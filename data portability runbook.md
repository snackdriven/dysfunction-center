Here’s a detailed runbook for setting up a robust, future-proof data persistence and portability system for your app, modeled after the depth and structure of your implementation docs:

---

# 📚 Data Portability & Persistence Runbook

## ✅ GOAL

Establish a stable, long-term, and portable system for storing and migrating all core app data (habits, journals, moods, tasks, etc.) to ensure seamless iteration, backup, and restoration across any future app versions or tech stacks.

---

### 🗃️ 1. Data Model Definition

- Define clear, versioned TypeScript interfaces for each data type (Task, Habit, Journal, Mood, etc.).
- Store these interfaces in a shared location (e.g., types.ts) for consistency across backend and frontend.

---

### 📦 2. Source-of-Truth Data Files

- Store all data in human-readable, version-controlled files (`northstar-data/tasks.json`, `northstar-data/habits.json`, etc.).
- Use JSON for structured data and Markdown for narrative/log data (journals, notes).
- Commit these files to your repository for full change history and easy rollback.

---

### 🔄 3. Import/Export Endpoints

- Implement Encore endpoints for each data type:
  - `/api/exportTasksMarkdown` and `/api/exportTasksJson`
  - `/api/exportHabitsMarkdown` and `/api/exportHabitsJson`
  - Repeat for journals, moods, etc.
- Endpoints should:
  - Fetch all records from the database.
  - Format as Markdown or JSON.
  - Return as downloadable responses with correct headers.

---

### 💾 4. Data Import/Restore

- Implement Encore endpoints or CLI scripts to import data from JSON/Markdown files into the database.
- Validate data against TypeScript interfaces before import.
- Support bulk import and upsert (update or insert) operations.

---

### 🔗 5. Frontend Integration

- Add UI controls (buttons, menus) for users to:
  - Export current data (triggers download from export endpoints).
  - Import/restore data (uploads file to import endpoint).
- Provide user feedback for success/failure of import/export actions.

---

### ☁️ 6. Backup & Recovery

- Automate regular backups of data files to cloud storage (e.g., S3, Google Drive).
- Document manual backup/restore procedures for developers and users.
- Store backup scripts in `scripts/` and document usage in README.md.

---

### 🧪 7. Testing & Validation

- Write unit and integration tests for all import/export logic.
- Test round-trip data integrity: export → import → export should yield identical data.
- Validate that all app features work with imported/restored data.

---

### 📝 8. Documentation

- Maintain a `DATA_PORTABILITY.md` guide with:
  - Data model definitions and versioning strategy.
  - Import/export endpoint usage.
  - Backup/restore instructions.
  - Migration tips for future app versions.

---

### 🏆 9. Best Practices & Future-Proofing

- Always treat data files as the “north star” source of truth.
- Keep data model changes backward-compatible when possible; document breaking changes.
- Use semantic versioning for data file formats and interfaces.
- Encourage regular data exports and backups before major app updates.

---

## 🚀 SUMMARY

By following this runbook, you ensure your app’s data is always safe, portable, and ready for any future iteration—no matter how the codebase evolves.

Let me know if you want ready-to-paste code for any step, or a template for the documentation!



Here is a prompt, modeled after your Prompt Guide, to implement the features listed in your Data Portability & Persistence Runbook:

---

## **Encore Data Portability & Persistence Implementation Prompt**

You are an Encore backend and full-stack developer. Your task is to implement a robust, future-proof data persistence and portability system for all core app data (habits, journals, moods, tasks, etc.), following the steps below.

---

### **1. Data Model Definition**
- Define clear, versioned TypeScript interfaces for each data type (Task, Habit, Journal, Mood, etc.).
- Store these interfaces in a shared location (e.g., types.ts) for use across backend and frontend.

---

### **2. Source-of-Truth Data Files**
- Store all data in human-readable, version-controlled files (e.g., `northstar-data/tasks.json`, `northstar-data/habits.json`).
- Use JSON for structured data and Markdown for narrative/log data (journals, notes).
- Ensure these files are committed to the repository for full change history and rollback.

---

### **3. Import/Export Endpoints**
- Implement Encore endpoints for each data type:
  - `/api/exportTasksMarkdown` and `/api/exportTasksJson`
  - `/api/exportHabitsMarkdown` and `/api/exportHabitsJson`
  - Repeat for journals, moods, etc.
- Each endpoint should:
  - Fetch all records from the database.
  - Format as Markdown or JSON.
  - Return as a downloadable response with the correct headers.

---

### **4. Data Import/Restore**
- Implement Encore endpoints or CLI scripts to import data from JSON/Markdown files into the database.
- Validate imported data against TypeScript interfaces.
- Support bulk import and upsert (update or insert) operations.

---

### **5. Frontend Integration**
- Add UI controls (buttons, menus) for users to:
  - Export current data (trigger download from export endpoints).
  - Import/restore data (upload file to import endpoint).
- Provide user feedback for success/failure of import/export actions.

---

### **6. Backup & Recovery**
- Automate regular backups of data files to cloud storage (e.g., S3, Google Drive).
- Document manual backup/restore procedures for developers and users.
- Store backup scripts in a `scripts/` directory and document usage in README.md.

---

### **7. Testing & Validation**
- Write unit and integration tests for all import/export logic.
- Test round-trip data integrity: export → import → export should yield identical data.
- Validate that all app features work with imported/restored data.

---

### **8. Documentation**
- Maintain a `DATA_PORTABILITY.md` guide with:
  - Data model definitions and versioning strategy.
  - Import/export endpoint usage.
  - Backup/restore instructions.
  - Migration tips for future app versions.

---

### **9. Best Practices & Future-Proofing**
- Always treat data files as the “north star” source of truth.
- Keep data model changes backward-compatible when possible; document breaking changes.
- Use semantic versioning for data file formats and interfaces.
- Encourage regular data exports and backups before major app updates.

---

**Let me know if you need ready-to-paste code for any step, or a template for the documentation!**