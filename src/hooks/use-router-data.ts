import useSWR from "swr"
import type { TelemetryAll, VersionInfo } from "@/lib/router-types"

let isRedirecting = false

async function handleUnauthorized() {
  if (isRedirecting) return
  isRedirecting = true

  try {
    const response = await fetch("/api/router/logout", {
      method: "POST",
      credentials: "include",
    })
    await response.json()
  } catch {
    // Ignore errors, proceed to redirect
  }

  await new Promise((resolve) => setTimeout(resolve, 100))
  window.location.replace("/login")
}

const fetcher = async (url: string) => {
  if (isRedirecting) {
    return new Promise(() => {})
  }

  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: { "Cache-Control": "no-cache" },
  })

  if (res.status === 401) {
    handleUnauthorized()
    return new Promise(() => {})
  }

  const data = await res.json()

  if (data.error === "Not authenticated") {
    handleUnauthorized()
    return new Promise(() => {})
  }

  return data
}

export interface GatewayHealthStatus {
  status: "online" | "offline" | "error"
  ip: string
  message?: string
}

export function useGatewayHealth() {
  return useSWR<GatewayHealthStatus>("/api/router/health", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  })
}

export function useGatewayInfo() {
  return useSWR("/api/router/gateway", fetcher, {
    refreshInterval: 5000,
    keepPreviousData: true,
  })
}

export function useSignalInfo() {
  return useSWR("/api/router/signal", fetcher, {
    refreshInterval: 3000,
    keepPreviousData: true,
  })
}

export function useCellInfo() {
  return useSWR("/api/router/cell", fetcher, {
    refreshInterval: 5000,
    keepPreviousData: true,
  })
}

export function useClients() {
  return useSWR("/api/router/clients", fetcher, {
    refreshInterval: 10000,
    keepPreviousData: true,
  })
}

export function useSimInfo() {
  return useSWR("/api/router/sim", fetcher, {
    refreshInterval: 30000,
    keepPreviousData: true,
  })
}

export function useApConfig() {
  return useSWR("/api/router/ap", fetcher, {
    refreshInterval: 30000,
  })
}

export function useVersion() {
  return useSWR<VersionInfo>("/api/router/version", fetcher, {
    refreshInterval: 60000,
  })
}

export function useTelemetryAll() {
  return useSWR<TelemetryAll>("/api/router/telemetry", fetcher, {
    refreshInterval: 5000,
  })
}

export type { VersionInfo, TelemetryAll }
