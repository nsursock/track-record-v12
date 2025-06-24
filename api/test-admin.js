import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  console.log('=== ADMIN TEST ENDPOINT ===');
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    keyLength: supabaseKey?.length,
    keyStart: supabaseKey?.substring(0, 30) + '...',
    isServiceKey: supabaseKey?.length > 100,
    urlStart: supabaseUrl?.substring(0, 30) + '...'
  });

  try {
    // Test 1: Raw query without any filtering
    console.log('Test 1: Raw query for all comments...');
    const { data: allComments, error: allError } = await supabase
      .from('comments')
      .select('id, comment, approved, created_at')
      .order('created_at', { ascending: false });

    console.log('Raw query result:', {
      success: !allError,
      error: allError?.message,
      count: allComments?.length,
      comments: allComments?.map(c => ({
        id: c.id,
        approved: c.approved,
        preview: c.comment.substring(0, 50) + '...'
      }))
    });

    // Test 2: Query with RLS disabled (using service role)
    console.log('Test 2: Service role bypass test...');
    const { data: serviceComments, error: serviceError } = await supabase
      .rpc('get_all_comments_for_admin');

    console.log('Service role test:', {
      success: !serviceError,
      error: serviceError?.message,
      count: serviceComments?.length,
      comments: serviceComments?.map(c => ({
        id: c.id,
        approved: c.approved,
        preview: c.comment.substring(0, 50) + '...'
      }))
    });

    // Test 3: Check current policies
    console.log('Test 3: Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'comments' });

    console.log('Policy check:', {
      success: !policyError,
      error: policyError?.message,
      note: 'This test requires a custom function'
    });

    return res.status(200).json({
      message: 'Admin test completed - check server logs',
      results: {
        allComments: {
          count: allComments?.length || 0,
          error: allError?.message,
          approvedCount: allComments?.filter(c => c.approved).length || 0,
          pendingCount: allComments?.filter(c => !c.approved).length || 0
        },
        environment: {
          hasServiceKey: supabaseKey?.length > 100,
          keyLength: supabaseKey?.length
        }
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      error: 'Test failed',
      details: error.message
    });
  }
} 