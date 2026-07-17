import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer-policy")({
  beforeLoad: () => {
    throw redirect({ to: "/disclaimer" });
  },
});
