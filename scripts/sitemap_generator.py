#!/usr/bin/env python3
"""
sitemap_generator.py — Bouiba Academy SEO Tool
فحص كل روابط الـ Sitemap وإيجاد الـ 404 والمكررات
شغّله بضغطة زر واحدة من Antigravity Terminal
"""

import requests
import xml.etree.ElementTree as ET
import sys
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://www.bouibacademy.me"
NS = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# ─── ألوان الـ Terminal ────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def fetch_sitemap(sitemap_url: str) -> list[str]:
    """جلب كل الـ URLs من ملف Sitemap"""
    try:
        r = requests.get(sitemap_url, timeout=10)
        r.raise_for_status()
        root = ET.fromstring(r.content)
        urls = [u.find("ns:loc", NS).text for u in root.findall("ns:url", NS)
                if u.find("ns:loc", NS) is not None]
        return urls
    except Exception as e:
        print(f"{RED}❌ فشل جلب الـ Sitemap: {e}{RESET}")
        sys.exit(1)

def check_url(url: str) -> tuple[str, int, float]:
    """فحص URL واحد — يُعيد (url, status_code, response_time)"""
    try:
        start = time.time()
        r = requests.get(url, timeout=8, allow_redirects=True)
        elapsed = round(time.time() - start, 2)
        return url, r.status_code, elapsed
    except requests.exceptions.Timeout:
        return url, 0, 8.0
    except Exception:
        return url, -1, 0.0

def check_sitemap_urls():
    """فحص كل روابط الـ Sitemap وإيجاد الـ 404"""
    
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}  🔍 Bouiba Academy — فحص الـ Sitemap{RESET}")
    print(f"  📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")

    # ── 1. جلب كل الـ Sitemaps الفرعية ──────────────────────────────
    sitemaps_to_check = [
        f"{BASE_URL}/sitemap-posts.xml",
        f"{BASE_URL}/sitemap-pages.xml",
        f"{BASE_URL}/sitemap-tools.xml",
    ]

    all_urls: list[str] = []
    for sm in sitemaps_to_check:
        urls = fetch_sitemap(sm)
        print(f"  📄 {sm.split('/')[-1]}: {len(urls)} رابط")
        all_urls.extend(urls)

    print(f"\n  {BOLD}إجمالي الروابط للفحص: {len(all_urls)}{RESET}\n")

    # ── 2. كشف التكرار قبل الفحص ────────────────────────────────────
    seen: dict[str, int] = {}
    for url in all_urls:
        seen[url] = seen.get(url, 0) + 1

    duplicates = {url: count for url, count in seen.items() if count > 1}
    unique_urls = list(seen.keys())

    # ── 3. فحص كل URL بشكل متوازٍ (10 threads) ──────────────────────
    print(f"  {BOLD}⚡ جاري الفحص بشكل متوازٍ...{RESET}\n")
    
    results: list[tuple[str, int, float]] = []
    broken: list[str] = []
    slow:   list[tuple[str, float]] = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_url, url): url for url in unique_urls}
        for future in as_completed(futures):
            url, status, elapsed = future.result()
            results.append((url, status, elapsed))

            if status == 200:
                color = GREEN if elapsed < 2 else YELLOW
                print(f"  {GREEN}OK 200{RESET}  {color}{elapsed}s{RESET}  {url}")
            elif status in (301, 302):
                print(f"  {YELLOW}REDIRECT {status}{RESET}  {elapsed}s  {url}")
            elif status == 404:
                print(f"  {RED}BROKEN 404{RESET}  {elapsed}s  {url}")
                broken.append(url)
            elif status == 0:
                print(f"  {RED}TIMEOUT{RESET}          {url}")
                broken.append(url)
            else:
                print(f"  {RED}ERROR {status}{RESET}  {elapsed}s  {url}")
                broken.append(url)

            if elapsed > 3 and status == 200:
                slow.append((url, elapsed))

    # ── 4. التقرير النهائي ───────────────────────────────────────────
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}  📊 التقرير النهائي{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}")

    ok_count = sum(1 for _, s, _ in results if s == 200)
    redirect_count = sum(1 for _, s, _ in results if s in (301, 302))

    print(f"\n  {GREEN}OK (200):            {ok_count}{RESET}")
    print(f"  {YELLOW}Redirects (301/302): {redirect_count}{RESET}")
    print(f"  {RED}Broken/Timeout:      {len(broken)}{RESET}")
    print(f"  Duplicates:          {len(duplicates)}")

    if broken:
        print(f"\n{BOLD}{RED}  -- روابط مكسورة (أصلحها فوراً) --{RESET}")
        for url in broken:
            print(f"    -> {url}")

    if duplicates:
        print(f"\n{BOLD}{YELLOW}  -- روابط مكررة في الـ Sitemap --{RESET}")
        for url, count in duplicates.items():
            print(f"    x{count}: {url}")

    if slow:
        print(f"\n{BOLD}{YELLOW}  -- روابط بطيئة (> 3 ثوانٍ) --{RESET}")
        for url, t in slow:
            print(f"    {t}s - {url}")

    # ── 5. Slugs عربية مشفّرة (SEO ضعيف) ────────────────────────────
    arabic_encoded = [u for u in unique_urls if "%D" in u or "%C" in u]
    if arabic_encoded:
        print(f"\n{BOLD}{YELLOW}  -- Slugs عربية مشفّرة (تضر بـ SEO) --{RESET}")
        for url in arabic_encoded:
            slug = url.split("/posts/")[-1] if "/posts/" in url else url
            print(f"    {slug[:70]}")
        print(f"\n  {YELLOW}الحل: غيّر هذه الـ Slugs في Blogger إلى أخرى إنجليزية{RESET}")

    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"  انتهى الفحص - {datetime.now().strftime('%H:%M:%S')}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")

    return broken

if __name__ == "__main__":
    broken = check_sitemap_urls()
    sys.exit(1 if broken else 0)
