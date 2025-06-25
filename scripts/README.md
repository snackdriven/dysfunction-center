# Executive Dysfunction Center - Backup & Recovery Scripts

This directory contains scripts for automating data backup and recovery operations.

## Scripts Overview

### `backup.sh`
Creates complete backups of all application data using the export API.

**Features:**
- Exports data in both JSON and Markdown formats
- Creates versioned, timestamped backups
- Includes metadata and migration files
- Automatic compression and cleanup of old backups
- Comprehensive logging

**Usage:**
```bash
# Create a backup
./scripts/backup.sh

# Check application connectivity
./scripts/backup.sh --check

# List existing backups
./scripts/backup.sh --list

# Show help
./scripts/backup.sh --help
```

### `restore.sh`
Restores data from backup files using the import API.

**Features:**
- Interactive backup selection
- Data validation before import
- Multiple import modes (replace, merge, append)
- Detailed import reporting
- Safety confirmations

**Usage:**
```bash
# Interactive restore
./scripts/restore.sh

# Restore specific backup
./scripts/restore.sh ./backups/edc_backup_20231225_120000.tar.gz

# Restore with merge mode
./scripts/restore.sh ./backups/edc_backup_20231225_120000.tar.gz merge

# List available backups
./scripts/restore.sh --list

# Show help
./scripts/restore.sh --help
```

### `schedule-backups.sh`
Sets up automated backup scheduling using cron.

**Features:**
- Interactive setup wizard
- Daily and weekly backup scheduling
- Backup monitoring and health checks
- Log rotation configuration
- Easy removal of scheduled jobs

**Usage:**
```bash
# Set up automated backups
./scripts/schedule-backups.sh setup

# Remove automated backups
./scripts/schedule-backups.sh remove

# Check current schedule
./scripts/schedule-backups.sh status

# Test backup connectivity
./scripts/schedule-backups.sh test
```

## Prerequisites

### Required Tools
- `curl` - For API communication
- `jq` - For JSON processing
- `tar` - For backup compression
- `crontab` - For scheduling (optional)

### Installation
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install curl jq tar cron

# macOS
brew install curl jq

# Cron is typically pre-installed on most systems
```

## Directory Structure

```
scripts/
├── README.md                 # This file
├── backup.sh                 # Main backup script
├── restore.sh                # Main restore script
├── schedule-backups.sh       # Backup scheduler
└── monitor-backups.sh        # Generated monitoring script
```

```
backups/                      # Created automatically
├── edc_backup_20231225_120000.tar.gz
├── edc_backup_20231224_120000.tar.gz
└── ...
```

```
logs/                         # Created automatically
├── backup_20231225_120000.log
├── restore_20231225_140000.log
├── backup.log                # Daily backup logs
├── backup_weekly.log         # Weekly backup logs
└── backup_monitor.log        # Monitoring logs
```

## Backup Format

### Backup Archive Contents
```
edc_backup_YYYYMMDD_HHMMSS/
├── data_export.json          # Complete data in JSON format
├── data_export.md            # Human-readable Markdown format
├── metadata.json             # Backup metadata
├── package.json              # Application version info
├── CLAUDE.md                 # Project documentation
└── migrations/               # Database migrations
    ├── tasks/
    ├── habits/
    ├── mood/
    ├── calendar/
    ├── journal/
    └── preferences/
```

### Metadata Format
```json
{
  "backup_id": "edc_backup_20231225_120000",
  "created_at": "2023-12-25T12:00:00.000Z",
  "domains": ["tasks", "habits", "mood", "calendar", "preferences", "journal"],
  "version": "1.0.0",
  "user_initiated": true,
  "backup_type": "full",
  "application_version": "0.1.0"
}
```

## Configuration

### Environment Variables
- `API_URL` - API endpoint (default: http://localhost:4000)
- `BACKUP_DIR` - Backup directory (default: ./backups)

### Example Configuration
```bash
export API_URL="http://localhost:4000"
export BACKUP_DIR="/path/to/custom/backups"
./scripts/backup.sh
```

## Scheduling Examples

### Manual Cron Setup
If you prefer to set up cron manually instead of using the scheduler script:

```bash
# Edit crontab
crontab -e

# Add these lines for daily backup at 2 AM
0 2 * * * cd /path/to/edc && ./scripts/backup.sh >> ./logs/backup.log 2>&1

# Add this line for weekly backup on Sunday at 3 AM
0 3 * * 0 cd /path/to/edc && ./scripts/backup.sh >> ./logs/backup_weekly.log 2>&1

# Add this line for daily monitoring at 9 AM
0 9 * * * cd /path/to/edc && ./scripts/monitor-backups.sh >> ./logs/backup_monitor.log 2>&1
```

## Troubleshooting

### Common Issues

1. **Application not accessible**
   ```bash
   ./scripts/backup.sh --check
   ```
   - Ensure the Encore application is running: `encore run`
   - Check the API_URL environment variable

2. **Permission denied**
   ```bash
   chmod +x ./scripts/*.sh
   ```

3. **Missing dependencies**
   ```bash
   # Check if tools are installed
   which curl jq tar crontab
   ```

4. **Backup validation failed**
   - Check the backup file is not corrupted
   - Verify JSON format with: `jq empty backup_file.json`

5. **Import errors**
   - Use `--validate` flag to check data before importing
   - Review error messages in the import response

### Log Analysis
```bash
# View recent backup logs
tail -f ./logs/backup.log

# Check for errors
grep ERROR ./logs/backup_*.log

# Monitor backup health
./scripts/monitor-backups.sh
```

## Security Considerations

1. **File Permissions**
   - Backup files contain sensitive data
   - Ensure appropriate file permissions (600 or 640)
   - Consider encrypting backups for sensitive environments

2. **Network Security**
   - Use HTTPS for production API endpoints
   - Consider VPN or secure networks for backup transfers

3. **Storage Security**
   - Store backups in secure locations
   - Consider off-site backup storage
   - Implement retention policies

## Recovery Procedures

### Complete System Recovery
1. Ensure the application is running
2. Run the restore script: `./scripts/restore.sh`
3. Select the appropriate backup
4. Choose import mode (typically "replace" for full recovery)
5. Confirm the operation
6. Verify data integrity after restore

### Partial Recovery
1. Use "merge" or "append" mode for partial recovery
2. Select specific domains during restore if supported
3. Test thoroughly after partial restore

### Disaster Recovery
1. Ensure you have recent backups stored securely off-site
2. Set up a new instance of the application
3. Run database migrations: `encore db migrate`
4. Restore from the latest backup
5. Verify all functionality works correctly

## Best Practices

1. **Regular Testing**
   - Test backup and restore procedures monthly
   - Verify backup integrity regularly
   - Test recovery in a development environment

2. **Monitoring**
   - Set up backup monitoring alerts
   - Monitor backup file sizes and growth
   - Check log files for errors regularly

3. **Retention**
   - Keep multiple backup generations
   - Archive old backups to long-term storage
   - Follow organizational data retention policies

4. **Documentation**
   - Document any custom backup procedures
   - Keep recovery procedures up to date
   - Train team members on backup/restore procedures