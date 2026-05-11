import { createFileRoute, redirect } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/dashboard-layout"

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => {
    const res = await fetch("/api/router/session", { credentials: "include" })
    const data = (await res.json().catch(() => ({ authenticated: false }))) as {
      authenticated?: boolean
    }
    if (!data.authenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: DashboardLayout,
})
