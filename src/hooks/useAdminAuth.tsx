// ─── Admin authentication context & hook ───────────────────────────────────────
// Shared session state using React Context + persistent storage (sessionStorage & localStorage).

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react"
import { loginAdmin, getApiUrl } from "@/lib/api"

export interface AdminSession {
  email: string
  name: string
}

export interface AdminAuthContextType {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loginError: string
  loginLoading: boolean
  clearError: () => void
}

const SESSION_KEY = "vdx_admin_session"

function getInitialSession(): AdminSession | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
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

  const clearError = useCallback(() => {
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
        if (dbResult.success && dbResult.user) {
          const newSession: AdminSession = {
            email: dbResult.user.email,
            name: dbResult.user.name,
          }
          persistSession(newSession)
          setSession(newSession)
          setLoginLoading(false)
          return true
        } else {
          setLoginError(dbResult.error || "Incorrect email or password. Please try again.")
          setLoginLoading(false)
          return false
        }
      } catch (err) {
        setLoginError("Unable to reach authentication server. Please check your connection.")
        setLoginLoading(false)
        return false
      }
    },
    [],
  )

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
    }),
    [session, login, logout, loginError, loginLoading, clearError],
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
