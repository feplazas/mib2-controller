#!/usr/bin/env python3
"""
Convert WebP screenshots to PNG format for Play Store
"""
from PIL import Image
import os
import glob

# Define paths
base_dir = "/home/ubuntu/mib2_controller/play-store-assets"
screenshots = glob.glob(os.path.join(base_dir, "screenshot-*.png"))

print(f"Found {len(screenshots)} screenshots to process\n")

for screenshot_path in sorted(screenshots):
    filename = os.path.basename(screenshot_path)
    print(f"Processing {filename}...")
    
    # Open image (Pillow auto-detects WebP)
    img = Image.open(screenshot_path)
    
    # Get dimensions
    width, height = img.size
    print(f"  Original: {width}x{height}px")
    
    # Convert to RGB if necessary (WebP might have alpha channel)
    if img.mode in ('RGBA', 'LA', 'P'):
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Save as PNG
    img.save(screenshot_path, "PNG", optimize=True)
    print(f"  ✓ Converted to PNG: {width}x{height}px\n")

print("✅ All screenshots converted successfully!")
