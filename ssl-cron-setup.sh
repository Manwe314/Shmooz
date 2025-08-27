#!/bin/bash

# Setup automatic SSL certificate renewal via cron
# Certificates will be checked for renewal twice daily

echo "⏰ Setting up automatic SSL certificate renewal..."
echo "================================================"

# Get the current directory (where the project is located)
PROJECT_DIR=$(pwd)

# Create the cron job entry (runs twice daily for redundancy)
CRON_JOB="0 2,14 * * * cd $PROJECT_DIR && ./ssl-renew.sh >> ./Volume/certbot/logs/renewal.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "ssl-renew.sh"; then
    echo "⚠️  SSL renewal cron job already exists"
    echo "Current cron jobs:"
    crontab -l | grep ssl-renew.sh
    
    read -p "Replace existing cron job? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing cron job"
        exit 0
    fi
    
    # Remove existing SSL cron jobs
    crontab -l | grep -v ssl-renew.sh | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo ""
echo "📋 Cron Job Details:"
echo "  - Schedule: Twice daily at 2:00 AM and 2:00 PM"
echo "  - Command: $PROJECT_DIR/ssl-renew.sh"
echo "  - Logs: $PROJECT_DIR/Volume/certbot/logs/renewal.log"
echo ""
echo "🔍 To view current cron jobs:"
echo "  crontab -l"
echo ""
echo "📝 To view renewal logs:"
echo "  tail -f ./Volume/certbot/logs/renewal.log"
echo ""
echo "⚠️  Note: Certificates are only renewed if they expire within 30 days"
