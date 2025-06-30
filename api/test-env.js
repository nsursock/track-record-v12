// Simple test endpoint to check environment variables
export default function handler(req, res) {
  return res.json({
    SITE_URL: process.env.SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SITE') || key.includes('VERCEL'))
  });
} 