import { createServerFn } from "@tanstack/react-start";

export interface WCMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
}

export interface WCStanding {
  group: string;
}

export const getWorldCupMatches = createServerFn({ method: "GET" }).handler(async () => {
  return [] as WCMatch[];
});

export const getWorldCupStandings = createServerFn({ method: "GET" }).handler(async () => {
  return [] as WCStanding[];
});
