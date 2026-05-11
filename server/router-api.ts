import { getCookie } from "hono/cookie"
import type { Context } from "hono"
import type {
  ApConfig,
  CellInfo,
  ClientInfo,
  GatewayInfo,
  SignalInfo,
  SimInfo,
  TelemetryAll,
  VersionInfo,
} from "../src/lib/router-types"

const DEFAULT_ROUTER_IP = "192.168.12.1"

export function getRouterIp(c: Context): string {
  return getCookie(c, "router_ip") || DEFAULT_ROUTER_IP
}

export function getAuthToken(c: Context): string {
  const token = getCookie(c, "auth_token")
  if (!token) {
    throw new Error("Not authenticated")
  }
  return token
}

export async function routerFetch<T>(
  c: Context,
  endpoint: string,
  options: { auth?: boolean; method?: string; body?: unknown } = {}
): Promise<T> {
  const { auth = false, method = "GET", body } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (auth) {
    const token = getAuthToken(c)
    headers.Authorization = `Bearer ${token}`
  }

  const routerIp = getRouterIp(c)
  const response = await fetch(`http://${routerIp}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Not authenticated")
    }
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as { result?: { message?: string } }).result?.message ||
        `Request failed: ${response.status}`
    )
  }

  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

export async function getGatewayInfo(c: Context): Promise<GatewayInfo> {
  return routerFetch<GatewayInfo>(c, "/TMI/v1/gateway?get=all")
}

export async function getSignalInfo(c: Context): Promise<SignalInfo> {
  return routerFetch<SignalInfo>(c, "/TMI/v1/gateway?get=signal")
}

export async function getCellInfo(c: Context): Promise<CellInfo> {
  return routerFetch<CellInfo>(c, "/TMI/v1/network/telemetry?get=cell", { auth: true })
}

export async function getClients(c: Context): Promise<ClientInfo> {
  return routerFetch<ClientInfo>(c, "/TMI/v1/network/telemetry?get=clients", { auth: true })
}

export async function getSimInfo(c: Context): Promise<SimInfo> {
  return routerFetch<SimInfo>(c, "/TMI/v1/network/telemetry?get=sim", { auth: true })
}

export async function getApConfig(c: Context): Promise<ApConfig> {
  return routerFetch<ApConfig>(c, "/TMI/v1/network/configuration/v2?get=ap", { auth: true })
}

export async function setApConfig(c: Context, config: Partial<ApConfig>): Promise<void> {
  return routerFetch(c, "/TMI/v1/network/configuration/v2?set=ap", {
    auth: true,
    method: "POST",
    body: config,
  })
}

export async function rebootGateway(c: Context): Promise<void> {
  return routerFetch(c, "/TMI/v1/gateway/reset?set=reboot", {
    auth: true,
    method: "POST",
  })
}

export async function getVersion(c: Context): Promise<VersionInfo> {
  return routerFetch<VersionInfo>(c, "/TMI/v1/version")
}

export async function getTelemetryAll(c: Context): Promise<TelemetryAll> {
  return routerFetch<TelemetryAll>(c, "/TMI/v1/network/telemetry?get=all", { auth: true })
}
