// ─── API client for Vivadoxa backend ───────────────────────────────────

export const getApiUrl = (endpoint: string): string => {
  // If Vite env specifies API URL, use it
  if (import.meta.env.VITE_API_URL) {
    const base = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
    return `${base}/${endpoint.replace(/^\//, "")}`;
  }

  // When browsing from localhost:8443 or similar, talk to MAMP on port 80
  const isDevHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDevHost && window.location.port !== "80") {
    return `http://${window.location.hostname}/Vivadoxa/api/${endpoint.replace(/^\//, "")}`;
  }

  // Production or same-origin deployment
  return `/Vivadoxa/api/${endpoint.replace(/^\//, "")}`;
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  application_no?: string;
  tracking_code?: string;
  reference?: string;
  application?: any;
  payment?: any;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  stats?: {
    total_applications: number;
    pending_applications: number;
    accepted_applications: number;
    pending_payments: number;
    total_revenue: number;
    formatted_revenue: string;
    active_repairs: number;
    unread_enquiries: number;
  };
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<ApiResponse> {
  const url = getApiUrl("login.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
}

export async function fetchStats(): Promise<ApiResponse> {
  const url = getApiUrl("stats.php");
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return await res.json();
}

// ── Applications ──────────────────────────────────────────────────────────────

export async function fetchApplications(
  search = "",
  status = ""
): Promise<any[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const url = `${getApiUrl("applications.php")}?${params.toString()}`;
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  return json.data || [];
}

export async function submitApplication(data: Record<string, any>): Promise<ApiResponse> {
  const url = getApiUrl("applications.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function checkApplicationStatus(
  ref: string,
  email?: string
): Promise<ApiResponse> {
  const params = new URLSearchParams({ ref });
  if (email) params.append("email", email);

  const url = `${getApiUrl("applications.php")}?${params.toString()}`;
  const res = await fetch(url, { credentials: "include" });
  return await res.json();
}

export async function updateApplicationStatus(
  application_no: string,
  status: string
): Promise<ApiResponse> {
  const url = getApiUrl("applications.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "update_status", application_no, status }),
  });
  return await res.json();
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function fetchPayments(): Promise<any[]> {
  const url = getApiUrl("payments.php");
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  return json.data || [];
}

export async function submitPaymentProof(data: Record<string, any>): Promise<ApiResponse> {
  const url = getApiUrl("payments.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updatePaymentStatus(
  reference: string,
  status: string
): Promise<ApiResponse> {
  const url = getApiUrl("payments.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "update_status", reference, status }),
  });
  return await res.json();
}

// ── Repairs ───────────────────────────────────────────────────────────────────

export async function fetchRepairs(): Promise<any[]> {
  const url = getApiUrl("repairs.php");
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  return json.data || [];
}

export async function submitRepairRequest(data: Record<string, any>): Promise<ApiResponse> {
  const url = getApiUrl("repairs.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateRepairStatus(
  tracking_code: string,
  status: string,
  estimated_cost?: number
): Promise<ApiResponse> {
  const url = getApiUrl("repairs.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "update_status", tracking_code, status, estimated_cost }),
  });
  return await res.json();
}

// ── Enquiries ─────────────────────────────────────────────────────────────────

export async function fetchEnquiries(): Promise<any[]> {
  const url = getApiUrl("enquiries.php");
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  return json.data || [];
}

export async function submitEnquiry(data: Record<string, any>): Promise<ApiResponse> {
  const url = getApiUrl("enquiries.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function markEnquiryRead(id: number, is_read = 1): Promise<ApiResponse> {
  const url = getApiUrl("enquiries.php");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "mark_read", id, is_read }),
  });
  return await res.json();
}

// ── Repair tracking lookup ───────────────────────────────────────────────────

export async function fetchRepairByCode(code: string): Promise<ApiResponse> {
  const url = `${getApiUrl("repairs.php")}?code=${encodeURIComponent(code)}`;
  const res = await fetch(url, { credentials: "include" });
  return await res.json();
}

// ── Academics (Programs, Instructors, Students, Cohorts, Performances) ─────────

export async function fetchAcademics(
  type: "programs" | "instructors" | "students" | "cohorts" | "performances"
): Promise<any[]> {
  const url = `${getApiUrl("academics.php")}?type=${type}`;
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  return json.data || [];
}

export async function saveProgram(data: Record<string, any>): Promise<ApiResponse> {
  const url = `${getApiUrl("academics.php")}?type=programs`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function saveInstructor(data: Record<string, any>): Promise<ApiResponse> {
  const url = `${getApiUrl("academics.php")}?type=instructors`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function savePerformance(data: Record<string, any>): Promise<ApiResponse> {
  const url = `${getApiUrl("academics.php")}?type=performances`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deletePerformance(id: number): Promise<ApiResponse> {
  const url = `${getApiUrl("academics.php")}?type=performances`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "delete", id }),
  });
  return await res.json();
}

export async function enrollStudent(data: {
  application_no?: string;
  full_name: string;
  email: string;
  phone: string;
  program: string;
  cohort: string;
}): Promise<ApiResponse> {
  const url = `${getApiUrl("academics.php")}?type=students`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "enroll", ...data }),
  });
  return await res.json();
}
