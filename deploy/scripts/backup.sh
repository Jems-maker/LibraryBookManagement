#!/bin/bash

# Database backup script for Library Management System
# Place this in /usr/local/bin/ or /etc/cron.daily/

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/librarysystem/storage/backups"
DB_NAME="library_db"
DB_USER="library_user"
DB_PASS="library_pass"
DB_HOST="127.0.0.1"
RETENTION_DAYS=30

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Also backup storage directory
tar -czf $BACKUP_DIR/storage_backup_$DATE.tar.gz /var/www/librarysystem/storage/app/public

# Remove backups older than retention period
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-bucket/backups/
# aws s3 cp $BACKUP_DIR/storage_backup_$DATE.tar.gz s3://your-bucket/backups/

echo "Backup completed: $DATE"