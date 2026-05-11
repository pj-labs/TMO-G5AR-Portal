import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "@/pages/login-page"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const res = await fetch("/api/router/session", { credentials: "include" })
    const data = (await res.json().catch(() => ({ authenticated: false }))) as {
      authenticated?: boolean
    }
    if (data.authenticated) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})
