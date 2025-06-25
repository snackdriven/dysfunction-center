#!/bin/bash

# Executive Dysfunction Center - Backup Scheduler
# This script sets up automated scheduled backups

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
CRON_COMMENT="# Executive Dysfunction Center automated backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if script exists
check_backup_script() {
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        error "Backup script not found: $BACKUP_SCRIPT"
        return 1
    fi
    
    if [ ! -x "$BACKUP_SCRIPT" ]; then
        log "Making backup script executable..."
        chmod +x "$BACKUP_SCRIPT"
    fi
    
    success "Backup script found and is executable"
}

# Check current cron jobs
check_existing_cron() {
    log "Checking for existing backup cron jobs..."
    
    if crontab -l 2>/dev/null | grep -q "edc.*backup"; then
        warn "Found existing backup cron jobs:"
        crontab -l 2>/dev/null | grep "edc.*backup" | sed 's/^/  /'
        echo ""
        echo -n "Remove existing backup cron jobs? (y/n): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            # Remove existing backup cron jobs
            crontab -l 2>/dev/null | grep -v "edc.*backup" | crontab -
            success "Removed existing backup cron jobs"
        else
            warn "Keeping existing cron jobs. This may cause conflicts."
        fi
    else
        log "No existing backup cron jobs found"
    fi
}

# Add daily backup job
add_daily_backup() {
    local hour="${1:-2}"  # Default to 2 AM
    local minute="${2:-0}"  # Default to top of hour
    
    log "Adding daily backup job (${hour}:${minute:02d})..."
    
    # Create cron entry
    local cron_entry="$minute $hour * * * cd \"$PROJECT_DIR\" && \"$BACKUP_SCRIPT\" >> \"$PROJECT_DIR/logs/backup.log\" 2>&1"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_COMMENT - Daily backup"; echo "$cron_entry") | crontab -
    
    success "Daily backup scheduled for ${hour}:${minute:02d}"
}

# Add weekly backup job
add_weekly_backup() {
    local day="${1:-0}"   # Default to Sunday (0)
    local hour="${2:-3}"  # Default to 3 AM
    local minute="${3:-0}" # Default to top of hour
    
    log "Adding weekly backup job (${day} ${hour}:${minute:02d})..."
    
    # Create cron entry
    local cron_entry="$minute $hour * * $day cd \"$PROJECT_DIR\" && \"$BACKUP_SCRIPT\" >> \"$PROJECT_DIR/logs/backup_weekly.log\" 2>&1"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_COMMENT - Weekly backup"; echo "$cron_entry") | crontab -
    
    success "Weekly backup scheduled for day $day at ${hour}:${minute:02d}"
}

# Create backup monitoring script
create_monitor_script() {
    local monitor_script="$SCRIPT_DIR/monitor-backups.sh"
    
    log "Creating backup monitoring script..."
    
    cat > "$monitor_script" << 'EOF'
#!/bin/bash

# Executive Dysfunction Center - Backup Monitor
# Checks backup status and sends alerts if needed

BACKUP_DIR="./backups"
LOG_DIR="./logs"
MAX_AGE_HOURS=25  # Alert if no backup in 25 hours (daily + 1 hour buffer)

# Check last backup
check_last_backup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "ERROR: Backup directory not found"
        return 1
    fi
    
    local latest_backup=$(ls -1t "$BACKUP_DIR"/edc_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$latest_backup" ]; then
        echo "ERROR: No backup files found"
        return 1
    fi
    
    local backup_time=$(stat -c %Y "$latest_backup" 2>/dev/null)
    local current_time=$(date +%s)
    local age_hours=$(( (current_time - backup_time) / 3600 ))
    
    echo "Latest backup: $(basename "$latest_backup")"
    echo "Age: $age_hours hours"
    
    if [ "$age_hours" -gt "$MAX_AGE_HOURS" ]; then
        echo "WARNING: Latest backup is older than $MAX_AGE_HOURS hours"
        return 1
    fi
    
    echo "OK: Backup is recent"
    return 0
}

# Check backup logs for errors
check_backup_logs() {
    if [ ! -d "$LOG_DIR" ]; then
        echo "WARNING: Log directory not found"
        return 0
    fi
    
    local latest_log=$(ls -1t "$LOG_DIR"/backup_*.log 2>/dev/null | head -1)
    
    if [ -z "$latest_log" ]; then
        echo "WARNING: No backup logs found"
        return 0
    fi
    
    local error_count=$(grep -c "\[ERROR\]" "$latest_log" 2>/dev/null || echo "0")
    
    if [ "$error_count" -gt 0 ]; then
        echo "WARNING: Found $error_count errors in latest backup log"
        echo "Recent errors:"
        grep "\[ERROR\]" "$latest_log" | tail -5 | sed 's/^/  /'
        return 1
    fi
    
    echo "OK: No errors in latest backup log"
    return 0
}

echo "=== Backup Status Check ==="
date
echo ""

backup_ok=true
log_ok=true

check_last_backup || backup_ok=false
echo ""
check_backup_logs || log_ok=false

echo ""
if [ "$backup_ok" = true ] && [ "$log_ok" = true ]; then
    echo "✓ All backup checks passed"
    exit 0
else
    echo "✗ Backup issues detected"
    exit 1
fi
EOF
    
    chmod +x "$monitor_script"
    success "Backup monitoring script created: $monitor_script"
}

# Add monitoring cron job
add_monitoring_job() {
    local hour="${1:-9}"   # Default to 9 AM
    local minute="${2:-0}" # Default to top of hour
    
    log "Adding backup monitoring job (${hour}:${minute:02d})..."
    
    local monitor_script="$SCRIPT_DIR/monitor-backups.sh"
    local cron_entry="$minute $hour * * * cd \"$PROJECT_DIR\" && \"$monitor_script\" >> \"$PROJECT_DIR/logs/backup_monitor.log\" 2>&1"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_COMMENT - Backup monitoring"; echo "$cron_entry") | crontab -
    
    success "Backup monitoring scheduled for ${hour}:${minute:02d}"
}

# Create log rotation script
create_log_rotation() {
    local logrotate_config="$SCRIPT_DIR/backup-logrotate.conf"
    
    log "Creating log rotation configuration..."
    
    cat > "$logrotate_config" << EOF
$PROJECT_DIR/logs/backup*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
    
    success "Log rotation configuration created: $logrotate_config"
    log "To enable log rotation, add this to your system logrotate:"
    log "sudo cp '$logrotate_config' /etc/logrotate.d/edc-backup"
}

# Show current cron status
show_cron_status() {
    log "Current backup-related cron jobs:"
    if crontab -l 2>/dev/null | grep -q "edc.*backup\|Executive Dysfunction"; then
        crontab -l 2>/dev/null | grep -A 1 -B 1 "edc.*backup\|Executive Dysfunction" | sed 's/^/  /'
    else
        echo "  No backup cron jobs found"
    fi
}

# Main function
main() {
    echo "Executive Dysfunction Center - Backup Scheduler"
    echo "=============================================="
    echo ""
    
    # Check prerequisites
    if ! command -v crontab &> /dev/null; then
        error "crontab is required but not installed"
        exit 1
    fi
    
    check_backup_script || exit 1
    
    case "${1:-setup}" in
        setup|install)
            log "Setting up automated backups..."
            check_existing_cron
            
            # Get user preferences
            echo "Backup Schedule Configuration"
            echo "============================"
            echo ""
            
            echo -n "Enable daily backups? (Y/n): "
            read -r daily_response
            if [[ ! "$daily_response" =~ ^[Nn]$ ]]; then
                echo -n "Daily backup time (hour 0-23, default 2): "
                read -r daily_hour
                daily_hour="${daily_hour:-2}"
                add_daily_backup "$daily_hour"
            fi
            
            echo -n "Enable weekly backups? (Y/n): "
            read -r weekly_response
            if [[ ! "$weekly_response" =~ ^[Nn]$ ]]; then
                echo -n "Weekly backup day (0=Sunday, 1=Monday, etc., default 0): "
                read -r weekly_day
                weekly_day="${weekly_day:-0}"
                echo -n "Weekly backup time (hour 0-23, default 3): "
                read -r weekly_hour
                weekly_hour="${weekly_hour:-3}"
                add_weekly_backup "$weekly_day" "$weekly_hour"
            fi
            
            echo -n "Enable backup monitoring? (Y/n): "
            read -r monitor_response
            if [[ ! "$monitor_response" =~ ^[Nn]$ ]]; then
                create_monitor_script
                echo -n "Monitoring check time (hour 0-23, default 9): "
                read -r monitor_hour
                monitor_hour="${monitor_hour:-9}"
                add_monitoring_job "$monitor_hour"
            fi
            
            create_log_rotation
            
            echo ""
            success "Backup automation setup completed!"
            show_cron_status
            ;;
            
        remove|uninstall)
            log "Removing backup automation..."
            if crontab -l 2>/dev/null | grep -q "edc.*backup\|Executive Dysfunction"; then
                crontab -l 2>/dev/null | grep -v "edc.*backup\|Executive Dysfunction" | crontab -
                success "Removed backup cron jobs"
            else
                log "No backup cron jobs found to remove"
            fi
            ;;
            
        status)
            show_cron_status
            ;;
            
        test)
            log "Testing backup script..."
            "$BACKUP_SCRIPT" --check
            ;;
            
        --help|-h)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup, install    Set up automated backups (default)"
            echo "  remove, uninstall Remove automated backups"
            echo "  status           Show current backup schedule"
            echo "  test             Test backup script connectivity"
            echo "  --help, -h       Show this help message"
            echo ""
            ;;
            
        *)
            error "Unknown command: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

main "$@"