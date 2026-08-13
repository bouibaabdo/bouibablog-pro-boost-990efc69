import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = "google.com, pub-6865528919843764, DIRECT, f88c47fec8942fa0\n";
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
