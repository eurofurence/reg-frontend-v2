import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  // redirect to the first step after mount
  useEffect(() => {
    navigate({ to: "/register/ticket/type" as any });
  }, [navigate]);

  return null;
}
