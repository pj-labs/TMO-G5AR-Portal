import { createFileRoute } from "@tanstack/react-router"
import { CellPage } from "@/pages/cell-page"

export const Route = createFileRoute("/_dashboard/cell")({
  component: CellPage,
})
