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
    desc: "Build strong technique, sight-reading and performance confidence.",
    category: "Instruments",
  },
  {
    name: "Guitar",
    tag: "All styles",
    image: guitarImg,
    fee: "₦75,000",
    feeAmount: 75000,
    desc: "Acoustic, electric or bass—learn chords, rhythm and improvisation.",
    category: "Instruments",
  },
  {
    name: "Drums & Percussion",
    tag: "High energy",
    image: drumsImg,
    fee: "₦80,000",
    feeAmount: 80000,
    desc: "Develop timing, coordination and a powerful musical vocabulary.",
    category: "Instruments",
  },
  {
    name: "Violin",
    tag: "Classical",
    image: violinImg,
    fee: "₦82,000",
    feeAmount: 82000,
    desc: "Develop bowing, intonation and expressive performance skills.",
    category: "Instruments",
  },
  {
    name: "Saxophone",
    tag: "Jazz + contemporary",
    image: saxophoneImg,
    fee: "₦90,000",
    feeAmount: 90000,
    desc: "Master breath control, tone, repertoire and improvisation.",
    category: "Instruments",
  },
  {
    name: "Vocals",
    tag: "All genres",
    image: vocalsImg,
    fee: "₦70,000",
    feeAmount: 70000,
    desc: "Build vocal control, range and the confidence to perform.",
    category: "Vocals",
  },
  {
    name: "Composition",
    tag: "Theory + practice",
    image: heroImg,
    fee: "₦80,000",
    feeAmount: 80000,
    desc: "Write, arrange and develop your musical voice from the ground up.",
    category: "Composition",
  },
  {
    name: "Music Production",
    tag: "Studio skills",
    image: studioImg,
    fee: "₦95,000",
    feeAmount: 95000,
    desc: "Record, arrange, mix and complete release-ready music.",
    category: "Music Production",
  },
];
