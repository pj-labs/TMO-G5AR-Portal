import { createFileRoute } from "@tanstack/react-router"
import { WifiPage } from "@/pages/wifi-page"

export const Route = createFileRoute("/_dashboard/wifi")({
  component: WifiPage,
})
