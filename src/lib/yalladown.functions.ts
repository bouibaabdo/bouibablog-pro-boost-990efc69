import { createServerFn } from "@tanstack/react-start";

export const getYalladownMatches = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});
