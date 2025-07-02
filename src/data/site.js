const baseUrl = process.env.BASE_URL || '/';

export default {
  title: "Track Record",
  tagline: "Groovy Wisdom",
  description: "Emergency metaphysics for space-ready survivors of massacres. Where personal trauma becomes cosmic data, musical inspiration serves as philosophical navigation, and authentic consciousness exploration happens in real-time through digital literature.",
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
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY
  }
};
