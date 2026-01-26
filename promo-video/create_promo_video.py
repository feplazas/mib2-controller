#!/usr/bin/env python3
"""
MIB2 Controller - Promotional Video Generator
Creates a professional promo video for Play Store from screenshots
"""

import subprocess
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import shutil

# Configuration
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
DURATION_PER_SLIDE = 3  # seconds
TRANSITION_DURATION = 0.5  # seconds
OUTPUT_DIR = "/home/ubuntu/mib2_controller/promo-video"
FRAMES_DIR = f"{OUTPUT_DIR}/frames"

# Slides with captions
SLIDES = [
    ("01_home_screen.png", "Connect USB Adapters", "Manage MIB2 units remotely"),
    ("02_auto_spoof.png", "Automatic USB Spoofing", "One-tap compatibility fix"),
    ("03_telnet_terminal.png", "Telnet Terminal", "Execute commands directly"),
    ("07_fec_codes.png", "Unlock Premium Features", "CarPlay & Android Auto"),
    ("05_eeprom_backups.png", "Secure Backups", "Protect your EEPROM data"),
    ("06_offline_guides.png", "Offline Documentation", "Guides available anytime"),
]

def create_frame_with_text(img_path, title, subtitle, frame_num, total_frames):
    """Create a single frame with the screenshot and overlay text"""
    # Create base canvas
    canvas = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), color='#0a0a0a')
    
    # Load and resize screenshot
    screenshot = Image.open(img_path)
    
    # Scale screenshot to fit (maintain aspect ratio)
    scale = min(VIDEO_WIDTH * 0.9 / screenshot.width, VIDEO_HEIGHT * 0.7 / screenshot.height)
    new_width = int(screenshot.width * scale)
    new_height = int(screenshot.height * scale)
    screenshot = screenshot.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Center screenshot
    x_offset = (VIDEO_WIDTH - new_width) // 2
    y_offset = 180
    
    # Add subtle shadow effect
    shadow = Image.new('RGBA', (new_width + 40, new_height + 40), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([20, 20, new_width + 20, new_height + 20], fill=(0, 0, 0, 100))
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    canvas.paste(shadow, (x_offset - 20, y_offset - 20), shadow)
    
    # Paste screenshot
    canvas.paste(screenshot, (x_offset, y_offset))
    
    draw = ImageDraw.Draw(canvas)
    
    # Try to load fonts
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        logo_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        logo_font = ImageFont.load_default()
    
    # Draw app name at top
    app_name = "MIB2 Controller"
    bbox = draw.textbbox((0, 0), app_name, font=logo_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, 60), app_name, fill='#0a7ea4', font=logo_font)
    
    # Draw title at bottom
    text_y = y_offset + new_height + 80
    bbox = draw.textbbox((0, 0), title, font=title_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, text_y), title, fill='#ffffff', font=title_font)
    
    # Draw subtitle
    bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, text_y + 70), subtitle, fill='#9BA1A6', font=subtitle_font)
    
    return canvas

def create_intro_frame():
    """Create intro frame with app logo and name"""
    canvas = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), color='#0a0a0a')
    draw = ImageDraw.Draw(canvas)
    
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Load app icon if exists
    icon_path = "/home/ubuntu/mib2_controller/assets/images/icon.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path)
        icon = icon.resize((300, 300), Image.Resampling.LANCZOS)
        x_offset = (VIDEO_WIDTH - 300) // 2
        canvas.paste(icon, (x_offset, 600))
    
    # App name
    app_name = "MIB2 Controller"
    bbox = draw.textbbox((0, 0), app_name, font=title_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, 950), app_name, fill='#0a7ea4', font=title_font)
    
    # Tagline
    tagline = "Remote Control for MIB2 Units"
    bbox = draw.textbbox((0, 0), tagline, font=subtitle_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, 1050), tagline, fill='#9BA1A6', font=subtitle_font)
    
    return canvas

def create_outro_frame():
    """Create outro frame with call to action"""
    canvas = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), color='#0a0a0a')
    draw = ImageDraw.Draw(canvas)
    
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 42)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Load app icon
    icon_path = "/home/ubuntu/mib2_controller/assets/images/icon.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path)
        icon = icon.resize((200, 200), Image.Resampling.LANCZOS)
        x_offset = (VIDEO_WIDTH - 200) // 2
        canvas.paste(icon, (x_offset, 650))
    
    # Call to action
    cta = "Download Now"
    bbox = draw.textbbox((0, 0), cta, font=title_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, 920), cta, fill='#0a7ea4', font=title_font)
    
    # Features list
    features = ["✓ USB Spoofing", "✓ Telnet Terminal", "✓ FEC Codes", "✓ Offline Guides"]
    y_pos = 1050
    for feature in features:
        bbox = draw.textbbox((0, 0), feature, font=subtitle_font)
        text_width = bbox[2] - bbox[0]
        draw.text(((VIDEO_WIDTH - text_width) // 2, y_pos), feature, fill='#ffffff', font=subtitle_font)
        y_pos += 60
    
    # Footer
    footer = "For MIB2 STD2 Technisat/Preh units"
    bbox = draw.textbbox((0, 0), footer, font=small_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - text_width) // 2, 1400), footer, fill='#687076', font=small_font)
    
    return canvas

def main():
    print("🎬 Creating MIB2 Controller Promo Video...")
    
    # Create frames directory
    if os.path.exists(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR)
    os.makedirs(FRAMES_DIR)
    
    frame_count = 0
    frames_per_slide = int(DURATION_PER_SLIDE * FPS)
    transition_frames = int(TRANSITION_DURATION * FPS)
    
    # Create intro frames
    print("📝 Creating intro...")
    intro = create_intro_frame()
    for i in range(frames_per_slide):
        intro.save(f"{FRAMES_DIR}/frame_{frame_count:05d}.png")
        frame_count += 1
    
    # Create slide frames
    for idx, (img_file, title, subtitle) in enumerate(SLIDES):
        print(f"📸 Processing slide {idx + 1}/{len(SLIDES)}: {title}")
        img_path = f"{OUTPUT_DIR}/{img_file}"
        
        if not os.path.exists(img_path):
            print(f"  ⚠️ Image not found: {img_path}")
            continue
        
        frame = create_frame_with_text(img_path, title, subtitle, idx, len(SLIDES))
        
        # Create frames for this slide
        for i in range(frames_per_slide):
            frame.save(f"{FRAMES_DIR}/frame_{frame_count:05d}.png")
            frame_count += 1
    
    # Create outro frames
    print("📝 Creating outro...")
    outro = create_outro_frame()
    for i in range(frames_per_slide):
        outro.save(f"{FRAMES_DIR}/frame_{frame_count:05d}.png")
        frame_count += 1
    
    print(f"✅ Created {frame_count} frames")
    
    # Generate video with ffmpeg
    print("🎥 Encoding video...")
    output_video = f"{OUTPUT_DIR}/MIB2_Controller_Promo.mp4"
    
    cmd = [
        'ffmpeg', '-y',
        '-framerate', str(FPS),
        '-i', f'{FRAMES_DIR}/frame_%05d.png',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        output_video
    ]
    
    subprocess.run(cmd, check=True)
    
    print(f"✅ Video created: {output_video}")
    
    # Get video info
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 
                           'format=duration,size', '-of', 'default=noprint_wrappers=1', 
                           output_video], capture_output=True, text=True)
    print(f"📊 Video info:\n{result.stdout}")
    
    # Cleanup frames
    print("🧹 Cleaning up frames...")
    shutil.rmtree(FRAMES_DIR)
    
    print("🎉 Done!")

if __name__ == "__main__":
    main()
