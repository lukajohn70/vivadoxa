import type { Program } from "@/types";

// Unsplash image URLs (no cost, attribution not required for Unsplash photos)
export const heroImg =
  "https://images.unsplash.com/photo-1722481742905-0ed15dd8d762?auto=format&fit=crop&w=1600&q=85";
export const trumpetImg =
  "https://images.unsplash.com/photo-1615841192203-84f7b2899c0b?auto=format&fit=crop&w=1200&q=85";
export const portraitImg =
  "https://images.unsplash.com/photo-1615841192282-0c9aba46d19c?auto=format&fit=crop&w=900&q=85";
export const drumsImg =
  "https://images.unsplash.com/photo-1721713834000-1064fbf2affb?auto=format&fit=crop&w=900&q=85";
export const pianoImg =
  "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?auto=format&fit=crop&w=1200&q=85";
export const guitarImg =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85";
export const studioImg =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85";
export const violinImg =
  "https://images.unsplash.com/photo-1567619822659-2094d3ebef04?auto=format&fit=crop&w=1200&q=85";
export const saxophoneImg =
  "https://images.unsplash.com/photo-1581283869631-baae04233b04?auto=format&fit=crop&w=1200&q=85";
export const vocalsImg =
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85";

export const programs: Program[] = [
  {
    name: "Piano & Keyboard",
    tag: "Most popular",
    image: pianoImg,
    fee: "₦85,000",
    feeAmount: 85000,
    desc: "Build strong technique, sight-reading, classical repertoire and jazz improvisation.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Guitar (Acoustic & Electric)",
    tag: "All styles",
    image: guitarImg,
    fee: "₦75,000",
    feeAmount: 75000,
    desc: "From fundamental open chords to fingerstyle, scales, solos and live band accompaniment.",
    category: "Instruments",
    ageGroup: "Teens (13–19)",
    level: "Beginner",
  },
  {
    name: "Contemporary Drums & Percussion",
    tag: "High energy",
    image: drumsImg,
    fee: "₦80,000",
    feeAmount: 80000,
    desc: "Develop rock-solid meter, limb independence, dynamic fills and live ensemble coordination.",
    category: "Instruments",
    ageGroup: "Kids (4–12)",
    level: "Intermediate",
  },
  {
    name: "Violin & Chamber Strings",
    tag: "Classical",
    image: violinImg,
    fee: "₦82,000",
    feeAmount: 82000,
    desc: "Develop proper posture, tone production, bowing mechanics, intonation and chamber ensemble skills.",
    category: "Instruments",
    ageGroup: "Kids (4–12)",
    level: "Beginner",
  },
  {
    name: "Saxophone Mastery",
    tag: "Jazz + contemporary",
    image: saxophoneImg,
    fee: "₦90,000",
    feeAmount: 90000,
    desc: "Master breath support, embouchure, tone clarity, blues scales and soulful melodic phrasing.",
    category: "Instruments",
    ageGroup: "Adults & Professionals",
    level: "Intermediate",
  },
  {
    name: "Vocal Artistry & Performance",
    tag: "All genres",
    image: vocalsImg,
    fee: "₦70,000",
    feeAmount: 70000,
    desc: "Expand your vocal range, breath control, pitch precision, resonance and commanding stagecraft.",
    category: "Vocals",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Composition & Music Theory",
    tag: "Theory + practice",
    image: heroImg,
    fee: "₦80,000",
    feeAmount: 80000,
    desc: "Write, arrange and transcribe music from foundational harmony to orchestral scoring.",
    category: "Composition",
    ageGroup: "Adults & Professionals",
    level: "Advanced",
  },
  {
    name: "Music Production & Audio Tech",
    tag: "Studio skills",
    image: studioImg,
    fee: "₦95,000",
    feeAmount: 95000,
    desc: "Hands-on tracking, MIDI sequencing, DAWs, mixing, vocal tuning and release-ready mastering.",
    category: "Music Production",
    ageGroup: "Teens (13–19)",
    level: "Intermediate",
  },
];

export interface PerformanceItem {
  id: string;
  title: string;
  performer: string;
  program: string;
  category: "Concert" | "Recital" | "Student Band" | "Rehearsal";
  youtubeId: string;
  duration: string;
  date: string;
  description: string;
}

export const performances: PerformanceItem[] = [
  {
    id: "perf-1",
    title: "Chamber Strings & Piano Recital",
    performer: "Vivadoxa Youth Ensemble",
    program: "Violin & Piano",
    category: "Concert",
    youtubeId: "FbnNOOE3ET4",
    duration: "4:15",
    date: "Annual Mid-Term Showcase",
    description: "Our intermediate violin and keyboard candidates perform an uplifting chamber medley at the Kaduna studio recital hall.",
  },
  {
    id: "perf-2",
    title: "Contemporary Keyboard Rendition",
    performer: "Junior Recitalists (Ages 7–11)",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "olo4Ax3HPv8",
    duration: "3:40",
    date: "Junior Music Festival",
    description: "Young learners demonstrate two-hand coordination, dynamic phrasing, and sight-reading after their 12-week foundation term.",
  },
  {
    id: "perf-3",
    title: "Acoustic Fingerstyle & Rhythm Ensemble",
    performer: "David O. & Teen Guitarists",
    program: "Guitar",
    category: "Recital",
    youtubeId: "47Ina4YxXnY",
    duration: "3:10",
    date: "Kaduna Youth Recital",
    description: "Clean fretboard transitions, chord melodies, and rhythmic syncopation performed live on acoustic guitars.",
  },
  {
    id: "perf-4",
    title: "Student Band Live Performance — Believer",
    performer: "Vivadoxa Senior Student Band",
    program: "Drums, Bass & Vocals",
    category: "Student Band",
    youtubeId: "JGUCSB0q0nE",
    duration: "4:30",
    date: "End of Year Concert",
    description: "High-octane ensemble performance showcasing stage discipline, tight pocket drumming, and dynamic vocal delivery.",
  },
];

export const accreditations = [
  {
    name: "ABRSM UK",
    badge: "Associated Board of the Royal Schools of Music",
    detail: "Graded practical and theory examination syllabus preparation.",
  },
  {
    name: "Trinity College London",
    badge: "Graded Classical & Rock/Pop Syllabus",
    detail: "International performance certification curriculum standard.",
  },
  {
    name: "MUSON Standard",
    badge: "Musical Society of Nigeria Alignment",
    detail: "Rigorous African and Western classical pedagogical benchmark.",
  },
  {
    name: "School & Church Outreach",
    badge: "Kaduna Music Network",
    detail: "Partnered training for private schools, fellowship choirs, and youth bands.",
  },
];

export const ageTracks = [
  {
    id: "kids",
    title: "Kids Music Academy",
    age: "Ages 4 to 12",
    tagline: "Cultivating joyful musicality, rhythm, and early ear training.",
    icon: "music",
    points: [
      "Patient, play-infused foundational pedagogy",
      "Piano, violin, drums, and vocal exploration",
      "Termly junior recital opportunities",
      "Small groups or 1-on-1 private coaching",
    ],
  },
  {
    id: "teens",
    title: "Teen Music Track",
    age: "Ages 13 to 19",
    tagline: "Disciplined technique, band ensembles, and stage performance readiness.",
    icon: "arrow",
    points: [
      "Acoustic/electric guitar, keys, drums, and vocals",
      "Contemporary band dynamics & worship arrangements",
      "Graded music theory & audition preparation",
      "Studio recording and audio technology introduction",
    ],
  },
  {
    id: "adults",
    title: "Adults & Working Professionals",
    age: "Ages 20 and above",
    tagline: "Practical, schedule-friendly lessons tailored to your personal goals.",
    icon: "calendar",
    points: [
      "Evening and weekend slots built around your work",
      "Start from scratch or reignite past musical passion",
      "Learn your favorite worship songs and classical pieces",
      "Onsite studio, home lessons, or live online video sessions",
    ],
  },
];

// ── Interactive "Pick Your Sound" Explorer (Parara-inspired benchmark) ──────────
export interface SoundExplorerItem {
  id: string;
  name: string;
  category: string;
  tag: string;
  headline: string;
  description: string;
  image: string;
  skills: string[];
  recommendedAge: string;
  programName: string;
}

export const soundExplorerInstruments: SoundExplorerItem[] = [
  {
    id: "piano",
    name: "Piano & Keyboard",
    category: "Keys",
    tag: "Foundation Standard",
    headline: "Technique, Harmony & Sight-Reading",
    description: "Build clean two-hand independence, classical phrasing, gospel progressions, and jazz chord voicings.",
    image: pianoImg,
    skills: ["Scales & Arpeggios", "Gospel Praise Chords", "ABRSM Graded Prep", "Lead-Sheet Reading"],
    recommendedAge: "From Age 4",
    programName: "Piano & Keyboard",
  },
  {
    id: "saxophone",
    name: "Saxophone & Brass",
    category: "Wind & Brass",
    tag: "Expressive Soul",
    headline: "Tone, Breath Control & Melodic Phrasing",
    description: "Develop rich acoustic resonance, blues scales, worship melodies, and commanding solo improvisations.",
    image: saxophoneImg,
    skills: ["Embouchure Mechanics", "Breath Support", "Pentatonic Scales", "Live Stage Confidence"],
    recommendedAge: "From Age 9",
    programName: "Saxophone Mastery",
  },
  {
    id: "violin",
    name: "Violin & Strings",
    category: "Chamber Strings",
    tag: "Classical Discipline",
    headline: "Posture, Bowing & Pure Intonation",
    description: "Master violin ergonomics, smooth bow distribution, orchestral ensemble playing, and ear pitch accuracy.",
    image: violinImg,
    skills: ["Bowing Articulation", "Finger Intonation", "Chamber Ensemble", "Vibrato Polish"],
    recommendedAge: "From Age 5",
    programName: "Violin & Chamber Strings",
  },
  {
    id: "drums",
    name: "Contemporary Drums",
    category: "Percussion",
    tag: "Pocket & Energy",
    headline: "Groove, Limb Independence & Band Pocket",
    description: "Solidify meter control, high-energy African & contemporary grooves, dynamic fills, and tight ensemble lock.",
    image: drumsImg,
    skills: ["4-Way Independence", "African Highlife & Gospel", "Syncopated Fills", "Metronome Mastery"],
    recommendedAge: "From Age 6",
    programName: "Contemporary Drums & Percussion",
  },
  {
    id: "guitar",
    name: "Acoustic & Electric Guitar",
    category: "Strings & Frets",
    tag: "Versatile Sound",
    headline: "Open Chords, Fingerstyle & Lead Solos",
    description: "From foundational open chords and strumming patterns to fingerstyle picking, fretboard navigation, and solos.",
    image: guitarImg,
    skills: ["Barre Chords", "Fingerstyle Picking", "Rhythm Accompaniment", "Fretboard Scales"],
    recommendedAge: "From Age 7",
    programName: "Guitar (Acoustic & Electric)",
  },
  {
    id: "vocals",
    name: "Vocal Artistry",
    category: "Voice",
    tag: "Natural Instrument",
    headline: "Breath, Pitch, Range & Stage Presence",
    description: "Unlock your authentic vocal timbre, diaphragmatic breath control, high note ease, and stagecraft.",
    image: vocalsImg,
    skills: ["Diaphragm Breathing", "Pitch Precision", "Vocal Agility & Runs", "Microphone Presence"],
    recommendedAge: "All Ages",
    programName: "Vocal Artistry & Performance",
  },
  {
    id: "theory",
    name: "Theory & Composition",
    category: "Academic",
    tag: "Musicianship",
    headline: "Notation, Ear Training & Orchestral Scoring",
    description: "Demystify musical structure. Read notation effortlessly, analyze chord movements, and arrange original music.",
    image: heroImg,
    skills: ["Staff Notation", "Harmony Analysis", "Ear Dictation", "Song Arrangement"],
    recommendedAge: "Teens & Adults",
    programName: "Composition & Music Theory",
  },
  {
    id: "production",
    name: "Audio Production & DAW",
    category: "Studio Tech",
    tag: "Modern Studio",
    headline: "Tracking, MIDI, Mixing & Mastering",
    description: "Gain hands-on studio tracking experience with industry DAWs, condenser microphones, and release-ready mastering.",
    image: studioImg,
    skills: ["Logic / FL Studio / ProTools", "Vocal Tuning", "EQ & Compression", "Beat Programming"],
    recommendedAge: "Teens & Adults",
    programName: "Music Production & Audio Tech",
  },
];

// ── On-Demand Digital Video Courses (Parara-inspired model) ───────────────────
export interface DigitalCourse {
  id: string;
  title: string;
  instructor: string;
  fee: string;
  feeAmount: number;
  lessonsCount: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "All Levels";
  category: string;
  image: string;
  description: string;
  tag: string;
  rating: number;
  studentsCount: number;
}

export const digitalCourses: DigitalCourse[] = [
  {
    id: "course-1",
    title: "Acoustic Guitar Essentials & Worship Praise Chords",
    instructor: "David Eze",
    fee: "₦12,500",
    feeAmount: 12500,
    lessonsCount: 18,
    duration: "4h 20m",
    level: "Beginner",
    category: "Guitar",
    image: guitarImg,
    description: "Master essential open chords, smooth transitions, strumming patterns, and contemporary praise progressions you can play anywhere.",
    tag: "Best for beginners",
    rating: 4.9,
    studentsCount: 340,
  },
  {
    id: "course-2",
    title: "Piano Foundation to Gospel & Contemporary Voicings",
    instructor: "Tosin Adewale",
    fee: "₦16,000",
    feeAmount: 16000,
    lessonsCount: 24,
    duration: "5h 45m",
    level: "All Levels",
    category: "Piano",
    image: pianoImg,
    description: "Learn two-hand coordination, 7th and 9th chord extensions, passing chords, and accompaniment techniques for modern church services.",
    tag: "High Demand",
    rating: 5.0,
    studentsCount: 520,
  },
  {
    id: "course-3",
    title: "Vocal Mastery: Pitch, Breath Control & Stage Projection",
    instructor: "Morenike Bello",
    fee: "₦20,000",
    feeAmount: 20000,
    lessonsCount: 16,
    duration: "3h 50m",
    level: "All Levels",
    category: "Vocals",
    image: vocalsImg,
    description: "Unlock effortless high notes without vocal strain. Covers warmups, resonance placement, runs, and professional stage presence.",
    tag: "Signature Course",
    rating: 4.8,
    studentsCount: 290,
  },
  {
    id: "course-4",
    title: "Contemporary Pocket Drumming & African Rhythms",
    instructor: "Senior Studio Faculty",
    fee: "₦15,000",
    feeAmount: 15000,
    lessonsCount: 14,
    duration: "3h 30m",
    level: "Intermediate",
    category: "Drums",
    image: drumsImg,
    description: "Develop groove discipline, metronome accuracy, syncopated African polyrhythms, and live ensemble dynamics.",
    tag: "Groove Intensive",
    rating: 4.9,
    studentsCount: 210,
  },
];

// ── Institutional Trust & Partner Strip ───────────────────────────────────────
export const institutionalPartners = [
  { name: "Essence International School", location: "Kaduna", badge: "Private Academy Partner" },
  { name: "Kaduna International School", location: "Kaduna", badge: "Ensemble Outreach" },
  { name: "ECWA Youth Fellowship Choirs", location: "Northern Nigeria", badge: "Worship Ministry Training" },
  { name: "RCCG Kaduna Provincial Choir", location: "Kaduna State", badge: "Band & Vocal Development" },
  { name: "Anglican Youth Fellowship", location: "Kaduna Diocese", badge: "Orchestral Coaching" },
  { name: "ABRSM UK Graded Examination", location: "International", badge: "Syllabus Standard" },
  { name: "MUSON Musical Society", location: "Nigeria", badge: "Curriculum Alignment" },
];

// ── Master Mentorship VIP Coaching Data ──────────────────────────────────────
export const masterMentorshipHighlights = [
  {
    title: "Ergonomics & Posture Correction",
    desc: "Hands-on diagnostic of hand arch, embouchure pressure, and spinal alignment to prevent injury and unlock tone clarity.",
  },
  {
    title: "Direct Repertoire Polish",
    desc: "Detailed measure-by-measure coaching on classical concertos, gospel praise arrangements, or contemporary solos.",
  },
  {
    title: "ABRSM / Trinity Exam Auditions",
    desc: "Mock examination hearings with graded scoring rubrics, sight-reading drill tests, and aural interval training.",
  },
  {
    title: "Church & Band Leadership Dynamics",
    desc: "Mentoring music directors, choir leads, and rhythm sections on clean arrangement, pocket tempo, and sound balancing.",
  },
];


