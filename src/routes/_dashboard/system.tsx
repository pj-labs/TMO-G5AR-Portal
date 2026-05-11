import { createFileRoute } from "@tanstack/react-router"
import { SystemPage } from "@/pages/system-page"

export const Route = createFileRoute("/_dashboard/system")({
  component: SystemPage,
})
