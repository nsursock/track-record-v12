// Simple test endpoint to check environment variables
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const keyType = supabaseKey ? 
    (supabaseKey.length > 150 ? 'Likely Service Role Key' : 'Likely Anon Key') : 
    'Not set';

  return res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV || 'unknown',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    usingKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'SUPABASE_KEY',
    keyType: keyType,
    keyLength: supabaseKey ? supabaseKey.length : 0,
    supabaseUrlPreview: process.env.SUPABASE_URL ? 
      process.env.SUPABASE_URL.substring(0, 30) + '...' : 
      'Not set',
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.includes('SUPABASE'))
      .map(key => ({ key, hasValue: !!process.env[key] }))
  });
} 