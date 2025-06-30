import { api } from './api';
import { 
  DailyProductivityData, 
  CrossDomainCorrelation, 
  ProductivityInsight,
  CalendarDataOverlay,
  DataExportRequest,
  DataImportRequest,
  DataImportResponse,
  BackupMetadata,
  RestoreRequest,
  DateString 
} from '../../../shared/types';

export class IntegrationService {
  // Cross-domain productivity data
  async getDailyProductivityData(date: DateString): Promise<DailyProductivityData> {
    const response = await api.get(`/integration/productivity/${date}`);
    return response.data;
  }

  async getProductivityDataRange(startDate: DateString, endDate: DateString): Promise<DailyProductivityData[]> {
    const response = await api.get('/integration/productivity/range', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  // Calendar overlay data
  async getCalendarOverlayData(date: DateString): Promise<CalendarDataOverlay> {
    const response = await api.get(`/integration/calendar-overlay/${date}`);
    return response.data;
  }

  async getCalendarOverlayRange(startDate: DateString, endDate: DateString): Promise<Map<string, CalendarDataOverlay>> {
    const response = await api.get('/integration/calendar-overlay/range', {
      params: { start_date: startDate, end_date: endDate }
    });
    return new Map(Object.entries(response.data));
  }

  // Correlations and insights
  async getCorrelations(days: number = 30): Promise<CrossDomainCorrelation[]> {
    const response = await api.get('/integration/correlations', {
      params: { days }
    });
    return response.data;
  }

  async getInsights(days: number = 30): Promise<ProductivityInsight[]> {
    const response = await api.get('/integration/insights', {
      params: { days }
    });
    return response.data;
  }

  async dismissInsight(insightId: string): Promise<void> {
    await api.delete(`/integration/insights/${insightId}`);
  }

  // Data export functionality
  async createExport(request: DataExportRequest): Promise<{ content: string; filename: string; contentType: string }> {
    const response = await api.post('/export', request);
    
    // Remove or comment out debug log
    // console.log('Export response:', response.data);
    
    // Automatically trigger download
    const data = response.data;
    
    // Create blob with appropriate content type
    let mimeType = data.contentType;
    if (request.format === 'csv') {
      mimeType = 'text/csv;charset=utf-8;';
    } else if (request.format === 'markdown') {
      mimeType = 'text/markdown;charset=utf-8;';
    } else {
      mimeType = 'application/json;charset=utf-8;';
    }
    
    const blob = new Blob([data.content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = data.filename;
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    
    // Force download on different browsers
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      link.click();
    } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
      link.click();
    } else {
      // Fallback for other browsers
      link.click();
    }
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return data;
  }

  // Data import functionality
  async importData(request: DataImportRequest): Promise<DataImportResponse> {
    const response = await api.post('/import', request);
    return response.data;
  }

  async validateImportData(fileContent: string, format: 'json' | 'markdown'): Promise<DataImportResponse> {
    const response = await api.post('/import', {
      file_content: fileContent,
      format: format,
      import_mode: 'append',
      validate_only: true
    });
    return response.data;
  }

  // File handling utilities
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Backup and restore
  async createBackup(domains?: string[]): Promise<BackupMetadata> {
    const response = await api.post('/integration/backup', { domains });
    return response.data;
  }

  async getBackups(): Promise<BackupMetadata[]> {
    const response = await api.get('/integration/backups');
    return response.data;
  }

  async restoreFromBackup(request: RestoreRequest): Promise<{ success: boolean; restored_records: number }> {
    const response = await api.post('/integration/restore', request);
    return response.data;
  }

  async deleteBackup(backupId: string): Promise<void> {
    await api.delete(`/integration/backup/${backupId}`);
  }

  // Quick actions for cross-domain operations
  async scheduleTaskOnCalendar(taskId: number, startTime: string, duration?: number): Promise<{ eventId: number }> {
    const response = await api.post('/integration/schedule-task', {
      task_id: taskId,
      start_time: startTime,
      duration_minutes: duration
    });
    return response.data;
  }

  async completeTaskFromCalendar(eventId: number): Promise<{ taskId?: number; completed: boolean }> {
    const response = await api.post(`/integration/complete-task-from-event/${eventId}`);
    return response.data;
  }

  async markHabitsFromCalendar(date: DateString, habitIds: number[], completed: boolean = true): Promise<{ updated: number }> {
    const response = await api.post('/integration/mark-habits-from-calendar', {
      date,
      habit_ids: habitIds,
      completed
    });
    return response.data;
  }

  async addMoodFromCalendar(date: DateString, moodData: {
    primary_mood: string;
    mood_score: number;
    energy_level?: number;
    stress_level?: number;
  }): Promise<{ moodId: number }> {
    const response = await api.post('/integration/add-mood-from-calendar', {
      date,
      ...moodData
    });
    return response.data;
  }

  // Productivity score calculation
  async calculateProductivityScore(date: DateString): Promise<{ score: number; breakdown: any }> {
    const response = await api.get(`/integration/productivity-score/${date}`);
    return response.data;
  }

  // Weekly productivity summary for dashboard insights
  async getWeeklyProductivitySummary(): Promise<{
    tasks_completed: number;
    habits_maintained: number;
    avg_mood_score: number;
  }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      const weeklyData = await this.getProductivityDataRange(startDate, endDate);
      
      // Aggregate the weekly data
      const summary = weeklyData.reduce((acc, day) => {
        acc.tasks_completed += day.tasks?.completed || 0;
        acc.habits_maintained += day.habits?.completed || 0;
        if (day.mood?.score) {
          acc.mood_entries++;
          acc.mood_total += day.mood.score;
        }
        return acc;
      }, {
        tasks_completed: 0,
        habits_maintained: 0,
        mood_entries: 0,
        mood_total: 0
      });

      return {
        tasks_completed: summary.tasks_completed,
        habits_maintained: summary.habits_maintained,
        avg_mood_score: summary.mood_entries > 0 ? summary.mood_total / summary.mood_entries : 0
      };
    } catch (error) {
      // Fallback to default values if API call fails
      return {
        tasks_completed: 0,
        habits_maintained: 0,
        avg_mood_score: 0
      };
    }
  }

  // Data sync status
  async getSyncStatus(): Promise<{ 
    status: 'idle' | 'syncing' | 'error'; 
    last_sync: string; 
    pending_changes: number;
    error_message?: string;
  }> {
    const response = await api.get('/integration/sync/status');
    return response.data;
  }

  async triggerSync(): Promise<{ success: boolean; synced_records: number }> {
    const response = await api.post('/integration/sync/trigger');
    return response.data;
  }

  // Analytics across domains
  async getCrossDomainAnalytics(startDate: DateString, endDate: DateString): Promise<{
    overall_productivity_trend: number;
    best_performing_domain: string;
    improvement_suggestions: string[];
    weekly_patterns: any[];
  }> {
    const response = await api.get('/integration/analytics', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
}

export const integrationService = new IntegrationService();