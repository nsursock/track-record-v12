import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = window.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = window.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
console.log('Supabase config:', {
    url: supabaseUrl,
    keyLength: supabaseKey?.length,
    hasValidUrl: supabaseUrl !== 'YOUR_SUPABASE_URL',
    hasValidKey: supabaseKey !== 'YOUR_SUPABASE_KEY'
});
const supabase = createClient(supabaseUrl, supabaseKey)

export default {

    user: null,
    session: null,
    loading: true,

    async init() {
        console.log('🚀 Auth store initializing...', {
            currentUrl: window.location.href,
            pathname: window.location.pathname,
            timestamp: new Date().toISOString()
        });

        // Check if we have any stored auth data
        const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        console.log('💾 LocalStorage auth data:', {
            hasSupabaseAuth: !!localStorage.getItem('supabase.auth.token'),
            authKeys,
            authKeysCount: authKeys.length
        });

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
            console.error('❌ Error getting session:', error)
        } else {
            this.session = session
            this.user = session?.user ?? null
            console.log('📋 Initial session check:', {
                hasSession: !!session,
                hasUser: !!session?.user,
                userEmail: session?.user?.email,
                sessionExpiry: session?.expires_at,
                isAuthenticated: this.isAuthenticated,
                currentPage: window.location.pathname
            });

            // Check if user is authenticated but on wrong page
            if (this.isAuthenticated && (window.location.pathname === '/' || window.location.pathname.includes('credentials'))) {
                console.log('⚠️ User is authenticated but on landing/credentials page!');
                console.log('🔄 Auto-redirecting to dashboard...');
                setTimeout(() => {
                    window.location.href = '/app/dashboard/';
                }, 500);
            }
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 Auth state changed:', {
                event,
                hasSession: !!session,
                hasUser: !!session?.user,
                userEmail: session?.user?.email,
                currentUrl: window.location.href,
                timestamp: new Date().toISOString()
            });

            this.session = session
            // Always fetch fresh user data on auth state change
            if (session?.user) {
                const { data: { user } } = await supabase.auth.getUser()
                this.user = user
                console.log('✅ Updated user data:', {
                    userEmail: user?.email,
                    isAuthenticated: this.isAuthenticated,
                    userMetadata: user?.user_metadata
                });
            } else {
                this.user = null
                console.log('❌ User cleared - isAuthenticated:', this.isAuthenticated)
            }

            if (event === 'SIGNED_IN') {
                console.log('🎉 User signed in successfully:', {
                    user: this.user,
                    isAuthenticated: this.isAuthenticated,
                    currentPage: window.location.pathname
                });

                // Check if we're on a page that should redirect
                if (window.location.pathname === '/' || window.location.pathname.includes('credentials')) {
                    console.log('🔄 User authenticated but on wrong page, should redirect');
                    console.log('🚀 Redirecting authenticated user to dashboard...');
                    setTimeout(() => {
                        window.location.href = '/app/dashboard/';
                    }, 500);
                }
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out')
            }

            // Force Alpine to update reactivity
            Alpine.nextTick(() => {
                console.log('⚡ Forced Alpine update - isAuthenticated:', this.isAuthenticated);
            });
        })

        this.loading = false
    },

    async signInWithGoogle(options = {}) {
        console.log('Attempting Google sign in...')
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: options.redirectTo || window.location.origin
            }
        })

        if (error) {
            console.error('Google sign in error:', error)
            throw error
        }

        // Fetch fresh user data after successful login
        if (data?.user) {
            const { data: { user } } = await supabase.auth.getUser()
            this.user = user
        }

        return data
    },

    async signInWithGitHub(options = {}) {
        console.log('Attempting GitHub sign in...')
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: options.redirectTo || window.location.origin
            }
        })

        if (error) {
            console.error('GitHub sign in error:', error)
            throw error
        }

        // Fetch fresh user data after successful login
        if (data?.user) {
            const { data: { user } } = await supabase.auth.getUser()
            this.user = user
        }

        return data
    },

    async signInWithEmail(email, password) {
        console.log('Attempting email sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error('Email sign in error:', error)
            throw error
        }

        // Fetch fresh user data after successful login
        if (data?.user) {
            const { data: { user } } = await supabase.auth.getUser()
            this.user = user
        }

        return data
    },

    async signUpWithEmail(email, password) {
        console.log('Attempting email sign up...')
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            console.error('Email sign up error:', error)
            throw error
        }

        // Fetch fresh user data after successful signup
        if (data?.user) {
            const { data: { user } } = await supabase.auth.getUser()
            this.user = user
        }

        return data
    },

    async signOut() {
        console.log('🔴 Starting sign out process...');
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('❌ Sign out error:', error)
            throw error
        }
        console.log('✅ Sign out successful - clearing user data');
        this.user = null
        this.session = null
    },

    async updateProfile(profileData) {
        console.log('Updating profile:', profileData)
        const { data, error } = await supabase
            .from('users')
            .update(profileData)
            .eq('id', this.user.id)

        if (error) {
            console.error('Profile update error:', error)
            throw error
        }

        // Fetch fresh user data after profile update
        const { data: { user } } = await supabase.auth.getUser()
        this.user = user

        return data
    },

    async updateSocialHandles(socialHandles) {
        console.log('Updating social handles:', socialHandles)
        const { data, error } = await supabase
            .from('social_handles')
            .upsert(
                socialHandles.map(handle => ({
                    ...handle,
                    user_id: this.user.id
                }))
            )

        if (error) {
            console.error('Social handles update error:', error)
            throw error
        }

        return data
    },

    get isAuthenticated() {
        return !!this.user
    },

    get userEmail() {
        return this.user?.email || ''
    },

    get userName() {
        return this.user?.user_metadata?.full_name || this.user?.email || 'User'
    },

    get userAvatar() {
        const avatarUrl = this.user?.user_metadata?.avatar_url || '';
        if (!avatarUrl) return '';

        // Add a cache-busting parameter to avoid rate limiting
        const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Cache for 1 hour
        return `${avatarUrl}?t=${timestamp}`;
    }
}
