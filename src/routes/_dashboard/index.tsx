import { createFileRoute } from "@tanstack/react-router"
import { DashboardHome } from "@/pages/dashboard-home"

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardHome,
})
