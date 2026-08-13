import { createServerFn } from "@tanstack/react-start";

export const getYallasellitMatches = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});
