import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('🔍 Checking ebook access for user:', user.id, user.email);

    // First, let's check if there are any completed orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from('ebook_orders')
      .select('id, email, user_id, status, product, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('product', '6-life-principles-ebook');

    console.log('📋 User orders:', orders);

    // Also check orders by email in case user_id wasn't set during purchase
    const { data: emailOrders, error: emailOrdersError } = await supabase
      .from('ebook_orders')
      .select('id, email, user_id, status, product, completed_at')
      .eq('email', user.email)
      .eq('status', 'completed')
      .eq('product', '6-life-principles-ebook');

    console.log('📧 Email orders:', emailOrders);

    // Check if user has completed ebook purchase using the function
    const { data, error } = await supabase
      .rpc('user_has_ebook_access', { check_user_id: user.id });

    console.log('🎯 Function result:', data, 'Error:', error);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to check ebook access' });
    }

    // If function says no but we have orders by email, there might be a linking issue
    const hasEmailBasedAccess = emailOrders && emailOrders.length > 0;
    const functionResult = data;

    // If user has orders by email but not by user_id, link them to the account
    if (hasEmailBasedAccess && !functionResult && emailOrders) {
      console.log('🔗 Linking existing email orders to user account...');
      
      // Update orders that match email but have no user_id
      const { error: updateError } = await supabase
        .from('ebook_orders')
        .update({ user_id: user.id })
        .eq('email', user.email)
        .eq('status', 'completed')
        .eq('product', '6-life-principles-ebook')
        .is('user_id', null);

      if (updateError) {
        console.error('❌ Failed to link orders to user account:', updateError);
      } else {
        console.log('✅ Successfully linked orders to user account');
      }
    }

    return res.status(200).json({ 
      hasAccess: functionResult || hasEmailBasedAccess,
      userId: user.id,
      userEmail: user.email,
      debug: {
        functionResult,
        hasEmailBasedAccess,
        userIdOrders: orders?.length || 0,
        emailOrders: emailOrders?.length || 0
      }
    });

  } catch (error) {
    console.error('Error checking ebook access:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 