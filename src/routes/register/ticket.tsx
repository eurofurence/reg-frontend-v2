import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/register/ticket")({
  component: RouteComponent,
});

function RouteComponent() {
  // Render nested ticket step routes
  return <Outlet />;
}
