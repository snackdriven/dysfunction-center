import { Theme, TimestampString } from "../shared/types";

// User preference interface
export interface UserPreference {
  id: number;
  user_id: string;
  preference_key: string;
  preference_value: string;
  created_at: TimestampString;
  updated_at: TimestampString;
}

// Theme preference specific interface
export interface ThemePreference {
  theme: Theme;
  auto_switch: boolean;
  dark_start_time?: string; // HH:MM format
  dark_end_time?: string;   // HH:MM format
}

// Request/Response types
export interface GetPreferenceRequest {
  key: string;
  user_id?: string;
}

export interface GetPreferenceResponse {
  preference: UserPreference;
}

export interface SetPreferenceRequest {
  key: string;
  value: string;
  user_id?: string;
}

export interface SetPreferenceResponse {
  preference: UserPreference;
}

export interface GetAllPreferencesRequest {
  user_id?: string;
}

export interface GetAllPreferencesResponse {
  preferences: Record<string, string>;
}

// Theme-specific requests
export interface GetThemeRequest {
  user_id?: string;
}

export interface GetThemeResponse {
  theme: Theme;
  system_theme?: Theme;
  current_theme: Theme; // resolved theme considering system preference
  theme_preference: ThemePreference;
}

export interface SetThemeRequest {
  theme: Theme;
  auto_switch?: boolean;
  dark_start_time?: string;
  dark_end_time?: string;
  user_id?: string;
}

export interface SetThemeResponse {
  theme_preference: ThemePreference;
  current_theme: Theme;
}

// System info
export interface GetSystemThemeResponse {
  system_theme: Theme;
  current_time: string;
  is_dark_hours: boolean;
}
