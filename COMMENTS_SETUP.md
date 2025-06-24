# Comment System Setup

This document explains how to set up the comment system for your blog.

## Prerequisites

1. A Supabase project
2. Vercel deployment or local development environment

## Database Setup

### 1. Run the Migration

Apply the comment table migration to your Supabase database:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL from:
# supabase/migrations/20250106000000_create_comments_table.sql
```

### 2. Verify RLS Policies

The migration creates these Row Level Security policies:
- Anyone can view approved comments
- Authenticated users can view their own comments (regardless of approval status)  
- Anyone can insert comments (but they start as unapproved)
- Users can update/delete their own comments
- Admins can manage all comments

## Environment Variables

### Environment Variable Setup

You currently have `SUPABASE_URL` and `SUPABASE_KEY` set up. The API has been updated to work with your naming convention.

**Important**: For the comment system to work properly, you need the **Service Role Key**, not the anon key:

1. **Check your current key**: Visit `/api/test-env` to see what key you're using
2. **Get the Service Role Key** from your Supabase project:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the **service_role** key (not the anon key)
   - The service role key usually starts with `eyJ...` and is much longer

### For Local Development

Your current setup should work if `SUPABASE_KEY` contains your service role key:

```env
SUPABASE_URL=https://mgkxueyitefvneifgzoc.supabase.co
SUPABASE_KEY=your-service-role-key-here
NODE_ENV=development
```

### For Vercel Deployment

Your Vercel environment variables should match:
- `SUPABASE_URL`: Your Supabase project URL  
- `SUPABASE_KEY`: Your Supabase **service role** key

### Why Service Role Key?

The comment API needs elevated permissions to:
- Insert comments from both authenticated and guest users
- Query approved comments for display
- Handle user verification and data validation

## API Endpoint

The comment API is available at `/api/comments` and handles:

### GET /api/comments
- Query params: `post_url` (required), `limit` (optional), `offset` (optional)
- Returns approved comments for a specific post

### POST /api/comments
- Creates a new comment
- Supports both authenticated users and guests
- All comments start as unapproved for moderation

## Frontend Integration

The comment system is integrated into the `post.njk` layout with:

1. **Comment Display**: Dynamic loading and display of approved comments
2. **Comment Forms**: Separate forms for authenticated users and guests
3. **Real-time Updates**: Comments reload after successful submission

## Comment Moderation

Comments start as unapproved (`approved: false`). To moderate comments:

1. **Manual Approval**: Update comments in Supabase dashboard
2. **Admin Interface**: Build an admin interface to manage comments
3. **Auto-approval**: Modify the API to auto-approve comments from trusted users

## Security Features

- Input sanitization and validation
- Rate limiting (implement as needed)
- Row Level Security (RLS) for database access
- CORS headers for API security
- Terms of service acceptance for guest comments

## Usage

1. Users can comment on blog posts as guests or authenticated users
2. Authenticated users get pre-filled name/email from their profile
3. All comments require moderation before being displayed
4. Users can view, edit, and delete their own comments

## Troubleshooting

### Step 1: Check Environment Variables
Visit `/api/test-env` to verify your environment variables:
```
http://localhost:3000/api/test-env
```
This will show you which Supabase variables are available.

### Step 2: Comments not showing
- Check if comments are approved in the database
- Verify the `post_url` matches exactly
- Check browser console for API errors
- Enable debug mode by clicking the "Debug" button on the comment form

### Step 3: Submission failures
- Verify environment variables are set correctly
- Check Supabase RLS policies are enabled
- Ensure API endpoint is accessible
- Check the browser network tab for API responses

### Step 4: Alpine.js Issues
- Comments section should be inside the `commentForm` Alpine component
- Check browser console for "Alpine Expression Error" messages
- Verify Alpine.js is properly initialized

### Step 5: Authentication issues  
- Verify user authentication is working
- Check localStorage for user data
- Confirm Supabase auth configuration 