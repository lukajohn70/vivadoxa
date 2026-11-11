// ─── Admin authentication context & hook ───────────────────────────────────────
// Shared session state using React Context + persistent storage (sessionStorage & localStorage).

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react"
import { loginAdmin, verifyAdmin2FA, resendAdmin2FA, getApiUrl } from "@/lib/api"

export interface AdminSession {
  id?: number
  email: string
  name: string
  role?: "superadmin" | "admissions" | "finance" | "workshop" | "staff" | string
}

export interface AdminPending2FA {
  userId: number
  tempToken?: string
  emailMasked: string
  deviceName?: string
}

export interface AdminAuthContextType {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loginError: string
  loginLoading: boolean
  clearError: () => void
  pending2FA: AdminPending2FA | null
  verify2FA: (code: string) => Promise<boolean>
  resend2FA: () => Promise<{ success: boolean; message?: string }>
  cancel2FA: () => void
}

const SESSION_KEY = "vdx_admin_session"

function getInitialSession(): AdminSession | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    if (!parsed.role) {
      parsed.role =
        parsed.email?.toLowerCase().includes("super") ||
        parsed.email?.toLowerCase() === "admin" ||
        parsed.email?.toLowerCase().startsWith("admin@")
          ? "superadmin"
          : "staff"
    }
    return parsed
  } catch {
    return null
  }
}

function persistSession(session: AdminSession | null) {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Storage access fallback
  }
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(getInitialSession)
  const [loginError, setLoginError] = useState<string>("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [pending2FA, setPending2FA] = useState<AdminPending2FA | null>(null)

  useEffect(() => {
    fetch(getApiUrl("me.php"), { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setSession((prev) => {
            const role =
              data.user.role ||
              (data.user.email?.toLowerCase().includes("super") ||
              data.user.email?.toLowerCase() === "admin" ||
              data.user.email?.toLowerCase().startsWith("admin@")
                ? "superadmin"
                : "staff")
            const updated: AdminSession = {
              id: data.user.id || prev?.id,
              email: data.user.email || prev?.email || "",
              name: data.user.name || prev?.name || "",
              role,
            }
            persistSession(updated)
            return updated
          })
        }
      })
      .catch(() => {})
  }, [])

  const clearError = useCallback(() => {
    setLoginError("")
  }, [])

  const cancel2FA = useCallback(() => {
    setPending2FA(null)
    setLoginError("")
  }, [])

  const login = useCallback(
    async (emailInput: string, passwordInput: string) => {
      setLoginLoading(true)
      setLoginError("")

      const cleanInput = emailInput.trim()
      const cleanPassword = passwordInput.trim()

      if (!cleanInput || !cleanPassword) {
        setLoginError("Please enter both your email address and password.")
        setLoginLoading(false)
        return false
      }

      try {
        const dbResult = await loginAdmin(cleanInput, cleanPassword)
        if (dbResult.requires_2fa && dbResult.user_id) {
          setPending2FA({
            userId: dbResult.user_id,
            tempToken: dbResult.temp_token,
            emailMasked: dbResult.email_masked || "registered email",
            deviceName: dbResult.device_name || "Current Browser",
          })
          setLoginLoading(false)
          return false
        }

        if (dbResult.success && dbResult.user) {
          const newSession: AdminSession = {
            id: dbResult.user.id,
            email: dbResult.user.email,
            name: dbResult.user.name,
            role:
              dbResult.user.role ||
              (dbResult.user.email?.toLowerCase().includes("super") ||
              dbResult.user.email?.toLowerCase() === "admin" ||
              dbResult.user.email?.toLowerCase().startsWith("admin@")
                ? "superadmin"
                : "staff"),
          }
          persistSession(newSession)
          setSession(newSession)
          setPending2FA(null)
          setLoginLoading(false)
          return true
        } else {
          setLoginError(
            dbResult.error || "Incorrect email or password. Please try again.",
          )
          setLoginLoading(false)
          return false
        }
      } catch (err) {
        setLoginError(
          "Unable to reach authentication server. Please check your connection.",
        )
        setLoginLoading(false)
        return false
      }
    },
    [],
  )

  const verify2FA = useCallback(
    async (code: string) => {
      if (!pending2FA) return false
      setLoginLoading(true)
      setLoginError("")

      try {
        const res = await verifyAdmin2FA(
          pending2FA.userId,
          code.trim(),
          pending2FA.tempToken,
          pending2FA.deviceName,
        )

        if (res.success && res.user) {
          const newSession: AdminSession = {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
            role:
              res.user.role ||
              (res.user.email?.toLowerCase().includes("super") ||
              res.user.email?.toLowerCase() === "admin" ||
              res.user.email?.toLowerCase().startsWith("admin@")
                ? "superadmin"
                : "staff"),
          }
          persistSession(newSession)
          setSession(newSession)
          setPending2FA(null)
          setLoginLoading(false)
          return true
        } else {
          setLoginError(res.error || "Invalid or expired verification code.")
          setLoginLoading(false)
          return false
        }
      } catch (err: any) {
        setLoginError(err.message || "Failed to verify security code.")
        setLoginLoading(false)
        return false
      }
    },
    [pending2FA],
  )

  const resend2FA = useCallback(async () => {
    if (!pending2FA) return { success: false, message: "No pending verification session." }
    try {
      const res = await resendAdmin2FA(pending2FA.userId)
      return res
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to resend code." }
    }
  }, [pending2FA])

  const logout = useCallback(() => {
    try {
      fetch(getApiUrl("logout.php"), {
        method: "POST",
        credentials: "include",
      }).catch(() => {})
    } catch {
      // offline/preview mode
    }
    persistSession(null)
    setSession(null)
    setPending2FA(null)
    setLoginError("")
  }, [])

  const contextValue = useMemo<AdminAuthContextType>(
    () => ({
      session,
      login,
      logout,
      loginError,
      loginLoading,
      clearError,
      pending2FA,
      verify2FA,
      resend2FA,
      cancel2FA,
    }),
    [session, login, logout, loginError, loginLoading, clearError, pending2FA, verify2FA, resend2FA, cancel2FA],
  )

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
