import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/worldcup")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", statusCode: 301 });
  },
  component: () => null,
});
