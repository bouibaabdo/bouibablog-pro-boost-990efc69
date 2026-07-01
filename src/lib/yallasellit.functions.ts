import { createServerFn } from "@tanstack/react-start";
import { parse } from "node-html-parser";

const BASE = "https://yallasellit.com";
const INTERNAL_HOST = "yallasellit.com";

export interface YSMatch {
  id: string;
  home: string;
  away: string;
  time: string;
  status: string;
  live: boolean;
  finished: boolean;
  streamUrl?: string; // external direct stream URL when available
  day: "yesterday" | "today" | "tomorrow";
}

const PAGES: Record<YSMatch["day"], string> = {
  yesterday: `${BASE}/matches-yesterday/`,
  today: `${BASE}/matches-today/`,
  tomorrow: `${BASE}/matches-tomorrow/`,
};

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

  // Keep only truly external stream URLs (skip internal /matches/... pages).
  let streamUrl: string | undefined;
  if (href) {
    try {
      const u = new URL(href);
      if (!u.hostname.includes(INTERNAL_HOST)) streamUrl = href;
    } catch {
      /* ignore */
    }
  }

  const id = `${home}-${away}-${day}`.replace(/\s+/g, "-");
  return { id, home, away, time, status, live, finished, streamUrl, day };
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
  return cards;
}

export const getYallasellitMatches = createServerFn({ method: "GET" }).handler(async () => {
  const [yesterday, today, tomorrow] = await Promise.all([
    scrape("yesterday").catch(() => []),
    scrape("today").catch(() => []),
    scrape("tomorrow").catch(() => []),
  ]);
  return { yesterday, today, tomorrow, fetchedAt: new Date().toISOString() };
});
