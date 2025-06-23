import { describe, it, expect, beforeEach } from "vitest";
import { 
  getPreference,
  setPreference,
  getAllPreferences,
  getTheme,
  setTheme,
  getSystemTheme
} from "./preferences";
import type { 
  SetPreferenceRequest,
  GetPreferenceRequest,
  SetThemeRequest
} from "./types";

describe("Preferences Management", () => {
  describe("setPreference and getPreference", () => {
    it("should set and get a preference", async () => {
      const setReq: SetPreferenceRequest = {
        key: "test_preference",
        value: "test_value"
      };

      const setResponse = await setPreference(setReq);
      
      expect(setResponse.preference).toBeDefined();
      expect(setResponse.preference.preference_key).toBe("test_preference");
      expect(setResponse.preference.preference_value).toBe("test_value");

      // Now get the preference
      const getReq: GetPreferenceRequest = {
        key: "test_preference"
      };

      const getResponse = await getPreference(getReq);
      
      expect(getResponse.preference.preference_key).toBe("test_preference");
      expect(getResponse.preference.preference_value).toBe("test_value");
    });

    it("should update existing preference", async () => {
      const setReq: SetPreferenceRequest = {
        key: "update_test",
        value: "original_value"
      };

      await setPreference(setReq);

      // Update the preference
      const updateReq: SetPreferenceRequest = {
        key: "update_test",
        value: "updated_value"
      };

      const response = await setPreference(updateReq);
      
      expect(response.preference.preference_value).toBe("updated_value");
    });

    it("should throw error for non-existent preference", async () => {
      const getReq: GetPreferenceRequest = {
        key: "non_existent_key"
      };

      await expect(getPreference(getReq)).rejects.toThrow("Preference not found");
    });
  });

  describe("getAllPreferences", () => {
    it("should get all preferences for a user", async () => {
      // Set multiple preferences
      await setPreference({ key: "pref1", value: "value1" });
      await setPreference({ key: "pref2", value: "value2" });

      const response = await getAllPreferences({});
      
      expect(response.preferences).toBeDefined();
      expect(typeof response.preferences).toBe("object");
      expect(response.preferences.pref1).toBe("value1");
      expect(response.preferences.pref2).toBe("value2");
    });

    it("should handle user-specific preferences", async () => {
      await setPreference({ key: "user_pref", value: "user_value", user_id: "test_user" });

      const response = await getAllPreferences({ user_id: "test_user" });
      
      expect(response.preferences).toBeDefined();
      expect(response.preferences.user_pref).toBe("user_value");
    });
  });

  describe("Theme Management", () => {
    describe("setTheme and getTheme", () => {
      it("should set and get theme preference", async () => {
        const setReq: SetThemeRequest = {
          theme: "dark"
        };

        const setResponse = await setTheme(setReq);
        
        expect(setResponse.theme_preference).toBeDefined();
        expect(setResponse.theme_preference.theme).toBe("dark");
        expect(setResponse.current_theme).toBeDefined();

        // Now get the theme
        const getResponse = await getTheme({});
        
        expect(getResponse.theme).toBe("dark");
        expect(getResponse.current_theme).toBeDefined();
        expect(getResponse.system_theme).toBeDefined();
      });

      it("should set theme with auto switch", async () => {
        const setReq: SetThemeRequest = {
          theme: "light",
          auto_switch: true,
          dark_start_time: "20:00",
          dark_end_time: "08:00"
        };

        const response = await setTheme(setReq);
        
        expect(response.theme_preference.theme).toBe("light");
        expect(response.theme_preference.auto_switch).toBe(true);
        expect(response.theme_preference.dark_start_time).toBe("20:00");
        expect(response.theme_preference.dark_end_time).toBe("08:00");
      });

      it("should throw error for invalid theme", async () => {
        const setReq: any = {
          theme: "invalid_theme"
        };

        await expect(setTheme(setReq)).rejects.toThrow("Invalid theme");
      });

      it("should throw error for invalid time format", async () => {
        const setReq: SetThemeRequest = {
          theme: "light",
          dark_start_time: "25:00" // Invalid hour
        };

        await expect(setTheme(setReq)).rejects.toThrow("Invalid dark_start_time format");
      });

      it("should handle system theme", async () => {
        const setReq: SetThemeRequest = {
          theme: "system"
        };

        const response = await setTheme(setReq);
        
        expect(response.theme_preference.theme).toBe("system");
        expect(response.current_theme).toMatch(/^(light|dark)$/);
      });
    });

    describe("getSystemTheme", () => {
      it("should get system theme information", async () => {
        const response = await getSystemTheme();
        
        expect(response.system_theme).toMatch(/^(light|dark)$/);
        expect(response.current_time).toBeDefined();
        expect(typeof response.is_dark_hours).toBe("boolean");
      });
    });

    describe("theme resolution", () => {
      it("should resolve theme correctly with different settings", async () => {
        // Test light theme
        await setTheme({ theme: "light" });
        let response = await getTheme({});
        expect(response.current_theme).toBe("light");

        // Test dark theme
        await setTheme({ theme: "dark" });
        response = await getTheme({});
        expect(response.current_theme).toBe("dark");

        // Test system theme
        await setTheme({ theme: "system" });
        response = await getTheme({});
        expect(response.current_theme).toMatch(/^(light|dark)$/);
      });
    });
  });

  describe("User-specific preferences", () => {
    it("should handle different users separately", async () => {
      // Set preference for user1
      await setPreference({ 
        key: "theme", 
        value: "dark", 
        user_id: "user1" 
      });

      // Set preference for user2
      await setPreference({ 
        key: "theme", 
        value: "light", 
        user_id: "user2" 
      });

      // Get preferences for each user
      const user1Prefs = await getAllPreferences({ user_id: "user1" });
      const user2Prefs = await getAllPreferences({ user_id: "user2" });

      expect(user1Prefs.preferences.theme).toBe("dark");
      expect(user2Prefs.preferences.theme).toBe("light");
    });
  });
});
