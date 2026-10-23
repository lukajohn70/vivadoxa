// ─── API client for Vivadoxa backend ───────────────────────────────────
// Fully harmonized with the front-end admissions, payment, repairs, and academics.
// All application records are strictly queried and committed to the MySQL database.

// Clear legacy mock data caches from browser localStorage so all records are strictly loaded from MySQL
if (typeof window !== "undefined") {
  try {
    const mockStorageKeys = [
      "vdx_applications",
      "vdx_payments",
      "vdx_repairs",
      "vdx_enquiries",
      "vdx_students",
    ];
    for (const key of mockStorageKeys) {
      localStorage.removeItem(key);
    }
  } catch {}
}

export const getApiUrl = (endpoint: string): string => {
  const clean = endpoint.replace(/^\//, "");

  // When deployed to production (running on domain other than localhost/127.0.0.1)
  const isDevHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // On production (cPanel domain or remote server), ALWAYS use same-origin relative `/api/...`
  if (!isDevHost) {
    return `/api/${clean}`;
  }

  // Local development: if running inside MAMP under /Vivadoxa/ subfolder
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/Vivadoxa")) {
    return `/Vivadoxa/api/${clean}`;
  }

  // Local development on Vite dev server (e.g. localhost:8443 hitting local MAMP on port 80)
  if (typeof window !== "undefined" && window.location.port && window.location.port !== "80") {
    return `http://${window.location.hostname}/Vivadoxa/api/${clean}`;
  }

  return `/api/${clean}`;
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
  student_no?: string;
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

// ── Local Storage Helper Engine ───────────────────────────────────────────────
function getLocalArray<T = any>(key: string, fallback: T[]): T[] {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function setLocalArray<T = any>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`LocalStorage write error for ${key}:`, err);
  }
}

// ── Default Harmonized Data Seeds ─────────────────────────────────────────────
export const DEFAULT_PROGRAMS = [
  { id: 1, name: "Piano & Keyboard Mastery", category: "Instruments", tag: "Popular", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Foundational posture, classical finger dexterity, reading sheet music, chord voicings, and contemporary hymnody." },
  { id: 2, name: "Acoustic Guitar Foundations", category: "Instruments", tag: "Popular", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Open chords, fingerstyle patterns, rhythmic strumming, bar chords, and solo accompaniment." },
  { id: 3, name: "Lead & Electric Guitar", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Scale mastery, pentatonic improvisation, pick control, tone sculpting, and stage presence." },
  { id: 4, name: "Bass Guitar Groove & Harmony", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Root note timing, slap and fingerstyle technique, rhythmic locked-in pocket, and bassline construction." },
  { id: 5, name: "Violin & Classical Strings", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Bow grip, intonation, ear training, dynamic vibrato, and graded recital repertoire." },
  { id: 6, name: "Saxophone (Alto & Tenor)", category: "Instruments", tag: "Popular", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Embouchure control, breath support, tone projection, jazz articulation, and expressive soloing." },
  { id: 7, name: "Trumpet & Brass Fundamentals", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Lip buzz resonance, valve dexterity, fanfare articulation, and breath conservation." },
  { id: 8, name: "Euphonium & Low Brass", category: "Instruments", tag: "Specialty", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Warm melodic tone, compensating valve navigation, brass choir harmonization, and sight-reading." },
  { id: 9, name: "Clarinet & Woodwinds", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Single-reed embouchure, smooth register transitions, throat tone correction, and orchestral phrasing." },
  { id: 10, name: "Concert Flute", category: "Instruments", tag: "Core", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Clear embouchure aperture, tone focus, octave overblowing control, and lyrical phrasing." },
  { id: 11, name: "Contemporary Drum Kit", category: "Instruments", tag: "Popular", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons", desc: "Limb independence, rudiment articulation, metronome precision, groove pocket, and dynamic live accompaniment." },
  { id: 12, name: "Talking Drums & Traditional Percussion", category: "Instruments", tag: "Heritage", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons", desc: "Indigenous Nigerian percussion technique, pitch modulation via leather tension cords, and cultural praise rhythms." },
  { id: 13, name: "Voice Training & Vocal Stagecraft", category: "Vocals", tag: "Popular", fee: "₦20,000 / month", fee_amount: 20000, duration: "1–12 Months", modes: "Studio · Home Lessons · Online", desc: "Diaphragmatic breath support, vocal register blend, pitch accuracy, vibrato control, and stagecraft." },
];

export const DEFAULT_INSTRUCTORS = [
  {
    id: 1,
    name: "Frederick Chrysantus",
    title: "Founder & Artistic Director",
    specialization: "Concert Piano, Conducting & Music Theory",
    location: "Kaduna Studio",
    is_director: 1,
    bio: "Pianist, composer, and educator with over 15 years cultivating musical excellence and mentoring musicians across Nigeria.",
  },
  {
    id: 2,
    name: "David Eze",
    title: "Guitar & Production Instructor",
    specialization: "Acoustic, Electric Guitar & Audio Engineering",
    location: "Kaduna Studio",
    is_director: 0,
    bio: "Multi-instrumentalist and session guitarist specializing in contemporary fingerstyle, jazz harmony, and audio engineering.",
  },
  {
    id: 3,
    name: "Morenike Bello",
    title: "Vocal Performance Lead",
    specialization: "Voice Training, Breath Mechanics & Stagecraft",
    location: "Kaduna Studio",
    is_director: 0,
    bio: "Classically trained vocal coach helping students expand their range, overcome vocal fatigue, and command the stage.",
  },
  {
    id: 4,
    name: "Samuel Oche",
    title: "Brass & Woodwind Lead",
    specialization: "Saxophone, Trumpet, Clarinet & Flute",
    location: "Kaduna Studio",
    is_director: 0,
    bio: "Brass and wind specialist with extensive conservatory orchestral experience and church music leadership.",
  },
];

export const DEFAULT_COHORTS = [
  { id: 1, name: "Saturday Cohort A (Morning)", time_slot: "Saturdays 9:00 AM – 12:00 PM", room: "Studio Hall 1 & Piano Lab", status: "Active" },
  { id: 2, name: "Saturday Cohort B (Afternoon)", time_slot: "Saturdays 1:00 PM – 4:00 PM", room: "Studio Hall 2 & Ensemble Room", status: "Active" },
  { id: 3, name: "Weekday Cohort (Tue & Thu)", time_slot: "Tue & Thu 5:00 PM – 7:00 PM", room: "Studio Hall 1", status: "Active" },
  { id: 4, name: "Private Home Lessons", time_slot: "Flexible (Scheduled with Instructor)", room: "Student Residence (Kaduna)", status: "Active" },
  { id: 5, name: "Online Virtual Studio", time_slot: "Flexible (1-on-1 Video Session)", room: "Remote Classroom", status: "Active" },
];

export const DEFAULT_PERFORMANCES = [
  {
    id: 1,
    title: "Vivadoxa Music Worship Session featuring Min. Uche",
    performer: "Min. Uche & Vivadoxa Live Ensemble",
    program: "Vocal & Instrumental Ensemble",
    category: "Concert",
    youtube_id: "-IcdMT9uCLU",
    duration: "Live Session",
    date_label: "Live Studio Session",
    description: "An inspiring live worship and vocal ensemble session featuring Min. Uche and Vivadoxa student instrumentalists live in the Kaduna studio.",
    is_featured: 1,
    is_short: 0,
  },
  {
    id: 2,
    title: "Students Praise Session & Live Band Recital",
    performer: "Vivadoxa Student Ensemble",
    program: "Drums, Bass & Keyboard",
    category: "Student Band",
    youtube_id: "XU917wI9sDg",
    duration: "Live Band",
    date_label: "Student Praise Showcase",
    description: "Vivadoxa candidates unite for an authentic praise session and live band showcase, demonstrating tempo lock, group dynamics, and rhythm control.",
    is_featured: 1,
    is_short: 1,
  },
  {
    id: 3,
    title: "Multi-Instrument Showcase: Bringing Musical Passions to Life",
    performer: "Vivadoxa Instructors & Students",
    program: "Multi-Disciplinary Ensemble",
    category: "Concert",
    youtube_id: "FZydqxYOpF0",
    duration: "Academy Showcase",
    date_label: "Kaduna Studio Showcase",
    description: "Highlighting the comprehensive range of musical disciplines taught at Vivadoxa Music Kaduna, from keyboard and strings to percussion.",
    is_featured: 1,
    is_short: 1,
  },
  {
    id: 4,
    title: "Acoustic Guitar Foundations & Worship Chord Melody",
    performer: "Vivadoxa Guitar Faculty & Students",
    program: "Acoustic Guitar",
    category: "Recital",
    youtube_id: "vjVEDq9oITE",
    duration: "Guitar Recital",
    date_label: "Guitar Studio Showcase",
    description: "Practical acoustic guitar demonstration playing worship songs, showing smooth open chord changes and rhythmic strumming dynamics.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 5,
    title: "Electric Bass Guitar Groove & Harmony Masterclass",
    performer: "Vivadoxa Bass Faculty",
    program: "Bass Guitar",
    category: "Recital",
    youtube_id: "G4c81H_UeXM",
    duration: "Bass Workshop",
    date_label: "Fretboard Workshop",
    description: "In-depth electric bass groove training, fretboard positioning, root-fifth-octave pocket playing, and gospel bass foundation.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 6,
    title: "Makossa & African Highlife Bass Groove Showcase",
    performer: "Vivadoxa Rhythm Section",
    program: "Bass Guitar & Percussion",
    category: "Student Band",
    youtube_id: "Adt0rd5uGaM",
    duration: "Groove Lab",
    date_label: "Live Rhythm Lab",
    description: "High-energy Makossa and African Highlife syncopated bass grooves, demonstrating finger dexterity, slap-pop nuances, and pocket timing.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 7,
    title: "Highlife Piano & African Praise Phrasing",
    performer: "Vivadoxa Keyboard Department",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "hH8frv6klc4",
    duration: "African Praise",
    date_label: "Keyboard Studio",
    description: "Authentic African Highlife keyboard chord voicings, rhythmic syncopation, and praise progression improvisation.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 8,
    title: "Makossa & Soukous Keyboard Rhythms",
    performer: "Vivadoxa Keyboard Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "Clu5E2abMgU",
    duration: "Studio Recital",
    date_label: "Contemporary Keyboard Lab",
    description: "Dynamic Makossa and Soukous rhythmic accompaniment patterns on piano, mastering two-hand independent rhythmic timing.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 9,
    title: "1-4-5 Chord Progressions & Harmonic Theory for Beginners",
    performer: "Vivadoxa Foundation Learners",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "aokYxYryN_8",
    duration: "Theory & Recital",
    date_label: "Foundation Class",
    description: "Demystifying fundamental 1-4-5 harmonic progressions on piano, voice leading, and cadence resolution for aspiring accompanists.",
    is_featured: 0,
    is_short: 0,
  },
  {
    id: 10,
    title: "Beginner Piano: Playing Your First Song",
    performer: "Vivadoxa Foundation Learners",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "SHQFEIvnFXc",
    duration: "Early Milestone",
    date_label: "Early Learner Showcase",
    description: "Encouraging early music education milestone: building hand posture, finger numbers, and completing your first song melody.",
    is_featured: 0,
    is_short: 0,
  },
  {
    id: 11,
    title: "Guitar Foundations: Playing Simple Songs & Strumming",
    performer: "Vivadoxa Guitar Department",
    program: "Acoustic Guitar",
    category: "Recital",
    youtube_id: "Hpx3BJ7C3QA",
    duration: "Acoustic Session",
    date_label: "Kaduna Studio",
    description: "Step-by-step guitar chord changes, rhythm timing, and playing your first full song with acoustic confidence.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 12,
    title: "Heartfelt Recital Milestone: Student Breakthrough Showcase",
    performer: "Junior Student Recitalist",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "biosC5ZXQgI",
    duration: "Milestone Recital",
    date_label: "Studio Recital",
    description: "An emotional milestone performance celebrating student breakthrough, musical expression, and dedication to practice.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 13,
    title: "Simple Piano Lesson & Melodic Phrasing",
    performer: "Vivadoxa Keyboard Department",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "teoKQmcuMZw",
    duration: "Piano Lesson",
    date_label: "Keyboard Studio",
    description: "Accessible foundation piano lesson breaking down melody phrasing, hand posture, and key navigation.",
    is_featured: 0,
    is_short: 0,
  },
  {
    id: 14,
    title: "Makossa Praise Groove & Syncopation",
    performer: "Vivadoxa Keyboard Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "Lxiwngf0YBQ",
    duration: "Praise Groove",
    date_label: "Kaduna Studio",
    description: "High-energy praise rhythm syncopation, upbeat comping, and authentic African gospel keyboard groove.",
    is_featured: 0,
    is_short: 1,
  },
  {
    id: 15,
    title: "Melodic Solo Expression on the Piano",
    performer: "Advanced Piano Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtube_id: "hSRbektpiTQ",
    duration: "Solo Phrasing",
    date_label: "Masterclass Showcase",
    description: "Techniques for playing lyrical solo melodies on keyboard with dynamic touch and expressive ornamentation.",
    is_featured: 0,
    is_short: 1,
  },
];

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAdmin(email: string, password: string): Promise<ApiResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // If there is an unsynced local staff account created offline, commit it to MySQL first
  try {
    const list = getLocalArray<any>("vdx_admins", []);
    const pending = list.find(
      (a: any) =>
        a &&
        a.email &&
        a.email.toLowerCase() === cleanEmail &&
        a.password &&
        a.password === cleanPassword
    );
    if (pending) {
      await fetch(getApiUrl("admins.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "add",
          name: pending.name || "Administrator",
          email: cleanEmail,
          role: pending.role || "superadmin",
          password: cleanPassword,
        }),
      });
      delete pending.password;
      localStorage.setItem("vdx_admins", JSON.stringify(list));
    }
  } catch {}

  // Strictly authenticate against the MySQL database via login.php
  try {
    const url = getApiUrl("login.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return data;
    }

    if (data && data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: false,
      error: `Authentication failed (Server HTTP ${res.status}). Please check database connectivity.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unable to reach database authentication server. Please check your network.",
    };
  }
}

// ── Live KPI Stats ────────────────────────────────────────────────────────────
export async function fetchStats(): Promise<ApiResponse> {
  try {
    const url = getApiUrl("stats.php");
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.stats) return json;
    }
  } catch (err) {
    console.warn("Backend stats unavailable:", err);
  }

  return {
    success: true,
    stats: {
      total_applications: 0,
      pending_applications: 0,
      accepted_applications: 0,
      pending_payments: 0,
      total_revenue: 0,
      formatted_revenue: "₦0.00",
      active_repairs: 0,
      unread_enquiries: 0,
      active_students: 0,
      pending_schedules: 0,
      monthly_revenue: [],
      recent_activity: [],
    },
  };
}

// ── Applications ──────────────────────────────────────────────────────────────
export async function fetchApplications(search = "", status = ""): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const url = `${getApiUrl("applications.php")}?${params.toString()}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json.applications) ? json.applications : null;
      if (json.success && list !== null) {
        return list;
      }
    }
  } catch (err) {
    console.warn("fetchApplications error:", err);
  }
  return [];
}

export async function submitApplication(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) {
      return result;
    }
    if (result?.error) {
      return { success: false, error: result.error };
    }
    return { success: false, error: `Failed to submit application (Server error ${res.status}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
}

export async function checkApplicationStatus(ref: string, email?: string): Promise<ApiResponse> {
  try {
    const params = new URLSearchParams({ ref });
    if (email) params.append("email", email);

    const url = `${getApiUrl("applications.php")}?${params.toString()}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.application) return json;
      if (json.error) return { success: false, error: json.error };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network error fetching application status." };
  }

  return {
    success: false,
    error: "No application record found matching this reference. Please check your reference number.",
  };
}

export async function updateApplicationStatus(application_no: string, status: string): Promise<ApiResponse> {
  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", application_no, status }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) {
      return result;
    }
    if (result?.error) {
      return { success: false, error: result.error };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to update application status." };
}

export async function updateApplication(
  application_no: string,
  updates: Record<string, any>
): Promise<ApiResponse> {
  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "modify", application_no, updates }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) {
      return result;
    }
    if (result?.error) {
      return { success: false, error: result.error };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update application." };
  }
  return { success: false, error: "Failed to update application details in database." };
}

export async function deleteApplication(application_no: string): Promise<ApiResponse> {
  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", application_no }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete application from database." };
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function fetchPayments(): Promise<any[]> {
  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json.payments) ? json.payments : null;
      if (json.success && list !== null) return list;
    }
  } catch (err) {
    console.warn("fetchPayments error:", err);
  }
  return [];
}

export async function submitPaymentProof(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit payment to database." };
  }
  return { success: false, error: "Payment submission failed." };
}

export async function updatePaymentStatus(reference: string, status: string): Promise<ApiResponse> {
  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", reference, status }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: `Failed to update payment ${reference}.` };
}

export async function deletePayment(reference: string): Promise<ApiResponse> {
  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", reference }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete payment from database." };
}

// ── Repairs ───────────────────────────────────────────────────────────────────
export async function fetchRepairs(): Promise<any[]> {
  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json.repairs) ? json.repairs : null;
      if (json.success && list !== null) return list;
    }
  } catch (err) {
    console.warn("fetchRepairs error:", err);
  }
  return [];
}

export async function submitRepairRequest(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit repair request to database." };
  }
  return { success: false, error: "Repair request failed." };
}

export async function updateRepairStatus(
  tracking_code: string,
  status: string,
  estimated_cost?: number
): Promise<ApiResponse> {
  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", tracking_code, status, estimated_cost }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: `Failed to update repair ${tracking_code}.` };
}

export async function deleteRepair(tracking_code: string): Promise<ApiResponse> {
  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", tracking_code }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete repair from database." };
}

export async function fetchRepairByCode(code: string): Promise<ApiResponse> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { success: false, error: "Please enter a tracking code." };
  try {
    const url = `${getApiUrl("repairs.php")}?code=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json;
      if (json.error) return { success: false, error: json.error };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error tracking repair." };
  }
  return { success: false, error: "No repair order found matching this tracking code." };
}

// ── Enquiries ─────────────────────────────────────────────────────────────────
export async function fetchEnquiries(): Promise<any[]> {
  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json.enquiries) ? json.enquiries : null;
      if (json.success && list !== null) return list;
    }
  } catch (err) {
    console.warn("fetchEnquiries error:", err);
  }
  return [];
}

export async function submitEnquiry(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit enquiry to database." };
  }
  return { success: false, error: "Enquiry message submission failed." };
}

export async function markEnquiryRead(id: number, is_read = 1): Promise<ApiResponse> {
  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_read", id, is_read }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to update enquiry status." };
}

export async function deleteEnquiry(id: number): Promise<ApiResponse> {
  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete enquiry from database." };
}

// ── Academics (Programs, Instructors, Students, Cohorts, Performances) ─────────
export async function fetchAcademics(
  type: "programs" | "instructors" | "students" | "cohorts" | "performances"
): Promise<any[]> {
  try {
    const url = `${getApiUrl("academics.php")}?type=${type}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn(`fetchAcademics error for ${type}:`, err);
  }
  return [];
}

export async function saveProgram(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=programs`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: data.id ? "update" : "add", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to save course program." };
}

export async function deleteProgram(id: number): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=programs`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete program from database." };
}

export async function saveInstructor(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=instructors`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: data.id ? "update" : "add", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to save instructor profile." };
}

export async function deleteInstructor(id: number): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=instructors`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete instructor from database." };
}

export async function savePerformance(data: Record<string, any>): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=performances`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: data.id ? "update" : "add", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to save performance recital." };
}

export async function deletePerformance(id: number): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=performances`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to delete performance from database." };
}

export async function enrollStudent(data: {
  application_no?: string;
  full_name: string;
  email: string;
  phone: string;
  program: string;
  cohort: string;
}): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "enroll", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to enroll student in database." };
}

export async function updateStudent(data: {
  id?: number;
  student_no?: string;
  status?: string;
  cohort?: string;
  phone?: string;
  email?: string;
  program?: string;
}): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to update student record in database." };
}

export async function deleteStudent(id: number): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to remove student record from database." };
}

export async function saveCohort(data: {
  id?: number;
  name: string;
  time_slot: string;
  room?: string;
  status?: string;
}): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=cohorts`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: data.id ? "update" : "add", ...data }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to save cohort slot." };
}

export async function deleteCohort(id: number): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("academics.php")}?type=cohorts`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok && result?.success) return result;
    if (result?.error) return { success: false, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
  return { success: false, error: "Failed to remove cohort slot from database." };
}

// ── Bank and System Settings ──────────────────────────────────────────────────
export interface BankSettings {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
  enablePaystack?: boolean;
  currency?: string;
  defaultTuitionFee?: number;
}

export const DEFAULT_BANK_SETTINGS: BankSettings = {
  bankName: "Access Bank",
  accountNumber: "1906950275",
  accountName: "Fredrerick Chysantus",
  branch: "Angwan Sunday, Kaduna",
  paystackPublicKey: "pk_live_vivadoxa_school_portal",
  paystackSecretKey: "••••••••••••••••••••••••",
  enablePaystack: true,
  currency: "NGN",
  defaultTuitionFee: 20000,
};

export function getBankSettings(): BankSettings {
  try {
    const raw = localStorage.getItem("vdx_bank_settings");
    if (raw) return { ...DEFAULT_BANK_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_BANK_SETTINGS;
}

export function saveBankSettings(settings: BankSettings): ApiResponse {
  try {
    localStorage.setItem("vdx_bank_settings", JSON.stringify(settings));
    // Asynchronously sync to backend
    fetch(getApiUrl("settings.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_payment", settings }),
    }).catch(() => {});
  } catch {}
  return { success: true, message: "Bank & gateway settings saved successfully." };
}

export interface GeneralSettings {
  schoolPhone: string;
  schoolPhone2: string;
  schoolWhatsapp: string;
  schoolEmail: string;
  schoolAddress?: string;
  emailAlerts: boolean;
  whatsappAlerts: boolean;
  alertOnApplication?: boolean;
  alertOnPayment?: boolean;
  alertOnRepair?: boolean;
  alertOnEnquiry?: boolean;
  studentEmailConfirmation?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpEncryption?: string;
  fromEmail?: string;
  fromName?: string;
  whatsappMode?: "direct" | "gateway";
  whatsappGatewayUrl?: string;
  whatsappApiToken?: string;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  schoolPhone: "09075330330",
  schoolPhone2: "09010267234",
  schoolWhatsapp: "08031308881",
  schoolEmail: "vivadoxa@gmail.com",
  schoolAddress: "Kaduna Studio, Kaduna State, Nigeria",
  emailAlerts: true,
  whatsappAlerts: true,
  alertOnApplication: true,
  alertOnPayment: true,
  alertOnRepair: true,
  alertOnEnquiry: true,
  studentEmailConfirmation: true,
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpEncryption: "tls",
  fromEmail: "admissions@vivadoxa.ng",
  fromName: "Vivadoxa Music Academy Admissions",
  whatsappMode: "direct",
  whatsappGatewayUrl: "",
  whatsappApiToken: "",
};

export function getGeneralSettings(): GeneralSettings {
  try {
    const raw = localStorage.getItem("vdx_general_settings");
    if (raw) return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_GENERAL_SETTINGS;
}

export function saveGeneralSettings(settings: GeneralSettings): ApiResponse {
  try {
    localStorage.setItem("vdx_general_settings", JSON.stringify(settings));
    // Asynchronously sync to backend
    fetch(getApiUrl("settings.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_general", settings }),
    }).catch(() => {});
  } catch {}
  return { success: true, message: "School general settings saved successfully." };
}

// ── Remote Settings & Testing Helpers ─────────────────────────────────────────
export async function fetchRemoteSettings(): Promise<{ general: GeneralSettings; payment: BankSettings }> {
  try {
    const res = await fetch(getApiUrl("settings.php?type=all"));
    if (res.ok) {
      const data = await res.json();
      if (data.general) {
        localStorage.setItem("vdx_general_settings", JSON.stringify(data.general));
      }
      if (data.payment) {
        localStorage.setItem("vdx_bank_settings", JSON.stringify(data.payment));
      }
      return {
        general: data.general || getGeneralSettings(),
        payment: data.payment || getBankSettings(),
      };
    }
  } catch {}
  return {
    general: getGeneralSettings(),
    payment: getBankSettings(),
  };
}

export async function testEmailNotification(settings: GeneralSettings, recipient: string): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("settings.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_email", settings, recipient }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach email verification endpoint." };
  }
}

export async function testWhatsAppNotification(settings: GeneralSettings, phone: string): Promise<ApiResponse & { wa_link?: string }> {
  try {
    const res = await fetch(getApiUrl("settings.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_whatsapp", settings, phone }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate WhatsApp notification test." };
  }
}

export async function fetchNotificationLogs(): Promise<any[]> {
  try {
    const res = await fetch(getApiUrl("settings.php?type=logs"));
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch {}
  return [];
}

// ── Staff & Administrator Management ──────────────────────────────────────────
export async function fetchAdmins(): Promise<any[]> {
  try {
    // If there are unsynced local staff accounts in cache with credentials, commit them to MySQL first
    const localList = getLocalArray<any>("vdx_admins", []);
    for (const localAdmin of localList) {
      if (localAdmin?.email && localAdmin?.password) {
        try {
          await fetch(getApiUrl("admins.php"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              action: "add",
              name: localAdmin.name || "Administrator",
              email: localAdmin.email,
              role: localAdmin.role || "staff",
              password: localAdmin.password,
            }),
          });
        } catch {}
      }
    }

    const res = await fetch(getApiUrl("admins.php"), {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        localStorage.setItem("vdx_admins", JSON.stringify(data.admins));
        return data.admins;
      }
    }
  } catch (err) {
    console.warn("fetchAdmins network error:", err);
  }
  return getLocalArray("vdx_admins", []);
}

export async function addStaffAdmin(data: { name: string; email: string; role: string; password: string }): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("admins.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "add", ...data }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      await fetchAdmins();
      return result;
    }

    if (result && result.error) {
      return { success: false, error: result.error };
    }

    return { success: false, error: `Failed to create staff account (Server error ${res.status}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server. Staff account could not be created." };
  }
}

export async function updateStaffAdmin(data: { id: number; name: string; email: string; role: string; password?: string }): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("admins.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update", ...data }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      await fetchAdmins();
      return result;
    }

    if (result && result.error) {
      return { success: false, error: result.error };
    }

    return { success: false, error: `Failed to update staff account (Server error ${res.status}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
}

export async function toggleStaffActive(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("admins.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "toggle_active", id }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      await fetchAdmins();
      return result;
    }

    if (result && result.error) {
      return { success: false, error: result.error };
    }

    return { success: false, error: `Failed to update staff status (Server error ${res.status}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
}

export async function deleteStaffAdmin(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("admins.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      await fetchAdmins();
      return result;
    }

    if (result && result.error) {
      return { success: false, error: result.error };
    }

    return { success: false, error: `Failed to delete staff account (Server error ${res.status}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to database server." };
  }
}

// ── Student & Client Portal Auth & API ─────────────────────────────────────────
export interface PortalUser {
  id: number;
  email: string;
  phone: string;
  full_name: string;
  role: "student" | "client" | "all";
  avatar?: string | null;
  address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  created_at?: string;
}

export interface PortalData {
  applications: any[];
  students: any[];
  payments: any[];
  repairs: any[];
  cohorts: any[];
  schedule_requests?: any[];
  financials: {
    total_invoiced: number;
    total_paid: number;
    balance_due: number;
    formatted_invoiced: string;
    formatted_paid: string;
    formatted_balance: string;
  };
}

export async function loginUser(identifier: string, password: string): Promise<ApiResponse & { user?: PortalUser }> {
  try {
    const res = await fetch(getApiUrl("user_auth.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", identifier, password }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      localStorage.setItem("vdx_portal_user", JSON.stringify(data.user));
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "Connection error" };
  }
}

export async function registerUser(data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
}): Promise<ApiResponse & { user?: PortalUser }> {
  try {
    const res = await fetch(getApiUrl("user_auth.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", ...data }),
    });
    const result = await res.json();
    if (result.success && result.user) {
      localStorage.setItem("vdx_portal_user", JSON.stringify(result.user));
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Registration error" };
  }
}

export async function checkUserSession(): Promise<PortalUser | null> {
  try {
    const res = await fetch(getApiUrl("user_auth.php"));
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        localStorage.setItem("vdx_portal_user", JSON.stringify(data.user));
        return data.user;
      }
    }
  } catch {}
  try {
    const cached = localStorage.getItem("vdx_portal_user");
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(getApiUrl("user_auth.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
  } catch {}
  localStorage.removeItem("vdx_portal_user");
}

export async function updateUserProfile(data: Record<string, any>): Promise<ApiResponse & { user?: PortalUser }> {
  try {
    const res = await fetch(getApiUrl("user_auth.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_profile", ...data }),
    });
    const result = await res.json();
    if (result.success && result.user) {
      localStorage.setItem("vdx_portal_user", JSON.stringify(result.user));
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile" };
  }
}

export async function fetchUserPortalData(email?: string): Promise<{ success: boolean; user?: PortalUser; portal?: PortalData; error?: string }> {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    const res = await fetch(getApiUrl(`user_portal.php${query}`));
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: "Failed to load portal data." };
}

export async function approveRepairEstimate(tracking_code: string): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("user_portal.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_repair", tracking_code }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve repair estimate" };
  }
}

// ── Schedule, Absence & Reschedule Requests ──────────────────────────────────
export async function submitScheduleRequest(data: {
  student_name: string;
  student_email: string;
  student_phone: string;
  program: string;
  request_type: string;
  current_schedule: string;
  affected_date?: string;
  return_date?: string;
  reason: string;
  makeup_requested?: boolean;
  preferred_makeup_slot?: string;
  notes?: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("schedule_requests.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...data }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit schedule notice." };
  }
}

export async function fetchScheduleRequests(email?: string, status?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (status && status !== "all") params.append("status", status);
    if (!email) params.append("all", "1");

    const res = await fetch(getApiUrl(`schedule_requests.php?${params.toString()}`));
    if (res.ok) {
      const data = await res.json();
      return data.requests || [];
    }
  } catch {}
  return [];
}

export async function respondToScheduleRequest(data: {
  id: number;
  status: string;
  allocated_makeup_date?: string;
  allocated_room?: string;
  staff_notes?: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(getApiUrl("schedule_requests.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "respond", ...data }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to respond to request." };
  }
}

// ── Purge Test & Mock Data ───────────────────────────────────────────────────
export async function purgeMockData(confirmation = "PURGE"): Promise<ApiResponse> {
  try {
    let adminEmail = "";
    try {
      const stored =
        localStorage.getItem("vdx_admin_session") ||
        sessionStorage.getItem("vdx_admin_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        adminEmail = parsed.email || "";
      }
    } catch {}

    const endpoint = `${getApiUrl("purge.php")}?confirm=${encodeURIComponent(confirmation)}&key=vivadoxa2026`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Email": adminEmail,
      },
      credentials: "include",
      body: JSON.stringify({
        confirm: confirmation,
        key: "vivadoxa2026",
        admin_email: adminEmail,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purge database." };
  }
}

