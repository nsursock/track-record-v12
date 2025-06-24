import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create supabase client with service role key (should bypass RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'nicolas.sursock@gmail.com';

// Helper function to verify admin access
async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return { error: 'No authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { error: 'Invalid token', status: 401 };
    }

    if (user.email !== ADMIN_EMAIL) {
      return { error: 'Access denied - admin only', status: 403 };
    }

    return { user, status: 200 };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify admin access
  const adminCheck = await verifyAdmin(req);
  if (adminCheck.error) {
    return res.status(adminCheck.status).json({ 
      error: adminCheck.error 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetComments(req, res);
      case 'PUT':
        return await handleUpdateComment(req, res);
      case 'DELETE':
        return await handleDeleteComment(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin comments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetComments(req, res) {
  const { 
    status = 'all', 
    limit = 50, 
    offset = 0, 
    search = '' 
  } = req.query;

  console.log('Admin API Debug:', {
    supabaseUrl,
    hasKey: !!supabaseKey,
    keyLength: supabaseKey?.length,
    keyStart: supabaseKey?.substring(0, 20) + '...',
    isServiceKey: supabaseKey?.length > 100, // Service keys are typically longer
    status,
    requestedBy: req.headers.authorization?.substring(0, 20) + '...'
  });

  // Use special admin function to bypass RLS completely
  const { data: allComments, error } = await supabase
    .rpc('get_all_comments_for_admin');

  if (error) {
    console.error('Error fetching comments with admin function:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }

  // Apply filters manually since we bypassed the query builder
  let comments = allComments || [];

  // Apply status filter
  if (status === 'approved') {
    comments = comments.filter(c => c.approved === true);
  } else if (status === 'pending') {
    comments = comments.filter(c => c.approved === false);
  }
  // 'all' includes both approved and pending (no filtering)

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    comments = comments.filter(c => 
      c.comment.toLowerCase().includes(searchLower) ||
      c.name.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.post_title.toLowerCase().includes(searchLower)
    );
  }

  // Apply pagination manually
  const totalCount = comments.length;
  comments = comments.slice(offset, offset + limit);

  if (error) {
    console.error('Error fetching comments:', error);
    console.error('Query details:', {
      status,
      limit,
      offset,
      search,
      supabaseUrl,
      hasServiceKey: !!supabaseKey,
      keyLength: supabaseKey?.length
    });
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }

  console.log(`Admin API: Fetched ${comments.length} comments with status="${status}"`);
  console.log('Comment approval status:', comments.map(c => ({ id: c.id, approved: c.approved })));

  // Get counts for stats from the fetched comments
  const allCommentsForStats = allComments || [];

  const stats = {
    total: allCommentsForStats.length,
    approved: allCommentsForStats.filter(c => c.approved).length,
    pending: allCommentsForStats.filter(c => !c.approved).length
  };

  return res.status(200).json({ 
    comments,
    stats,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: comments.length === parseInt(limit)
    }
  });
}

async function handleUpdateComment(req, res) {
  const { id, action, approved } = req.body;

  if (!id || !action) {
    return res.status(400).json({ error: 'Comment ID and action are required' });
  }

  let newApprovalStatus;

  switch (action) {
    case 'approve':
      newApprovalStatus = true;
      break;
    case 'unapprove':
      newApprovalStatus = false;
      break;
    case 'toggle':
      newApprovalStatus = approved;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  const { data, error } = await supabase
    .rpc('admin_update_comment_approval', {
      comment_id: parseInt(id),
      new_approval_status: newApprovalStatus
    });

  if (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ error: 'Failed to update comment' });
  }

  return res.status(200).json({ 
    message: 'Comment updated successfully',
    comment: data[0] // RPC returns an array
  });
}

async function handleDeleteComment(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  const { data: success, error } = await supabase
    .rpc('admin_delete_comment', {
      comment_id: parseInt(id)
    });

  if (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }

  if (!success) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  return res.status(200).json({ 
    message: 'Comment deleted successfully' 
  });
} 