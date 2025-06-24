import { api } from './api';
import { 
  DailyProductivityData, 
  CrossDomainCorrelation, 
  ProductivityInsight,
  CalendarDataOverlay,
  DataExportRequest,
  DataExportResponse,
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
  async createExport(request: DataExportRequest): Promise<DataExportResponse> {
    const response = await api.post('/integration/export', request);
    return response.data;
  }

  async getExportStatus(exportId: string): Promise<{ status: 'pending' | 'completed' | 'failed'; progress?: number }> {
    const response = await api.get(`/integration/export/${exportId}/status`);
    return response.data;
  }

  async downloadExport(exportId: string): Promise<Blob> {
    const response = await api.get(`/integration/export/${exportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
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