# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to your project settings
3. Navigate to the "API" section

## 2. Get Your Credentials

Copy the following from your Supabase project:
- **Project URL** (found in API settings)
- **Anon Public Key** (found in API settings)

## 3. Set Environment Variables

Create a `.env` file in your project root (or add to your existing one):

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

## 4. Configure OAuth Providers

To enable social login (Google and GitHub), configure OAuth providers in Supabase:

### Google OAuth
1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID and Secret)
4. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000` (for development)

### GitHub OAuth
1. In Supabase dashboard, go to Authentication > Providers
2. Enable GitHub provider
3. Add your GitHub OAuth App credentials
4. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000` (for development)

## 5. Setting Up OAuth Apps

### Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to your Supabase callback URL

## 6. Authentication Features

The implemented authentication includes:

- **Social Login**: Google and GitHub OAuth
- **Email/Password**: Traditional email authentication
- **Session Management**: Persistent login sessions
- **User Profile**: Access to user metadata and avatar
- **Sign Out**: Secure session termination

## 7. Testing

1. Start your development server: `npm run dev`
2. Navigate to `/credentials/`
3. Test social login buttons
4. Test email signup/signin

## 8. Security Notes

- Never commit your `.env` file to version control
- Use environment variables for production deployment
- Configure proper redirect URLs for production
- Set up row-level security (RLS) in Supabase if needed

## 9. Available Auth Store Methods

The Alpine.js auth store provides:

```javascript
// Authentication methods
$store.auth.signInWithGoogle()
$store.auth.signInWithGitHub()
$store.auth.signInWithEmail(email, password)
$store.auth.signUpWithEmail(email, password)
$store.auth.signOut()

// State getters
$store.auth.isAuthenticated
$store.auth.user
$store.auth.userEmail
$store.auth.userName
$store.auth.userAvatar
```

## Troubleshooting

- Check browser console for authentication errors
- Verify environment variables are properly set
- Ensure OAuth redirect URLs match exactly
- Check Supabase project settings and API keys 