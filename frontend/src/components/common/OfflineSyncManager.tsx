import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Wifi,
  WifiOff,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  AlertTriangle
} from 'lucide-react';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
  syncProgress: number;
  errors: string[];
}

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'habit' | 'mood' | 'journal' | 'calendar';
  data: any;
  timestamp: Date;
  retryCount: number;
}

const SYNC_STORAGE_KEY = 'edc_pending_changes';
const SYNC_STATUS_KEY = 'edc_sync_status';

export const OfflineSyncManager: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false,
    syncProgress: 0,
    errors: []
  });

  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval] = useState(30000); // 30 seconds - setSyncInterval removed as unused

  // const { setNotifications } = useAppStore();

  const addNotification = (notification: any) => {
    // TODO: Implement proper notification system
    console.log('Notification:', notification);
  };

  useEffect(() => {
    // Load pending changes from localStorage
    loadPendingChanges();
    loadSyncStatus();

    // Set up online/offline detection
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      if (autoSync) {
        handleSync();
      }
      addNotification({
        id: `online_${Date.now()}`,
        type: 'success',
        title: 'Back online',
        message: 'Connection restored. Syncing pending changes...',
        duration: 3000
      });
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      addNotification({
        id: `offline_${Date.now()}`,
        type: 'warning',
        title: 'Working offline',
        message: 'Changes will be saved locally and synced when online.',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up auto-sync interval
    let syncIntervalId: NodeJS.Timeout;
    if (autoSync) {
      syncIntervalId = setInterval(() => {
        if (navigator.onLine && pendingChanges.length > 0) {
          handleSync();
        }
      }, syncInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncIntervalId) {
        clearInterval(syncIntervalId);
      }
    };
  }, [autoSync, syncInterval, pendingChanges.length]); // handleSync is called conditionally, removing from deps

  const loadPendingChanges = () => {
    try {
      const stored = localStorage.getItem(SYNC_STORAGE_KEY);
      if (stored) {
        const changes = JSON.parse(stored).map((change: any) => ({
          ...change,
          timestamp: new Date(change.timestamp)
        }));
        setPendingChanges(changes);
        setSyncStatus(prev => ({ ...prev, pendingChanges: changes.length }));
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  };

  const loadSyncStatus = () => {
    try {
      const stored = localStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        const status = JSON.parse(stored);
        setSyncStatus(prev => ({
          ...prev,
          lastSync: status.lastSync ? new Date(status.lastSync) : null,
          errors: status.errors || []
        }));
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const savePendingChanges = (changes: PendingChange[]) => {
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(changes));
      setPendingChanges(changes);
      setSyncStatus(prev => ({ ...prev, pendingChanges: changes.length }));
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  };

  const saveSyncStatus = (status: Partial<SyncStatus>) => {
    try {
      const currentStatus = {
        lastSync: syncStatus.lastSync,
        errors: syncStatus.errors,
        ...status
      };
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(currentStatus));
      setSyncStatus(prev => ({ ...prev, ...status }));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  };

  const addPendingChange = (change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>) => {
    const newChange: PendingChange = {
      ...change,
      id: `${change.entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0
    };

    const updatedChanges = [...pendingChanges, newChange];
    savePendingChanges(updatedChanges);

    // If online and auto-sync is enabled, sync immediately
    if (navigator.onLine && autoSync) {
      setTimeout(handleSync, 1000); // Small delay to batch changes
    }
  };

  const handleSync = React.useCallback(async () => {
    if (!navigator.onLine || syncStatus.isSyncing || pendingChanges.length === 0) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0, errors: [] }));

    try {
      const totalChanges = pendingChanges.length;
      const successfulChanges: string[] = [];
      const failedChanges: PendingChange[] = [];
      const errors: string[] = [];

      for (let i = 0; i < pendingChanges.length; i++) {
        const change = pendingChanges[i];
        
        try {
          // Update progress
          setSyncStatus(prev => ({ 
            ...prev, 
            syncProgress: Math.round(((i + 1) / totalChanges) * 100)
          }));

          // Simulate API call based on entity type and operation
          await syncChange(change);
          successfulChanges.push(change.id);
        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);
          
          // Increment retry count
          const updatedChange = { ...change, retryCount: change.retryCount + 1 };
          
          // If retry count exceeds limit, mark as failed
          if (updatedChange.retryCount >= 3) {
            errors.push(`Failed to sync ${change.entity} ${change.type} after 3 attempts`);
          } else {
            failedChanges.push(updatedChange);
          }
        }
      }

      // Remove successful changes from pending list
      const remainingChanges = failedChanges;
      savePendingChanges(remainingChanges);

      // Update sync status
      saveSyncStatus({
        lastSync: new Date(),
        isSyncing: false,
        syncProgress: 100,
        errors
      });

      // Show success notification
      if (successfulChanges.length > 0) {
        addNotification({
          id: `sync_success_${Date.now()}`,
          type: 'success',
          title: 'Sync completed',
          message: `Successfully synced ${successfulChanges.length} changes`,
          duration: 3000
        });
      }

      // Show error notification if there were failures
      if (errors.length > 0) {
        addNotification({
          id: `sync_error_${Date.now()}`,
          type: 'error',
          title: 'Sync partially failed',
          message: `${errors.length} changes failed to sync`,
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Sync process failed:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        errors: ['Sync process failed'] 
      }));
      
      addNotification({
        id: `sync_failed_${Date.now()}`,
        type: 'error',
        title: 'Sync failed',
        message: 'Unable to sync changes. Will retry automatically.',
        duration: 5000
      });
    }
  }, [syncStatus.isSyncing, pendingChanges.length, addNotification]);

  const syncChange = async (change: PendingChange): Promise<void> => {
    // This would normally make actual API calls
    // For demo purposes, we'll simulate the API calls
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Simulated API error'));
        }
      }, 500 + Math.random() * 1000);
    });
  };

  const clearAllPendingChanges = () => {
    savePendingChanges([]);
    saveSyncStatus({ errors: [] });
    addNotification({
      id: `clear_pending_${Date.now()}`,
      type: 'info',
      title: 'Pending changes cleared',
      message: 'All pending changes have been removed',
      duration: 3000
    });
  };

  const retryFailedChanges = () => {
    const retriableChanges = pendingChanges.map(change => ({
      ...change,
      retryCount: 0
    }));
    savePendingChanges(retriableChanges);
    
    if (navigator.onLine) {
      handleSync();
    }
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Export the addPendingChange function for use by other components
  (window as any).addOfflineChange = addPendingChange;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Sync Manager
          </div>
          <Badge variant={syncStatus.isOnline ? 'success' : 'warning'}>
            {syncStatus.isOnline ? (
              <><Wifi className="h-3 w-3 mr-1" /> Online</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Last Sync</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(syncStatus.lastSync)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Pending Changes</p>
            <p className="font-medium flex items-center gap-1">
              <Upload className="h-3 w-3" />
              {syncStatus.pendingChanges}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Auto Sync</p>
            <p className="font-medium flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {autoSync ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium flex items-center gap-1">
              {syncStatus.isSyncing ? (
                <><RefreshCw className="h-3 w-3 animate-spin" /> Syncing</>
              ) : syncStatus.errors.length > 0 ? (
                <><XCircle className="h-3 w-3 text-destructive" /> Errors</>
              ) : (
                <><CheckCircle className="h-3 w-3 text-success" /> Ready</>
              )}
            </p>
          </div>
        </div>

        {/* Sync Progress */}
        {syncStatus.isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing changes...</span>
              <span>{syncStatus.syncProgress}%</span>
            </div>
            <Progress value={syncStatus.syncProgress} />
          </div>
        )}

        {/* Errors */}
        {syncStatus.errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sync Errors:</strong>
              <ul className="mt-1 ml-4 list-disc">
                {syncStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Changes Details */}
        {pendingChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Pending Changes</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pendingChanges.slice(0, 10).map((change) => (
                <div key={change.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                  <span className="capitalize">
                    {change.type} {change.entity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatTimeAgo(change.timestamp)}
                    </span>
                    {change.retryCount > 0 && (
                      <Badge variant="warning" className="text-xs">
                        Retry {change.retryCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {pendingChanges.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{pendingChanges.length - 10} more changes
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <Button 
            size="sm" 
            onClick={handleSync}
            disabled={!syncStatus.isOnline || syncStatus.isSyncing || pendingChanges.length === 0}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoSync(!autoSync)}
          >
            Auto Sync: {autoSync ? 'On' : 'Off'}
          </Button>

          {syncStatus.errors.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={retryFailedChanges}
            >
              Retry Failed
            </Button>
          )}

          {pendingChanges.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={clearAllPendingChanges}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
