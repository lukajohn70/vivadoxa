// ─── Admin authentication hook ─────────────────────────────────────────────
// Client-side session guard using sessionStorage.
// ⚠️  PRODUCTION: Replace this with a real backend authentication flow
//    (JWT issued by your API, verified on every request). This client-side
//    check is a UX convenience only — never trust client-side auth for
//    data protection; protect all admin API endpoints server-side.

import { useState, useCallback } from "react";

// Temporary staff credentials — REPLACE with a server-side login endpoint
// before production. Never ship real passwords in source code.
const STAFF_CREDENTIALS: Record<string, { password: string; name: string }> = {
  "admin@vivadoxa.ng": { password: "VivadoxaAdmin2025!", name: "Tomi Adeyemi" },
  "staff@vivadoxa.ng": { password: "StaffPass2025!", name: "Admissions Staff" },
};

const SESSION_KEY = "vdx_admin_session";

export interface AdminSession {
  email: string;
  name: string;
}

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AdminSession) : null;
    } catch {
      return null;
    }
  });

  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError("");
    // Simulate a short network delay so the UI doesn't flash
    await new Promise((r) => setTimeout(r, 600));

    const cred = STAFF_CREDENTIALS[email.toLowerCase().trim()];
    if (cred && cred.password === password) {
      const newSession: AdminSession = { email, name: cred.name };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setLoginLoading(false);
      return true;
    }
    setLoginError("Incorrect email or password. Please try again.");
    setLoginLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return { session, login, logout, loginError, loginLoading };
}
