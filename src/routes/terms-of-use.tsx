import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-use")({
  beforeLoad: () => {
    throw redirect({ to: "/terms" });
  },
});
