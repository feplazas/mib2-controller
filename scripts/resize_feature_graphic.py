#!/usr/bin/env python3
"""
Resize the new feature graphic to Play Store specifications (1024x500px)
"""

from PIL import Image
import sys

def resize_feature_graphic(input_path, output_path):
    """Resize image to 1024x500px maintaining aspect ratio with crop"""
    try:
        # Open the image
        img = Image.open(input_path)
        print(f"Original size: {img.size}")
        
        # Target dimensions for Play Store feature graphic
        target_width = 1024
        target_height = 500
        target_ratio = target_width / target_height
        
        # Calculate current ratio
        current_ratio = img.width / img.height
        
        # Resize to fill target dimensions (may exceed in one dimension)
        if current_ratio > target_ratio:
            # Image is wider, fit to height
            new_height = target_height
            new_width = int(img.width * (target_height / img.height))
        else:
            # Image is taller, fit to width
            new_width = target_width
            new_height = int(img.height * (target_width / img.width))
        
        # Resize
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop to exact target dimensions (center crop)
        left = (new_width - target_width) // 2
        top = (new_height - target_height) // 2
        right = left + target_width
        bottom = top + target_height
        
        img_cropped = img_resized.crop((left, top, right, bottom))
        
        # Save as PNG
        img_cropped.save(output_path, 'PNG', optimize=True)
        print(f"Saved to: {output_path}")
        print(f"Final size: {img_cropped.size}")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    input_file = "/home/ubuntu/mib2_controller/play-store-assets/feature-graphic-new.jpg"
    output_file = "/home/ubuntu/mib2_controller/play-store-assets/feature-graphic.png"
    
    success = resize_feature_graphic(input_file, output_file)
    sys.exit(0 if success else 1)
