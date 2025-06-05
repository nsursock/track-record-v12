const baseUrl = process.env.BASE_URL || '/';

export default {
  title: "Track Record",
  tagline: "Groovy Wisdom",
  description: "A music and philosophy blog exploring the deeper connections between sound, rhythm, and meaning. Discover thoughtful reflections on albums, artists, and the philosophical questions music raises.",
  locale: 'en',
  baseUrl,
  env: process.env.NODE_ENV || 'development',
  author: {
    name: "Nicolas Sursock",
    email: "contact@trackrecord.ink",
    twitter: "SursockNicolas",
    instagram: "nsursock",
    linkedin: "nicolas-sursock",
    github: "nsursock",
    soundcloud: "nalman",
    spotify: "1137656838",
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  }
};
