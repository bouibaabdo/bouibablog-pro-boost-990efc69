import { createServerFn } from "@tanstack/react-start";

export interface YKMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
}

export const getYallakoraMatches = createServerFn({ method: "GET" }).handler(async () => {
  return { today: [], tomorrow: [] };
});
