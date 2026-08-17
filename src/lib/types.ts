export type LabelSlug = "bigdripuniverse" | "ag20" | "elmayanaconcept";

export interface Label {
  slug: LabelSlug;
  name: string;
  wordmark: string;
  tagline: string;
  description: string;
  color: string;
  colorSoft: string;
  artistCount: number;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  label: LabelSlug;
  bio: string;
  status: "active" | "new";
}

export type ReleaseType = "Album" | "EP" | "Single";

export interface Track {
  title: string;
  duration: string;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  label: LabelSlug;
  type: ReleaseType;
  trackCount: number;
  year: number;
  blurb: string;
  tracks: Track[];
}

export interface BaeEvent {
  id: string;
  name: string;
  day: string;
  month: string;
  fullDate: string;
  time: string;
  city: string;
  venue: string;
  labels: LabelSlug[];
  status: "upcoming" | "past";
  description: string;
  tiers: { name: string; price: number; fee: number; note: string }[];
}

export interface NewsPost {
  id: string;
  category: "Announcement" | "Music" | "Events" | "Culture" | "Industry" | "Press";
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

export interface CultureStory {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}
