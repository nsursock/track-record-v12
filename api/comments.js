import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for API operations (required for admin access and RLS bypass)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_KEY;

console.log('Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  hasAnonKey: !!supabaseAnonKey,
  serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
  anonKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'undefined'
});

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY - required for API operations');
  console.log('Note: SUPABASE_KEY (anon key) is for frontend, SUPABASE_SERVICE_ROLE_KEY is for API');
}

let supabase;
try {
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized with service role key');
  } else {
    console.error('❌ Cannot initialize Supabase client - missing credentials');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Helper function to validate email
function isValidEmail(email) {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to sanitize input
function sanitizeString(str) {
  return str?.trim().substring(0, 1000) || '';
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Supabase is properly initialized
  if (!supabase) {
    console.error('Supabase client not initialized');
    return res.status(500).json({ 
      error: 'Database connection not available',
      message: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
    });
  }

  try {
    if (req.method === 'GET') {
      return await handleGetComments(req, res);
    } else if (req.method === 'POST') {
      return await handlePostComment(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

async function handleGetComments(req, res) {
  const { post_url, limit = 50, offset = 0 } = req.query;

  if (!post_url) {
    return res.status(400).json({ error: 'post_url is required' });
  }

  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_url', post_url)
      .eq('approved', true)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    return res.status(200).json({
      success: true,
      comments: comments || [],
      count: comments?.length || 0
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function handlePostComment(req, res) {
  console.log('🚀 POST /api/comments received:', req.body);
  
  const { 
    post_url, 
    post_title, 
    user_id, 
    name, 
    email, 
    avatar, 
    comment,
    terms 
  } = req.body;

  // Validation
  if (!post_url || !post_title || !name || !comment) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['post_url', 'post_title', 'name', 'comment']
    });
  }

  // For guest users, terms must be accepted
  if (!user_id && !terms) {
    return res.status(400).json({ 
      error: 'Terms of service must be accepted for guest comments'
    });
  }

  // Validate email format if provided
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Sanitize inputs
  const sanitizedData = {
    post_url: sanitizeString(post_url),
    post_title: sanitizeString(post_title),
    user_id: user_id || null,
    name: sanitizeString(name),
    email: email ? sanitizeString(email) : null,
    avatar: avatar ? sanitizeString(avatar) : null,
    comment: sanitizeString(comment),
    approved: user_id ? true : false // All comments start as unapproved for moderation except for authenticated users
  };

  // Additional validation
  if (sanitizedData.comment.length < 3) {
    return res.status(400).json({ error: 'Comment must be at least 3 characters long' });
  }

  if (sanitizedData.comment.length > 1000) {
    return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
  }

  if (sanitizedData.name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long' });
  }

  try {
    // If user_id is provided, validate the data and optionally enhance from users table
    if (sanitizedData.user_id) {
      console.log('🔐 Processing authenticated user:', sanitizedData.user_id);
      
      // Validate that we have required user data from frontend
      if (!sanitizedData.name || !sanitizedData.email) {
        return res.status(400).json({ 
          error: 'User data incomplete',
          details: 'Name and email are required for authenticated users'
        });
      }

      console.log('✅ User data validated from frontend');
      
      // Try to get additional profile data from users table (optional enhancement)
      try {
        const { data: profileUser, error: profileError } = await supabase
          .from('users')
          .select('first_name, last_name, email, profile_picture_url')
          .eq('id', sanitizedData.user_id)
          .single();

        if (profileUser && !profileError) {
          // Use profile data if available and more complete
          console.log('📋 Enhanced with data from users table');
          sanitizedData.name = `${profileUser.first_name} ${profileUser.last_name}`.trim();
          sanitizedData.email = profileUser.email;
          sanitizedData.avatar = profileUser.profile_picture_url || sanitizedData.avatar;
        } else {
          console.log('📋 Using frontend data (users table not available)');
          // Keep the data from frontend - it's already validated above
        }
      } catch (profileError) {
        console.log('📋 Users table query failed, using frontend data:', profileError.message);
        // Not critical - we can proceed with frontend data
      }

      console.log('🎯 Final user data:', {
        user_id: sanitizedData.user_id,
        name: sanitizedData.name,
        email: sanitizedData.email,
        hasAvatar: !!sanitizedData.avatar
      });
    }

    // Insert the comment
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert([sanitizedData])
      .select('*')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save comment' });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Comment submitted successfully! It will be visible after moderation.',
      comment: {
        id: newComment.id,
        name: newComment.name,
        comment: newComment.comment,
        created_at: newComment.created_at,
        approved: newComment.approved
      }
    });

  } catch (error) {
    console.error('Post comment error:', error);
    return res.status(500).json({ error: 'Failed to submit comment' });
  }
} 