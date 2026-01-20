#!/usr/bin/env python3
"""
Resize Play Store assets to exact specifications
"""
from PIL import Image
import os

# Define paths
base_dir = "/home/ubuntu/mib2_controller/play-store-assets"
icon_path = os.path.join(base_dir, "icon-512.png")
feature_path = os.path.join(base_dir, "feature-graphic.png")

# Resize icon to 512x512px
print("Resizing icon to 512x512px...")
icon = Image.open(icon_path)
icon_resized = icon.resize((512, 512), Image.Resampling.LANCZOS)
icon_resized.save(icon_path, "PNG", optimize=True)
print(f"✓ Icon saved: {icon_path} ({icon_resized.size[0]}x{icon_resized.size[1]}px)")

# Resize feature graphic to 1024x500px
print("\nResizing feature graphic to 1024x500px...")
feature = Image.open(feature_path)
feature_resized = feature.resize((1024, 500), Image.Resampling.LANCZOS)
feature_resized.save(feature_path, "PNG", optimize=True)
print(f"✓ Feature graphic saved: {feature_path} ({feature_resized.size[0]}x{feature_resized.size[1]}px)")

print("\n✅ All assets resized successfully!")
