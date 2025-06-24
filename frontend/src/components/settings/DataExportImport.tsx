import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Dialog, DialogContent, DialogTrigger } from '../ui/Dialog';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationService } from '../../services/integration';
import { DataExportRequest, BackupMetadata } from '../../../../shared/types';
import { cn } from '../../utils/cn';

export const DataExportImport: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['tasks', 'habits', 'mood', 'calendar', 'journal']);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState<'export' | 'backup'>('export');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch backups
  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: integrationService.getBackups,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (request: DataExportRequest) => integrationService.createExport(request),
    onSuccess: (response) => {
      // Trigger download
      window.open(response.download_url, '_blank');
    },
  });

  // Backup mutation
  const backupMutation = useMutation({
    mutationFn: (domains?: string[]) => integrationService.createBackup(domains),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (request: { backup_id: string; domains?: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences')[] }) => 
      integrationService.restoreFromBackup(request),
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.clear();
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: (backupId: string) => integrationService.deleteBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const domainOptions = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'habits', label: 'Habits', icon: RefreshCw },
    { id: 'mood', label: 'Mood', icon: AlertCircle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: Database },
  ];

  const handleDomainToggle = (domainId: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains([...selectedDomains, domainId]);
    } else {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    }
  };

  const handleExport = () => {
    const request: DataExportRequest = {
      domains: selectedDomains as any,
      format: exportFormat,
      start_date: dateRange.start || undefined,
      end_date: dateRange.end || undefined,
    };
    exportMutation.mutate(request);
  };

  const handleBackup = () => {
    backupMutation.mutate(selectedDomains.length === domainOptions.length ? undefined : selectedDomains);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
        <p className="text-muted-foreground">
          Export your data, create backups, and restore from previous backups
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'export' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('export')}
        >
          <Download className="h-4 w-4 mr-2 inline" />
          Export Data
        </button>
        <button
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'backup' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('backup')}
        >
          <Database className="h-4 w-4 mr-2 inline" />
          Backup & Restore
        </button>
      </div>

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'json' | 'csv')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        JSON (Complete data with structure)
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV (Spreadsheet compatible)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Domain Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Data to Export</label>
                <div className="space-y-2">
                  {domainOptions.map((domain) => {
                    const Icon = domain.icon;
                    return (
                      <div key={domain.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={domain.id}
                          checked={selectedDomains.includes(domain.id)}
                          onCheckedChange={(checked) => handleDomainToggle(domain.id, checked as boolean)}
                        />
                        <label htmlFor={domain.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {domain.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to export all data
                </p>
              </div>

              {/* Export Button */}
              <Button 
                onClick={handleExport} 
                disabled={selectedDomains.length === 0 || exportMutation.isPending}
                className="w-full"
              >
                {exportMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Preparing Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export Info */}
          <Card>
            <CardHeader>
              <CardTitle>Export Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">JSON Format</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete data structure preservation</li>
                    <li>• Includes all relationships and metadata</li>
                    <li>• Best for backup and migration</li>
                    <li>• Can be imported back into the system</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">CSV Format</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Spreadsheet and database compatible</li>
                    <li>• Easy to analyze with external tools</li>
                    <li>• Flattened data structure</li>
                    <li>• Separate file for each data type</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Export links expire after 24 hours</li>
                    <li>• Large datasets may take time to process</li>
                    <li>• Downloads start automatically when ready</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Create Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Create Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Full System Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a complete backup of all your data
                  </p>
                </div>
                <Button 
                  onClick={handleBackup}
                  disabled={backupMutation.isPending}
                >
                  {backupMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Backup History</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['backups'] })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading backups...</p>
                </div>
              ) : backups && backups.length > 0 ? (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {backup.user_initiated ? 'Manual Backup' : 'Automatic Backup'}
                          </h4>
                          <Badge variant={backup.user_initiated ? 'default' : 'secondary'}>
                            {backup.user_initiated ? 'Manual' : 'Auto'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(backup.created_at)}</span>
                          <span>{formatFileSize(backup.size_bytes)}</span>
                          <span>{backup.domains.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBackup(backup);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            {selectedBackup && (
                              <RestoreBackupDialog 
                                backup={selectedBackup}
                                onRestore={(domains) => {
                                  restoreMutation.mutate({ 
                                    backup_id: selectedBackup.id, 
                                    domains: domains as ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences')[]
                                  });
                                  setRestoreDialogOpen(false);
                                }}
                                isRestoring={restoreMutation.isPending}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBackupMutation.mutate(backup.id)}
                          disabled={deleteBackupMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No backups found</p>
                  <p className="text-sm">Create your first backup to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface RestoreBackupDialogProps {
  backup: BackupMetadata;
  onRestore: (domains?: string[]) => void;
  isRestoring: boolean;
}

const RestoreBackupDialog: React.FC<RestoreBackupDialogProps> = ({
  backup,
  onRestore,
  isRestoring
}) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>(backup.domains);

  const domainOptions = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'habits', label: 'Habits' },
    { id: 'mood', label: 'Mood' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'journal', label: 'Journal' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Restore Backup</h3>
        <p className="text-sm text-muted-foreground">
          Restore data from backup created on {new Date(backup.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Data to Restore</label>
          <div className="mt-2 space-y-2">
            {backup.domains.map((domain) => {
              const domainInfo = domainOptions.find(d => d.id === domain);
              return (
                <div key={domain} className="flex items-center space-x-2">
                  <Checkbox
                    id={`restore-${domain}`}
                    checked={selectedDomains.includes(domain)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDomains([...selectedDomains, domain]);
                      } else {
                        setSelectedDomains(selectedDomains.filter(id => id !== domain));
                      }
                    }}
                  />
                  <label htmlFor={`restore-${domain}`} className="text-sm">
                    {domainInfo?.label || domain}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Warning</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Restoring will replace your current data with the backup data. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button 
          onClick={() => onRestore(selectedDomains)}
          disabled={selectedDomains.length === 0 || isRestoring}
          variant="destructive"
        >
          {isRestoring ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Restoring...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Restore Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
};