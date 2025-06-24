-- Ensure service role can completely bypass RLS for comments table
-- This should allow the admin API to see ALL comments regardless of approval status

-- Option 1: Create a function that bypasses RLS for admin operations
CREATE OR REPLACE FUNCTION get_all_comments_for_admin()
RETURNS TABLE (
    id bigint,
    post_url text,
    post_title text,
    user_id uuid,
    name text,
    email text,
    avatar text,
    comment text,
    approved boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function runs with the privileges of the function owner (should be service role)
    -- and can bypass RLS
    RETURN QUERY
    SELECT 
        c.id,
        c.post_url,
        c.post_title,
        c.user_id,
        c.name,
        c.email,
        c.avatar,
        c.comment,
        c.approved,
        c.created_at,
        c.updated_at
    FROM comments c
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_all_comments_for_admin() TO service_role;

-- Option 2: Temporarily disable RLS for service role operations
-- Create a function to update comment approval status
CREATE OR REPLACE FUNCTION admin_update_comment_approval(comment_id bigint, new_approval_status boolean)
RETURNS TABLE (
    id bigint,
    post_url text,
    post_title text,
    user_id uuid,
    name text,
    email text,
    avatar text,
    comment text,
    approved boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the comment and return the updated row
    UPDATE comments 
    SET approved = new_approval_status, updated_at = timezone('utc'::text, now())
    WHERE comments.id = comment_id;
    
    RETURN QUERY
    SELECT 
        c.id,
        c.post_url,
        c.post_title,
        c.user_id,
        c.name,
        c.email,
        c.avatar,
        c.comment,
        c.approved,
        c.created_at,
        c.updated_at
    FROM comments c
    WHERE c.id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION admin_update_comment_approval(bigint, boolean) TO service_role;

-- Create a function to delete comments
CREATE OR REPLACE FUNCTION admin_delete_comment(comment_id bigint)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM comments WHERE id = comment_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION admin_delete_comment(bigint) TO service_role; 