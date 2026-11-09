// ─── Student & Client Portal Authentication ──────────────────────────────────
import React, { useState } from "react"
import { Logo, Button, Field, Icon, WhatsAppIcon } from "@/components/ui"
import { loginUser, registerUser, verifyUser2FA, resendUser2FA, type PortalUser } from "@/lib/api"
import type { Page } from "@/types"

export function PortalAuth({
  go,
  onLoginSuccess,
}: {
  go: (p: Page | string) => void
  onLoginSuccess?: (user: PortalUser) => void
}) {
  const [tab, setTab] = useState<"login" | "register">("login")

  // Login form states
  const [loginId, setLoginId] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  // 2FA Security states
  const [pending2FA, setPending2FA] = useState<{
    userId: number
    tempToken?: string
    emailMasked: string
    deviceName?: string
  } | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [otpNotice, setOtpNotice] = useState("")
  const [otpResending, setOtpResending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)

  // Register form states
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPass, setRegPass] = useState("")
  const [regRole, setRegRole] = useState("student")
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setOtpNotice("")
    if (!loginId.trim() || !loginPass.trim()) {
      setLoginError("Please enter your email/phone and password.")
      return
    }

    setLoginLoading(true)
    try {
      const res = await loginUser(loginId.trim(), loginPass.trim())
      if (res.requires_2fa && res.user_id) {
        setPending2FA({
          userId: res.user_id,
          tempToken: res.temp_token,
          emailMasked: res.email_masked || "your registered email",
          deviceName: res.device_name || "Current Browser",
        })
        return
      }

      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user)
        go("portal")
      } else {
        setLoginError(res.error || "Incorrect login credentials.")
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred during sign in.")
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    if (!pending2FA || !otpCode.trim() || otpCode.trim().length < 6) return
    setOtpVerifying(true)
    setLoginError("")
    try {
      const res = await verifyUser2FA(
        pending2FA.userId,
        otpCode.trim(),
        pending2FA.tempToken,
        pending2FA.deviceName,
      )
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user)
        go("portal")
      } else {
        setLoginError(res.error || "Invalid or expired verification code.")
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to verify security code.")
    } finally {
      setOtpVerifying(false)
    }
  }

  async function handleResendOTP() {
    if (!pending2FA || otpResending) return
    setOtpResending(true)
    setOtpNotice("")
    try {
      const res = await resendUser2FA(pending2FA.userId)
      if (res.success) {
        setOtpNotice("A fresh 6-digit code has been dispatched to your email.")
      } else {
        setOtpNotice(res.error || "Unable to resend code.")
      }
    } finally {
      setOtpResending(false)
    }
  }

  function handleCancel2FA() {
    setPending2FA(null)
    setOtpCode("")
    setOtpNotice("")
    setLoginError("")
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError("")

    if (!regName.trim() || !regEmail.trim() || !regPass.trim()) {
      setRegError("Please fill in your name, email, and password.")
      return
    }

    setRegLoading(true)
    try {
      const res = await registerUser({
        full_name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPass.trim(),
        role: regRole,
      })
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user)
        go("portal")
      } else {
        setRegError(res.error || "Failed to create account.")
      }
    } catch (err: any) {
      setRegError(err.message || "An error occurred during registration.")
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f2f0e9",
        display: "grid",
        placeItems: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "white",
          borderRadius: 14,
          boxShadow: "0 20px 50px rgba(20,15,10,0.08)",
          border: "1px solid var(--line)",
          overflow: "hidden",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            background: "var(--navy)",
            padding: "28px 24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <Logo light />
          </div>
          <h1
            style={{
              fontSize: 20,
              margin: "6px 0 2px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Student &amp; Client Portal
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#9dafbc" }}>
            Track admission, tuition payments, and instrument repairs.
          </p>
        </div>

        {/* 2FA Verification Card or Standard Tabs */}
        {pending2FA ? (
          <div style={{ padding: 28 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(201, 107, 50, 0.12)",
                  color: "#c96b32",
                  marginBottom: 12,
                }}
              >
                <Icon name="lock" size={24} />
              </div>
              <h2
                style={{
                  fontSize: 18,
                  margin: "0 0 6px",
                  color: "var(--navy)",
                }}
              >
                Two-Factor Security Verification
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                First-time login or unrecognized device authorization (
                <strong>{pending2FA.deviceName || "Current Browser"}</strong>).
              </p>
            </div>

            <div
              style={{
                background: "#fbfaf8",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "var(--navy)",
              }}
            >
              A 6-digit verification code has been dispatched to:
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  marginTop: 4,
                  letterSpacing: "0.02em",
                  color: "#157054",
                }}
              >
                {pending2FA.emailMasked}
              </div>
            </div>

            {loginError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  background: "#fee2e2",
                  border: "1px solid #f87171",
                  borderRadius: 6,
                  color: "#991b1b",
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                {loginError}
              </div>
            )}

            {otpNotice && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: 6,
                  color: "#166534",
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                {otpNotice}
              </div>
            )}

            <form
              onSubmit={handleVerify2FA}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  htmlFor="portal-otp-input"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                    color: "var(--navy)",
                  }}
                >
                  Enter 6-Digit Verification Code:
                </label>
                <input
                  id="portal-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "12px",
                    textAlign: "center",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "2px solid var(--gold)",
                    background: "white",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={otpVerifying || otpCode.length < 6}
                style={{ marginTop: 6 }}
              >
                {otpVerifying ? "Authorizing device…" : "Verify & Access Portal"}
              </Button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  fontSize: 12,
                }}
              >
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpResending}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {otpResending ? "Dispatching code…" : "Resend code to email"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel2FA}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Cancel / Return
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <button
                type="button"
                onClick={() => setTab("login")}
                style={{
                  padding: "14px",
                  fontSize: 13,
                  fontWeight: 700,
                  background: tab === "login" ? "white" : "#fcfbf9",
                  border: "none",
                  borderBottom: tab === "login" ? "2px solid var(--gold)" : "none",
                  color: tab === "login" ? "var(--gold-text)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                style={{
                  padding: "14px",
                  fontSize: 13,
                  fontWeight: 700,
                  background: tab === "register" ? "white" : "#fcfbf9",
                  border: "none",
                  borderBottom:
                    tab === "register" ? "2px solid var(--gold)" : "none",
                  color: tab === "register" ? "var(--gold-text)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            <div style={{ padding: 24 }}>
          {tab === "login" ? (
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {loginError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fee2e2",
                    border: "1px solid #f87171",
                    borderRadius: 6,
                    color: "#991b1b",
                    fontSize: 12,
                  }}
                >
                  {loginError}
                </div>
              )}

              <Field
                id="portal-login-id"
                label="Email Address or Phone Number"
                placeholder="e.g. chiamaka@example.com or 080..."
                value={loginId}
                onChange={setLoginId}
                required
              />

              <div>
                <Field
                  id="portal-login-pass"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPass}
                  onChange={setLoginPass}
                  required
                />
                <div style={{ textAlign: "right", marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        "You can sign in using your Application Reference Number (e.g. VDX-2026-XXXX) as your password, or contact Admissions via WhatsApp.",
                      )
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--muted)",
                      fontSize: 11,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Forgot password or need reference login?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loginLoading}
                style={{ marginTop: 8 }}
              >
                {loginLoading ? "Signing In…" : "Sign In to Portal"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {regError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fee2e2",
                    border: "1px solid #f87171",
                    borderRadius: 6,
                    color: "#991b1b",
                    fontSize: 12,
                  }}
                >
                  {regError}
                </div>
              )}

              <Field
                id="portal-reg-name"
                label="Full Name"
                placeholder="e.g. John Danladi"
                value={regName}
                onChange={setRegName}
                required
              />

              <Field
                id="portal-reg-email"
                label="Email Address"
                type="email"
                placeholder="e.g. john@example.com"
                value={regEmail}
                onChange={setRegEmail}
                required
              />

              <Field
                id="portal-reg-phone"
                label="Phone Number (WhatsApp Active)"
                placeholder="e.g. 08012345678"
                value={regPhone}
                onChange={setRegPhone}
                required
              />

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 5,
                  }}
                >
                  I Am Joining Vivadoxa As
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    padding: "0 10px",
                    background: "white",
                    fontSize: 13,
                  }}
                >
                  <option value="student">
                    Music Student / Applicant (Courses &amp; Recitals)
                  </option>
                  <option value="client">
                    Workshop Client (Instrument Repairs &amp; Maintenance)
                  </option>
                  <option value="all">Both Student &amp; Repair Client</option>
                </select>
              </div>

              <Field
                id="portal-reg-pass"
                label="Create Password"
                type="password"
                placeholder="Choose a secure password"
                value={regPass}
                onChange={setRegPass}
                required
              />

              <Button
                type="submit"
                fullWidth
                disabled={regLoading}
                style={{ marginTop: 8 }}
              >
                {regLoading ? "Creating Account…" : "Create Portal Account"}
              </Button>
            </form>
          )}

          {/* Bottom helper */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => go("home")}
              style={{
                border: "none",
                background: "none",
                color: "var(--gold-text)",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Back to Vivadoxa Website
            </button>
          </div>
        </div>
      </>
    )}
      </div>
    </main>
  )
}

export default PortalAuth
