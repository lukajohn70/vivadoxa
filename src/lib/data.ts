import type { Program } from "@/types"

// Authentic Vivadoxa Music School Media Assets & Dedicated Discipline Images
export const heroImg = "/media/programs/sax-ensemble.jpeg"
export const trumpetImg = "/media/programs/trumpet-brass.jpeg"
export const euphoniumImg = "/media/programs/euphonium-brass.jpeg"
export const drumsImg = "/media/programs/drums-group-lab.jpeg"
export const talkingDrumsImg = "/media/programs/talking-drum-nigeria.jpeg"
export const pianoImg = "/media/programs/piano-syllabus.jpeg"
export const guitarAcousticImg =
  "/media/programs/guitar-classical-practice.jpeg"
export const guitarLeadImg = "/media/programs/guitar-electric-player.jpeg"
export const bassGuitarImg = "/media/programs/bass-electric.jpeg"
export const fluteImg = "/media/programs/flute-recital-boy.jpeg"
export const clarinetImg = "/media/programs/clarinet-ankara.jpeg"
export const studioImg = "/media/studio/studio-keyboard-lab.jpeg"
export const violinImg = "/media/programs/violin-solo-rainbow.jpeg"
export const saxophoneImg = "/media/programs/sax-solo-grey.jpeg"
export const altoSaxImg = "/media/programs/sax-solo-grey.jpeg"
export const sopranoSaxImg = "/media/programs/sax-solo-stripe.jpeg"
export const studioEngineeringImg = "/media/studio/multi-instrument-lab.jpeg"
export const soundEngineeringImg = "/media/studio/studio-keyboard-lab.jpeg"
export const ukuleleImg = "/media/programs/guitar-classical-practice.jpeg"
export const vocalsImg = "/media/programs/voice-training-singer.jpeg"
export const guitarImg = "/media/programs/guitar-acoustic-recital.jpeg"
export const portraitImg = "/media/studio/1-on-1-mentorship.jpeg"
export const cohortImg = "/media/studio/academy-cohort-group.jpeg"
export const rcBadgeImg = "/media/branding/vivadoxa-rc-badge.jpeg"
export const recitalVideo = "/media/video/recital-piano-african-groove.mp4"
export const repairSaxImg = "/media/repairs/repair-saxophone-craftsman.jpeg"
export const repairElectronicsImg =
  "/media/repairs/repair-keyboard-electronics.jpeg"

export interface PricingTier {
  id: string
  name: string
  duration: string
  fee: string
  feeAmount: number
  badge?: string
  popular?: boolean
  target: string
  inclusions: string[]
  description: string
}

export const officialPricingTiers: PricingTier[] = [
  {
    id: "tier-1month",
    name: "Introductory Foundation",
    duration: "1 Month",
    fee: "₦20,000",
    feeAmount: 20000,
    target: "Fixed across all disciplines",
    inclusions: [
      "4 weekly intensive practical sessions",
      "Core instrument & posture mechanics",
      "Studio instrument access during study",
    ],
    description:
      "Foundational mechanics, posture, and essential technique drills.",
  },
  {
    id: "tier-3months",
    name: "Certificate Program",
    duration: "3 Months",
    fee: "₦55,000",
    feeAmount: 55000,
    popular: true,
    badge: "Popular",
    target: "Fixed across all disciplines",
    inclusions: [
      "Sight-reading & staff notation",
      "Supervised weekly practical sessions",
      "Graded recital prep & Vivadoxa Certificate",
    ],
    description:
      "Foundational musicianship, sight-reading, and first recital preparation.",
  },
  {
    id: "tier-6months",
    name: "Performance Track",
    duration: "6 Months",
    fee: "₦100,000",
    feeAmount: 100000,
    badge: "Intermediate",
    target: "Fixed across all disciplines",
    inclusions: [
      "Solo improvisation & harmonic theory",
      "Live ensemble & band rehearsals",
      "Public stage recital performance",
    ],
    description:
      "Intermediate improvisation, chord harmony, and ensemble stagecraft.",
  },
  {
    id: "tier-1year",
    name: "Conservatory Masterclass",
    duration: "12 Months",
    fee: "₦195,000",
    feeAmount: 195000,
    badge: "Advanced",
    target: "Fixed across all disciplines",
    inclusions: [
      "Concert-level repertoire mastery",
      "Live multi-track studio recording",
      "Solo showcase recital & Advanced Award",
    ],
    description:
      "Concert repertoire, advanced modal harmony, and studio tracking.",
  },
  {
    id: "tier-2years",
    name: "Professional Diploma",
    duration: "2 Years",
    fee: "₦500,000",
    feeAmount: 500000,
    badge: "Diploma",
    target: "Fixed across all disciplines",
    inclusions: [
      "ABRSM & MUSON graded syllabus prep",
      "Full album studio production project",
      "Solo graduation recital & Diploma",
    ],
    description:
      "Comprehensive 2-year conservatory pathway for professional artists.",
  },
  {
    id: "tier-home",
    name: "Private Mentorship",
    duration: "Monthly",
    fee: "₦70,000",
    feeAmount: 70000,
    badge: "1-on-1",
    target: "At residence or private studio",
    inclusions: [
      "Instructor visits your residence",
      "Personalized pace & custom repertoire",
      "Flexible schedule for busy professionals",
    ],
    description:
      "Dedicated 1-on-1 private instruction at your residence or private studio.",
  },
]

export interface AvailableInstrument {
  id: string
  name: string
  family: "Woodwinds" | "Brass" | "Keys" | "Strings & Frets" | "Percussion" | "Voice" | "Production"
  image: string
  description: string
  levels: string
}

export const availableInstruments: AvailableInstrument[] = [
  {
    id: "alto-saxophone",
    name: "Alto saxophone",
    family: "Woodwinds",
    image: altoSaxImg,
    description:
      "Tone production, embouchure, breath control, gospel praise, jazz phrasing and blues scales.",
    levels: "Beginner to Advanced",
  },
  {
    id: "soprano-saxophone",
    name: "Soprano saxophone",
    family: "Woodwinds",
    image: sopranoSaxImg,
    description:
      "Pitch intonation, curved/straight soprano technique, tone projection and lyrical solo phrasing.",
    levels: "Beginner to Advanced",
  },
  {
    id: "euphonium",
    name: "Euphonium",
    family: "Brass",
    image: euphoniumImg,
    description:
      "Deep, rich baritone brass resonance, valve mechanics, breath management and concert brass repertoire.",
    levels: "Beginner to Advanced",
  },
  {
    id: "trumpet",
    name: "Trumpet",
    family: "Brass",
    image: trumpetImg,
    description:
      "Lip buzz, valve dexterity, melodic phrasing, high register control, fanfare & worship brass.",
    levels: "Beginner to Advanced",
  },
  {
    id: "clarinet",
    name: "Clarinet",
    family: "Woodwinds",
    image: clarinetImg,
    description:
      "Reed selection, embouchure, register breaks, warm tone production, and classical woodwind phrasing.",
    levels: "Beginner to Advanced",
  },
  {
    id: "flute",
    name: "Flute",
    family: "Woodwinds",
    image: fluteImg,
    description:
      "Concert flute technique, clean tone projection, finger agility, breathing dynamics & chamber melodies.",
    levels: "Beginner to Advanced",
  },
  {
    id: "piano-keyboard",
    name: "Piano/keyboard",
    family: "Keys",
    image: pianoImg,
    description:
      "Acoustic piano & digital workstations. Classical sight reading, contemporary chord voicings & gospel praise.",
    levels: "All Levels (Kids to Adults)",
  },
  {
    id: "bass-guitar",
    name: "Bass guitar",
    family: "Strings & Frets",
    image: bassGuitarImg,
    description:
      "4-string, 5-string & 6-string bass. Walking basslines, slapping, finger grooves and tight pocket lock.",
    levels: "Beginner to Advanced",
  },
  {
    id: "lead-guitar",
    name: "Lead guitar",
    family: "Strings & Frets",
    image: guitarLeadImg,
    description:
      "Pentatonic scales, bending, tapping, overdrive tone shaping, solos and live band performance.",
    levels: "Beginner to Advanced",
  },
  {
    id: "acoustic-guitar",
    name: "Acoustic guitar",
    family: "Strings & Frets",
    image: guitarAcousticImg,
    description:
      "Strumming patterns, fingerstyle picking, open chords, barre chords and acoustic accompaniment.",
    levels: "Beginner to Advanced",
  },
  {
    id: "talking-drums",
    name: "Talking drums",
    family: "Percussion",
    image: talkingDrumsImg,
    description:
      "Traditional African tonal percussion, squeeze-pitch modulation, cultural proverbs, rhythms and live fusion.",
    levels: "All Levels",
  },
  {
    id: "set-drum",
    name: "Set drum",
    family: "Percussion",
    image: drumsImg,
    description:
      "4-way limb independence, contemporary pocket drumming, African highlife, worship grooves and fills.",
    levels: "All Ages",
  },
  {
    id: "voice-training",
    name: "Voice training",
    family: "Voice",
    image: vocalsImg,
    description:
      "Diaphragmatic breathing, pitch calibration, vocal range extension, resonance, runs and stage delivery.",
    levels: "All Levels",
  },
  {
    id: "studio-engineering",
    name: "Studio engineering",
    family: "Production",
    image: studioEngineeringImg,
    description:
      "Pro DAW workflows, multitrack recording, microphone acoustics, audio editing and commercial tracking.",
    levels: "Beginner to Advanced",
  },
  {
    id: "sound-engineering",
    name: "Sound engineering",
    family: "Production",
    image: soundEngineeringImg,
    description:
      "Live sound mixing, digital/analog consoles, speaker crossover calibration, monitor balancing & mastering.",
    levels: "Beginner to Advanced",
  },
  {
    id: "violin",
    name: "Violin",
    family: "Strings & Frets",
    image: violinImg,
    description:
      "Proper posture, bowing mechanics, finger intonation, Suzuki/ABRSM repertoire and chamber ensemble.",
    levels: "Ages 4+ to Adults",
  },
  {
    id: "ukulele",
    name: "Ukulele",
    family: "Strings & Frets",
    image: ukuleleImg,
    description:
      "4-string ukulele strumming chords, fingerpicking, rhythm coordination and fun portable song accompaniment.",
    levels: "Beginner to Intermediate",
  },
]

export interface SpecialtyProgram {
  title: string
  tagline: string
  desc: string
  highlight: string
}

export const specialtyPrograms: SpecialtyProgram[] = [
  {
    title: "Voice Training",
    tagline: "Vocal Mastery & Breath Control",
    desc: "Comprehensive vocal technique, pitch correction, diaphragm breath support, range expansion, and confident stage projection.",
    highlight: "1 Mo, 3 Mos, 6 Mos & 1 Year tracks",
  },
  {
    title: "Sight Reading & Sight Singing",
    tagline: "Fluent Staff Music Literacy",
    desc: "Read standard staff notation at first glance and accurately sing pitch intervals without an instrument, following international benchmarks.",
    highlight: "Solfège & Aural Training",
  },
  {
    title: "Intermediate Piano",
    tagline: "Beyond Foundation Basics",
    desc: "Advanced two-hand syncopation, minor scales, 7th/9th chord inversions, rhythm patterns and introductory improvisation.",
    highlight: "Prerequisite: Foundation or 3-Month Cert",
  },
  {
    title: "Advance Piano",
    tagline: "Concert Repertoire & Gospel/Jazz Voicings",
    desc: "Master complex reharmonization, tritone substitutions, classical sonatas, modal jazz improvisation, and accompanist mastery.",
    highlight: "Professional Level",
  },
  {
    title: "Home Lessons",
    tagline: "Personalized 1-on-1 at Your Residence",
    desc: "Enjoy private, tailored musical lessons in the comfort of your living room with a dedicated Vivadoxa instructor on your own schedule.",
    highlight: "₦70,000 / month",
  },
  {
    title: "Sunday Specials",
    tagline: "Weekend Intensive for Busy Schedules",
    desc: "Special Sunday afternoon cohorts tailored for church musicians, choir directors, and working professionals who cannot attend weekdays.",
    highlight: "Weekend Cohort",
  },
  {
    title: "Sound Engineering",
    tagline: "Studio & Live Sound Production",
    desc: "Hands-on training in our recording studio covering live sound consoles, microphone techniques, DAW mixing, signal routing, and acoustics.",
    highlight: "State-of-the-Art Studio Access",
  },
]

export const programs: Program[] = [
  {
    name: "Alto saxophone",
    tag: "Woodwind Mastery",
    image: altoSaxImg,
    desc: "Embouchure mechanics, breath support, tone control, gospel praise medleys, jazz and blues improvisation.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Soprano saxophone",
    tag: "Lyrical Expression",
    image: sopranoSaxImg,
    desc: "Pitch stability, curved/straight soprano technique, tone projection, and lyrical contemporary worship solos.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Euphonium",
    tag: "Concert Brass",
    image: euphoniumImg,
    desc: "Deep baritone brass resonance, valve mechanics, breath management, concert band and worship brass repertoire.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Trumpet",
    tag: "Fanfare & Worship",
    image: trumpetImg,
    desc: "Lip buzz, valve dexterity, embouchure stamina, fanfare projection and worship brass chorales.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Clarinet",
    tag: "Woodwind Elegance",
    image: clarinetImg,
    desc: "Reed preparation, embouchure, warm tone production, register breaks and classical woodwind phrasing.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Flute",
    tag: "Chamber & Classical",
    image: fluteImg,
    desc: "Concert flute breath dynamics, clean tone projection, finger agility, classical and liturgical melodies.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Piano/keyboard",
    tag: "Most Popular",
    image: pianoImg,
    desc: "Classical sight-reading, contemporary chords, gospel praise progressions, chord inversions, and solo improvisation.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Bass guitar",
    tag: "Groove & Pocket",
    image: bassGuitarImg,
    desc: "4-string and 5-string electric bass, walking basslines, slap technique, pocket lock and live rhythm support.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Lead guitar",
    tag: "Solos & Expression",
    image: guitarLeadImg,
    desc: "Pentatonic scales, bending, tapping, overdrive tone shaping, expressive soloing and live band stagecraft.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Acoustic guitar",
    tag: "Fingerstyle & Chords",
    image: guitarAcousticImg,
    desc: "Open chords, strumming patterns, fingerstyle picking, barre chords and vocal acoustic accompaniment.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Talking drums",
    tag: "African Heritage",
    image: talkingDrumsImg,
    desc: "Traditional African tonal percussion, squeeze-pitch modulation, cultural proverbs, rhythms and live fusion.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Set drum",
    tag: "High Energy",
    image: drumsImg,
    desc: "4-way limb independence, contemporary pocket drumming, African highlife, worship grooves and fills.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Voice training",
    tag: "Vocal Mastery",
    image: vocalsImg,
    desc: "Diaphragmatic breathing, pitch calibration, vocal range extension, resonance, runs, control and stagecraft.",
    category: "Vocals",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Studio engineering",
    tag: "Studio Recording",
    image: studioEngineeringImg,
    desc: "Pro DAW multitrack tracking, acoustic microphone placement, vocal tuning, audio editing and commercial mixing.",
    category: "Music Production",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Sound engineering",
    tag: "Live & Acoustic Sound",
    image: soundEngineeringImg,
    desc: "Live digital/analog sound consoles, speaker crossover alignment, monitor routing, feedback elimination & mastering.",
    category: "Music Production",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Violin",
    tag: "Chamber Strings",
    image: violinImg,
    desc: "Proper posture, bowing mechanics, finger intonation, classical Suzuki/ABRSM repertoire and chamber ensemble.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
  {
    name: "Ukulele",
    tag: "Strings & Strumming",
    image: ukuleleImg,
    desc: "4-string ukulele strumming chords, fingerpicking, rhythm coordination, portable playing and song accompaniment.",
    category: "Instruments",
    ageGroup: "All Ages",
    level: "Beginner",
  },
]

export interface PerformanceItem {
  id: string
  title: string
  performer: string
  program: string
  category: "Concert" | "Recital" | "Student Band" | "Rehearsal"
  youtubeId?: string
  videoUrl?: string
  thumbnail?: string
  duration: string
  date: string
  description: string
  isShort?: boolean
}

export const performances: PerformanceItem[] = [
  {
    id: "perf-vdx-1",
    title: "Vivadoxa Music Worship Session featuring Min. Uche",
    performer: "Min. Uche & Vivadoxa Live Ensemble",
    program: "Vocal & Instrumental Ensemble",
    category: "Concert",
    youtubeId: "-IcdMT9uCLU",
    thumbnail: "https://img.youtube.com/vi/-IcdMT9uCLU/hqdefault.jpg",
    duration: "Live Session",
    date: "Live Studio Session",
    description:
      "An inspiring live worship and vocal ensemble session featuring Min. Uche and Vivadoxa student instrumentalists live in the Kaduna studio.",
    isShort: false,
  },
  {
    id: "perf-vdx-2",
    title: "Students Praise Session & Live Band Recital",
    performer: "Vivadoxa Student Ensemble",
    program: "Drums, Bass & Keyboard",
    category: "Student Band",
    youtubeId: "XU917wI9sDg",
    thumbnail: "https://img.youtube.com/vi/XU917wI9sDg/hqdefault.jpg",
    duration: "Live Band",
    date: "Student Praise Showcase",
    description:
      "Vivadoxa candidates unite for an authentic praise session and live band showcase, demonstrating tempo lock, group dynamics, and rhythm control.",
    isShort: true,
  },
  {
    id: "perf-vdx-3",
    title: "Multi-Instrument Showcase: Bringing Musical Passions to Life",
    performer: "Vivadoxa Instructors & Students",
    program: "Multi-Disciplinary Ensemble",
    category: "Concert",
    youtubeId: "FZydqxYOpF0",
    thumbnail: "https://img.youtube.com/vi/FZydqxYOpF0/hqdefault.jpg",
    duration: "Academy Showcase",
    date: "Kaduna Studio Showcase",
    description:
      "Highlighting the comprehensive range of musical disciplines taught at Vivadoxa Music Kaduna, from keyboard and strings to percussion.",
    isShort: true,
  },
  {
    id: "perf-vdx-4",
    title: "Acoustic Guitar Foundations & Worship Chord Melody",
    performer: "Vivadoxa Guitar Faculty & Students",
    program: "Acoustic Guitar",
    category: "Recital",
    youtubeId: "vjVEDq9oITE",
    thumbnail: "https://img.youtube.com/vi/vjVEDq9oITE/hqdefault.jpg",
    duration: "Guitar Recital",
    date: "Guitar Studio Showcase",
    description:
      "Practical acoustic guitar demonstration playing worship songs, showing smooth open chord changes and rhythmic strumming dynamics.",
    isShort: true,
  },
  {
    id: "perf-vdx-5",
    title: "Electric Bass Guitar Groove & Harmony Masterclass",
    performer: "Vivadoxa Bass Faculty",
    program: "Bass Guitar",
    category: "Recital",
    youtubeId: "G4c81H_UeXM",
    thumbnail: "https://img.youtube.com/vi/G4c81H_UeXM/hqdefault.jpg",
    duration: "Bass Workshop",
    date: "Fretboard Workshop",
    description:
      "In-depth electric bass groove training, fretboard positioning, root-fifth-octave pocket playing, and gospel bass foundation.",
    isShort: true,
  },
  {
    id: "perf-vdx-6",
    title: "Makossa & African Highlife Bass Groove Showcase",
    performer: "Vivadoxa Rhythm Section",
    program: "Bass Guitar & Percussion",
    category: "Student Band",
    youtubeId: "Adt0rd5uGaM",
    thumbnail: "https://img.youtube.com/vi/Adt0rd5uGaM/hqdefault.jpg",
    duration: "Groove Lab",
    date: "Live Rhythm Lab",
    description:
      "High-energy Makossa and African Highlife syncopated bass grooves, demonstrating finger dexterity, slap-pop nuances, and pocket timing.",
    isShort: true,
  },
  {
    id: "perf-vdx-7",
    title: "Highlife Piano & African Praise Phrasing",
    performer: "Vivadoxa Keyboard Department",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "hH8frv6klc4",
    thumbnail: "https://img.youtube.com/vi/hH8frv6klc4/hqdefault.jpg",
    duration: "African Praise",
    date: "Keyboard Studio",
    description:
      "Authentic African Highlife keyboard chord voicings, rhythmic syncopation, and praise progression improvisation.",
    isShort: true,
  },
  {
    id: "perf-vdx-8",
    title: "Makossa & Soukous Keyboard Rhythms",
    performer: "Vivadoxa Keyboard Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "Clu5E2abMgU",
    thumbnail: "https://img.youtube.com/vi/Clu5E2abMgU/hqdefault.jpg",
    duration: "Studio Recital",
    date: "Contemporary Keyboard Lab",
    description:
      "Dynamic Makossa and Soukous rhythmic accompaniment patterns on piano, mastering two-hand independent rhythmic timing.",
    isShort: true,
  },
  {
    id: "perf-vdx-9",
    title: "1-4-5 Chord Progressions & Harmonic Theory for Beginners",
    performer: "Vivadoxa Foundation Learners",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "aokYxYryN_8",
    thumbnail: "https://img.youtube.com/vi/aokYxYryN_8/hqdefault.jpg",
    duration: "Theory & Recital",
    date: "Foundation Class",
    description:
      "Demystifying fundamental 1-4-5 harmonic progressions on piano, voice leading, and cadence resolution for aspiring accompanists.",
    isShort: false,
  },
  {
    id: "perf-vdx-10",
    title: "Beginner Piano: Playing Your First Song",
    performer: "Vivadoxa Foundation Learners",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "SHQFEIvnFXc",
    thumbnail: "https://img.youtube.com/vi/SHQFEIvnFXc/hqdefault.jpg",
    duration: "Early Milestone",
    date: "Early Learner Showcase",
    description:
      "Encouraging early music education milestone: building hand posture, finger numbers, and completing your first song melody.",
    isShort: false,
  },
  {
    id: "perf-vdx-11",
    title: "Guitar Foundations: Playing Simple Songs & Strumming",
    performer: "Vivadoxa Guitar Department",
    program: "Acoustic Guitar",
    category: "Recital",
    youtubeId: "Hpx3BJ7C3QA",
    thumbnail: "https://img.youtube.com/vi/Hpx3BJ7C3QA/hqdefault.jpg",
    duration: "Acoustic Session",
    date: "Kaduna Studio",
    description:
      "Step-by-step guitar chord changes, rhythm timing, and playing your first full song with acoustic confidence.",
    isShort: true,
  },
  {
    id: "perf-vdx-12",
    title: "Heartfelt Recital Milestone: Student Breakthrough Showcase",
    performer: "Junior Student Recitalist",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "biosC5ZXQgI",
    thumbnail: "https://img.youtube.com/vi/biosC5ZXQgI/hqdefault.jpg",
    duration: "Milestone Recital",
    date: "Studio Recital",
    description:
      "An emotional milestone performance celebrating student breakthrough, musical expression, and dedication to practice.",
    isShort: true,
  },
  {
    id: "perf-vdx-13",
    title: "Simple Piano Lesson & Melodic Phrasing",
    performer: "Vivadoxa Keyboard Department",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "teoKQmcuMZw",
    thumbnail: "https://img.youtube.com/vi/teoKQmcuMZw/hqdefault.jpg",
    duration: "Piano Lesson",
    date: "Keyboard Studio",
    description:
      "Accessible foundation piano lesson breaking down melody phrasing, hand posture, and key navigation.",
    isShort: false,
  },
  {
    id: "perf-vdx-14",
    title: "Makossa Praise Groove & Syncopation",
    performer: "Vivadoxa Keyboard Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "Lxiwngf0YBQ",
    thumbnail: "https://img.youtube.com/vi/Lxiwngf0YBQ/hqdefault.jpg",
    duration: "Praise Groove",
    date: "Kaduna Studio",
    description:
      "High-energy praise rhythm syncopation, upbeat comping, and authentic African gospel keyboard groove.",
    isShort: true,
  },
  {
    id: "perf-vdx-15",
    title: "Melodic Solo Expression on the Piano",
    performer: "Advanced Piano Students",
    program: "Piano & Keyboard",
    category: "Recital",
    youtubeId: "hSRbektpiTQ",
    thumbnail: "https://img.youtube.com/vi/hSRbektpiTQ/hqdefault.jpg",
    duration: "Solo Phrasing",
    date: "Masterclass Showcase",
    description:
      "Techniques for playing lyrical solo melodies on keyboard with dynamic touch and expressive ornamentation.",
    isShort: true,
  },
]

export const accreditations = [
  {
    name: "ABRSM UK",
    badge: "Associated Board of the Royal Schools of Music",
    detail: "Graded practical and theory examination syllabus preparation.",
  },
  {
    name: "MUSON Standard",
    badge: "Musical Society of Nigeria Alignment",
    detail: "Rigorous African and Western classical pedagogical benchmark.",
  },
  {
    name: "School & Church Outreach",
    badge: "Kaduna Music Network",
    detail:
      "Partnered training for private schools, fellowship choirs, and youth bands.",
  },
]

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
    tagline:
      "Disciplined technique, band ensembles, and stage performance readiness.",
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
    tagline:
      "Practical, schedule-friendly lessons tailored to your personal goals.",
    icon: "calendar",
    points: [
      "Evening and weekend slots built around your work",
      "Start from scratch or reignite past musical passion",
      "Learn your favorite worship songs and classical pieces",
      "Onsite studio, home lessons, or live online video sessions",
    ],
  },
]

// ── Interactive "Pick Your Sound" Explorer (Parara-inspired benchmark) ──────────
export interface SoundExplorerItem {
  id: string
  name: string
  category: string
  tag: string
  headline: string
  description: string
  image: string
  skills: string[]
  recommendedAge: string
  programName: string
}

export const soundExplorerInstruments: SoundExplorerItem[] = [
  {
    id: "piano",
    name: "Piano / Keyboard",
    category: "Keys",
    tag: "Acoustic & Workstation",
    headline: "Technique, Harmony & Sight-Reading",
    description:
      "Build clean two-hand independence, classical phrasing, gospel progressions, and contemporary chord voicings.",
    image: pianoImg,
    skills: [
      "Scales & Arpeggios",
      "Gospel Praise Chords",
      "Staff Notation Reading",
      "Two-Hand Independence",
    ],
    recommendedAge: "From Age 4",
    programName: "Piano",
  },
  {
    id: "alto-saxophone",
    name: "Alto Saxophone",
    category: "Woodwinds",
    tag: "Eb Classical & Contemporary",
    headline: "Tone Production, Embouchure & Phrasing",
    description:
      "Master breath support, embouchure, tone clarity, gospel praise solos, and blues scales under seasoned saxophonists.",
    image: altoSaxImg,
    skills: [
      "Embouchure Mechanics",
      "Breath Support",
      "Pentatonic Scales",
      "Live Stage Confidence",
    ],
    recommendedAge: "From Age 8",
    programName: "Alto Saxophone",
  },
  {
    id: "soprano-saxophone",
    name: "Soprano Saxophone",
    category: "Woodwinds",
    tag: "Bb Pitch Intonation & Projection",
    headline: "Pitch Intonation & Curved/Straight Technique",
    description:
      "Refine pitch intonation, curved and straight soprano mechanics, tone projection, and lyrical solo phrasing.",
    image: sopranoSaxImg,
    skills: [
      "Pitch Intonation",
      "Soprano Mechanics",
      "Lyrical Solo Phrasing",
      "Ensemble Blending",
    ],
    recommendedAge: "From Age 8",
    programName: "Soprano Saxophone",
  },
  {
    id: "acoustic-guitar",
    name: "Acoustic Guitar",
    category: "Strings & Frets",
    tag: "Folk, Worship & Fingerstyle",
    headline: "Strumming Patterns, Barre Chords & Fingerstyle",
    description:
      "From foundational open chords to complex fingerstyle picking, dynamic strumming, and vocal accompaniment.",
    image: guitarAcousticImg,
    skills: [
      "Barre Chords",
      "Fingerstyle Picking",
      "Rhythm Accompaniment",
      "Fretboard Navigation",
    ],
    recommendedAge: "From Age 7",
    programName: "Acoustic Guitar",
  },
  {
    id: "lead-guitar",
    name: "Lead / Electric Guitar",
    category: "Strings & Frets",
    tag: "Electric Band Performance",
    headline: "Fretboard Navigation, Bending & Solos",
    description:
      "Explore pentatonic scales, string bending, pick agility, overdrive tone shaping, and live solo improvisation.",
    image: guitarLeadImg,
    skills: [
      "Pentatonic Scales",
      "Pick Agility & Bends",
      "Tone Shaping & FX",
      "Band Soloing",
    ],
    recommendedAge: "From Age 8",
    programName: "Lead Guitar / Electric Guitar",
  },
  {
    id: "bass-guitar",
    name: "Bass Guitar",
    category: "Strings & Frets",
    tag: "4 & 5-String Electric",
    headline: "Pocket, Walking Basslines & Slap",
    description:
      "Master foundational root-note grooves, walking basslines, slap and pop technique, and tight rhythm section lock.",
    image: bassGuitarImg,
    skills: [
      "Walking Basslines",
      "Finger Plucking & Slap",
      "Metronome Groove Lock",
      "Scales & Arpeggios",
    ],
    recommendedAge: "From Age 8",
    programName: "Bass Guitar",
  },
  {
    id: "drums-set",
    name: "Drums Set",
    category: "Percussion",
    tag: "4-Way Limb Independence",
    headline: "Groove, African Highlife & Dynamic Fills",
    description:
      "Solidify meter control, high-energy African & contemporary grooves, syncopated fills, and tight ensemble lock.",
    image: drumsImg,
    skills: [
      "4-Way Independence",
      "African Highlife & Gospel",
      "Syncopated Fills",
      "Metronome Mastery",
    ],
    recommendedAge: "From Age 6",
    programName: "Drums Set",
  },
  {
    id: "talking-drums",
    name: "Talking Drums",
    category: "Percussion",
    tag: "African Cultural Heritage",
    headline: "Pitch Modulation, Squeeze Agility & Proverb Rhythms",
    description:
      "Master traditional tonal percussion, squeeze-pitch modulation, indigenous African proverbs, and live band fusion.",
    image: talkingDrumsImg,
    skills: [
      "Squeeze-Pitch Modulation",
      "Tonal Phrasing",
      "Cultural Rhythms",
      "Live Fusion Jamming",
    ],
    recommendedAge: "All Ages",
    programName: "Talking Drums",
  },
  {
    id: "voice-training",
    name: "Voice Training",
    category: "Voice",
    tag: "Vocal Mastery & Range",
    headline: "Diaphragm Breath, Pitch Precision & Agility",
    description:
      "Unlock your authentic vocal timbre, diaphragmatic breath control, high note ease, agility runs, and commanding stagecraft.",
    image: vocalsImg,
    skills: [
      "Diaphragm Breathing",
      "Pitch Precision",
      "Vocal Agility & Runs",
      "Microphone Stagecraft",
    ],
    recommendedAge: "All Ages",
    programName: "Voice Training",
  },
  {
    id: "trumpets",
    name: "Trumpet",
    category: "Brass",
    tag: "Fanfare & Worship Brass",
    headline: "Lip Buzz, Valve Dexterity & Projection",
    description:
      "Develop embouchure stamina, crisp valve articulation, fanfare projection, and worship brass chorales.",
    image: trumpetImg,
    skills: [
      "Lip Buzz Mechanics",
      "Valve Dexterity",
      "High Register Control",
      "Fanfare Projection",
    ],
    recommendedAge: "From Age 9",
    programName: "Trumpet",
  },
  {
    id: "euphonium",
    name: "Euphonium",
    category: "Brass",
    tag: "Deep Baritone Resonance",
    headline: "Breath Support, Valve Mechanics & Resonance",
    description:
      "Explore the deep, expressive baritone resonance of brass, breath control, slide/valve mechanics, and concert repertoire.",
    image: euphoniumImg,
    skills: [
      "Deep Breath Support",
      "Valve Agility",
      "Harmonic Resonance",
      "Concert Band Repertoire",
    ],
    recommendedAge: "From Age 10",
    programName: "Euphonium",
  },
  {
    id: "flute",
    name: "Flute",
    category: "Woodwinds",
    tag: "Concert Flute",
    headline: "Breath Dynamics, Tone & Finger Agility",
    description:
      "Refine clean embouchure air stream, finger speed, melodic intonation, and classical/contemporary woodwind phrasing.",
    image: fluteImg,
    skills: [
      "Air Stream Mechanics",
      "Finger Dexterity",
      "Pitch Intonation",
      "Chamber Melodies",
    ],
    recommendedAge: "From Age 7",
    programName: "Flute",
  },
  {
    id: "clarinet",
    name: "Clarinet",
    category: "Woodwinds",
    tag: "Classical Woodwinds",
    headline: "Reed Selection, Register Control & Warmth",
    description:
      "Learn reed care, embouchure stamina, smooth register breaks, and rich tone projection in solo and band settings.",
    image: clarinetImg,
    skills: [
      "Reed Calibration",
      "Register Transitions",
      "Warm Acoustic Tone",
      "Solo Phrasing",
    ],
    recommendedAge: "From Age 8",
    programName: "Clarinet",
  },
  {
    id: "violin",
    name: "Violin",
    category: "Strings & Frets",
    tag: "Classical & Graded Prep",
    headline: "Posture, Bowing Mechanics & Intonation",
    description:
      "Master violin ergonomics, smooth bow distribution, orchestral chamber ensemble playing, and ear pitch accuracy.",
    image: violinImg,
    skills: [
      "Bowing Articulation",
      "Finger Intonation",
      "Chamber Ensemble",
      "Vibrato Polish",
    ],
    recommendedAge: "From Age 5",
    programName: "Violin",
  },
  {
    id: "ukulele",
    name: "Ukulele",
    category: "Strings & Frets",
    tag: "4-String Fretted Folk",
    headline: "Chords, Fingerpicking & Rhythm Coordination",
    description:
      "Learn 4-string ukulele chord strumming, fingerpicking patterns, rhythm coordination, and portable song accompaniment.",
    image: ukuleleImg,
    skills: [
      "Open Chords",
      "Fingerpicking Patterns",
      "Rhythm Strumming",
      "Song Accompaniment",
    ],
    recommendedAge: "From Age 6",
    programName: "Ukulele",
  },
  {
    id: "studio-engineering",
    name: "Studio Engineering",
    category: "Production",
    tag: "DAW Tracking & Production",
    headline: "DAW Tracking, Acoustic Capture & Audio Editing",
    description:
      "Professional DAW workflows, multitrack recording, microphone acoustics, audio editing, and commercial tracking.",
    image: studioEngineeringImg,
    skills: [
      "DAW Routing",
      "Mic Placement",
      "Multitrack Recording",
      "Audio Editing",
    ],
    recommendedAge: "From Age 14",
    programName: "Studio Engineering",
  },
  {
    id: "sound-engineering",
    name: "Sound Engineering",
    category: "Production",
    tag: "Live Sound & Console Mixing",
    headline: "Live Mixing, Crossover Calibration & FOH Balancing",
    description:
      "Live sound mixing, digital and analog consoles, speaker crossover calibration, monitor balancing, and mastering.",
    image: soundEngineeringImg,
    skills: [
      "Digital Consoles",
      "FOH & Monitor Mixing",
      "Frequency EQ & Dynamics",
      "Acoustic Calibration",
    ],
    recommendedAge: "From Age 14",
    programName: "Sound Engineering",
  },
]

// ── Institutional Trust & Partner Strip ───────────────────────────────────────
export const institutionalPartners = [
  {
    name: "Essence International School",
    location: "Kaduna",
    badge: "Private Academy Partner",
  },
  {
    name: "Kaduna International School",
    location: "Kaduna",
    badge: "Ensemble Outreach",
  },
  {
    name: "ECWA Youth Fellowship Choirs",
    location: "Northern Nigeria",
    badge: "Worship Ministry Training",
  },
  {
    name: "RCCG Kaduna Provincial Choir",
    location: "Kaduna State",
    badge: "Band & Vocal Development",
  },
  {
    name: "Anglican Youth Fellowship",
    location: "Kaduna Diocese",
    badge: "Orchestral Coaching",
  },
  {
    name: "ABRSM UK Graded Examination",
    location: "International",
    badge: "Syllabus Standard",
  },
  {
    name: "MUSON Musical Society",
    location: "Nigeria",
    badge: "Curriculum Alignment",
  },
]

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
    title: "ABRSM / MUSON Exam Auditions",
    desc: "Mock examination hearings with graded scoring rubrics, sight-reading drill tests, and aural interval training.",
  },
  {
    title: "Church & Band Leadership Dynamics",
    desc: "Mentoring music directors, choir leads, and rhythm sections on clean arrangement, pocket tempo, and sound balancing.",
  },
]
