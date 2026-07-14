import type { YSMatch } from "./yallasellit.functions";
import type { YDMatch } from "./yalladown.functions";

/**
 * Aggressive Arabic normalization so team names from different providers match.
 * Strips diacritics, common prefixes (منتخب / نادي / فريق), leading ال,
 * punctuation and spaces, then lower-cases.
 */
export function normalizeArName(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/(منتخب|نادي|فريق|المنتخب)/g, "")
    .replace(/^ال/, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

function nameMatches(a: string, b: string): boolean {
  const na = normalizeArName(a);
  const nb = normalizeArName(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export interface StreamEntry {
  home: string;
  away: string;
  urls: string[];
  source: "yalladown" | "yallasellit";
}

type YSData = { today?: YSMatch[]; tomorrow?: YSMatch[]; yesterday?: YSMatch[] } | undefined;
type YDData = { today?: YDMatch[]; tomorrow?: YDMatch[]; yesterday?: YDMatch[] } | undefined;

/**
 * Merge Yalladown (primary) and Yallasellit (secondary) match lists into a
 * flat lookup. Yalladown URLs always come first so the stream modal tries
 * them before falling back to Yallasellit.
 */
export function buildStreamLookup(
  yd: YDData | null | undefined,
  ys: YSData | null | undefined,
) {
  const entries: StreamEntry[] = [];

  const pushYd = (m: YDMatch) => {
    if (!m.streamUrls.length && !m.pageUrl) return;
    const urls = Array.from(new Set([...m.streamUrls, m.pageUrl].filter(Boolean) as string[]));
    if (!urls.length) return;
    entries.push({ home: m.home, away: m.away, urls, source: "yalladown" });
  };
  const pushYs = (m: YSMatch) => {
    const urls = Array.from(
      new Set(
        [m.playerUrl, m.streamUrl, ...(m.channelUrls ?? []), m.pageUrl].filter(
          Boolean,
        ) as string[],
      ),
    );
    if (!urls.length) return;
    entries.push({ home: m.home, away: m.away, urls, source: "yallasellit" });
  };

  yd?.today?.forEach(pushYd);
  yd?.tomorrow?.forEach(pushYd);
  yd?.yesterday?.forEach(pushYd);
  ys?.today?.forEach(pushYs);
  ys?.tomorrow?.forEach(pushYs);
  ys?.yesterday?.forEach(pushYs);

  function find(home: string, away: string): string[] | undefined {
    // Prefer yalladown; fall back to yallasellit.
    const combined: string[] = [];
    for (const source of ["yalladown", "yallasellit"] as const) {
      for (const e of entries) {
        if (e.source !== source) continue;
        if (
          (nameMatches(e.home, home) && nameMatches(e.away, away)) ||
          (nameMatches(e.home, away) && nameMatches(e.away, home))
        ) {
          combined.push(...e.urls);
        }
      }
    }
    const unique = Array.from(new Set(combined));
    return unique.length ? unique : undefined;
  }

  return {
    find,
    // Map-like adapter used by existing worldcup card components.
    get(key: string) {
      const [h, a] = key.split("|");
      return find(h ?? "", a ?? "");
    },
  };
}

export type StreamLookup = ReturnType<typeof buildStreamLookup>;
