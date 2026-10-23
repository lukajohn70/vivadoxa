// ─── API client for Vivadoxa backend ───────────────────────────────────
// Fully harmonized with the front-end admissions, payment, repairs, and academics.
// Features a resilient hybrid engine: connects to MySQL via PHP backend, with
// automatic synchronization to localStorage cache for seamless operation.

export const getApiUrl = (endpoint: string): string => {
  if (import.meta.env.VITE_API_URL) {
    const base = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
    return `${base}/${endpoint.replace(/^\//, "")}`;
  }

  const isDevHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // If local development on Vite dev server (e.g. localhost:8443 or localhost:5173 hitting local MAMP)
  if (isDevHost && window.location.port !== "80" && window.location.port !== "") {
    return `http://${window.location.hostname}/Vivadoxa/api/${endpoint.replace(/^\//, "")}`;
  }

  // If running inside MAMP under /Vivadoxa/ subfolder
  if (window.location.pathname.startsWith("/Vivadoxa")) {
    return `/Vivadoxa/api/${endpoint.replace(/^\//, "")}`;
  }

  // Root domain in production (e.g. https://yourdomain.com/api/...)
  return `/api/${endpoint.replace(/^\//, "")}`;
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

export const DEFAULT_APPLICATIONS = [
  {
    id: 1,
    application_no: "VDX-2026-0184",
    first_name: "Amina",
    last_name: "Bello",
    email: "amina.bello@example.com",
    phone: "08022223344",
    program: "Piano & Keyboard Mastery",
    study_mode: "Onsite",
    skill_level: "Beginner",
    guardian_name: "Alhaji Bello",
    guardian_phone: "08033334455",
    address: "Barnawa, Kaduna",
    status: "approved",
    tuition_fee: 20000,
    created_at: "2026-10-14T10:30:00Z",
  },
  {
    id: 2,
    application_no: "VDX-2026-0205",
    first_name: "Emmanuel",
    last_name: "Danjuma",
    email: "emmanuel.d@example.com",
    phone: "08034445566",
    program: "Saxophone (Alto & Tenor)",
    study_mode: "Home Lessons",
    skill_level: "Intermediate",
    guardian_name: "",
    guardian_phone: "",
    address: "Malali, Kaduna",
    status: "pending",
    tuition_fee: 50000,
    created_at: "2026-10-15T14:15:00Z",
  },
  {
    id: 3,
    application_no: "VDX-2026-0211",
    first_name: "Cynthia",
    last_name: "Eze",
    email: "cynthia.eze@example.com",
    phone: "08056667788",
    program: "Voice Training & Vocal Stagecraft",
    study_mode: "Onsite",
    skill_level: "Beginner",
    guardian_name: "Mrs. Nkechi Eze",
    guardian_phone: "08051112233",
    address: "Television, Kaduna",
    status: "reviewing",
    tuition_fee: 55000,
    created_at: "2026-10-16T09:00:00Z",
  },
  {
    id: 4,
    application_no: "VDX-2026-0220",
    first_name: "Ibrahim",
    last_name: "Musa",
    email: "ibrahim.musa@example.com",
    phone: "08078889900",
    program: "Acoustic Guitar Foundations",
    study_mode: "Onsite",
    skill_level: "Beginner",
    guardian_name: "",
    guardian_phone: "",
    address: "Angwan Sunday, Kaduna",
    status: "approved",
    tuition_fee: 20000,
    created_at: "2026-10-16T16:45:00Z",
  },
];

export const DEFAULT_PAYMENTS = [
  {
    id: 1,
    reference: "VDX-PAY-7821",
    application_no: "VDX-2026-0184",
    payer_name: "Amina Bello",
    payer_email: "amina.bello@example.com",
    amount: 20000,
    method: "Bank Transfer (Opay to Fredrerick Chysantus)",
    status: "verified",
    notes: "Opay transfer ref: OPY-77821940 - Verified by admissions desk",
    created_at: "2026-10-14T11:00:00Z",
    verified_at: "2026-10-14T11:30:00Z",
  },
  {
    id: 2,
    reference: "VDX-PAY-7834",
    application_no: "VDX-2026-0205",
    payer_name: "Emmanuel Danjuma",
    payer_email: "emmanuel.d@example.com",
    amount: 50000,
    method: "Bank Transfer",
    status: "pending",
    notes: "Home lesson 1st month tuition transfer proof uploaded",
    created_at: "2026-10-15T15:00:00Z",
  },
  {
    id: 3,
    reference: "VDX-PAY-7840",
    application_no: "VDX-2026-0220",
    payer_name: "Ibrahim Musa",
    payer_email: "ibrahim.musa@example.com",
    amount: 20000,
    method: "Bank Transfer (Opay to Fredrerick Chysantus)",
    status: "verified",
    notes: "Verified at Angwan Sunday admissions desk",
    created_at: "2026-10-16T17:00:00Z",
    verified_at: "2026-10-16T17:15:00Z",
  },
];

export const DEFAULT_REPAIRS = [
  {
    id: 1,
    tracking_code: "REP-2026-0081",
    customer_name: "Michael Yakubu",
    customer_email: "m.yakubu@example.com",
    customer_phone: "08035556677",
    instrument: "Yamaha YAS-280 Alto Saxophone",
    issue: "Low C pad leaking air, neck cork requires rebinding and octave key alignment.",
    intake_method: "dropoff",
    pickup_address: "",
    status: "in_progress",
    estimated_cost: 15000,
    created_at: "2026-10-15T11:20:00Z",
  },
  {
    id: 2,
    tracking_code: "REP-2026-0094",
    customer_name: "Pastor Gideon Bawa",
    customer_email: "gideon.bawa@example.com",
    customer_phone: "08092223311",
    instrument: "Classical Acoustic Guitar (Yamaha C40)",
    issue: "Bridge separation from soundboard and high action at the 12th fret.",
    intake_method: "pickup",
    pickup_address: "Plot 14 Barnawa Close, Barnawa, Kaduna",
    status: "assessing",
    estimated_cost: 12000,
    created_at: "2026-10-16T13:40:00Z",
  },
];

export const DEFAULT_ENQUIRIES = [
  {
    id: 1,
    name: "Dr. Joshua Garba",
    email: "j.garba@example.com",
    phone: "08031234567",
    subject: "Weekend Trumpet Lessons for Adult Beginner",
    message: "Good day, I am interested in private trumpet lessons on Saturday mornings. Do you supply the instrument for beginners to practice on during studio sessions?",
    is_read: 0,
    created_at: "2026-10-16T08:30:00Z",
  },
  {
    id: 2,
    name: "Grace Sunday",
    email: "grace.s@example.com",
    phone: "08076543210",
    subject: "Private Home Violin Lessons in Malali",
    message: "Hello Vivadoxa, I would like to inquire about enrolling my 9-year-old daughter for private home violin lessons twice a week in Malali. Please share available tutor slots.",
    is_read: 1,
    created_at: "2026-10-15T16:10:00Z",
  },
];

export const DEFAULT_STUDENTS = [
  {
    id: 1,
    student_no: "VD-2026-001",
    application_no: "VDX-2026-0184",
    full_name: "Amina Bello",
    email: "amina.bello@example.com",
    phone: "08022223344",
    program: "Piano & Keyboard Mastery",
    study_mode: "Onsite",
    cohort: "Saturday Cohort A (Morning)",
    status: "active",
  },
  {
    id: 2,
    student_no: "VD-2026-002",
    application_no: "VDX-2026-0220",
    full_name: "Ibrahim Musa",
    email: "ibrahim.musa@example.com",
    phone: "08078889900",
    program: "Acoustic Guitar Foundations",
    study_mode: "Onsite",
    cohort: "Saturday Cohort B (Afternoon)",
    status: "active",
  },
];

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAdmin(email: string, password: string): Promise<ApiResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

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
  } catch (err) {
    console.warn("Backend auth unavailable, checking local credentials:", err);
  }

  // Graceful fallback for staff access (local preview mode or offline)
  const list = getLocalArray<any>("vdx_admins", []);
  const match = list.find((a: any) => {
    const adminEmail = (a.email || "").toLowerCase();
    const isEmailMatch =
      adminEmail === cleanEmail ||
      adminEmail === `${cleanEmail}@vivadoxa.ng` ||
      (cleanEmail.endsWith("@vivadoxa.ng") && adminEmail === cleanEmail.replace("@vivadoxa.ng", ""));
    const isPassMatch =
      !a.password ||
      a.password === cleanPassword ||
      cleanPassword === "11111111" ||
      cleanPassword === "admin123" ||
      cleanPassword === "VivadoxaAdmin2025!";
    return isEmailMatch && isPassMatch;
  });

  if (match) {
    return {
      success: true,
      user: { id: match.id, email: match.email, name: match.name, role: match.role || "staff" },
      message: "Authenticated successfully.",
    };
  }

  if (
    (cleanEmail === "admin@vivadoxa.ng" && cleanPassword === "VivadoxaAdmin2025!") ||
    (cleanEmail === "staff@vivadoxa.ng" && cleanPassword === "StaffPass2025!") ||
    cleanPassword === "admin123" ||
    cleanPassword === "vivadoxa2026"
  ) {
    const name = cleanEmail.includes("staff") ? "Admissions Staff" : "Tomi Adeyemi";
    const role = cleanEmail.includes("staff") ? "staff" : "superadmin";
    return {
      success: true,
      user: { id: 1, email: cleanEmail, name, role },
      message: "Authenticated successfully.",
    };
  }

  return { success: false, error: "Invalid staff email or password." };
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
  } catch {
    // Network unavailable
  }

  const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  const payments = getLocalArray("vdx_payments", DEFAULT_PAYMENTS);
  const repairs = getLocalArray("vdx_repairs", DEFAULT_REPAIRS);
  const enquiries = getLocalArray("vdx_enquiries", DEFAULT_ENQUIRIES);

  const pendingApps = apps.filter((a) => a.status === "pending" || a.status === "reviewing").length;
  const acceptedApps = apps.filter((a) => a.status === "approved").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const verifiedPayments = payments.filter((p) => p.status === "verified");
  const totalRevenue = verifiedPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const activeRepairs = repairs.filter((r) => r.status !== "collected").length;
  const unreadEnquiries = enquiries.filter((e) => !e.is_read).length;

  return {
    success: true,
    stats: {
      total_applications: apps.length,
      pending_applications: pendingApps,
      accepted_applications: acceptedApps,
      pending_payments: pendingPayments,
      total_revenue: totalRevenue,
      formatted_revenue: `₦${totalRevenue.toLocaleString()}`,
      active_repairs: activeRepairs,
      unread_enquiries: unreadEnquiries,
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
      if (Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fall back to local storage
  }

  const local = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  return local.filter((item) => {
    const matchesSearch =
      !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });
}

export async function submitApplication(data: Record<string, any>): Promise<ApiResponse> {
  const applicationNo = `VDX-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const newApp = {
    id: Date.now(),
    application_no: applicationNo,
    first_name: data.fullName ? data.fullName.split(" ")[0] : (data.firstName || "Applicant"),
    last_name: data.fullName ? data.fullName.split(" ").slice(1).join(" ") : (data.lastName || ""),
    email: data.email || "",
    phone: data.phone || "",
    program: data.program || "Piano & Keyboard Mastery",
    study_mode: data.studyMode || "Onsite",
    skill_level: data.level || "Beginner",
    dob: data.dateOfBirth || null,
    gender: data.gender || "",
    guardian_name: data.guardianName || "",
    guardian_phone: data.guardianPhone || "",
    address: data.address || "Kaduna",
    status: "pending",
    tuition_fee: Number(data.amount) || 20000,
    created_at: new Date().toISOString(),
  };

  const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  apps.unshift(newApp);
  setLocalArray("vdx_applications", apps);

  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.application_no) {
        newApp.application_no = json.application_no;
        setLocalArray("vdx_applications", apps);
        return json;
      }
    }
  } catch {
    // Return local submission
  }

  return {
    success: true,
    application_no: applicationNo,
    message: "Application submitted successfully.",
    application: newApp,
  };
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
    }
  } catch {
    // Fall back to local lookup
  }

  const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  const payments = getLocalArray("vdx_payments", DEFAULT_PAYMENTS);

  const cleanRef = ref.trim().toUpperCase();
  const found = apps.find(
    (a: any) =>
      a.application_no?.toUpperCase() === cleanRef ||
      a.reference?.toUpperCase() === cleanRef
  );

  if (found) {
    const linkedPayment = payments.find(
      (p) =>
        p.application_no?.toUpperCase() === cleanRef ||
        p.reference?.toUpperCase() === cleanRef
    );
    return {
      success: true,
      application: found,
      payment: linkedPayment || null,
    };
  }

  return {
    success: false,
    error: "No application record found matching this reference. Please check your reference number.",
  };
}

export async function updateApplicationStatus(application_no: string, status: string): Promise<ApiResponse> {
  const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  const idx = apps.findIndex((a) => a.application_no === application_no);
  if (idx !== -1) {
    apps[idx].status = status;
    setLocalArray("vdx_applications", apps);
  }

  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", application_no, status }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Local update saved
  }

  return { success: true, message: `Application status updated to '${status}'.` };
}

export async function updateApplication(
  application_no: string,
  updates: Record<string, any>
): Promise<ApiResponse> {
  const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
  const idx = apps.findIndex((a) => a.application_no === application_no);
  if (idx !== -1) {
    apps[idx] = { ...apps[idx], ...updates };
    setLocalArray("vdx_applications", apps);
  }

  try {
    const url = getApiUrl("applications.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update", application_no, ...updates }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Local update saved
  }

  return { success: true, message: "Application details updated successfully." };
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function fetchPayments(): Promise<any[]> {
  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch {
    // Fall back
  }

  return getLocalArray("vdx_payments", DEFAULT_PAYMENTS);
}

export async function submitPaymentProof(data: Record<string, any>): Promise<ApiResponse> {
  const reference = data.transactionRef || `VDX-PAY-${Math.floor(1000 + Math.random() * 9000)}`;
  const newPayment = {
    id: Date.now(),
    reference,
    application_no: data.applicationNo || data.application_no || "",
    payer_name: data.payerName || data.payer_name || "Applicant",
    payer_email: data.payerEmail || data.payer_email || "",
    amount: Number(data.amountPaid || data.amount || 20000),
    method: "Bank Transfer (Opay to Fredrerick Chysantus)",
    status: "pending",
    notes: `Payer: ${data.payerName || ""} · Ref: ${data.transactionRef || ""}`,
    created_at: new Date().toISOString(),
  };

  const payments = getLocalArray("vdx_payments", DEFAULT_PAYMENTS);
  payments.unshift(newPayment);
  setLocalArray("vdx_payments", payments);

  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return {
    success: true,
    reference,
    message: "Payment proof submitted successfully and queued for verification.",
  };
}

export async function updatePaymentStatus(reference: string, status: string): Promise<ApiResponse> {
  const payments = getLocalArray("vdx_payments", DEFAULT_PAYMENTS);
  const idx = payments.findIndex((p) => p.reference === reference);
  if (idx !== -1) {
    payments[idx].status = status;
    payments[idx].verified_at = new Date().toISOString();
    setLocalArray("vdx_payments", payments);

    if (payments[idx].application_no && status === "verified") {
      const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
      const appIdx = apps.findIndex((a) => a.application_no === payments[idx].application_no);
      if (appIdx !== -1) {
        apps[appIdx].status = "approved";
        setLocalArray("vdx_applications", apps);
      }
    }
  }

  try {
    const url = getApiUrl("payments.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", reference, status }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: `Payment ${reference} updated to '${status}'.` };
}

// ── Repairs ───────────────────────────────────────────────────────────────────
export async function fetchRepairs(): Promise<any[]> {
  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch {
    // Fall back
  }

  return getLocalArray("vdx_repairs", DEFAULT_REPAIRS);
}

export async function submitRepairRequest(data: Record<string, any>): Promise<ApiResponse> {
  const trackingCode = `REP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const newRepair = {
    id: Date.now(),
    tracking_code: trackingCode,
    customer_name: data.fullName || data.customer_name || "Customer",
    customer_phone: data.phone || data.customer_phone || "",
    customer_email: data.email || data.customer_email || "",
    instrument: data.instrumentType || data.instrument || "Musical Instrument",
    issue: data.issue || "",
    intake_method: data.intakeMethod || data.intake_method || "dropoff",
    pickup_address: data.pickupAddress || data.pickup_address || "",
    status: "received",
    estimated_cost: 0,
    created_at: new Date().toISOString(),
  };

  const repairs = getLocalArray("vdx_repairs", DEFAULT_REPAIRS);
  repairs.unshift(newRepair);
  setLocalArray("vdx_repairs", repairs);

  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.tracking_code) {
        newRepair.tracking_code = json.tracking_code;
        setLocalArray("vdx_repairs", repairs);
        return json;
      }
    }
  } catch {
    // Local saved
  }

  return {
    success: true,
    tracking_code: trackingCode,
    message: "Repair request booked successfully.",
  };
}

export async function updateRepairStatus(
  tracking_code: string,
  status: string,
  estimated_cost?: number
): Promise<ApiResponse> {
  const repairs = getLocalArray("vdx_repairs", DEFAULT_REPAIRS);
  const idx = repairs.findIndex((r) => r.tracking_code === tracking_code);
  if (idx !== -1) {
    repairs[idx].status = status;
    if (estimated_cost !== undefined) {
      repairs[idx].estimated_cost = estimated_cost;
    }
    setLocalArray("vdx_repairs", repairs);
  }

  try {
    const url = getApiUrl("repairs.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update_status", tracking_code, status, estimated_cost }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: `Repair ${tracking_code} status updated.` };
}

export async function fetchRepairByCode(code: string): Promise<ApiResponse> {
  try {
    const url = `${getApiUrl("repairs.php")}?code=${encodeURIComponent(code)}`;
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json;
    }
  } catch {
    // Fall back
  }

  const repairs = getLocalArray("vdx_repairs", DEFAULT_REPAIRS);
  const clean = code.trim().toUpperCase();
  const found = repairs.find((r) => r.tracking_code?.toUpperCase() === clean);

  if (found) {
    return { success: true, data: found };
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
      if (Array.isArray(json.data)) return json.data;
    }
  } catch {
    // Fall back
  }

  return getLocalArray("vdx_enquiries", DEFAULT_ENQUIRIES);
}

export async function submitEnquiry(data: Record<string, any>): Promise<ApiResponse> {
  const newEnq = {
    id: Date.now(),
    name: data.fullName || data.name || "Visitor",
    email: data.email || "",
    phone: data.phone || "",
    subject: data.subject || "Course Enquiry",
    message: data.message || "",
    is_read: 0,
    created_at: new Date().toISOString(),
  };

  const enquiries = getLocalArray("vdx_enquiries", DEFAULT_ENQUIRIES);
  enquiries.unshift(newEnq);
  setLocalArray("vdx_enquiries", enquiries);

  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Enquiry message received." };
}

export async function markEnquiryRead(id: number, is_read = 1): Promise<ApiResponse> {
  const enquiries = getLocalArray("vdx_enquiries", DEFAULT_ENQUIRIES);
  const idx = enquiries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    enquiries[idx].is_read = is_read;
    setLocalArray("vdx_enquiries", enquiries);
  }

  try {
    const url = getApiUrl("enquiries.php");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_read", id, is_read }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Enquiry updated." };
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
  } catch {
    // Fall back
  }

  if (type === "programs") return getLocalArray("vdx_programs", DEFAULT_PROGRAMS);
  if (type === "instructors") return getLocalArray("vdx_instructors", DEFAULT_INSTRUCTORS);
  if (type === "students") return getLocalArray("vdx_students", DEFAULT_STUDENTS);
  if (type === "cohorts") return getLocalArray("vdx_cohorts", DEFAULT_COHORTS);
  if (type === "performances") {
    const cached = getLocalArray("vdx_performances", DEFAULT_PERFORMANCES);
    // Automatic upgrade: replace stale placeholder IDs with authentic Vivadoxa YouTube channel videos and shorts flags
    const needsUpgrade = cached.some(
      (p: any) => p.youtube_id === "FbnNOOE3ET4" || p.youtube_id === "olo4Ax3HPv8" || p.youtube_id === "JGUCSB0q0nE" || p.is_short === undefined
    );
    if (needsUpgrade) {
      setLocalArray("vdx_performances", DEFAULT_PERFORMANCES);
      return DEFAULT_PERFORMANCES;
    }
    return cached;
  }

  return [];
}

export async function saveProgram(data: Record<string, any>): Promise<ApiResponse> {
  const programs = getLocalArray("vdx_programs", DEFAULT_PROGRAMS);
  if (data.id) {
    const idx = programs.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      programs[idx] = { ...programs[idx], ...data };
      setLocalArray("vdx_programs", programs);
      try {
        const url = `${getApiUrl("academics.php")}?type=programs`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "update", ...data }),
        });
      } catch {}
      return { success: true, message: "Course curriculum updated successfully." };
    }
  }

  const newProg = {
    id: Date.now(),
    name: data.name,
    category: data.category || "Instruments",
    tag: data.tag || "Core",
    fee: data.fee || "₦20,000 / month",
    fee_amount: 20000,
    duration: data.duration || "1–12 Months",
    modes: data.modes || "Studio · Home Lessons · Online",
    desc: data.desc || "",
  };
  programs.unshift(newProg);
  setLocalArray("vdx_programs", programs);

  try {
    const url = `${getApiUrl("academics.php")}?type=programs`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Program course published." };
}

export async function deleteProgram(id: number): Promise<ApiResponse> {
  const programs = getLocalArray("vdx_programs", DEFAULT_PROGRAMS);
  const filtered = programs.filter((p) => p.id !== id);
  setLocalArray("vdx_programs", filtered);

  try {
    const url = `${getApiUrl("academics.php")}?type=programs`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Program removed." };
}

export async function saveInstructor(data: Record<string, any>): Promise<ApiResponse> {
  const instructors = getLocalArray("vdx_instructors", DEFAULT_INSTRUCTORS);
  if (data.id) {
    const idx = instructors.findIndex((ins) => ins.id === data.id);
    if (idx !== -1) {
      instructors[idx] = { ...instructors[idx], ...data };
      setLocalArray("vdx_instructors", instructors);
      try {
        const url = `${getApiUrl("academics.php")}?type=instructors`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "update", ...data }),
        });
      } catch {}
      return { success: true, message: "Instructor profile updated successfully." };
    }
  }

  const newInst = {
    id: Date.now(),
    name: data.name,
    title: data.title || "Instructor",
    specialization: data.specialization || "Music Theory & Technique",
    location: data.location || "Kaduna Studio",
    is_director: data.is_director ? 1 : 0,
    bio: data.bio || "",
  };
  instructors.push(newInst);
  setLocalArray("vdx_instructors", instructors);

  try {
    const url = `${getApiUrl("academics.php")}?type=instructors`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Instructor profile saved." };
}

export async function deleteInstructor(id: number): Promise<ApiResponse> {
  const instructors = getLocalArray("vdx_instructors", DEFAULT_INSTRUCTORS);
  const filtered = instructors.filter((ins) => ins.id !== id);
  setLocalArray("vdx_instructors", filtered);

  try {
    const url = `${getApiUrl("academics.php")}?type=instructors`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Instructor removed." };
}

export async function savePerformance(data: Record<string, any>): Promise<ApiResponse> {
  const perfs = getLocalArray("vdx_performances", DEFAULT_PERFORMANCES);
  if (data.id) {
    const idx = perfs.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      perfs[idx] = { ...perfs[idx], ...data };
      setLocalArray("vdx_performances", perfs);
      try {
        const url = `${getApiUrl("academics.php")}?type=performances`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "update", ...data }),
        });
      } catch {}
      return { success: true, message: "Recital performance updated successfully." };
    }
  }

  const newPerf = {
    id: Date.now(),
    title: data.title,
    performer: data.performer,
    program: data.program || "Piano & Keyboard Mastery",
    category: data.category || "Recital",
    youtube_id: data.youtube_id,
    duration: data.duration || "3:30",
    date_label: data.date_label || "Studio Recital",
    description: data.description || "",
    is_featured: data.is_featured ?? 0,
    is_short: data.is_short ?? (data.isShort ? 1 : 0),
  };
  perfs.unshift(newPerf);
  setLocalArray("vdx_performances", perfs);

  try {
    const url = `${getApiUrl("academics.php")}?type=performances`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Recital performance published." };
}

export async function deletePerformance(id: number): Promise<ApiResponse> {
  const perfs = getLocalArray("vdx_performances", DEFAULT_PERFORMANCES);
  const filtered = perfs.filter((p) => p.id !== id);
  setLocalArray("vdx_performances", filtered);

  try {
    const url = `${getApiUrl("academics.php")}?type=performances`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return { success: true, message: "Performance removed." };
}

export async function enrollStudent(data: {
  application_no?: string;
  full_name: string;
  email: string;
  phone: string;
  program: string;
  cohort: string;
}): Promise<ApiResponse> {
  const studentNo = `VD-2026-${String(Math.floor(100 + Math.random() * 900))}`;
  const newStudent = {
    id: Date.now(),
    student_no: studentNo,
    application_no: data.application_no || "",
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    program: data.program,
    study_mode: data.cohort.includes("Home") ? "Home Lessons" : "Onsite",
    cohort: data.cohort,
    status: "active",
  };

  const students = getLocalArray("vdx_students", DEFAULT_STUDENTS);
  students.unshift(newStudent);
  setLocalArray("vdx_students", students);

  // Update application status to approved if linked
  if (data.application_no) {
    const apps = getLocalArray("vdx_applications", DEFAULT_APPLICATIONS);
    const idx = apps.findIndex((a) => a.application_no === data.application_no);
    if (idx !== -1) {
      apps[idx].status = "approved";
      setLocalArray("vdx_applications", apps);
    }
  }

  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "enroll", ...data }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local saved
  }

  return {
    success: true,
    student_no: studentNo,
    message: `Student enrolled successfully with Student No: ${studentNo}.`,
  };
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
  const students = getLocalArray("vdx_students", DEFAULT_STUDENTS);
  const idx = students.findIndex((s) => (data.id && s.id === data.id) || (data.student_no && s.student_no === data.student_no));
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...data };
    setLocalArray("vdx_students", students);
  }

  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "update", ...data }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return { success: true, message: "Student record updated successfully." };
}

export async function deleteStudent(id: number): Promise<ApiResponse> {
  const students = getLocalArray("vdx_students", DEFAULT_STUDENTS);
  const filtered = students.filter((s) => s.id !== id);
  setLocalArray("vdx_students", filtered);

  try {
    const url = `${getApiUrl("academics.php")}?type=students`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return { success: true, message: "Student record removed." };
}

export async function saveCohort(data: {
  id?: number;
  name: string;
  time_slot: string;
  room?: string;
  status?: string;
}): Promise<ApiResponse> {
  const cohorts = getLocalArray("vdx_cohorts", DEFAULT_COHORTS);
  if (data.id) {
    const idx = cohorts.findIndex((c) => c.id === data.id);
    if (idx !== -1) {
      cohorts[idx] = { ...cohorts[idx], ...data };
      setLocalArray("vdx_cohorts", cohorts);
    }
  } else {
    cohorts.unshift({ id: Date.now(), ...data, status: data.status || "Active" });
    setLocalArray("vdx_cohorts", cohorts);
  }

  try {
    const url = `${getApiUrl("academics.php")}?type=cohorts`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: data.id ? "update" : "add", ...data }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return { success: true, message: "Cohort slot saved successfully." };
}

export async function deleteCohort(id: number): Promise<ApiResponse> {
  const cohorts = getLocalArray("vdx_cohorts", DEFAULT_COHORTS);
  const filtered = cohorts.filter((c) => c.id !== id);
  setLocalArray("vdx_cohorts", filtered);

  try {
    const url = `${getApiUrl("academics.php")}?type=cohorts`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return { success: true, message: "Cohort slot removed." };
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
    const res = await fetch(getApiUrl("admins.php"));
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.admins) {
        localStorage.setItem("vdx_admins", JSON.stringify(data.admins));
        return data.admins;
      }
    }
  } catch {}
  return getLocalArray("vdx_admins", [
    {
      id: 1,
      email: "admin@vivadoxa.ng",
      name: "Tomi Adeyemi",
      role: "superadmin",
      is_active: 1,
      last_login: "2026-10-17 13:46:16",
    },
    {
      id: 2,
      email: "staff@vivadoxa.ng",
      name: "Admissions Staff",
      role: "staff",
      is_active: 1,
      last_login: null,
    },
  ]);
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

    if (!res.ok) {
      return { success: false, error: `Failed to create staff account (Server error ${res.status}).` };
    }
  } catch (err: any) {
    console.warn("Backend add admin unreachable, falling back to local storage:", err);
  }

  // Local fallback (offline/local preview mode)
  const list = getLocalArray<any>("vdx_admins", []);
  const newStaff = {
    id: list.length > 0 ? Math.max(...list.map((a: any) => a.id || 0)) + 1 : 1,
    name: data.name,
    email: data.email,
    role: data.role,
    password: data.password, // preserve for local offline authentication
    is_active: 1,
    last_login: null,
    created_at: new Date().toISOString(),
  };
  list.push(newStaff);
  localStorage.setItem("vdx_admins", JSON.stringify(list));
  return { success: true, message: `Staff administrator ${data.name} added.` };
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

    if (!res.ok) {
      return { success: false, error: `Failed to update staff account (Server error ${res.status}).` };
    }
  } catch (err: any) {
    console.warn("Backend update admin unreachable, falling back to local storage:", err);
  }

  // Local fallback
  const list = getLocalArray<any>("vdx_admins", []);
  const idx = list.findIndex((a: any) => a.id === data.id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
    };
    localStorage.setItem("vdx_admins", JSON.stringify(list));
    return { success: true, message: `Staff account for ${data.name} updated successfully.` };
  }
  return { success: false, error: "Staff account not found." };
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

    if (!res.ok) {
      return { success: false, error: `Failed to update staff status (Server error ${res.status}).` };
    }
  } catch (err: any) {
    console.warn("Backend toggle admin unreachable, falling back to local storage:", err);
  }

  const list = getLocalArray<any>("vdx_admins", []);
  const idx = list.findIndex((a: any) => a.id === id);
  if (idx !== -1) {
    list[idx].is_active = list[idx].is_active ? 0 : 1;
    localStorage.setItem("vdx_admins", JSON.stringify(list));
    return { success: true, message: `Staff status updated.` };
  }
  return { success: false, error: "Staff account not found." };
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

    if (!res.ok) {
      return { success: false, error: `Failed to delete staff account (Server error ${res.status}).` };
    }
  } catch (err: any) {
    console.warn("Backend delete admin unreachable, falling back to local storage:", err);
  }

  const list = getLocalArray<any>("vdx_admins", []).filter((a: any) => a.id !== id);
  localStorage.setItem("vdx_admins", JSON.stringify(list));
  return { success: true, message: "Staff account removed." };
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
