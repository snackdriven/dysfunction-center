import { api } from './api';

export interface UserPreference {
  id: number;
  user_id: string;
  preference_key: string;
  preference_value: string;
  created_at: string;
  updated_at: string;
}

export interface ThemePreference {
  theme: 'light' | 'dark' | 'system';
  auto_switch: boolean;
  dark_start_time?: string;
  dark_end_time?: string;
}

export interface PreferencesResponse {
  preferences: Record<string, string>;
}

export interface ThemeResponse {
  theme: 'light' | 'dark' | 'system';
  system_theme?: 'light' | 'dark';
  current_theme: 'light' | 'dark';
  theme_preference: ThemePreference;
}

export class PreferencesService {
  // Get a specific preference
  async getPreference(key: string, userId?: string): Promise<UserPreference> {
    const response = await api.get(`/preferences/${key}`, {
      params: userId ? { user_id: userId } : {}
    });
    return response.data.preference;
  }

  // Set a preference
  async setPreference(key: string, value: string, userId?: string): Promise<UserPreference> {
    const response = await api.post('/preferences', {
      key,
      value,
      user_id: userId
    });
    return response.data.preference;
  }

  // Get all preferences
  async getAllPreferences(userId?: string): Promise<PreferencesResponse> {
    const response = await api.get('/preferences', {
      params: userId ? { user_id: userId } : {}
    });
    return response.data;
  }

  // Delete a preference
  async deletePreference(key: string, userId?: string): Promise<void> {
    await api.delete(`/preferences/${key}`, {
      params: userId ? { user_id: userId } : {}
    });
  }

  // Theme-specific methods
  async getTheme(userId?: string): Promise<ThemeResponse> {
    const response = await api.get('/preferences/theme', {
      params: userId ? { user_id: userId } : {}
    });
    return response.data;
  }

  async setTheme(
    theme: 'light' | 'dark' | 'system',
    autoSwitch?: boolean,
    darkStartTime?: string,
    darkEndTime?: string,
    userId?: string
  ): Promise<ThemeResponse> {
    const response = await api.post('/preferences/theme', {
      theme,
      auto_switch: autoSwitch,
      dark_start_time: darkStartTime,
      dark_end_time: darkEndTime,
      user_id: userId
    });
    return response.data;
  }

  // Get system theme info
  async getSystemTheme(): Promise<{
    system_theme: 'light' | 'dark';
    current_time: string;
    is_dark_hours: boolean;
  }> {
    const response = await api.get('/preferences/theme/system');
    return response.data;
  }

  // Convenience methods for common preferences
  async getEndOfDayTime(userId?: string): Promise<string> {
    try {
      const pref = await this.getPreference('end_of_day_time', userId);
      return pref.preference_value;
    } catch {
      return '23:59'; // Default
    }
  }

  async setEndOfDayTime(time: string, userId?: string): Promise<void> {
    await this.setPreference('end_of_day_time', time, userId);
  }

  async getDefaultCalendarView(userId?: string): Promise<string> {
    try {
      const pref = await this.getPreference('default_calendar_view', userId);
      return pref.preference_value;
    } catch {
      return 'week'; // Default
    }
  }

  async setDefaultCalendarView(view: string, userId?: string): Promise<void> {
    await this.setPreference('default_calendar_view', view, userId);
  }

  async getStartOfWeek(userId?: string): Promise<string> {
    try {
      const pref = await this.getPreference('start_of_week', userId);
      return pref.preference_value;
    } catch {
      return 'monday'; // Default
    }
  }

  async getStreakGracePeriod(userId?: string): Promise<number> {
    try {
      const pref = await this.getPreference('habit_streak_grace_period', userId);
      return parseInt(pref.preference_value, 10);
    } catch {
      return 0; // Default - strict mode
    }
  }

  async setStreakGracePeriod(days: number, userId?: string): Promise<void> {
    await this.setPreference('habit_streak_grace_period', days.toString(), userId);
  }
}

export const preferencesService = new PreferencesService();