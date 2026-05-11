import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import type { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import {
  getApConfig,
  getCellInfo,
  getClients,
  getGatewayInfo,
  getRouterIp,
  getSignalInfo,
  getSimInfo,
  getTelemetryAll,
  getVersion,
  rebootGateway,
  setApConfig,
} from "./router-api"

const DEFAULT_ROUTER_IP = "192.168.12.1"

const protectedApiPrefixes = [
  "/api/router/clients",
  "/api/router/cell",
  "/api/router/sim",
  "/api/router/ap",
  "/api/router/telemetry",
  "/api/router/reboot",
] as const

function isProtectedApiPath(pathname: string): boolean {
  return protectedApiPrefixes.some((route) => pathname.startsWith(route))
}

function isAuthenticated(c: Context): boolean {
  const token = getCookie(c, "auth_token")
  return !!(token && token.length > 0)
}

const app = new Hono()

app.use("*", async (c, next) => {
  if (!isProtectedApiPath(c.req.path)) {
    return next()
  }
  if (!isAuthenticated(c)) {
    return c.json({ error: "Not authenticated" }, 401)
  }
  return next()
})

app.get("/api/router/session", (c) => {
  return c.json({ authenticated: isAuthenticated(c) })
})

app.post("/api/router/login", async (c) => {
  try {
    const { username, password, routerIp } = await c.req.json<{
      username?: string
      password?: string
      routerIp?: string
    }>()
    const ip = routerIp || DEFAULT_ROUTER_IP

    const response = await fetch(`http://${ip}/TMI/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = (await response.json()) as {
      auth?: { token: string; expiration: number }
      result?: { message?: string }
    }

    if (data.auth?.token) {
      const tokenMaxAge = data.auth.expiration - Math.floor(Date.now() / 1000)

      setCookie(c, "auth_token", data.auth.token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: tokenMaxAge,
        path: "/",
      })

      setCookie(c, "router_ip", ip, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      })

      return c.json({ success: true })
    }

    return c.json(
      { success: false, error: data.result?.message || "Invalid credentials" },
      401
    )
  } catch (error) {
    console.error("Login error:", error)
    return c.json({ success: false, error: "Connection failed" }, 500)
  }
})

app.post("/api/router/logout", (c) => {
  setCookie(c, "auth_token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  })
  setCookie(c, "router_ip", "", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  })
  return c.json({ success: true })
})

app.get("/api/router/health", async (c) => {
  const routerIp = getRouterIp(c)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`http://${routerIp}/TMI/v1/version`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return c.json({ status: "online" as const, ip: routerIp })
    }
    return c.json({
      status: "error" as const,
      ip: routerIp,
      message: "Gateway returned error",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isTimeout = errorMessage.includes("abort") || errorMessage.includes("timeout")

    return c.json({
      status: "offline" as const,
      ip: routerIp,
      message: isTimeout ? "Connection timeout" : errorMessage,
    })
  }
})

app.get("/api/router/gateway", async (c) => {
  try {
    const data = await getGatewayInfo(c)
    return c.json(data)
  } catch (error) {
    console.error("Gateway API error:", error)
    return c.json({ error: "Failed to fetch gateway info" }, 500)
  }
})

app.get("/api/router/signal", async (c) => {
  try {
    const data = await getSignalInfo(c)
    return c.json(data)
  } catch (error) {
    console.error("Signal API error:", error)
    return c.json({ error: "Failed to fetch signal info" }, 500)
  }
})

app.get("/api/router/cell", async (c) => {
  try {
    const data = await getCellInfo(c)
    return c.json(data)
  } catch (error) {
    console.error("Cell API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to fetch cell info" }, 500)
  }
})

app.get("/api/router/clients", async (c) => {
  try {
    const data = await getClients(c)
    return c.json(data)
  } catch (error) {
    console.error("Clients API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to fetch clients" }, 500)
  }
})

app.get("/api/router/sim", async (c) => {
  try {
    const data = await getSimInfo(c)
    return c.json(data)
  } catch (error) {
    console.error("SIM API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to fetch SIM info" }, 500)
  }
})

app.get("/api/router/ap", async (c) => {
  try {
    const data = await getApConfig(c)
    return c.json(data)
  } catch (error) {
    console.error("AP Config API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to fetch AP config" }, 500)
  }
})

app.post("/api/router/ap", async (c) => {
  try {
    const body = await c.req.json()
    await setApConfig(c, body)
    return c.json({ success: true })
  } catch (error) {
    console.error("AP Config update error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to update AP config" }, 500)
  }
})

app.get("/api/router/telemetry", async (c) => {
  try {
    const data = await getTelemetryAll(c)
    return c.json(data)
  } catch (error) {
    console.error("Telemetry API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to fetch telemetry data" }, 500)
  }
})

app.post("/api/router/reboot", async (c) => {
  try {
    await rebootGateway(c)
    return c.json({ success: true })
  } catch (error) {
    console.error("Reboot API error:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return c.json({ error: "Not authenticated" }, 401)
    }
    return c.json({ error: "Failed to reboot gateway" }, 500)
  }
})

app.get("/api/router/version", async (c) => {
  try {
    const data = await getVersion(c)
    return c.json(data)
  } catch (error) {
    console.error("Version API error:", error)
    return c.json({ error: "Failed to fetch version info" }, 500)
  }
})

const isProd = process.env.NODE_ENV === "production"
const port = Number(process.env.PORT) || 3000

if (isProd) {
  const distRoot = join(process.cwd(), "dist")
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api")) {
      return next()
    }
    return serveStatic({ root: distRoot })(c, next)
  })
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api") || c.finalized) {
      return next()
    }
    const html = await readFile(join(distRoot, "index.html"), "utf-8")
    return c.html(html)
  })
}

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server listening on http://0.0.0.0:${info.port}`)
  }
)
