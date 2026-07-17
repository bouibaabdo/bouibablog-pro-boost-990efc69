import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-quiz")({
  beforeLoad: () => {
    throw redirect({ to: "/quiz" });
  },
});
