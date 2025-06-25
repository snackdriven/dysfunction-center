#!/bin/bash

# Executive Dysfunction Center - Data Restore Script
# This script restores data from backup files

set -e  # Exit on any error

# Configuration
BACKUP_DIR="./backups"
API_URL="http://localhost:4000"
LOG_FILE="./logs/restore_$(date +"%Y%m%d_%H%M%S").log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    echo "[ERROR] $1" >> "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

# Check if Encore app is running
check_app_status() {
    log "Checking if Encore application is running..."
    if curl -f -s "$API_URL/health" > /dev/null 2>&1; then
        success "Application is running and accessible"
        return 0
    else
        error "Application is not accessible at $API_URL"
        log "Please ensure the application is running with 'encore run'"
        return 1
    fi
}

# List available backups
list_backups() {
    log "Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        local backups=($(ls -1t "$BACKUP_DIR"/edc_backup_*.tar.gz 2>/dev/null))
        if [ ${#backups[@]} -eq 0 ]; then
            warn "No backup files found in $BACKUP_DIR"
            return 1
        fi
        
        for i in "${!backups[@]}"; do
            local backup_file="${backups[$i]}"
            local basename=$(basename "$backup_file" .tar.gz)
            local size=$(wc -c < "$backup_file" 2>/dev/null || echo "unknown")
            local date_str=$(echo "$basename" | sed 's/edc_backup_//' | sed 's/_/ /')
            echo "  $((i+1)). $basename ($size bytes) - $date_str"
        done
        return 0
    else
        error "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi
}

# Select backup interactively
select_backup() {
    local backups=($(ls -1t "$BACKUP_DIR"/edc_backup_*.tar.gz 2>/dev/null))
    
    if [ ${#backups[@]} -eq 0 ]; then
        error "No backup files found"
        return 1
    fi
    
    echo "Select a backup to restore:"
    for i in "${!backups[@]}"; do
        local backup_file="${backups[$i]}"
        local basename=$(basename "$backup_file" .tar.gz)
        local date_str=$(echo "$basename" | sed 's/edc_backup_//' | sed 's/_/ /')
        echo "  $((i+1)). $basename - $date_str"
    done
    
    echo -n "Enter backup number (1-${#backups[@]}): "
    read -r selection
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#backups[@]} ]; then
        SELECTED_BACKUP="${backups[$((selection-1))]}"
        success "Selected backup: $(basename "$SELECTED_BACKUP")"
        return 0
    else
        error "Invalid selection"
        return 1
    fi
}

# Extract backup
extract_backup() {
    local backup_file="$1"
    local extract_dir="/tmp/edc_restore_$$"
    
    log "Extracting backup: $(basename "$backup_file")"
    
    mkdir -p "$extract_dir"
    cd "$extract_dir"
    
    tar -xzf "$backup_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        success "Backup extracted successfully"
        EXTRACT_DIR="$extract_dir"
        return 0
    else
        error "Failed to extract backup"
        rm -rf "$extract_dir"
        return 1
    fi
}

# Validate backup contents
validate_backup() {
    local backup_dir="$1"
    local data_dir=$(find "$backup_dir" -type d -name "edc_backup_*" | head -1)
    
    if [ -z "$data_dir" ]; then
        error "Could not find backup data directory"
        return 1
    fi
    
    log "Validating backup contents..."
    
    # Check for essential files
    if [ ! -f "$data_dir/data_export.json" ]; then
        error "Missing data_export.json file"
        return 1
    fi
    
    if [ ! -f "$data_dir/metadata.json" ]; then
        warn "Missing metadata.json file"
    fi
    
    # Validate JSON format
    if ! jq empty "$data_dir/data_export.json" 2>/dev/null; then
        error "Invalid JSON format in data_export.json"
        return 1
    fi
    
    success "Backup validation passed"
    BACKUP_DATA_DIR="$data_dir"
    return 0
}

# Show backup information
show_backup_info() {
    local data_dir="$1"
    
    log "Backup Information:"
    
    if [ -f "$data_dir/metadata.json" ]; then
        local backup_date=$(jq -r '.created_at' "$data_dir/metadata.json" 2>/dev/null || echo "unknown")
        local domains=$(jq -r '.domains | join(", ")' "$data_dir/metadata.json" 2>/dev/null || echo "unknown")
        local version=$(jq -r '.version' "$data_dir/metadata.json" 2>/dev/null || echo "unknown")
        
        echo "  Created: $backup_date"
        echo "  Domains: $domains"
        echo "  Version: $version"
    fi
    
    if [ -f "$data_dir/data_export.json" ]; then
        local total_records=$(jq -r '.metadata.total_records' "$data_dir/data_export.json" 2>/dev/null || echo "unknown")
        echo "  Total Records: $total_records"
        
        # Show record counts by domain
        local tasks=$(jq -r '.data.tasks | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        local habits=$(jq -r '.data.habits | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        local mood=$(jq -r '.data.mood | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        local calendar=$(jq -r '.data.calendar | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        local journal=$(jq -r '.data.journal | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        local preferences=$(jq -r '.data.preferences | length' "$data_dir/data_export.json" 2>/dev/null || echo "0")
        
        echo "  Records by domain:"
        echo "    Tasks: $tasks"
        echo "    Habits: $habits"
        echo "    Mood: $mood"
        echo "    Calendar: $calendar"
        echo "    Journal: $journal"
        echo "    Preferences: $preferences"
    fi
}

# Confirm restore operation
confirm_restore() {
    echo ""
    warn "WARNING: This will replace your current data with the backup data."
    warn "This operation cannot be undone."
    echo ""
    echo -n "Are you sure you want to continue? (yes/no): "
    read -r confirmation
    
    if [ "$confirmation" = "yes" ]; then
        return 0
    else
        log "Restore operation cancelled by user"
        return 1
    fi
}

# Import data using API
import_data() {
    local data_file="$1"
    local import_mode="${2:-replace}"
    
    log "Importing data with mode: $import_mode"
    
    # Read the JSON data
    local file_content=$(cat "$data_file")
    
    # Create import request
    local import_request='{
        "file_content": '"$(echo "$file_content" | jq -R -s '.')"',
        "format": "json",
        "domains": ["tasks", "habits", "mood", "calendar", "preferences", "journal"],
        "import_mode": "'$import_mode'",
        "validate_only": false
    }'
    
    # Call import API
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$import_request" \
        "$API_URL/import" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        local success=$(echo "$response" | jq -r '.success' 2>/dev/null)
        local imported_count=$(echo "$response" | jq -r '.imported_count' 2>/dev/null)
        local error_count=$(echo "$response" | jq -r '.error_count' 2>/dev/null)
        
        if [ "$success" = "true" ]; then
            success "Data imported successfully!"
            log "Imported records: $imported_count"
            
            if [ "$error_count" != "0" ] && [ "$error_count" != "null" ]; then
                warn "Some records had errors: $error_count"
                local errors=$(echo "$response" | jq -r '.errors[]?' 2>/dev/null)
                if [ -n "$errors" ]; then
                    echo "$errors" | while read -r err; do
                        warn "Import error: $err"
                    done
                fi
            fi
            
            return 0
        else
            error "Import failed"
            local errors=$(echo "$response" | jq -r '.errors[]?' 2>/dev/null)
            if [ -n "$errors" ]; then
                echo "$errors" | while read -r err; do
                    error "Import error: $err"
                done
            fi
            return 1
        fi
    else
        error "Failed to call import API"
        return 1
    fi
}

# Cleanup temporary files
cleanup() {
    if [ -n "$EXTRACT_DIR" ] && [ -d "$EXTRACT_DIR" ]; then
        log "Cleaning up temporary files..."
        rm -rf "$EXTRACT_DIR"
        success "Cleanup completed"
    fi
}

# Main restore function
main() {
    local backup_file="$1"
    local import_mode="${2:-replace}"
    
    log "Starting restore process..."
    
    # Check prerequisites
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed. Please install jq first."
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed. Please install curl first."
        exit 1
    fi
    
    # Check app status
    check_app_status || exit 1
    
    # Select backup if not provided
    if [ -z "$backup_file" ]; then
        list_backups || exit 1
        select_backup || exit 1
        backup_file="$SELECTED_BACKUP"
    fi
    
    # Validate backup file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Extract and validate backup
    extract_backup "$backup_file" || exit 1
    validate_backup "$EXTRACT_DIR" || { cleanup; exit 1; }
    
    # Show backup information
    show_backup_info "$BACKUP_DATA_DIR"
    
    # Confirm restore
    confirm_restore || { cleanup; exit 1; }
    
    # Import data
    import_data "$BACKUP_DATA_DIR/data_export.json" "$import_mode" || { cleanup; exit 1; }
    
    cleanup
    success "Restore completed successfully!"
    log "Log file: $LOG_FILE"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Executive Dysfunction Center - Restore Script"
        echo ""
        echo "Usage: $0 [backup_file] [import_mode]"
        echo ""
        echo "Arguments:"
        echo "  backup_file    Path to backup file (interactive selection if not provided)"
        echo "  import_mode    Import mode: replace, merge, append (default: replace)"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --list         List available backups"
        echo "  --check        Check if application is accessible"
        echo ""
        echo "Environment Variables:"
        echo "  API_URL        API endpoint (default: http://localhost:4000)"
        echo "  BACKUP_DIR     Backup directory (default: ./backups)"
        echo ""
        exit 0
        ;;
    --check)
        check_app_status
        exit $?
        ;;
    --list)
        list_backups
        exit $?
        ;;
    *)
        main "$1" "$2"
        ;;
esac