#!/usr/bin/env python3
"""
meta_checker.py — Bouiba Academy SEO Auditor
يفحص كل صفحات الموقع ويُبلّغ عن مشاكل SEO بالتفصيل
"""

import requests
import re
import sys
import io
from datetime import datetime
from bs4 import BeautifulSoup

# Fix Unicode output on Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


# ─── ألوان الـ Terminal ────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

PAGES = [
    ("الصفحة الرئيسية",  "https://www.bouibacademy.me/"),
    ("المقالات",          "https://www.bouibacademy.me/posts"),
    ("الأدوات",           "https://www.bouibacademy.me/tools"),
    ("الاختبار",          "https://www.bouibacademy.me/quiz"),
    ("عن الأكاديمية",    "https://www.bouibacademy.me/about"),
    ("تواصل",             "https://www.bouibacademy.me/contact"),
    # مقالات للفحص
    ("مقال: RAG",         "https://www.bouibacademy.me/posts/rag"),
    ("مقال: Norton",      "https://www.bouibacademy.me/posts/norton-360-deluxe"),
    ("مقال: RAM",         "https://www.bouibacademy.me/posts/ram"),
]

def count_emojis(text: str) -> int:
    """عد الـ Emojis في النص"""
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "🔥⚡✅❌⚠️📅⏱️🎁🛡️🔍]+",
        flags=re.UNICODE,
    )
    return len(emoji_pattern.findall(text))

def check_page_seo(name: str, url: str) -> list[dict]:
    """فحص SEO شامل لصفحة واحدة"""
    issues = []

    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; BouibaBot/1.0)"}
        r = requests.get(url, timeout=10, headers=headers)
        status = r.status_code
    except Exception as e:
        return [{"level": "error", "msg": f"فشل الاتصال: {e}"}]

    if status == 404:
        return [{"level": "error", "msg": f"الصفحة غير موجودة (404)"}]
    if status != 200:
        return [{"level": "warning", "msg": f"كود HTTP غير متوقع: {status}"}]

    soup = BeautifulSoup(r.text, "html.parser")

    # ── 1. Title ─────────────────────────────────────────────────────
    title_tag = soup.find("title")
    if not title_tag:
        issues.append({"level": "error", "msg": "لا يوجد <title> Tag!"})
    else:
        t = title_tag.get_text(strip=True)
        if len(t) > 60:
            issues.append({"level": "warning", "msg": f"Title طويل ({len(t)} حرف) — الحد 60: «{t[:55]}...»"})
        if len(t) < 30:
            issues.append({"level": "warning", "msg": f"Title قصير جداً ({len(t)} حرف): «{t}»"})
        if "…" in t or "..." in t:
            issues.append({"level": "error", "msg": f"Title مقتطع بـ «...»: «{t}»"})

    # ── 2. Meta Description ──────────────────────────────────────────
    meta = soup.find("meta", {"name": "description"})
    if not meta:
        issues.append({"level": "error", "msg": "لا توجد Meta Description!"})
    else:
        desc = meta.get("content", "")
        if "&nbsp;" in desc:
            issues.append({"level": "error", "msg": "Meta Description تحتوي &nbsp; — أزلها"})
        if len(desc) > 155:
            issues.append({"level": "warning", "msg": f"Meta Description طويلة ({len(desc)} حرف) — الحد 155"})
        if len(desc) < 70:
            issues.append({"level": "warning", "msg": f"Meta Description قصيرة ({len(desc)} حرف) — الحد الأدنى 70"})
        emoji_count = count_emojis(desc)
        if emoji_count > 2:
            issues.append({"level": "warning", "msg": f"Meta Description تحتوي {emoji_count} emojis — قلّصها لأقل من 2"})

    # ── 3. H1 ────────────────────────────────────────────────────────
    h1_tags = soup.find_all("h1")
    if len(h1_tags) == 0:
        issues.append({"level": "error", "msg": "لا يوجد H1 في الصفحة!"})
    elif len(h1_tags) > 1:
        issues.append({"level": "warning", "msg": f"توجد {len(h1_tags)} عناصر H1 — يجب أن يكون واحداً فقط"})

    # ── 4. Canonical ─────────────────────────────────────────────────
    canonical = soup.find("link", {"rel": "canonical"})
    if not canonical:
        issues.append({"level": "error", "msg": "لا يوجد Canonical URL!"})
    else:
        canon_href = canonical.get("href", "")
        if not canon_href.startswith("https://"):
            issues.append({"level": "warning", "msg": f"Canonical URL غير آمن: {canon_href}"})

    # ── 5. OG Tags ───────────────────────────────────────────────────
    og_title = soup.find("meta", {"property": "og:title"})
    og_desc  = soup.find("meta", {"property": "og:description"})
    og_image = soup.find("meta", {"property": "og:image"})
    if not og_title:
        issues.append({"level": "warning", "msg": "لا يوجد og:title"})
    if not og_desc:
        issues.append({"level": "warning", "msg": "لا يوجد og:description"})
    if not og_image:
        issues.append({"level": "warning", "msg": "لا يوجد og:image — مهم للمشاركة على السوشيال ميديا"})

    # ── 6. Images ────────────────────────────────────────────────────
    imgs = soup.find_all("img")
    imgs_no_alt   = [img for img in imgs if not img.get("alt")]
    imgs_no_dims  = [img for img in imgs if not img.get("width") or not img.get("height")]
    imgs_lazy_lcp = []

    # فقط أول صورة خارج nav/header تُعدّ LCP
    content_imgs = [
        img for img in imgs
        if not any(p.name in ("nav", "header", "aside") for p in img.parents)
    ]
    for img in content_imgs[:2]:   # أول صورتَين في المحتوى = LCP candidates
        if img.get("loading") == "lazy":
            imgs_lazy_lcp.append(img.get("src", "")[:70])

    if imgs_no_alt:
        issues.append({"level": "error", "msg": f"{len(imgs_no_alt)} صورة بدون alt text"})
    if imgs_no_dims:
        issues.append({"level": "warning", "msg": f"{len(imgs_no_dims)} صورة بدون width/height (يسبب CLS) — أضف width/height في Blogger"})
    if imgs_lazy_lcp:
        for src in imgs_lazy_lcp:
            issues.append({"level": "error",
                           "msg": f"[CODE] صورة LCP بـ loading=lazy — تم إصلاحه في الكود (انتظر Deploy): {src}"})


    # ── 7. Schema.org ────────────────────────────────────────────────
    schemas = soup.find_all("script", {"type": "application/ld+json"})
    if not schemas:
        issues.append({"level": "warning", "msg": "لا يوجد Schema.org JSON-LD"})

    return issues

def run_audit():
    """تشغيل الفحص الكامل لكل الصفحات"""
    print(f"\n{BOLD}{BLUE}{'='*65}{RESET}")
    print(f"{BOLD}  🔍 Bouiba Academy — فحص SEO الشامل{RESET}")
    print(f"  📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{BOLD}{BLUE}{'='*65}{RESET}\n")

    total_errors   = 0
    total_warnings = 0

    for name, url in PAGES:
        print(f"\n{BOLD}{CYAN}── {name}{RESET}")
        print(f"   {url}")
        print(f"   {'-'*55}")

        issues = check_page_seo(name, url)

        if not issues:
            print(f"   {GREEN}✅ لا توجد مشاكل!{RESET}")
        else:
            for issue in issues:
                level = issue["level"]
                msg   = issue["msg"]
                if level == "error":
                    print(f"   {RED}❌ {msg}{RESET}")
                    total_errors += 1
                else:
                    print(f"   {YELLOW}⚠️  {msg}{RESET}")
                    total_warnings += 1

    # ── التقرير النهائي ──────────────────────────────────────────────
    print(f"\n{BOLD}{BLUE}{'='*65}{RESET}")
    print(f"{BOLD}  📊 ملخص الفحص{RESET}")
    print(f"{BOLD}{BLUE}{'='*65}{RESET}")
    print(f"  {RED}❌ أخطاء:    {total_errors}{RESET}")
    print(f"  {YELLOW}⚠️  تحذيرات: {total_warnings}{RESET}")

    score = max(0, 100 - (total_errors * 10) - (total_warnings * 3))
    color = GREEN if score >= 80 else (YELLOW if score >= 60 else RED)
    print(f"  {color}{BOLD}📈 درجة SEO التقديرية: {score}/100{RESET}")

    if total_errors == 0 and total_warnings == 0:
        print(f"\n  {GREEN}{BOLD}🎉 ممتاز! الموقع خالٍ من مشاكل SEO{RESET}")
    elif total_errors == 0:
        print(f"\n  {YELLOW}👍 جيد! لا أخطاء حرجة — راجع التحذيرات{RESET}")
    else:
        print(f"\n  {RED}⚠️  يجب إصلاح {total_errors} خطأ قبل أي شيء آخر{RESET}")

    print(f"\n{BOLD}{BLUE}{'='*65}{RESET}\n")

    return total_errors

if __name__ == "__main__":
    # تأكد من تثبيت المكتبات المطلوبة
    try:
        import bs4  # noqa: F401
    except ImportError:
        print(f"{RED}❌ مكتبة bs4 غير مثبتة. شغّل: pip install beautifulsoup4 requests{RESET}")
        sys.exit(1)

    errors = run_audit()
    sys.exit(1 if errors > 0 else 0)
