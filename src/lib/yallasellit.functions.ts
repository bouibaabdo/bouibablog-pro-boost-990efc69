import { createServerFn } from "@tanstack/react-start";
import { parse } from "node-html-parser";

const BASE = "https://yallasellit.com";


export interface YSMatch {
  id: string;
  home: string;
  away: string;
  time: string;
  status: string;
  live: boolean;
  finished: boolean;
  streamUrl?: string; // original match page URL used as the reliable embedded source
  playerUrl?: string; // direct player/embed URL when available
  pageUrl?: string; // original match page URL as a fallback
  day: "yesterday" | "today" | "tomorrow";
}

const PAGES: Record<YSMatch["day"], string> = {
  yesterday: `${BASE}/matches-yesterday/`,
  today: `${BASE}/matches-today/`,
  tomorrow: `${BASE}/matches-tomorrow/`,
};

function cleanUrl(value: string | undefined, base = BASE): string | undefined {
  if (!value) return undefined;
  const decoded = value.replace(/&amp;|&#038;/g, "&").trim();
  try {
    const u = new URL(decoded, base);
    return ["http:", "https:"].includes(u.protocol) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function extractPlayerUrl(html: string, baseUrl: string): string | undefined {
  const root = parse(html);
  const iframes = root
    .querySelectorAll("iframe[src]")
    .map((iframe) => cleanUrl(iframe.getAttribute("src"), baseUrl))
    .filter(Boolean) as string[];

  const preferred = iframes.find((url) =>
    /player|embed|stream|live|twitch\.tv|m3u8/i.test(url),
  );
  if (preferred) return preferred;
  if (iframes[0]) return iframes[0];

  const sourceMatch = html.match(/(?:file|source|src)\s*[:=]\s*["']([^"']+(?:m3u8|embed|player|stream)[^"']*)["']/i);
  return cleanUrl(sourceMatch?.[1], baseUrl);
}

async function resolvePlayerUrl(pageUrl: string): Promise<string | undefined> {
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BouibAcademyBot/1.0; +https://edu.bouibacademy.me)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ar,en;q=0.8",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return undefined;
  return extractPlayerUrl(await res.text(), pageUrl);
}

function parseCard(html: string, day: YSMatch["day"]): YSMatch | null {
  const normalized = html.replace(/=\s*'([^']*)'/g, '="$1"');
  const root = parse(`<div>${normalized}</div>`);
  const teams = root.querySelectorAll(".MT_Team");
  const t1 = teams.find((t) => (t.getAttribute("class") || "").includes("TM1"));
  const t2 = teams.find((t) => (t.getAttribute("class") || "").includes("TM2"));
  if (!t1 || !t2) return null;
  const home = t1.querySelector(".TM_Name")?.text.trim() || "";
  const away = t2.querySelector(".TM_Name")?.text.trim() || "";
  if (!home || !away) return null;
  const time = root.querySelector(".MT_Time")?.text.trim() || "";
  const status = root.querySelector(".MT_Stat")?.text.trim() || "";
  const finished = status.includes("انتهت");
  const live =
    !finished &&
    (status.includes("جارية") || status.includes("مباشر") || /^\d+\s*'/.test(status));
  const href = root.querySelector("a[href]")?.getAttribute("href") || "";

  // Keep the match page as a fallback, then enrich it with the real iframe URL
  // in `scrape()` so the app embeds the player instead of an ad-heavy page.
  const pageUrl = cleanUrl(href);

  const id = `${home}-${away}-${day}`.replace(/\s+/g, "-");
  return { id, home, away, time, status, live, finished, streamUrl: pageUrl, pageUrl, day };
}


async function scrape(day: YSMatch["day"]): Promise<YSMatch[]> {
  const res = await fetch(PAGES[day], {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BouibAcademyBot/1.0; +https://edu.bouibacademy.me)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const parts = html.split('<div class="AY_Match');
  const cards: YSMatch[] = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = '<div class="AY_Match' + parts[i].split('<div class="AY_Match')[0];
    const m = parseCard(chunk, day);
    if (m) cards.push(m);
  }
  return Promise.all(
    cards.map(async (card) => {
      if (!card.pageUrl) return card;
      const playerUrl = await resolvePlayerUrl(card.pageUrl).catch(() => undefined);
      return playerUrl ? { ...card, playerUrl } : card;
    }),
  );
}

export const getYallasellitMatches = createServerFn({ method: "GET" }).handler(async () => {
  const [yesterday, today, tomorrow] = await Promise.all([
    scrape("yesterday").catch(() => []),
    scrape("today").catch(() => []),
    scrape("tomorrow").catch(() => []),
  ]);
  return { yesterday, today, tomorrow, fetchedAt: new Date().toISOString() };
});
