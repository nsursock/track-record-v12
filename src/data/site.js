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
    email: "nicolas.sursock@gmail.com",
    twitter: "SursockNicolas",
    instagram: "nsursock",
    linkedin: "nicolas-sursock",
    github: "nsursock",
    soundcloud: "nalman",
    spotify: "1137656838",
  }
};
