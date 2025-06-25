#!/bin/bash

# Executive Dysfunction Center - Data Backup Script
# This script creates automated backups of all application data

set -e  # Exit on any error

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="edc_backup_$DATE"
API_URL="http://localhost:4000"
LOG_FILE="./logs/backup_$DATE.log"

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

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
}

# Export data using API endpoints
export_data() {
    local format="$1"
    local filename="$2"
    
    log "Exporting data in $format format..."
    
    # Create export request
    local export_request='{
        "domains": ["tasks", "habits", "mood", "calendar", "preferences", "journal"],
        "format": "'$format'",
        "include_deleted": false
    }'
    
    # Call export API
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$export_request" \
        "$API_URL/export" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        # Extract content from response and save to file
        echo "$response" | jq -r '.content' > "$BACKUP_DIR/$BACKUP_NAME/$filename" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            success "Successfully exported $format data to $filename"
            local file_size=$(wc -c < "$BACKUP_DIR/$BACKUP_NAME/$filename")
            log "File size: $file_size bytes"
        else
            error "Failed to save $format export to file"
            return 1
        fi
    else
        error "Failed to export $format data from API"
        return 1
    fi
}

# Create metadata file
create_metadata() {
    log "Creating backup metadata..."
    
    local metadata='{
        "backup_id": "'$BACKUP_NAME'",
        "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
        "domains": ["tasks", "habits", "mood", "calendar", "preferences", "journal"],
        "version": "1.0.0",
        "user_initiated": true,
        "backup_type": "full",
        "application_version": "0.1.0"
    }'
    
    echo "$metadata" | jq '.' > "$BACKUP_DIR/$BACKUP_NAME/metadata.json" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        success "Metadata file created"
    else
        error "Failed to create metadata file"
        return 1
    fi
}

# Copy additional files
copy_additional_files() {
    log "Copying additional configuration files..."
    
    # Copy migration files for reference
    if [ -d "./tasks/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/tasks"
        cp -r ./tasks/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/tasks/" 2>/dev/null || warn "Could not copy task migrations"
    fi
    
    if [ -d "./habits/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/habits"
        cp -r ./habits/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/habits/" 2>/dev/null || warn "Could not copy habit migrations"
    fi
    
    if [ -d "./mood/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/mood"
        cp -r ./mood/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/mood/" 2>/dev/null || warn "Could not copy mood migrations"
    fi
    
    if [ -d "./calendar/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/calendar"
        cp -r ./calendar/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/calendar/" 2>/dev/null || warn "Could not copy calendar migrations"
    fi
    
    if [ -d "./journal/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/journal"
        cp -r ./journal/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/journal/" 2>/dev/null || warn "Could not copy journal migrations"
    fi
    
    if [ -d "./preferences/migrations" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/migrations/preferences"
        cp -r ./preferences/migrations/* "$BACKUP_DIR/$BACKUP_NAME/migrations/preferences/" 2>/dev/null || warn "Could not copy preferences migrations"
    fi
    
    # Copy package.json for version info
    if [ -f "./package.json" ]; then
        cp "./package.json" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || warn "Could not copy package.json"
    fi
    
    # Copy CLAUDE.md for context
    if [ -f "./CLAUDE.md" ]; then
        cp "./CLAUDE.md" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || warn "Could not copy CLAUDE.md"
    fi
    
    success "Additional files copied"
}

# Create compressed archive
create_archive() {
    log "Creating compressed archive..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local archive_size=$(wc -c < "${BACKUP_NAME}.tar.gz")
        success "Compressed archive created: ${BACKUP_NAME}.tar.gz ($archive_size bytes)"
        
        # Remove uncompressed directory
        rm -rf "$BACKUP_NAME"
        success "Temporary directory cleaned up"
    else
        error "Failed to create compressed archive"
        return 1
    fi
    
    cd - > /dev/null
}

# Cleanup old backups (keep last 10)
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last 10)..."
    
    cd "$BACKUP_DIR"
    local backup_count=$(ls -1 edc_backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt 10 ]; then
        local to_delete=$((backup_count - 10))
        ls -1t edc_backup_*.tar.gz | tail -n "$to_delete" | xargs rm -f
        success "Removed $to_delete old backup(s)"
    else
        log "No old backups to clean up (found $backup_count backup(s))"
    fi
    
    cd - > /dev/null
}

# Main backup function
main() {
    log "Starting backup process..."
    log "Backup name: $BACKUP_NAME"
    
    # Check prerequisites
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed. Please install jq first."
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed. Please install curl first."
        exit 1
    fi
    
    # Run backup steps
    check_app_status || exit 1
    create_backup_dir
    
    # Export data in both formats
    export_data "json" "data_export.json" || exit 1
    export_data "markdown" "data_export.md" || exit 1
    
    create_metadata || exit 1
    copy_additional_files
    create_archive || exit 1
    cleanup_old_backups
    
    success "Backup completed successfully!"
    log "Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    log "Log file: $LOG_FILE"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Executive Dysfunction Center - Backup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check        Check if application is accessible"
        echo "  --list         List existing backups"
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
        echo "Existing backups:"
        if [ -d "$BACKUP_DIR" ]; then
            ls -la "$BACKUP_DIR"/edc_backup_*.tar.gz 2>/dev/null || echo "No backups found"
        else
            echo "Backup directory does not exist: $BACKUP_DIR"
        fi
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac