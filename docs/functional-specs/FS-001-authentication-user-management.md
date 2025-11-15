# Functional Specification: Authentication & User Management

**Document ID:** FS-001
**Version:** 1.0
**Status:** Implementation Ready
**Last Updated:** 2025-11-15
**Related PRD:** PRD-06 (Part 2)

---

## 1. Overview

### 1.1 Purpose
This functional specification defines the complete technical implementation for user authentication, registration, session management, and profile management in the Executive Dysfunction Center application.

### 1.2 Scope
- User registration with email verification
- User login (email/password)
- OAuth 2.0 social login (Google, Apple)
- Session management with JWT
- Password reset flow
- User profile CRUD
- Multi-tenancy data isolation
- API authentication

### 1.3 Out of Scope (Future Phases)
- Two-factor authentication (2FA)
- Biometric authentication
- SSO/SAML
- User roles and permissions (beyond basic user)

---

## 2. Database Schema

### 2.1 Users Table

```sql
-- Migration: 001_create_users_table.up.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_lowercase VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
  password_hash VARCHAR(255),  -- NULL for social-only users

  -- Profile
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,

  -- OAuth
  auth_provider VARCHAR(20) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'apple')),
  auth_provider_id VARCHAR(255),  -- External provider user ID

  -- Verification & Reset
  email_verification_token VARCHAR(64) UNIQUE,
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(64) UNIQUE,
  password_reset_expires TIMESTAMP,

  -- Settings
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete

  -- Indexes
  CONSTRAINT email_lowercase_idx UNIQUE (email_lowercase),
  CONSTRAINT unique_provider_id UNIQUE NULLS NOT DISTINCT (auth_provider, auth_provider_id)
);

CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
CREATE INDEX idx_users_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX idx_users_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 User Sessions Table

```sql
-- Migration: 002_create_user_sessions_table.up.sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tokens
  refresh_token VARCHAR(64) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(255) NOT NULL,  -- Hashed for security

  -- Expiration
  expires_at TIMESTAMP NOT NULL,

  -- Device Info
  device_info JSONB DEFAULT '{}'::JSONB,
  /*
    {
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "macOS"
    }
  */

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,

  -- Indexes
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_refresh_token (refresh_token),
  INDEX idx_sessions_expires (expires_at) WHERE revoked_at IS NULL,
  INDEX idx_sessions_active (user_id, revoked_at, expires_at)
);

-- Cleanup expired sessions (run daily)
CREATE INDEX idx_sessions_cleanup ON user_sessions(expires_at, revoked_at);
```

### 2.3 OAuth Providers Table (Optional - for future multi-provider support)

```sql
-- Migration: 003_create_oauth_providers_table.up.sql
CREATE TABLE oauth_providers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'apple', 'github', 'microsoft')),
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),

  access_token TEXT,  -- Encrypted
  refresh_token TEXT,  -- Encrypted
  token_expires_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (provider, provider_user_id),
  INDEX idx_oauth_user (user_id, provider)
);
```

---

## 3. API Contracts

### 3.1 Type Definitions

```typescript
// File: /auth/types.ts

// ============================================================================
// Request/Response Types
// ============================================================================

export interface RegisterRequest {
  email: string;              // Valid email format
  password: string;           // Min 8 chars, complexity requirements
  display_name: string;       // 2-100 chars
  timezone?: string;          // IANA timezone (e.g., "America/New_York")
  consent: {
    terms: boolean;           // Must be true
    privacy: boolean;         // Must be true
  };
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    display_name: string;
    email_verified: false;
    created_at: string;
  };
  message: string;  // "Verification email sent to {email}"
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;      // Default: false
}

export interface LoginResponse {
  user: UserProfile;
  access_token: string;       // JWT, expires in 15 min
  refresh_token: string;      // Expires in 7 days (30 if remember_me)
  expires_in: number;         // Seconds until access_token expires
}

export interface VerifyEmailRequest {
  token: string;              // 64-char hex string
}

export interface VerifyEmailResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;      // New refresh token (rotation)
  expires_in: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;  // Generic message (don't reveal if email exists)
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;  // "Password reset successful"
}

export interface UpdateProfileRequest {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string;       // Must equal "DELETE MY ACCOUNT"
}

// ============================================================================
// Data Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  email_verified: boolean;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  auth_provider: 'email' | 'google' | 'apple';
  timezone: string;
  created_at: string;
  last_login_at: string | null;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  iat: number;               // Issued at
  exp: number;               // Expires at
}

export interface SessionInfo {
  id: string;
  device_info: {
    user_agent?: string;
    ip_address?: string;
    device_type?: string;
    browser?: string;
    os?: string;
  };
  created_at: string;
  last_accessed_at: string;
  expires_at: string;
}

// ============================================================================
// Error Responses
// ============================================================================

export interface AuthError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Error codes:
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### 3.2 API Endpoints

#### 3.2.1 POST /auth/register

**Purpose:** Register new user with email/password

**Request:**
```typescript
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "John Doe",
  "timezone": "America/New_York",
  "consent": {
    "terms": true,
    "privacy": true
  }
}
```

**Response (Success):**
```typescript
HTTP/1.1 201 Created
Content-Type: application/json

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "John Doe",
    "email_verified": false,
    "created_at": "2025-11-15T10:30:00Z"
  },
  "message": "Verification email sent to user@example.com"
}
```

**Response (Error - Email Exists):**
```typescript
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

**Response (Error - Weak Password):**
```typescript
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character",
    "details": {
      "requirements": {
        "min_length": false,
        "uppercase": true,
        "lowercase": true,
        "number": true,
        "special": false
      }
    }
  }
}
```

**Validation Rules:**
- Email: RFC 5322 format, max 255 chars
- Password: Min 8 chars, max 128 chars, must contain:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&*)
- Display Name: 2-100 chars, alphanumeric + spaces/hyphens
- Timezone: Valid IANA timezone string
- Consent: Both must be true

**Side Effects:**
1. Create user record with `email_verified = false`
2. Hash password with bcrypt (12 rounds)
3. Generate verification token (32 bytes random, hex encoded)
4. Set token expiration (24 hours)
5. Send verification email
6. Return immediately (don't wait for email)

---

#### 3.2.2 POST /auth/verify-email

**Purpose:** Verify email address and activate account

**Request:**
```typescript
POST /auth/verify-email
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "email_verified": true,
    "display_name": "John Doe",
    "avatar_url": null,
    "bio": null,
    "auth_provider": "email",
    "timezone": "America/New_York",
    "created_at": "2025-11-15T10:30:00Z",
    "last_login_at": "2025-11-15T10:35:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2",
  "expires_in": 900
}
```

**Response (Error - Invalid Token):**
```typescript
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired verification token"
  }
}
```

**Algorithm:**
1. Query user by `email_verification_token = :token`
2. If not found → INVALID_TOKEN error
3. If `email_verification_expires < NOW()` → TOKEN_EXPIRED error
4. Update user:
   - `email_verified = true`
   - `email_verification_token = NULL`
   - `email_verification_expires = NULL`
   - `last_login_at = NOW()`
5. Generate JWT access token
6. Create session with refresh token
7. Return tokens and user profile

---

#### 3.2.3 POST /auth/login

**Purpose:** Authenticate user with email/password

**Request:**
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "user": { /* UserProfile */ },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 900
}
```

**Response (Error - Invalid Credentials):**
```typescript
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Response (Error - Email Not Verified):**
```typescript
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in. Check your inbox for the verification link."
  }
}
```

**Response (Error - Account Locked):**
```typescript
HTTP/1.1 423 Locked
Content-Type: application/json

{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to too many failed login attempts. Try again in 15 minutes.",
    "details": {
      "locked_until": "2025-11-15T11:00:00Z"
    }
  }
}
```

**Algorithm:**
```
1. Normalize email to lowercase
2. Query user by email_lowercase
3. If not found → INVALID_CREDENTIALS (don't reveal email doesn't exist)
4. If locked_until > NOW() → ACCOUNT_LOCKED
5. If !email_verified → EMAIL_NOT_VERIFIED
6. Compare password with bcrypt
7. If password invalid:
   a. Increment failed_login_attempts
   b. If failed_login_attempts >= 5:
      - Set locked_until = NOW() + 15 minutes
      → ACCOUNT_LOCKED
   c. → INVALID_CREDENTIALS
8. If password valid:
   a. Reset failed_login_attempts = 0
   b. Set locked_until = NULL
   c. Update last_login_at = NOW()
   d. Generate JWT access token (exp: 15 min)
   e. Create session with refresh token
      - Expiration: 7 days (or 30 if remember_me)
   f. Return tokens and user profile
```

**Security Measures:**
- Rate limiting: Max 5 attempts per IP per minute
- Account lockout: 5 failed attempts = 15 min lockout
- Generic error message (don't reveal if email exists)
- Timing attack prevention (constant-time comparison)

---

#### 3.2.4 POST /auth/refresh

**Purpose:** Refresh access token using refresh token

**Request:**
```typescript
POST /auth/refresh
Content-Type: application/json
Cookie: refresh_token=...

{
  "refresh_token": "x1y2z3..." // or from cookie
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=NEW_TOKEN...; HttpOnly; Secure; SameSite=Strict

{
  "access_token": "NEW_ACCESS_TOKEN...",
  "refresh_token": "NEW_REFRESH_TOKEN...",
  "expires_in": 900
}
```

**Response (Error - Invalid Token):**
```typescript
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

**Algorithm (Refresh Token Rotation):**
```
1. Hash the provided refresh_token
2. Query session by refresh_token_hash
3. If not found → INVALID_TOKEN
4. If revoked_at IS NOT NULL → INVALID_TOKEN
5. If expires_at < NOW() → TOKEN_EXPIRED
6. Query user by session.user_id
7. If user not found or deleted → INVALID_TOKEN
8. Generate new access token
9. Generate new refresh token
10. Update session:
    - refresh_token = new_token
    - refresh_token_hash = hash(new_token)
    - last_accessed_at = NOW()
    - Keep same expires_at (don't extend on refresh)
11. Return new tokens
```

**Token Rotation Benefits:**
- Prevents token replay attacks
- Limits damage from token theft
- Each refresh invalidates old refresh token

---

#### 3.2.5 POST /auth/logout

**Purpose:** Logout user and revoke refresh token

**Request:**
```typescript
POST /auth/logout
Content-Type: application/json
Authorization: Bearer <access_token>
Cookie: refresh_token=...

{
  "refresh_token": "x1y2z3..." // or from cookie
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0

{
  "message": "Logged out successfully"
}
```

**Algorithm:**
```
1. Hash refresh_token
2. Query session by refresh_token_hash
3. If found:
   - Update session: revoked_at = NOW()
4. Clear refresh_token cookie
5. Return success (even if session not found)
```

---

#### 3.2.6 POST /auth/forgot-password

**Purpose:** Request password reset email

**Request:**
```typescript
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Always Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Algorithm:**
```
1. Normalize email to lowercase
2. Query user by email_lowercase
3. If not found → Return success anyway (don't reveal)
4. If found:
   a. Generate reset token (32 bytes random, hex)
   b. Update user:
      - password_reset_token = token
      - password_reset_expires = NOW() + 1 hour
   c. Send password reset email
5. Return generic success message
```

**Email Template:**
```
Subject: Reset your password

Hi {display_name},

We received a request to reset your password. Click the link below to create a new password:

[Reset Password] → {APP_URL}/reset-password?token={token}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.
```

**Rate Limiting:**
- Max 3 requests per email per hour
- Max 10 requests per IP per hour

---

#### 3.2.7 POST /auth/reset-password

**Purpose:** Reset password using reset token

**Request:**
```typescript
POST /auth/reset-password
Content-Type: application/json

{
  "token": "a1b2c3d4...",
  "new_password": "NewSecurePass456!"
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Response (Error - Invalid Token):**
```typescript
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired password reset token"
  }
}
```

**Algorithm:**
```
1. Validate new_password (same rules as registration)
2. Query user by password_reset_token
3. If not found → INVALID_TOKEN
4. If password_reset_expires < NOW() → TOKEN_EXPIRED
5. Hash new password with bcrypt
6. Update user:
   - password_hash = new_hash
   - password_reset_token = NULL
   - password_reset_expires = NULL
   - failed_login_attempts = 0
   - locked_until = NULL
7. Revoke ALL sessions for this user (force re-login)
8. Send "password changed" notification email
9. Return success
```

---

#### 3.2.8 GET /auth/me

**Purpose:** Get current user profile

**Request:**
```typescript
GET /auth/me
Authorization: Bearer <access_token>
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "email_verified": true,
    "display_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "Product manager and productivity enthusiast",
    "auth_provider": "email",
    "timezone": "America/New_York",
    "created_at": "2025-11-15T10:30:00Z",
    "last_login_at": "2025-11-15T14:22:00Z"
  },
  "stats": {
    "days_since_joined": 45,
    "total_tasks": 127,
    "total_habits": 8,
    "total_journal_entries": 23,
    "current_streaks": 3
  }
}
```

**Response (Error - Unauthorized):**
```typescript
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired access token"
  }
}
```

---

#### 3.2.9 PUT /auth/me

**Purpose:** Update user profile

**Request:**
```typescript
PUT /auth/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "display_name": "Jane Doe",
  "bio": "Updated bio",
  "timezone": "America/Los_Angeles"
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": { /* Updated UserProfile */ }
}
```

**Validation:**
- display_name: 2-100 chars
- avatar_url: Valid URL, max 500 chars
- bio: Max 500 chars
- timezone: Valid IANA timezone

---

#### 3.2.10 PUT /auth/me/password

**Purpose:** Change password (requires current password)

**Request:**
```typescript
PUT /auth/me/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Password changed successfully. All other sessions have been logged out."
}
```

**Response (Error - Invalid Current Password):**
```typescript
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Current password is incorrect"
  }
}
```

**Algorithm:**
```
1. Get user_id from JWT
2. Query user
3. Verify current_password matches password_hash
4. If not → INVALID_CREDENTIALS
5. Validate new_password
6. Hash new_password
7. Update user.password_hash
8. Revoke all sessions EXCEPT current one
9. Send "password changed" email
10. Return success
```

---

#### 3.2.11 DELETE /auth/me

**Purpose:** Delete user account (soft delete)

**Request:**
```typescript
DELETE /auth/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "CurrentPass123!",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Response (Success):**
```typescript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Account deleted successfully. We're sorry to see you go."
}
```

**Algorithm:**
```
1. Get user_id from JWT
2. Query user
3. Verify password
4. Verify confirmation === "DELETE MY ACCOUNT"
5. Soft delete user:
   - Set deleted_at = NOW()
   - Anonymize: email = "deleted_{user_id}@deleted.local"
   - Clear: display_name, avatar_url, bio, password_hash
6. Revoke all sessions
7. Schedule hard delete after 30 days (GDPR grace period)
8. Send goodbye email to original email
9. Return success
```

**Note:** User data (tasks, habits, etc.) is handled separately based on data retention policy. Options:
- Delete all user data immediately
- Anonymize and keep for analytics (GDPR compliant)
- Allow export before deletion

---

## 4. JWT Implementation

### 4.1 Token Generation

```typescript
// File: /auth/jwt.ts

import jwt from 'jsonwebtoken';
import { JWTPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ISSUER = 'executive-dysfunction-center';
const JWT_AUDIENCE = 'edc-api';

export function generateAccessToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    user_id: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JWTPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('TOKEN_EXPIRED', 'Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('INVALID_TOKEN', 'Invalid access token');
    }
    throw error;
  }
}
```

### 4.2 Refresh Token Generation

```typescript
// File: /auth/refresh-token.ts

import crypto from 'crypto';
import bcrypt from 'bcrypt';

export function generateRefreshToken(): string {
  // 32 bytes = 64 hex characters
  return crypto.randomBytes(32).toString('hex');
}

export async function hashRefreshToken(token: string): Promise<string> {
  // Use bcrypt for refresh tokens (allows verification later)
  return bcrypt.hash(token, 10);
}

export async function verifyRefreshToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
```

### 4.3 Environment Variables

```bash
# .env
JWT_SECRET=<random-256-bit-secret>  # Generate with: openssl rand -base64 32
JWT_ACCESS_TOKEN_EXPIRY=900         # 15 minutes in seconds
JWT_REFRESH_TOKEN_EXPIRY=604800     # 7 days in seconds
JWT_REFRESH_TOKEN_EXPIRY_REMEMBER=2592000  # 30 days in seconds
```

---

## 5. Encore.ts Auth Integration

### 5.1 Auth Handler

```typescript
// File: /auth/encore.service.ts

import { authHandler } from "encore.dev/auth";
import { verifyAccessToken } from "./jwt";
import { AuthError, AuthErrorCodes } from "./types";

interface AuthParams {
  authorization: string;  // "Bearer <token>"
}

export interface AuthData {
  userID: string;
  email: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params): Promise<AuthData> => {
    // Extract token from Authorization header
    const authHeader = params.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError(
        AuthErrorCodes.INVALID_TOKEN,
        'Missing or invalid Authorization header'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      // Verify JWT
      const payload = verifyAccessToken(token);

      // Return auth data (available in all endpoints via auth.data())
      return {
        userID: payload.user_id,
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        AuthErrorCodes.INTERNAL_ERROR,
        'Authentication failed'
      );
    }
  }
);
```

### 5.2 Using Auth in Endpoints

```typescript
// Example: Using auth in any endpoint

import { api } from "encore.dev/api";
import { auth } from "~encore/auth";

export const getTasks = api(
  {
    method: "GET",
    path: "/tasks",
    auth: true,  // Require authentication
  },
  async (): Promise<GetTasksResponse> => {
    // Get current user from auth
    const { userID } = auth.data()!;

    // Query tasks for this user only
    const tasks = await db.query`
      SELECT * FROM tasks
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
    `;

    return { tasks };
  }
);
```

---

## 6. Password Security

### 6.1 Password Hashing

```typescript
// File: /auth/password.ts

import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 6.2 Password Validation

```typescript
// File: /auth/validation.ts

export interface PasswordStrength {
  valid: boolean;
  score: number;  // 0-4
  requirements: {
    min_length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  suggestions: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    min_length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const valid = Object.values(requirements).every(Boolean);

  const score = Object.values(requirements).filter(Boolean).length;

  const suggestions: string[] = [];
  if (!requirements.min_length) suggestions.push('Use at least 8 characters');
  if (!requirements.uppercase) suggestions.push('Add uppercase letters');
  if (!requirements.lowercase) suggestions.push('Add lowercase letters');
  if (!requirements.number) suggestions.push('Add numbers');
  if (!requirements.special) suggestions.push('Add special characters');

  return { valid, score, requirements, suggestions };
}
```

---

## 7. Email Service Integration

### 7.1 Email Templates

```typescript
// File: /auth/emails.ts

import { sendEmail } from '~/shared/email-service';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = 'no-reply@executivedysfunctioncenter.com';

export async function sendVerificationEmail(
  email: string,
  displayName: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    from: FROM_EMAIL,
    subject: 'Verify your email address',
    html: renderVerificationEmail(displayName, verificationUrl),
    text: `Hi ${displayName},\n\nWelcome to Executive Dysfunction Center! Please verify your email by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  displayName: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset your password',
    html: renderPasswordResetEmail(displayName, resetUrl),
    text: `Hi ${displayName},\n\nReset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can ignore this email.`,
  });
}

export async function sendPasswordChangedEmail(
  email: string,
  displayName: string
): Promise<void> {
  await sendEmail({
    to: email,
    from: FROM_EMAIL,
    subject: 'Your password was changed',
    html: renderPasswordChangedEmail(displayName),
    text: `Hi ${displayName},\n\nYour password was successfully changed.\n\nIf you didn't make this change, please contact support immediately.`,
  });
}

// HTML templates (separate file for maintainability)
function renderVerificationEmail(displayName: string, url: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #4f46e5; margin-bottom: 20px;">Welcome to Executive Dysfunction Center!</h1>
    <p>Hi ${displayName},</p>
    <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
    </div>
    <p style="color: #666; font-size: 14px;">Or copy and paste this link: <a href="${url}">${url}</a></p>
    <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
  </div>
  <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
</body>
</html>
  `;
}

// Similar templates for other emails...
```

---

## 8. Data Migration Plan

### 8.1 Migration Strategy

**Objective:** Migrate from `'default_user'` to actual user IDs across all tables.

**Steps:**

1. **Add user_id columns to all tables**
```sql
-- For each service table (tasks, habits, mood, etc.)
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE habits ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE mood_entries ADD COLUMN user_id UUID REFERENCES users(id);
-- etc.
```

2. **Backfill with default user**
```sql
-- Create a default user for existing data
INSERT INTO users (id, email, display_name, email_verified, auth_provider)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'legacy@system.local',
  'Legacy User',
  true,
  'email'
);

-- Update all tables
UPDATE tasks SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
UPDATE habits SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
-- etc.
```

3. **Add NOT NULL constraint**
```sql
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL;
-- etc.
```

4. **Add indexes**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
-- etc.
```

5. **Update all queries to filter by user_id**
```typescript
// Before
const tasks = await db.query`SELECT * FROM tasks`;

// After
const { userID } = auth.data()!;
const tasks = await db.query`SELECT * FROM tasks WHERE user_id = ${userID}`;
```

### 8.2 Row-Level Security (Optional but Recommended)

```sql
-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_tasks ON tasks
  USING (user_id = current_setting('app.current_user')::UUID);

CREATE POLICY user_habits ON habits
  USING (user_id = current_setting('app.current_user')::UUID);

-- In application, set current user
BEGIN;
SET LOCAL app.current_user = '<user-id>';
-- Run queries (RLS automatically filters)
COMMIT;
```

---

## 9. Testing Specifications

### 9.1 Unit Tests

```typescript
// File: /auth/auth.test.ts

describe('Authentication Service', () => {
  describe('User Registration', () => {
    it('should create user with valid data', async () => {
      const response = await register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        display_name: 'Test User',
        consent: { terms: true, privacy: true },
      });

      expect(response.user).toMatchObject({
        email: 'test@example.com',
        display_name: 'Test User',
        email_verified: false,
      });
    });

    it('should reject weak password', async () => {
      await expect(
        register({
          email: 'test@example.com',
          password: 'weak',
          display_name: 'Test User',
          consent: { terms: true, privacy: true },
        })
      ).rejects.toThrow('WEAK_PASSWORD');
    });

    it('should reject duplicate email', async () => {
      await register({ /* valid data */ });

      await expect(
        register({ /* same email */ })
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    it('should send verification email', async () => {
      const mockSendEmail = jest.spyOn(emailService, 'sendEmail');

      await register({ /* valid data */ });

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Verify'),
        })
      );
    });
  });

  describe('Email Verification', () => {
    it('should verify with valid token', async () => {
      const { user } = await register({ /* data */ });
      const token = await getVerificationToken(user.id);

      const response = await verifyEmail({ token });

      expect(response.user.email_verified).toBe(true);
      expect(response.access_token).toBeDefined();
    });

    it('should reject expired token', async () => {
      const token = await createExpiredToken();

      await expect(
        verifyEmail({ token })
      ).rejects.toThrow('TOKEN_EXPIRED');
    });

    it('should reject invalid token', async () => {
      await expect(
        verifyEmail({ token: 'invalid' })
      ).rejects.toThrow('INVALID_TOKEN');
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      await createVerifiedUser('test@example.com', 'Pass123!');

      const response = await login({
        email: 'test@example.com',
        password: 'Pass123!',
      });

      expect(response.access_token).toBeDefined();
      expect(response.refresh_token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await createVerifiedUser('test@example.com', 'Pass123!');

      await expect(
        login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should reject unverified email', async () => {
      await register({ /* data */ });  // Not verified

      await expect(
        login({ email: 'test@example.com', password: 'Pass123!' })
      ).rejects.toThrow('EMAIL_NOT_VERIFIED');
    });

    it('should lock account after 5 failed attempts', async () => {
      await createVerifiedUser('test@example.com', 'Pass123!');

      // Attempt 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        await expect(
          login({ email: 'test@example.com', password: 'wrong' })
        ).rejects.toThrow();
      }

      // 6th attempt should be locked
      await expect(
        login({ email: 'test@example.com', password: 'Pass123!' })
      ).rejects.toThrow('ACCOUNT_LOCKED');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh with valid refresh token', async () => {
      const { refresh_token } = await loginUser();

      const response = await refreshToken({ refresh_token });

      expect(response.access_token).toBeDefined();
      expect(response.refresh_token).not.toBe(refresh_token);  // Rotation
    });

    it('should reject expired refresh token', async () => {
      const token = await createExpiredRefreshToken();

      await expect(
        refreshToken({ refresh_token: token })
      ).rejects.toThrow('TOKEN_EXPIRED');
    });

    it('should reject revoked refresh token', async () => {
      const { refresh_token } = await loginUser();
      await logout({ refresh_token });

      await expect(
        refreshToken({ refresh_token })
      ).rejects.toThrow('INVALID_TOKEN');
    });
  });

  describe('Password Reset', () => {
    it('should send reset email for existing user', async () => {
      const mockSendEmail = jest.spyOn(emailService, 'sendEmail');
      await createVerifiedUser('test@example.com', 'Pass123!');

      await forgotPassword({ email: 'test@example.com' });

      expect(mockSendEmail).toHaveBeenCalled();
    });

    it('should not reveal if email does not exist', async () => {
      const response = await forgotPassword({ email: 'nonexistent@example.com' });

      expect(response.message).toContain('If an account');
    });

    it('should reset password with valid token', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPass123!');
      const token = await createResetToken(user.id);

      await resetPassword({ token, new_password: 'NewPass456!' });

      // Old password should not work
      await expect(
        login({ email: 'test@example.com', password: 'OldPass123!' })
      ).rejects.toThrow();

      // New password should work
      await expect(
        login({ email: 'test@example.com', password: 'NewPass456!' })
      ).resolves.toBeDefined();
    });

    it('should revoke all sessions on password reset', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPass123!');
      const { refresh_token } = await login({ /* credentials */ });
      const token = await createResetToken(user.id);

      await resetPassword({ token, new_password: 'NewPass456!' });

      // Old refresh token should not work
      await expect(
        refreshToken({ refresh_token })
      ).rejects.toThrow('INVALID_TOKEN');
    });
  });
});
```

### 9.2 Integration Tests

```typescript
describe('Authentication Integration', () => {
  it('should complete full registration flow', async () => {
    // 1. Register
    const registerResponse = await api.post('/auth/register', {
      email: 'integration@test.com',
      password: 'TestPass123!',
      display_name: 'Integration Test',
      consent: { terms: true, privacy: true },
    });

    expect(registerResponse.status).toBe(201);

    // 2. Extract verification token from email
    const token = await getLastSentEmailToken();

    // 3. Verify email
    const verifyResponse = await api.post('/auth/verify-email', { token });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.data.access_token).toBeDefined();

    // 4. Use access token to access protected resource
    const meResponse = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${verifyResponse.data.access_token}` },
    });

    expect(meResponse.status).toBe(200);
    expect(meResponse.data.user.email_verified).toBe(true);
  });

  it('should maintain session across token refresh', async () => {
    const { access_token, refresh_token } = await loginUser();

    // Use initial access token
    const response1 = await api.get('/tasks', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(response1.status).toBe(200);

    // Wait for access token to expire (or mock expiration)
    await sleep(1000);

    // Refresh tokens
    const refreshResponse = await api.post('/auth/refresh', { refresh_token });
    const newAccessToken = refreshResponse.data.access_token;

    // Use new access token
    const response2 = await api.get('/tasks', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    expect(response2.status).toBe(200);
  });
});
```

### 9.3 Security Tests

```typescript
describe('Authentication Security', () => {
  it('should prevent timing attacks on email enumeration', async () => {
    const start1 = Date.now();
    await login({ email: 'exists@example.com', password: 'wrong' });
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await login({ email: 'nonexistent@example.com', password: 'wrong' });
    const time2 = Date.now() - start2;

    // Response times should be similar (within 50ms)
    expect(Math.abs(time1 - time2)).toBeLessThan(50);
  });

  it('should hash passwords with bcrypt', async () => {
    const user = await createUser('test@example.com', 'Pass123!');

    const dbUser = await db.query`SELECT password_hash FROM users WHERE id = ${user.id}`;

    expect(dbUser.password_hash).toMatch(/^\$2[aby]\$\d+\$/);  // bcrypt format
    expect(dbUser.password_hash).not.toBe('Pass123!');
  });

  it('should use secure random tokens', async () => {
    const user = await createUser('test@example.com', 'Pass123!');
    await forgotPassword({ email: 'test@example.com' });

    const dbUser = await db.query`SELECT password_reset_token FROM users WHERE id = ${user.id}`;

    expect(dbUser.password_reset_token).toHaveLength(64);  // 32 bytes hex
    expect(/^[0-9a-f]{64}$/.test(dbUser.password_reset_token)).toBe(true);
  });

  it('should rotate refresh tokens on refresh', async () => {
    const { refresh_token: token1 } = await loginUser();

    const { refresh_token: token2 } = await refreshToken({ refresh_token: token1 });

    expect(token2).not.toBe(token1);

    // Old token should not work
    await expect(
      refreshToken({ refresh_token: token1 })
    ).rejects.toThrow();
  });
});
```

---

## 10. Performance Requirements

### 10.1 Response Time Targets

| Operation | Target | Max |
|-----------|--------|-----|
| Register | < 200ms (excluding email) | 500ms |
| Login | < 300ms | 1s |
| Verify Email | < 200ms | 500ms |
| Refresh Token | < 100ms | 300ms |
| Get Profile | < 100ms | 300ms |
| Update Profile | < 200ms | 500ms |

### 10.2 Throughput Targets

| Operation | Target RPS | Peak RPS |
|-----------|------------|----------|
| Login | 100 | 500 |
| Refresh Token | 500 | 2000 |
| Get Profile | 1000 | 5000 |

### 10.3 Database Optimization

```sql
-- Ensure all critical queries use indexes

-- Login query
EXPLAIN ANALYZE
SELECT * FROM users WHERE email_lowercase = 'test@example.com';
-- Should use: idx_users_email_verified or email_lowercase_idx

-- Session lookup
EXPLAIN ANALYZE
SELECT * FROM user_sessions WHERE refresh_token = 'xyz' AND revoked_at IS NULL;
-- Should use: idx_sessions_refresh_token

-- Active sessions for user
EXPLAIN ANALYZE
SELECT * FROM user_sessions
WHERE user_id = 'uuid' AND revoked_at IS NULL AND expires_at > NOW();
-- Should use: idx_sessions_active
```

---

## 11. Security Considerations

### 11.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Brute force password guessing | Rate limiting, account lockout, CAPTCHA (future) |
| Token theft | Short-lived access tokens, refresh token rotation, HTTPS only |
| Session hijacking | Secure cookies (HttpOnly, Secure, SameSite), device fingerprinting (future) |
| Email enumeration | Generic error messages, timing attack prevention |
| SQL injection | Parameterized queries only |
| XSS | Strict CSP, sanitize all inputs, HttpOnly cookies |
| CSRF | SameSite cookies, CSRF tokens (if needed) |

### 11.2 Secure Defaults

```typescript
// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,        // Prevent JavaScript access
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  path: '/',
  domain: process.env.COOKIE_DOMAIN,
};

// CORS configuration
const CORS_OPTIONS = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate limiting
const RATE_LIMITS = {
  login: { windowMs: 60000, max: 5 },           // 5 per minute
  register: { windowMs: 3600000, max: 3 },      // 3 per hour
  forgot_password: { windowMs: 3600000, max: 3 },
  verify_email: { windowMs: 60000, max: 10 },
  refresh: { windowMs: 60000, max: 20 },
};
```

---

## 12. Monitoring & Logging

### 12.1 Metrics to Track

```typescript
// Authentication metrics
- auth.register.attempts
- auth.register.success
- auth.register.failures
- auth.login.attempts
- auth.login.success
- auth.login.failures
- auth.login.locked_accounts
- auth.token.refresh.success
- auth.token.refresh.failures
- auth.password_reset.requests
- auth.email_verification.success

// Performance metrics
- auth.login.duration
- auth.register.duration
- auth.token.verify.duration
```

### 12.2 Audit Logging

```typescript
// Log all authentication events
interface AuthAuditLog {
  timestamp: string;
  event_type: 'register' | 'login' | 'logout' | 'password_reset' | 'email_verify';
  user_id?: string;
  email?: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  error_code?: string;
  metadata?: any;
}

// Examples
logAuthEvent({
  event_type: 'login',
  user_id: '550e8400-...',
  email: 'user@example.com',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
  success: true,
});

logAuthEvent({
  event_type: 'login',
  email: 'user@example.com',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
  success: false,
  error_code: 'INVALID_CREDENTIALS',
});
```

---

## 13. Frontend Integration

### 13.1 Authentication Context

```typescript
// File: frontend/src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../services/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to restore session on mount
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (error) {
      // No valid session
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    localStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  }

  async function logout() {
    await authApi.logout();
    localStorage.removeItem('access_token');
    setUser(null);
  }

  async function register(data: RegisterRequest) {
    await authApi.register(data);
    // Don't auto-login, wait for email verification
  }

  async function refreshToken() {
    const response = await authApi.refreshToken();
    localStorage.setItem('access_token', response.access_token);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 13.2 Axios Interceptor for Token Refresh

```typescript
// File: frontend/src/services/api.ts

import axios from 'axios';
import * as authApi from './auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,  // Send cookies
});

// Request interceptor: Add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const response = await authApi.refreshToken();
        localStorage.setItem('access_token', response.access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 13.3 Protected Route Component

```typescript
// File: frontend/src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;  // Or loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage in App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />

  <Route path="/dashboard" element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } />

  <Route path="/tasks" element={
    <ProtectedRoute>
      <TasksPage />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 14. Implementation Checklist

### Phase 1: Database & Core (Week 1)
- [ ] Create users table migration
- [ ] Create user_sessions table migration
- [ ] Implement password hashing functions
- [ ] Implement JWT generation/verification
- [ ] Implement refresh token generation
- [ ] Set up email service integration
- [ ] Create email templates

### Phase 2: Registration & Verification (Week 1-2)
- [ ] Implement POST /auth/register endpoint
- [ ] Implement email sending logic
- [ ] Implement POST /auth/verify-email endpoint
- [ ] Add validation for all inputs
- [ ] Write unit tests for registration
- [ ] Test email delivery

### Phase 3: Login & Session Management (Week 2)
- [ ] Implement POST /auth/login endpoint
- [ ] Implement account lockout logic
- [ ] Implement POST /auth/refresh endpoint
- [ ] Implement refresh token rotation
- [ ] Implement POST /auth/logout endpoint
- [ ] Write tests for login flows

### Phase 4: Password Reset (Week 2-3)
- [ ] Implement POST /auth/forgot-password endpoint
- [ ] Implement POST /auth/reset-password endpoint
- [ ] Test password reset flow end-to-end

### Phase 5: Profile Management (Week 3)
- [ ] Implement GET /auth/me endpoint
- [ ] Implement PUT /auth/me endpoint
- [ ] Implement PUT /auth/me/password endpoint
- [ ] Implement DELETE /auth/me endpoint
- [ ] Add stats calculation for profile

### Phase 6: Encore Integration (Week 3-4)
- [ ] Implement Encore auth handler
- [ ] Update all existing endpoints to use auth
- [ ] Add user_id to all queries
- [ ] Test multi-user data isolation

### Phase 7: Data Migration (Week 4)
- [ ] Add user_id columns to all tables
- [ ] Create default/legacy user
- [ ] Backfill existing data
- [ ] Add NOT NULL constraints
- [ ] Add indexes on user_id columns

### Phase 8: Frontend (Week 4-5)
- [ ] Create AuthContext
- [ ] Create login page
- [ ] Create registration page
- [ ] Create email verification page
- [ ] Create password reset flow
- [ ] Create profile page
- [ ] Implement ProtectedRoute
- [ ] Add token refresh logic
- [ ] Test complete auth flows

### Phase 9: Security & Testing (Week 5-6)
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Set up secure cookie handling
- [ ] Write comprehensive unit tests
- [ ] Write integration tests
- [ ] Write security tests
- [ ] Perform security audit

### Phase 10: Monitoring & Documentation (Week 6)
- [ ] Set up authentication metrics
- [ ] Implement audit logging
- [ ] Create API documentation
- [ ] Create user guide
- [ ] Load testing
- [ ] Production deployment

---

## 15. Appendix

### 15.1 Error Code Reference

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Wrong email/password | Check credentials |
| EMAIL_ALREADY_EXISTS | 409 | Email in use | Use different email or login |
| EMAIL_NOT_VERIFIED | 403 | Account not verified | Check email for verification link |
| ACCOUNT_LOCKED | 423 | Too many failed attempts | Wait 15 minutes |
| WEAK_PASSWORD | 400 | Password requirements not met | Use stronger password |
| INVALID_TOKEN | 401 | Invalid or expired token | Request new token |
| TOKEN_EXPIRED | 401 | Token expired | Refresh or re-authenticate |
| USER_NOT_FOUND | 404 | User doesn't exist | Check email or register |
| INTERNAL_ERROR | 500 | Server error | Contact support |

### 15.2 Environment Variables

```bash
# Required
JWT_SECRET=<base64-encoded-secret>
DATABASE_URL=postgresql://...
APP_URL=https://app.executivedysfunctioncenter.com
FRONTEND_URL=https://executivedysfunctioncenter.com

# Email
SENDGRID_API_KEY=<key>
FROM_EMAIL=no-reply@executivedysfunctioncenter.com

# Optional
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
JWT_REFRESH_TOKEN_EXPIRY_REMEMBER=2592000
BCRYPT_ROUNDS=12
COOKIE_DOMAIN=.executivedysfunctioncenter.com
```

### 15.3 Related Documents
- PRD-06: Authentication & User Management
- API Documentation: Authentication Endpoints
- Security Best Practices Guide
- Data Privacy & GDPR Compliance

---

**Document Status:** ✅ Ready for Implementation
**Estimated Effort:** 6 weeks (1 senior engineer)
**Dependencies:** Email service (SendGrid), Database (PostgreSQL)
**Review Date:** 2025-11-15
