import { api } from "encore.dev/api";
import { preferencesDB } from "./encore.service";
import {
  UserPreference,
  ThemePreference,
  TimeDisplayPreference,
  GetPreferenceRequest,
  GetPreferenceResponse,
  SetPreferenceRequest,
  SetPreferenceResponse,
  GetAllPreferencesRequest,
  GetAllPreferencesResponse,
  GetThemeRequest,
  GetThemeResponse,
  SetThemeRequest,
  SetThemeResponse,
  GetSystemThemeResponse
} from "./types";
import { Theme } from "../shared/types";
import { sanitizeString } from "../shared/utils";

// Helper function to collect database results
async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Determine system theme based on time (simplified approach)
function detectSystemTheme(): Theme {
  const hour = new Date().getHours();
  // Dark theme from 18:00 to 6:00
  return (hour >= 18 || hour < 6) ? 'dark' : 'light';
}

// Check if current time is within dark hours
function isDarkHours(darkStart: string = "18:00", darkEnd: string = "06:00"): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Handle case where dark period crosses midnight
  if (darkStart > darkEnd) {
    return currentTime >= darkStart || currentTime < darkEnd;
  } else {
    return currentTime >= darkStart && currentTime < darkEnd;
  }
}

// Resolve actual theme considering system preference
function resolveTheme(userTheme: Theme, autoSwitch: boolean, darkStart?: string, darkEnd?: string): Theme {
  if (userTheme === 'system') {
    return detectSystemTheme();
  }
  
  if (autoSwitch && userTheme === 'light') {
    return isDarkHours(darkStart, darkEnd) ? 'dark' : 'light';
  }
  
  return userTheme;
}

// Get a specific preference
export const getPreference = api(
  { method: "GET", path: "/preferences/:key", expose: true },
  async (req: GetPreferenceRequest): Promise<GetPreferenceResponse> => {
    try {
      const user_id = req.user_id || 'default_user';
      const key = sanitizeString(req.key, 100);

      const generator = preferencesDB.query`
        SELECT * FROM user_preferences 
        WHERE user_id = ${user_id} AND preference_key = ${key}
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        // Return default value if preference doesn't exist
        const defaultPrefs: { [key: string]: string } = {
          'end_of_day_time': '23:59',
          'start_of_week': 'monday',
          'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          'date_format': 'short',
          'time_format': '12h',
          'show_seconds': 'false',
          'show_date': 'true',
          'show_timezone': 'false',
          'theme': 'system',
          'auto_switch_theme': 'true',
          'dark_hours_start': '18:00',
          'dark_hours_end': '06:00',
          'font_scale': '1.0',
          'default_calendar_view': 'week',
          'show_weekend': 'true',
          'habit_streak_grace_period': '0'
        };

        const defaultValue = defaultPrefs[key];
        if (defaultValue) {
          const preference: UserPreference = {
            id: 0, // Indicates this is a default value
            user_id: user_id,
            preference_key: key,
            preference_value: defaultValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return { preference };
        }
        
        throw new Error("Preference not found");
      }

      const prefRow = result[0];
      const preference: UserPreference = {
        id: prefRow.id,
        user_id: prefRow.user_id,
        preference_key: prefRow.preference_key,
        preference_value: prefRow.preference_value,
        created_at: prefRow.created_at,
        updated_at: prefRow.updated_at
      };

      return { preference };
    } catch (error) {
      throw new Error(`Failed to get preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get all preferences with support for End of Day settings
export const getAllPreferences = api(
  { method: "GET", path: "/preferences", expose: true },
  async (req: GetAllPreferencesRequest): Promise<GetAllPreferencesResponse> => {
    try {
      const user_id = req.user_id || 'default_user';

      const generator = preferencesDB.query`
        SELECT * FROM user_preferences 
        WHERE user_id = ${user_id}
        ORDER BY preference_key
      `;

      const result = await collectResults(generator);
      const preferences: { [key: string]: string } = {};
      
      result.forEach(row => {
        preferences[row.preference_key] = row.preference_value;
      });

      // Add default preferences if they don't exist
      const defaultPrefs = {
        'end_of_day_time': '23:59',
        'start_of_week': 'monday',
        'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'date_format': 'YYYY-MM-DD',
        'time_format': '24h',
        'theme': 'system',
        'auto_switch_theme': 'true',
        'dark_hours_start': '18:00',
        'dark_hours_end': '06:00',
        'font_scale': '1.0',
        'default_calendar_view': 'week',
        'show_weekend': 'true',
        'habit_streak_grace_period': '0'
      };

      Object.entries(defaultPrefs).forEach(([key, value]) => {
        if (!(key in preferences)) {
          preferences[key] = value;
        }
      });

      return { preferences };
    } catch (error) {
      throw new Error(`Failed to get preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Set a preference (create or update)
export const setPreference = api(
  { method: "POST", path: "/preferences", expose: true },
  async (req: SetPreferenceRequest): Promise<SetPreferenceResponse> => {
    try {
      const user_id = req.user_id || 'default_user';      const key = sanitizeString(req.key, 100);
      const value = sanitizeString(req.value, 1000);

      // Use UPSERT to insert or update with database timestamps
      const generator = preferencesDB.query`
        INSERT INTO user_preferences (user_id, preference_key, preference_value, created_at, updated_at)
        VALUES (${user_id}, ${key}, ${value}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, preference_key) 
        DO UPDATE SET preference_value = ${value}, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await collectResults(generator);
      const prefRow = result[0];

      const preference: UserPreference = {
        id: prefRow.id,
        user_id: prefRow.user_id,
        preference_key: prefRow.preference_key,
        preference_value: prefRow.preference_value,
        created_at: prefRow.created_at,
        updated_at: prefRow.updated_at
      };

      return { preference };
    } catch (error) {
      throw new Error(`Failed to set preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get theme preference and resolved theme
export const getTheme = api(
  { method: "GET", path: "/theme", expose: true },
  async (req: GetThemeRequest): Promise<GetThemeResponse> => {
    try {
      const user_id = req.user_id || 'default_user';

      // Get theme-related preferences
      const generator = preferencesDB.query`
        SELECT preference_key, preference_value 
        FROM user_preferences 
        WHERE user_id = ${user_id} 
        AND preference_key IN ('theme', 'auto_switch', 'dark_start_time', 'dark_end_time')
      `;

      const result = await collectResults(generator);
      
      const prefs: Record<string, string> = {};
      result.forEach((row: any) => {
        prefs[row.preference_key] = row.preference_value;
      });

      // Set defaults
      const theme: Theme = (prefs.theme as Theme) || 'light';
      const auto_switch = prefs.auto_switch === 'true';
      const dark_start_time = prefs.dark_start_time || '18:00';
      const dark_end_time = prefs.dark_end_time || '06:00';

      const theme_preference: ThemePreference = {
        theme,
        auto_switch,
        dark_start_time,
        dark_end_time
      };      const system_theme = detectSystemTheme();
      const current_theme = resolveTheme(theme, auto_switch, dark_start_time, dark_end_time);

      return {
        theme,
        system_theme,
        current_theme,
        theme_preference
      };
    } catch (error) {
      throw new Error(`Failed to get theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Set theme preference
export const setTheme = api(
  { method: "POST", path: "/theme", expose: true },
  async (req: SetThemeRequest): Promise<SetThemeResponse> => {
    try {
      const user_id = req.user_id || 'default_user';
      const { theme, auto_switch, dark_start_time, dark_end_time } = req;

      // Validate theme
      if (!['light', 'dark', 'system'].includes(theme)) {
        throw new Error("Invalid theme. Must be 'light', 'dark', or 'system'");
      }

      // Validate time format if provided
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (dark_start_time && !timeRegex.test(dark_start_time)) {
        throw new Error("Invalid dark_start_time format. Use HH:MM");
      }
      if (dark_end_time && !timeRegex.test(dark_end_time)) {
        throw new Error("Invalid dark_end_time format. Use HH:MM");      }

      // Set theme preference
      await setPreference({ key: 'theme', value: theme, user_id });

      // Set auto switch if provided
      if (auto_switch !== undefined) {
        await setPreference({ key: 'auto_switch', value: auto_switch.toString(), user_id });
      }

      // Set dark hours if provided
      if (dark_start_time) {
        await setPreference({ key: 'dark_start_time', value: dark_start_time, user_id });
      }
      if (dark_end_time) {
        await setPreference({ key: 'dark_end_time', value: dark_end_time, user_id });
      }

      // Build response
      const theme_preference: ThemePreference = {
        theme,
        auto_switch: auto_switch ?? false,
        dark_start_time: dark_start_time || '18:00',
        dark_end_time: dark_end_time || '06:00'
      };

      const current_theme = resolveTheme(
        theme, 
        theme_preference.auto_switch, 
        theme_preference.dark_start_time, 
        theme_preference.dark_end_time
      );

      return {
        theme_preference,
        current_theme
      };
    } catch (error) {
      throw new Error(`Failed to set theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get system theme info
export const getSystemTheme = api(
  { method: "GET", path: "/theme/system", expose: true },
  async (): Promise<GetSystemThemeResponse> => {
    try {
      const system_theme = detectSystemTheme();
      const current_time = new Date().toLocaleString();
      const is_dark_hours = isDarkHours();

      return {
        system_theme,
        current_time,
        is_dark_hours
      };
    } catch (error) {
      throw new Error(`Failed to get system theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get time display preferences
export const getTimeDisplayPreferences = api(
  { method: "GET", path: "/preferences/time-display", expose: true },
  async (req: { user_id?: string }): Promise<{ time_display: TimeDisplayPreference }> => {
    try {
      const user_id = req.user_id || 'default_user';

      // Get individual preferences
      const timeFormatPref = await getPreference({ key: 'time_format', user_id });
      const dateFormatPref = await getPreference({ key: 'date_format', user_id });
      const showSecondsPref = await getPreference({ key: 'show_seconds', user_id });
      const showDatePref = await getPreference({ key: 'show_date', user_id });
      const showTimezonePref = await getPreference({ key: 'show_timezone', user_id });

      const time_display: TimeDisplayPreference = {
        time_format: (timeFormatPref.preference.preference_value as '12h' | '24h') || '12h',
        date_format: (dateFormatPref.preference.preference_value as 'short' | 'long' | 'iso') || 'short',
        show_seconds: showSecondsPref.preference.preference_value === 'true',
        show_date: showDatePref.preference.preference_value !== 'false',
        show_timezone: showTimezonePref.preference.preference_value === 'true'
      };

      return { time_display };
    } catch (error) {
      throw new Error(`Failed to get time display preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Set time display preferences
export const setTimeDisplayPreferences = api(
  { method: "POST", path: "/preferences/time-display", expose: true },
  async (req: { 
    time_format?: '12h' | '24h';
    date_format?: 'short' | 'long' | 'iso';
    show_seconds?: boolean;
    show_date?: boolean;
    show_timezone?: boolean;
    user_id?: string;
  }): Promise<{ time_display: TimeDisplayPreference }> => {
    try {
      const user_id = req.user_id || 'default_user';

      // Set individual preferences
      if (req.time_format !== undefined) {
        await setPreference({ key: 'time_format', value: req.time_format, user_id });
      }
      if (req.date_format !== undefined) {
        await setPreference({ key: 'date_format', value: req.date_format, user_id });
      }
      if (req.show_seconds !== undefined) {
        await setPreference({ key: 'show_seconds', value: req.show_seconds.toString(), user_id });
      }
      if (req.show_date !== undefined) {
        await setPreference({ key: 'show_date', value: req.show_date.toString(), user_id });
      }
      if (req.show_timezone !== undefined) {
        await setPreference({ key: 'show_timezone', value: req.show_timezone.toString(), user_id });
      }

      // Return updated preferences
      return await getTimeDisplayPreferences({ user_id });
    } catch (error) {
      throw new Error(`Failed to set time display preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
