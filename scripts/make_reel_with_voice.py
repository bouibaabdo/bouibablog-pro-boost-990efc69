import os
import sys
import subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')

WIDTH, HEIGHT = 1080, 1920
FPS = 30

OUTPUT_MP4 = os.path.join("public", "facebook-images", "reels-ollama-morocco.mp4")
TEMP_VIDEO_MP4 = os.path.join("public", "facebook-images", "temp_video.mp4")
VOICEOVER_MP3 = os.path.join("public", "facebook-images", "voiceover.mp3")
COVER_PATH = os.path.join("public", "facebook-images", "reels-ollama-morocco.png")

# 1. Moroccan Darija Script for Audio Voiceover
DARIJA_VOICEOVER_TEXT = """السلام عليكم! واش كتعرف بلي تقدر تخدم بأقوى نماذج الذكاء الاصطناعي فـ جهازك فابور 100% وبلا إنترنت؟
حبّس من ضياع الفلوس فـ الاشتراكات الشهرية أو الـ APIs الغالية.
مع أداة Ollama المجانية، كتحمّل النموذج فـ جهازك بكود واحد بسيط:
ollama run llama3
وها هو خدام معاك سرعة وخفة وبلا حدود!
وتقدر تربطها مع أداة n8n وتصاوب بوتات وأتمتة كاملة للمهام ديالك فـ أمان تام وبلا ما تخرج الداتا ديالك لبرا.
الشرح الكامل بالخطوات والسورس كود والأدوات المجانية نزلناه ليك فـ مقال عملي فـ المدونة.
الرابط غتلقاه كيتسناك مثبت فـ أول تعليق!"""

print("🎙️ Step 1: Synthesizing Moroccan Voiceover Audio (gTTS)...")
tts = gTTS(text=DARIJA_VOICEOVER_TEXT, lang='ar', slow=False)
tts.save(VOICEOVER_MP3)
print(f"✅ Voiceover saved at: {VOICEOVER_MP3}")

# Get audio duration using ffprobe/ffmpeg if needed, default to ~38 seconds
DURATION_SEC = 38
TOTAL_FRAMES = FPS * DURATION_SEC

# Font Resolver
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

font_title = get_arabic_font(56)
font_subtitle = get_arabic_font(40)
font_code = get_arabic_font(46)
font_badge = get_arabic_font(34)

# Load Base Background
if os.path.exists(COVER_PATH):
    base_bg = Image.open(COVER_PATH).convert("RGB")
    base_bg = base_bg.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
else:
    base_bg = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42))

print(f"🎬 Step 2: Rendering Video Frames ({WIDTH}x{HEIGHT} @ {FPS}fps)...")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(TEMP_VIDEO_MP4, fourcc, FPS, (WIDTH, HEIGHT))

for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / FPS

    # Smooth Camera Zoom
    zoom_factor = 1.0 + (0.04 * (frame_idx / TOTAL_FRAMES))
    w_z, h_z = int(WIDTH * zoom_factor), int(HEIGHT * zoom_factor)
    frame_img = base_bg.resize((w_z, h_z), Image.Resampling.LANCZOS)

    left = (w_z - WIDTH) // 2
    top = (h_z - HEIGHT) // 2
    frame_img = frame_img.crop((left, top, left + WIDTH, top + HEIGHT))

    draw = ImageDraw.Draw(frame_img, "RGBA")

    # Dark UI Gradients
    draw.rectangle([0, 0, WIDTH, 360], fill=(15, 23, 42, 230))
    draw.rectangle([0, HEIGHT - 460, WIDTH, HEIGHT], fill=(15, 23, 42, 235))

    # Header Badge
    draw.rectangle([60, 60, WIDTH - 60, 140], fill=(56, 189, 248, 40), outline=(56, 189, 248, 180), width=3)
    draw.text((WIDTH // 2, 100), "BOUIBA ACADEMY - MOROCCO AI REELS 🇲🇦", font=font_badge, fill=(255, 255, 255, 255), anchor="mm")

    # Scene 1 (0 - 8s): Moroccan Hook
    if time_sec < 8:
        draw.rectangle([50, 190, WIDTH - 50, 340], fill=(239, 68, 68, 230), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 240), "AI Free 100% f-PC Dialek!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, 305), "ذكاء اصطناعي مجاني فـ جهازك وبلا إنترنت 🇲🇦", font=font_subtitle, fill=(254, 242, 242, 255), anchor="mm")

    # Scene 2 (8 - 17s): No Subscriptions & Ollama Command
    elif time_sec < 17:
        draw.rectangle([50, 190, WIDTH - 50, 340], fill=(234, 179, 8, 230), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 245), "❌ حبّس من ضياع الفلوس فـ الاشتراكات!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, 305), "Local AI Model - Ollama & Llama 3", font=font_subtitle, fill=(254, 252, 232, 255), anchor="mm")

        # Terminal Box Animation
        draw.rectangle([70, HEIGHT // 2 - 130, WIDTH - 70, HEIGHT // 2 + 130], fill=(2, 6, 23, 245), outline=(56, 189, 248, 220), width=4)
        draw.text((110, HEIGHT // 2 - 80), "$ Terminal (Local AI)", font=font_badge, fill=(148, 163, 184, 255))
        draw.text((110, HEIGHT // 2 - 10), "> ollama run llama3", font=font_code, fill=(52, 211, 153, 255))
        draw.text((110, HEIGHT // 2 + 55), "⚡ سرعة، خفة، وبلا حدود!", font=font_subtitle, fill=(186, 230, 253, 255))

    # Scene 3 (17 - 28s): n8n Integration & Privacy
    elif time_sec < 28:
        draw.rectangle([50, 190, WIDTH - 50, 340], fill=(168, 85, 247, 230), outline=(255, 255, 255, 255), width=3)
        draw.text((WIDTH // 2, 245), "🤖 Ollama + n8n Automation", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, 305), "أتمتة البوتات وكتابة الأكواد فـ أمان تام", font=font_subtitle, fill=(250, 245, 255, 255), anchor="mm")

        draw.rectangle([70, HEIGHT // 2 - 110, WIDTH - 70, HEIGHT // 2 + 110], fill=(15, 23, 42, 245), outline=(168, 85, 247, 220), width=4)
        draw.text((WIDTH // 2, HEIGHT // 2 - 35), "⚡ أتمتة كاملة للمهام والعمليات", font=font_subtitle, fill=(244, 232, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, HEIGHT // 2 + 35), "🔒 حماية بياناتك ومستنداتك 100%", font=font_subtitle, fill=(192, 132, 252, 255), anchor="mm")

    # Scene 4 (28 - 38s): Call To Action (Link in 1st Comment)
    else:
        draw.rectangle([50, 190, WIDTH - 50, 340], fill=(16, 185, 129, 235), outline=(255, 255, 255, 255), width=4)
        draw.text((WIDTH // 2, 245), "📌 الشرح الكامل فـ المقال!", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, 305), "الخطوات والسورس كود مجاناً 100%", font=font_subtitle, fill=(236, 253, 245, 255), anchor="mm")

        draw.rectangle([70, HEIGHT - 390, WIDTH - 70, HEIGHT - 170], fill=(6, 78, 59, 245), outline=(52, 211, 153, 255), width=4)
        draw.text((WIDTH // 2, HEIGHT - 310), "👇 Comment 💬 مثبت الآن", font=font_title, fill=(255, 255, 255, 255), anchor="mm")
        draw.text((WIDTH // 2, HEIGHT - 220), "https://www.bouibacademy.me", font=font_subtitle, fill=(110, 231, 183, 255), anchor="mm")

    frame_np = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
    out.write(frame_np)

    if frame_idx % 150 == 0:
        print(f"Processed {frame_idx}/{TOTAL_FRAMES} frames ({int(frame_idx/TOTAL_FRAMES*100)}%)...")

out.release()
print("✅ Temp Video render complete.")

# 3. Merge Audio Voiceover + Video with FFmpeg
print("🎵 Step 3: Merging Moroccan Voiceover Audio with Video (FFmpeg)...")
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

cmd = [
    ffmpeg_exe,
    "-y",
    "-i", TEMP_VIDEO_MP4,
    "-i", VOICEOVER_MP3,
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    OUTPUT_MP4
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"🎉 SUCCESS! Final Reel Video with Audio saved at: {OUTPUT_MP4}")
else:
    print("❌ FFmpeg merge error:", res.stderr)

# Cleanup temp files
if os.path.exists(TEMP_VIDEO_MP4):
    os.remove(TEMP_VIDEO_MP4)
