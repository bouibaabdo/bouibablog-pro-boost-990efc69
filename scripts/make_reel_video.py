import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')

# Reel Configuration
WIDTH, HEIGHT = 1080, 1920
FPS = 30
DURATION_SEC = 35
TOTAL_FRAMES = FPS * DURATION_SEC

OUTPUT_MP4 = os.path.join("public", "facebook-images", "reels-ollama-morocco.mp4")
COVER_PATH = os.path.join("public", "facebook-images", "reels-ollama-morocco.png")

# Font Fallback Resolver
def get_arabic_font(size):
    font_paths = [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\seguiemj.ttf",
        r"C:\Windows\Fonts\tahomabd.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_title = get_arabic_font(60)
font_subtitle = get_arabic_font(42)
font_code = get_arabic_font(48)
font_badge = get_arabic_font(34)

# Load and fit cover background
if os.path.exists(COVER_PATH):
    base_bg = Image.open(COVER_PATH).convert("RGB")
    base_bg = base_bg.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
else:
    base_bg = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42))

print(f"Starting MP4 Video Rendering ({WIDTH}x{HEIGHT} @ {FPS}fps, {DURATION_SEC}s)...")

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_MP4, fourcc, FPS, (WIDTH, HEIGHT))

for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / FPS

    # 1. Base frame with subtle zoom effect
    zoom_factor = 1.0 + (0.05 * (frame_idx / TOTAL_FRAMES))
    w_z, h_z = int(WIDTH * zoom_factor), int(HEIGHT * zoom_factor)
    frame_img = base_bg.resize((w_z, h_z), Image.Resampling.LANCZOS)

    # Crop to exact center
    left = (w_z - WIDTH) // 2
    top = (h_z - HEIGHT) // 2
    frame_img = frame_img.crop((left, top, left + WIDTH, top + HEIGHT))

    draw = ImageDraw.Draw(frame_img, "RGBA")

    # Dark overlay gradient for contrast
    draw.rectangle([0, 0, WIDTH, 350], fill=(15, 23, 42, 220))
    draw.rectangle([0, HEIGHT - 450, WIDTH, HEIGHT], fill=(15, 23, 42, 230))

    # Top Brand Header
    draw.rectangle([60, 60, WIDTH - 60, 140], fill=(56, 189, 248, 40), outline=(56, 189, 248, 180), width=3)
    draw.text((WIDTH // 2, 100), "BOUIBA ACADEMY - REELS", font=font_badge, fill=(255, 255, 255, 255), anchor="mm")

    # Scene 1: 0 - 7 sec (Hook)
    if time_sec < 7:
        draw.rectangle([50, 200, WIDTH - 50, 360], fill=(239, 68, 68, 220), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 255), "AI Free 100% f-PC Dialek!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, 320), "Local AI Model - Ollama & Llama 3", font=font_subtitle, fill=(255, 241, 242, 255), anchor="mm")

    # Scene 2: 7 - 15 sec (No Subscriptions & Code)
    elif time_sec < 15:
        draw.rectangle([50, 200, WIDTH - 50, 340], fill=(234, 179, 8, 220), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 270), "No Monthly Subscriptions $20!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")

        # Terminal Box Animation
        draw.rectangle([80, HEIGHT // 2 - 120, WIDTH - 80, HEIGHT // 2 + 120], fill=(2, 6, 23, 240), outline=(56, 189, 248, 220), width=4)
        draw.text((120, HEIGHT // 2 - 70), "$ Terminal (Local AI)", font=font_badge, fill=(148, 163, 184, 255))
        draw.text((120, HEIGHT // 2), "> ollama run llama3", font=font_code, fill=(52, 211, 153, 255))

    # Scene 3: 15 - 25 sec (Ollama + n8n Integration)
    elif time_sec < 25:
        draw.rectangle([50, 200, WIDTH - 50, 340], fill=(168, 85, 247, 220), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 270), "Ollama + n8n Automation", font=font_title, fill=(255, 255, 255, 255), anchor="mm")

        draw.rectangle([80, HEIGHT // 2 - 100, WIDTH - 80, HEIGHT // 2 + 100], fill=(15, 23, 42, 240), outline=(168, 85, 247, 220), width=4)
        draw.text((WIDTH // 2, HEIGHT // 2 - 30), "AI Workflows & Code Generation", font=font_subtitle, fill=(244, 232, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, HEIGHT // 2 + 30), "100% Privacy & Data Security", font=font_subtitle, fill=(192, 132, 252, 255), anchor="mm")

    # Scene 4: 25 - 35 sec (Call to Action - Link in Comment)
    else:
        draw.rectangle([50, 200, WIDTH - 50, 340], fill=(16, 185, 129, 230), outline=(255, 255, 255, 255), width=4)
        draw.text((WIDTH // 2, 270), "Full Guide & Code Link Below!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")

        draw.rectangle([80, HEIGHT - 380, WIDTH - 80, HEIGHT - 180], fill=(6, 78, 59, 240), outline=(52, 211, 153, 255), width=4)
        draw.text((WIDTH // 2, HEIGHT - 300), "Link in 1st Comment!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, HEIGHT - 220), "https://www.bouibacademy.me", font=font_subtitle, fill=(110, 231, 183, 255), anchor="mm")

    # Convert PIL Image back to OpenCV BGR Frame
    frame_np = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
    out.write(frame_np)

    if frame_idx % 150 == 0:
        print(f"Processed {frame_idx}/{TOTAL_FRAMES} frames ({int(frame_idx/TOTAL_FRAMES*100)}%)...")

out.release()
print(f"MP4 Video successfully generated at: {OUTPUT_MP4}")
