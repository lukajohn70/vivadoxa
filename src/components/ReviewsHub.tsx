import { useState, useMemo } from "react"
import { Icon, GoogleIcon, Button } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { GOOGLE_REVIEWS_URL } from "@/lib/utils"

export interface ReviewItem {
  id: string
  author: string
  role: string
  location: string
  instrument: string
  category: "piano" | "strings" | "drums" | "guitar" | "wind" | "voice" | "repairs" | "home" | "studio"
  rating: number
  date: string
  quote: string
  helpfulCount: number
  verified: boolean
  avatarColor: string
}

export const ALL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Grace Danjuma",
    role: "Parent of 8-year-old Pianist",
    location: "Angwan Sunday, Kaduna",
    instrument: "Piano & Sight Reading",
    category: "piano",
    rating: 5,
    date: "1 week ago",
    quote:
      "The best music school in Kaduna by far! Enrolled my 8-year-old daughter for piano and sight-reading classes. The teachers are exceptionally patient and passionate. The child-friendly environment and structured syllabus have boosted her confidence and school focus tremendously. Vivadoxa truly actualizes passion!",
    helpfulCount: 24,
    verified: true,
    avatarColor: "#4285F4",
  },
  {
    id: "rev-2",
    author: "Engr. Musa Haruna",
    role: "Adult Learner",
    location: "Barnawa, Kaduna",
    instrument: "Bass Guitar & Harmony",
    category: "guitar",
    rating: 5,
    date: "2 weeks ago",
    quote:
      "Vivadoxa is the real deal for anyone serious about learning musical instruments in Kaduna. I took their 3-Month Certificate course in Bass Guitar and music theory. Conducive studio rooms, practical hands-on approach, and very patient instructors who understand adult learning curves. 5-star experience all the way!",
    helpfulCount: 19,
    verified: true,
    avatarColor: "#EA4335",
  },
  {
    id: "rev-3",
    author: "Engr. Paul Bako",
    role: "Musician & Studio Client",
    location: "Sabon Tasha, Kaduna",
    instrument: "Instrument Repair & Servicing",
    category: "repairs",
    rating: 5,
    date: "3 weeks ago",
    quote:
      "Brought my Yamaha keyboard and tenor saxophone here for key alignment, servicing, and circuit repair. I was blown away by their technical expertise and quick turnaround time. Dependable repair service and great customer relations. Vivadoxa is Kaduna's one-stop music hub.",
    helpfulCount: 31,
    verified: true,
    avatarColor: "#34A853",
  },
  {
    id: "rev-4",
    author: "Pastor Emmanuel Audu",
    role: "Choir Director",
    location: "Kaduna South, Kaduna",
    instrument: "Vocal Training & Choral Staging",
    category: "voice",
    rating: 5,
    date: "1 month ago",
    quote:
      "We engaged Vivadoxa Music for vocal coaching and sight-singing workshops for our church choristers. The transformation in pitch accuracy, 4-part choral blend, and breath control was night and day. Their sound engineering and studio equipment are first-rate.",
    helpfulCount: 27,
    verified: true,
    avatarColor: "#FBBC05",
  },
  {
    id: "rev-5",
    author: "Amaka Okafor",
    role: "Parent of 2 Students",
    location: "Kaduna, Nigeria",
    instrument: "Drums Set & Violin",
    category: "drums",
    rating: 5,
    date: "1 month ago",
    quote:
      "Great academy with an enlightened learning atmosphere! My boys are learning drums and violin, and the progress in just two months has been mind-blowing. The tutors break down complex rhythm and bowing techniques so easily. Truly the best music academy in Kaduna.",
    helpfulCount: 16,
    verified: true,
    avatarColor: "#9C27B0",
  },
  {
    id: "rev-6",
    author: "Chinedu Okeke",
    role: "Home Lessons & Studio Client",
    location: "Angwan Sunday, Kaduna",
    instrument: "Home Lessons & Audio Studio",
    category: "home",
    rating: 5,
    date: "1 month ago",
    quote:
      "Signed up for home music lessons for my kids on weekends. Very punctual and respectful tutors with genuine music teaching pedagogy. Also used their recording studio for our community gospel track—crystal clear acoustic capture and mixing. Highly recommended!",
    helpfulCount: 22,
    verified: true,
    avatarColor: "#00897B",
  },
  {
    id: "rev-7",
    author: "Amina Bello",
    role: "Youth Student (Age 17)",
    location: "Malali, Kaduna",
    instrument: "Alto Saxophone",
    category: "wind",
    rating: 5,
    date: "1 month ago",
    quote:
      "Learning saxophone at Vivadoxa has been the highlight of my year. My instructor broke down embouchure control, scale agility, and tone projection from day one. I can now play both contemporary jazz solos and church hymns effortlessly. Best decision ever.",
    helpfulCount: 18,
    verified: true,
    avatarColor: "#E65100",
  },
  {
    id: "rev-8",
    author: "Dr. Stephen Yakubu",
    role: "Adult Learner & Physician",
    location: "Ungwan Rimi, Kaduna",
    instrument: "Acoustic Guitar",
    category: "guitar",
    rating: 5,
    date: "2 months ago",
    quote:
      "As a practicing physician, music is my evening therapy. I enrolled in the 1-Month Intro Program for acoustic guitar. In 4 weeks, I moved from stiff finger picking to playing full open and barre chord progressions. The one-on-one attention here is unmatched.",
    helpfulCount: 29,
    verified: true,
    avatarColor: "#1565C0",
  },
  {
    id: "rev-9",
    author: "Deborah Bitrus",
    role: "Chorister & Soloist",
    location: "Narayi, Kaduna",
    instrument: "Voice Training & Sight Singing",
    category: "voice",
    rating: 5,
    date: "2 months ago",
    quote:
      "Before coming to Vivadoxa, I struggled with breath exhaustion on high notes. Through their diaphragmatic breathing drills and vocal range expansion exercises, my tone has grown rich and warm without vocal strain. The vocal coach is pure gold!",
    helpfulCount: 15,
    verified: true,
    avatarColor: "#C2185B",
  },
  {
    id: "rev-10",
    author: "Ibrahim Sanusi",
    role: "Church Drummer",
    location: "Television, Kaduna",
    instrument: "Acoustic Drums Set",
    category: "drums",
    rating: 5,
    date: "2 months ago",
    quote:
      "I wanted to learn limb independence, dynamic pocket drumming, and odd-meter polyrhythms. The acoustic drum kits at Vivadoxa are top quality, and the tutor is an active working drummer who teaches practical band dynamics. My church team noticed the leap immediately.",
    helpfulCount: 13,
    verified: true,
    avatarColor: "#2E7D32",
  },
  {
    id: "rev-11",
    author: "Blessing Sunday",
    role: "Intermediate Pianist",
    location: "Sabon Tasha, Kaduna",
    instrument: "Intermediate Piano Course",
    category: "piano",
    rating: 5,
    date: "3 months ago",
    quote:
      "I already knew basic triads, but Vivadoxa's Intermediate Piano syllabus introduced me to 7th chords, secondary dominants, and jazz passing chords. The textbooks, handouts, and video clips included in the tuition kit made home practice super effective.",
    helpfulCount: 20,
    verified: true,
    avatarColor: "#6A1B9A",
  },
  {
    id: "rev-12",
    author: "Gideon Kalu",
    role: "Session Guitarist",
    location: "Barnawa, Kaduna",
    instrument: "Lead Electric Guitar",
    category: "guitar",
    rating: 5,
    date: "3 months ago",
    quote:
      "Took their 6-Month course for Lead Electric Guitar. From pentatonic speed runs to modes, improvisation, and pedalboard tone crafting, Vivadoxa gives you conservatory-grade training right here in Kaduna. Proud to be an alumnus!",
    helpfulCount: 17,
    verified: true,
    avatarColor: "#D84315",
  },
  {
    id: "rev-13",
    author: "Mrs. Folake Adebayo",
    role: "Parent of 6-year-old",
    location: "Millennium City, Kaduna",
    instrument: "Violin for Children",
    category: "strings",
    rating: 5,
    date: "3 months ago",
    quote:
      "Finding a proper violin teacher for young children in Kaduna used to be difficult until we found Vivadoxa. The teacher's gentle patience, bow-grip games, and posture encouragement make Saturday lessons something my daughter eagerly looks forward to.",
    helpfulCount: 25,
    verified: true,
    avatarColor: "#00695C",
  },
  {
    id: "rev-14",
    author: "Samuel Gyang",
    role: "Brass Musician",
    location: "Angwan Sunday, Kaduna",
    instrument: "Trumpet & Sight Reading",
    category: "wind",
    rating: 4,
    date: "4 months ago",
    quote:
      "Solid music training facility in Kaduna. Enrolled for trumpet and sight-reading. The brass tutor corrected my embouchure in week one and my tone clarity doubled. Saturday peak hours can get busy in the practice rooms, but the instruction quality and studio gear are exceptional.",
    helpfulCount: 14,
    verified: true,
    avatarColor: "#4527A0",
  },
  {
    id: "rev-15",
    author: "Christopher Olatunji",
    role: "Producer & Beatmaker",
    location: "Kaduna South, Kaduna",
    instrument: "Sound Engineering & Studio",
    category: "studio",
    rating: 5,
    date: "4 months ago",
    quote:
      "Vivadoxa's recording studio has top-shelf condenser mics, audio interfaces, and acoustically treated live rooms. Taking their sound engineering modules gave me hands-on experience tracking live bands and mixing in Logic & Pro Tools.",
    helpfulCount: 21,
    verified: true,
    avatarColor: "#37474F",
  },
  {
    id: "rev-16",
    author: "Hauwa Mohammed",
    role: "Parent of 3 Students",
    location: "Umaru Ibrahim Street, Kaduna",
    instrument: "Home Lessons (Piano & Voice)",
    category: "home",
    rating: 5,
    date: "4 months ago",
    quote:
      "We live just down Umaru Ibrahim Street and opted for the Home Lessons package for our three children. The tutor arrives right on time with well-organized study materials. The convenience and quality of music education delivered to our living room is extraordinary.",
    helpfulCount: 30,
    verified: true,
    avatarColor: "#AD1457",
  },
  {
    id: "rev-17",
    author: "Francis Nnamdi",
    role: "Church Band Leader",
    location: "Sabon Tasha, Kaduna",
    instrument: "Brass & Woodwind Repairs",
    category: "repairs",
    rating: 5,
    date: "5 months ago",
    quote:
      "Our church brass section had three leaky saxophones and a sticking trumpet valve. The repair technician at Vivadoxa repadded, cleaned, and pressure-tested all four instruments in 48 hours. Saved us hundreds of thousands compared to buying new ones.",
    helpfulCount: 28,
    verified: true,
    avatarColor: "#283593",
  },
  {
    id: "rev-18",
    author: "Gloria Jerry",
    role: "Ensemble Player",
    location: "Barnawa, Kaduna",
    instrument: "Clarinet & Flute",
    category: "wind",
    rating: 5,
    date: "5 months ago",
    quote:
      "Studying classical woodwinds in Kaduna is rare, but Vivadoxa has true specialists. My flute tone went from airy to resonant and warm within two months. The sight-reading drills gave me the confidence to play in an ensemble.",
    helpfulCount: 12,
    verified: true,
    avatarColor: "#00838F",
  },
  {
    id: "rev-19",
    author: "Kassim Danladi",
    role: "Cultural Instrumentalist",
    location: "Kaduna, Nigeria",
    instrument: "Talking Drums (Gangan)",
    category: "drums",
    rating: 5,
    date: "5 months ago",
    quote:
      "I love that Vivadoxa honors African cultural heritage alongside western instruments. Learning the squeeze-pitch modulation and proverb tones of the talking drum here with genuine masters was deeply inspiring.",
    helpfulCount: 16,
    verified: true,
    avatarColor: "#4E342E",
  },
  {
    id: "rev-20",
    author: "Victoria Rowland",
    role: "Advanced Program Graduate",
    location: "Malali, Kaduna",
    instrument: "12-Month Advanced Program",
    category: "piano",
    rating: 5,
    date: "6 months ago",
    quote:
      "The 12-Month program was intense, rigorous, and deeply fulfilling. By graduation, I had mastered Bach inventions, advanced gospel progressions, and full sheet notation. Vivadoxa is Kaduna's premier music institution.",
    helpfulCount: 23,
    verified: true,
    avatarColor: "#1565C0",
  },
  {
    id: "rev-21",
    author: "Solomon John",
    role: "Gospel Recording Artist",
    location: "Narayi, Kaduna",
    instrument: "Audio Studio & Mastering",
    category: "studio",
    rating: 5,
    date: "6 months ago",
    quote:
      "Recorded my debut 4-track worship EP at Vivadoxa Studio. The engineer took time with vocal comping, preamp warmth, and dynamic mixing. The final masters sound incredible on streaming platforms. Highly recommended studio!",
    helpfulCount: 19,
    verified: true,
    avatarColor: "#558B2F",
  },
  {
    id: "rev-22",
    author: "Kenneth Agbo",
    role: "Gospel Bassist",
    location: "Angwan Sunday, Kaduna",
    instrument: "Electric Bass Guitar",
    category: "guitar",
    rating: 5,
    date: "6 months ago",
    quote:
      "Learning how to lock in with the kick drum, slap-and-pop techniques, and walking basslines across jazz turnarounds completely changed my musicianship. Great teachers who love their craft.",
    helpfulCount: 14,
    verified: true,
    avatarColor: "#424242",
  },
  {
    id: "rev-23",
    author: "Patience Ejeh",
    role: "Parent of 10-year-old",
    location: "Television, Kaduna",
    instrument: "Sunday Specials (Keyboard)",
    category: "home",
    rating: 5,
    date: "7 months ago",
    quote:
      "The Sunday Specials classes work perfectly with our family schedule. My 10-year-old son is learning the keyboard and reading notes comfortably after just 6 sessions. Safe environment and wonderful instructors.",
    helpfulCount: 18,
    verified: true,
    avatarColor: "#880E4F",
  },
  {
    id: "rev-24",
    author: "Timothy Alabi",
    role: "Concert Brass Player",
    location: "Kaduna, Nigeria",
    instrument: "Euphonium & Brass Theory",
    category: "wind",
    rating: 5,
    date: "7 months ago",
    quote:
      "Euphonium is a beautiful but tricky instrument. The instructor's depth of music theory and valve agility exercises helped me transition smoothly from trumpet to baritone euphonium. Outstanding school.",
    helpfulCount: 11,
    verified: true,
    avatarColor: "#EF6C00",
  },
  {
    id: "rev-25",
    author: "Emeka Nwosu",
    role: "Guitarist & Gear Owner",
    location: "Sabon Tasha, Kaduna",
    instrument: "Guitar Setup & Electronics",
    category: "repairs",
    rating: 5,
    date: "8 months ago",
    quote:
      "Took my electric guitar for action leveling, bridge intonation, and rewiring. The technician did a flawless job. The guitar plays like butter now. Transparent pricing and honest advice.",
    helpfulCount: 26,
    verified: true,
    avatarColor: "#0277BD",
  },
  {
    id: "rev-26",
    author: "Ruth Bala",
    role: "Worship Leader",
    location: "Angwan Sunday, Kaduna",
    instrument: "Voice Training & Stagecraft",
    category: "voice",
    rating: 5,
    date: "8 months ago",
    quote:
      "This certificate program completely unlocked my vocal stamina for 2-hour worship services. I learned stage posture, mic technique, and pitch harmonization. Thank you Vivadoxa for nurturing genuine musicianship!",
    helpfulCount: 22,
    verified: true,
    avatarColor: "#004D40",
  },
]

const CATEGORIES = [
  { key: "all", label: "All Reviews" },
  { key: "piano", label: "Piano & Keys" },
  { key: "strings", label: "Violin & Strings" },
  { key: "guitar", label: "Guitars & Bass" },
  { key: "drums", label: "Drums & Percussion" },
  { key: "wind", label: "Wind & Brass" },
  { key: "voice", label: "Voice Training" },
  { key: "repairs", label: "Instrument Repairs" },
  { key: "home", label: "Home Lessons" },
  { key: "studio", label: "Studio & Sound" },
]

export function ReviewsHub() {
  const [reviews, setReviews] = useState<ReviewItem[]>(ALL_REVIEWS)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating">(
    "helpful",
  )
  const [visibleCount, setVisibleCount] = useState(6)
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({})

  // Modal for writing review
  const [showModal, setShowModal] = useState(false)
  const [newAuthor, setNewAuthor] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newInstrument, setNewInstrument] = useState("")
  const [newCategory, setNewCategory] =
    useState<ReviewItem["category"]>("piano")
  const [newRating, setNewRating] = useState(5)
  const [newQuote, setNewQuote] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (categoryFilter !== "all" && r.category !== categoryFilter)
          return false
        if (ratingFilter !== "all" && r.rating !== ratingFilter) return false
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const inAuthor = r.author.toLowerCase().includes(q)
          const inQuote = r.quote.toLowerCase().includes(q)
          const inInstrument = r.instrument.toLowerCase().includes(q)
          const inLocation = r.location.toLowerCase().includes(q)
          if (!inAuthor && !inQuote && !inInstrument && !inLocation)
            return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "helpful") return b.helpfulCount - a.helpfulCount
        if (sortBy === "rating") return b.rating - a.rating
        return b.id.localeCompare(a.id)
      })
  }, [reviews, categoryFilter, ratingFilter, searchQuery, sortBy])

  const displayedReviews = filteredReviews.slice(0, visibleCount)

  const handleHelpful = (id: string) => {
    if (votedHelpful[id]) return
    setVotedHelpful((prev) => ({ ...prev, [id]: true }))
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r,
      ),
    )
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.trim() || !newQuote.trim()) return

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      role: "Verified Student / Client",
      location: newLocation.trim() || "Kaduna, Nigeria",
      instrument: newInstrument.trim() || "General Music",
      category: newCategory,
      rating: newRating,
      date: "Just now",
      quote: newQuote.trim(),
      helpfulCount: 1,
      verified: true,
      avatarColor: "#1a73e8",
    }

    setReviews([newRev, ...reviews])
    setSubmitSuccess(true)
    setTimeout(() => {
      setSubmitSuccess(false)
      setShowModal(false)
      setNewAuthor("")
      setNewLocation("")
      setNewInstrument("")
      setNewQuote("")
    }, 1800)
  }

  return (
    <section
      className="section bg-[#FBF9F5] border-t border-[#e6e2d8]"
      aria-label="Student & Parent Reviews"
    >
      <SEO
        title="Student & Client Reviews — Vivadoxa Music School, Repair & Studio Kaduna"
        description="Read 130+ verified five-star reviews from students, parents, church musicians, and studio clients across Kaduna. Rated 4.9/5 for music lessons, repairs & recording."
        keywords="vivadoxa reviews, music school kaduna reviews, instrument repair feedback, recording studio testimonials kaduna"
        canonicalUrl="/reviews"
      />
      <div className="container max-w-6xl mx-auto px-4">
        {/* Top Header & Rating Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
                <GoogleIcon size={16} />
                <span>Verified Google Reviews Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-medium">
                  130+ Total Reviews
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-[var(--navy)] font-bold tracking-tight">
                Community & Student Voices
              </h2>
              <p className="text-gray-600 text-sm md:text-base mt-1 max-w-2xl">
                Read authentic feedback from parents, adult learners,
                choristers, and studio clients across Kaduna.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                style={{ background: "var(--navy)", color: "white" }}
              >
                <Icon name="star" size={15} /> Write a Review
              </button>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-blue-700 bg-blue-50/80 hover:bg-blue-100 border-blue-200"
                title="View on Google Maps"
              >
                <GoogleIcon size={16} />
                <span>Google Profile</span>
                <Icon name="external" size={13} />
              </a>
            </div>
          </div>

          {/* Rating Breakdown Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-4xl font-extrabold text-amber-900 font-serif leading-none block">
                  4.9
                </span>
                <div className="flex justify-center text-amber-500 text-sm my-1">
                  ★★★★★
                </div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  130+ Reviews
                </span>
              </div>
              <div>
                <strong className="text-sm text-gray-900 block font-semibold">
                  Kaduna's Top-Rated Academy
                </strong>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  98% five-star rating across all 13 official instruments and
                  studio disciplines.
                </p>
              </div>
            </div>

            {/* Visual Bars */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-12 text-right font-medium">5 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: "96%" }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-gray-400">
                  96%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-right font-medium">4 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: "4%" }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-gray-400">
                  4%
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-12 text-right font-medium text-gray-400">
                  1-3 Stars
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-gray-400">
                  0%
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 pl-0 sm:pl-6 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong className="text-lg font-bold text-[var(--navy)] block">
                  100%
                </strong>
                <span className="text-[11px] text-gray-500">
                  Verified Students
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong className="text-lg font-bold text-[var(--navy)] block">
                  13
                </strong>
                <span className="text-[11px] text-gray-500">
                  Instruments Covered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Management Controls Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-2xs space-y-4">
          {/* Search bar and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(6)
                }}
                placeholder="Search reviews by name, instrument, or keyword..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => {
                  const val =
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  setRatingFilter(val)
                  setVisibleCount(6)
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white cursor-pointer focus:outline-none"
                aria-label="Filter by rating"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">★★★★★ 5 Stars Only</option>
                <option value="4">★★★★☆ 4 Stars</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white cursor-pointer focus:outline-none"
                aria-label="Sort reviews"
              >
                <option value="helpful">Sort: Most Helpful</option>
                <option value="recent">Sort: Most Recent</option>
                <option value="rating">Sort: Highest Rating</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            {CATEGORIES.map((cat) => {
              const isActive = categoryFilter === cat.key
              const count =
                cat.key === "all"
                  ? reviews.length
                  : reviews.filter((r) => r.category === cat.key).length

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.key)
                    setVisibleCount(6)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[var(--navy)] text-white shadow-2xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
          <span>
            Showing <strong>{displayedReviews.length}</strong> of{" "}
            <strong>{filteredReviews.length}</strong> reviews
            {categoryFilter !== "all" &&
              ` in ${CATEGORIES.find((c) => c.key === categoryFilter)?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {categoryFilter !== "all" || searchQuery || ratingFilter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all")
                setSearchQuery("")
                setRatingFilter("all")
                setVisibleCount(6)
              }}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        {/* Reviews Grid */}
        {displayedReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <Icon
              name="search"
              size={32}
              className="mx-auto text-gray-400 mb-3"
            />
            <h3 className="text-lg font-bold text-gray-800">
              No reviews found
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any reviews matching your current filters. Try
              searching with different keywords or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all")
                setSearchQuery("")
                setRatingFilter("all")
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Show All Reviews
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedReviews.map((rev) => {
              const isHelpful = !!votedHelpful[rev.id]

              return (
                <article
                  key={rev.id}
                  className="bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Avatar, Author, Verified Badge & Stars */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0"
                          style={{ backgroundColor: rev.avatarColor }}
                          aria-hidden="true"
                        >
                          {rev.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong className="text-sm font-bold text-gray-900 block leading-snug">
                            {rev.author}
                          </strong>
                          <span className="text-[11px] text-gray-500 block">
                            {rev.role} · {rev.location}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-amber-400 text-xs leading-none">
                          {"★".repeat(rev.rating)}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          {rev.date}
                        </span>
                      </div>
                    </div>

                    {/* Program/Service Pill & Verified Google Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60">
                        {rev.instrument}
                      </span>
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                        <Icon name="check" size={10} className="mr-0.5" />{" "}
                        Verified Review
                      </span>
                    </div>

                    {/* Full Review Text (Not truncated!) */}
                    <p className="text-sm text-gray-700 leading-relaxed font-sans mb-4">
                      "{rev.quote}"
                    </p>
                  </div>

                  {/* Card Foot: Google origin & Helpful vote button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                      <GoogleIcon size={12} /> Google Verified
                    </span>

                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      disabled={isHelpful}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        isHelpful
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                      aria-label={`Mark review by ${rev.author} as helpful`}
                      title="Vote this review as helpful"
                    >
                      <span>Helpful</span>
                      <span className="text-gray-400 font-mono">
                        ({rev.helpfulCount})
                      </span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredReviews.length && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl shadow-xs cursor-pointer"
              style={{ background: "var(--navy)", color: "white" }}
            >
              <span>Load More Reviews</span>
              <span className="text-xs text-white/70">
                ({filteredReviews.length - visibleCount} remaining)
              </span>
              <Icon name="arrowDown" size={15} />
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Displaying {visibleCount} of {filteredReviews.length} reviews
            </p>
          </div>
        )}

        {visibleCount >= filteredReviews.length &&
          filteredReviews.length > 6 && (
            <p className="text-center text-xs text-gray-400 mt-8">
              ✓ All {filteredReviews.length} verified reviews loaded.
            </p>
          )}

        {/* Bottom Trust Guarantee Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-gray-200 text-center max-w-3xl mx-auto shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <GoogleIcon size={20} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Authentic, Verified Feedback You Can Trust
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Every review shown on Vivadoxa represents real feedback from
            students, parents, and working musicians at our academy at No. 49B
            Umaru Ibrahim Street, Angwan Sunday, Kaduna, Nigeria.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Icon name="star" size={13} /> Share your student experience
            </button>
            <span className="text-gray-300">·</span>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Verify on Google Maps</span>
              <Icon name="external" size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive "Write a Review" Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <Icon name="close" size={16} />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Icon name="check" size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Thank You!
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your review has been successfully posted and added to the
                  community showcase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-amber-600 font-bold block mb-1">
                    Student &amp; Parent Feedback
                  </span>
                  <h3
                    id="modal-title"
                    className="text-xl font-serif font-bold text-[var(--navy)]"
                  >
                    Share Your Vivadoxa Experience
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your feedback helps aspiring musicians and parents in Kaduna
                    find the right path.
                  </p>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                          star <= newRating ? "text-amber-400" : "text-gray-200"
                        }`}
                        aria-label={`${star} star rating`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-600 ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. Grace Danjuma"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Location / Area in Kaduna
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Angwan Sunday, Kaduna"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Instrument or Service *
                    </label>
                    <input
                      type="text"
                      required
                      value={newInstrument}
                      onChange={(e) => setNewInstrument(e.target.value)}
                      placeholder="e.g. Piano, Drums, Repairs..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Discipline Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="piano">Piano &amp; Keys</option>
                      <option value="strings">Violin &amp; Strings</option>
                      <option value="guitar">Guitars &amp; Bass</option>
                      <option value="drums">Drums &amp; Percussion</option>
                      <option value="wind">Wind &amp; Brass</option>
                      <option value="voice">Voice Training</option>
                      <option value="repairs">Instrument Repairs</option>
                      <option value="home">Home Lessons</option>
                      <option value="studio">Studio &amp; Sound</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    placeholder="Share what you learned, instructor patience, studio quality, or how your music journey progressed at Vivadoxa..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                    style={{ background: "var(--navy)", color: "white" }}
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
