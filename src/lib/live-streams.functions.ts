import { createServerFn } from "@tanstack/react-start";

export const getLiveStreamsFor = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});
