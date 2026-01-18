#!/bin/sh
#
# Guided MIB2 Backup Restoration Script
# Automatically verifies integrity before restoring
#
# Usage: sh /mnt/sd/guided_restore.sh <backup_file>
# Example: sh /mnt/sd/guided_restore.sh /mnt/sd/mib2_full_backup.img
#

echo "========================================="
echo "  MIB2 Guided Backup Restoration"
echo "========================================="
echo ""

# Check if backup file parameter is provided
if [ -z "$1" ]; then
    echo "ERROR: No backup file specified"
    echo "Usage: sh $0 <backup_file>"
    echo "Example: sh $0 /mnt/sd/mib2_full_backup.img"
    exit 1
fi

BACKUP_FILE="$1"
MD5_FILE="${BACKUP_FILE}.md5"

echo "Step 1/6: Verifying backup integrity..."
echo "==========================================="
echo ""

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "✓ Backup file found: $BACKUP_FILE"

# Get file information
FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
FILE_DATE=$(ls -l "$BACKUP_FILE" | awk '{print $6, $7, $8}')

echo "  Size: $FILE_SIZE"
echo "  Date: $FILE_DATE"
echo ""

# Check if MD5 file exists
if [ ! -f "$MD5_FILE" ]; then
    echo "WARNING: MD5 checksum file not found: $MD5_FILE"
    echo "Cannot verify backup integrity!"
    echo ""
    echo "Do you want to continue WITHOUT integrity verification? (yes/no)"
    read -r CONTINUE_WITHOUT_MD5
    if [ "$CONTINUE_WITHOUT_MD5" != "yes" ]; then
        echo "Restoration cancelled by user"
        exit 1
    fi
    SKIP_MD5=1
else
    echo "✓ MD5 checksum file found"
    SKIP_MD5=0
fi

# Verify MD5 if available
if [ "$SKIP_MD5" -eq 0 ]; then
    echo ""
    echo "Step 2/6: Calculating MD5 checksum..."
    echo "==========================================="
    echo "This may take several minutes..."
    echo ""
    
    CALCULATED_MD5=$(md5sum "$BACKUP_FILE" | awk '{print $1}')
    STORED_MD5=$(cat "$MD5_FILE" | awk '{print $1}')
    
    echo "Calculated MD5: $CALCULATED_MD5"
    echo "Stored MD5:     $STORED_MD5"
    echo ""
    
    if [ "$CALCULATED_MD5" = "$STORED_MD5" ]; then
        echo "✓ MD5 verification PASSED"
        echo "  Backup integrity confirmed!"
    else
        echo "✗ MD5 verification FAILED"
        echo "  Backup file may be corrupted!"
        echo ""
        echo "CRITICAL WARNING: Restoring a corrupted backup may brick your MIB2!"
        echo "Do you want to continue anyway? (type 'yes' to confirm)"
        read -r CONTINUE_CORRUPTED
        if [ "$CONTINUE_CORRUPTED" != "yes" ]; then
            echo "Restoration cancelled by user"
            exit 1
        fi
    fi
else
    echo ""
    echo "Step 2/6: Skipping MD5 verification (no checksum file)"
    echo "==========================================="
fi

echo ""
echo "Step 3/6: Detecting target device..."
echo "==========================================="
echo ""

# Detect target device
if [ -b "/dev/mmcblk0" ]; then
    TARGET_DEVICE="/dev/mmcblk0"
    echo "✓ Target device detected: $TARGET_DEVICE"
elif [ -b "/dev/mmc0" ]; then
    TARGET_DEVICE="/dev/mmc0"
    echo "✓ Target device detected: $TARGET_DEVICE"
else
    echo "ERROR: Cannot detect target device"
    echo "Please specify manually (e.g., /dev/mmcblk0):"
    read -r TARGET_DEVICE
    if [ ! -b "$TARGET_DEVICE" ]; then
        echo "ERROR: Invalid device: $TARGET_DEVICE"
        exit 1
    fi
fi

echo ""
echo "Step 4/6: Checking available space..."
echo "==========================================="
echo ""

# Get device size
if command -v blockdev > /dev/null 2>&1; then
    DEVICE_SIZE=$(blockdev --getsize64 "$TARGET_DEVICE" 2>/dev/null)
    if [ -n "$DEVICE_SIZE" ]; then
        DEVICE_SIZE_MB=$((DEVICE_SIZE / 1024 / 1024))
        echo "Target device size: ${DEVICE_SIZE_MB} MB"
    fi
fi

# Get backup file size in bytes
BACKUP_SIZE=$(ls -l "$BACKUP_FILE" | awk '{print $5}')
BACKUP_SIZE_MB=$((BACKUP_SIZE / 1024 / 1024))

echo "Backup file size: ${BACKUP_SIZE_MB} MB"
echo ""

if [ -n "$DEVICE_SIZE" ] && [ "$BACKUP_SIZE" -gt "$DEVICE_SIZE" ]; then
    echo "ERROR: Backup file is larger than target device!"
    echo "Cannot proceed with restoration"
    exit 1
fi

echo "✓ Space check passed"

echo ""
echo "Step 5/6: Final confirmation"
echo "==========================================="
echo ""
echo "CRITICAL WARNING:"
echo "  This will OVERWRITE ALL DATA on $TARGET_DEVICE"
echo "  Your MIB2 system will be restored to the backup state"
echo "  This operation CANNOT be undone!"
echo ""
echo "Backup details:"
echo "  File: $BACKUP_FILE"
echo "  Size: $FILE_SIZE"
echo "  Date: $FILE_DATE"
if [ "$SKIP_MD5" -eq 0 ]; then
    echo "  MD5:  Verified ✓"
else
    echo "  MD5:  NOT verified ⚠"
fi
echo ""
echo "Target device: $TARGET_DEVICE"
echo ""
echo "Do you want to proceed with restoration? (type 'RESTORE' to confirm)"
read -r FINAL_CONFIRMATION

if [ "$FINAL_CONFIRMATION" != "RESTORE" ]; then
    echo "Restoration cancelled by user"
    exit 1
fi

echo ""
echo "Step 6/6: Restoring backup..."
echo "==========================================="
echo ""
echo "Starting restoration. DO NOT INTERRUPT!"
echo "This will take 10-30 minutes depending on backup size"
echo ""

# Execute dd restore with progress
if dd if="$BACKUP_FILE" of="$TARGET_DEVICE" bs=4M status=progress 2>&1; then
    echo ""
    echo "Syncing changes to disk..."
    sync
    echo ""
    echo "========================================="
    echo "  Restoration completed successfully!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Reboot your MIB2 system"
    echo "  2. Wait 2-3 minutes for system to start"
    echo "  3. Verify that system boots correctly"
    echo ""
    echo "To reboot now, run: reboot"
else
    echo ""
    echo "========================================="
    echo "  ERROR: Restoration failed!"
    echo "========================================="
    echo ""
    echo "Your MIB2 may be in an inconsistent state"
    echo "Try running the restoration again"
    echo "If problem persists, contact technical support"
    exit 1
fi
