import '../css/index.css';

import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { Notyf } from 'notyf';
import 'flyonui/flyonui'
import notificationStore from './notificationStore.js'

// Register Alpine plugins
Alpine.plugin(intersect)

// Make sure HSOverlay is available globally
window.HSOverlay = window.HSOverlay || window.FlyonUI?.HSOverlay;

// Make notification store available globally
window.notificationStore = notificationStore;

// Import components
import donationForm from './donationForm.js';

import auth from './auth';
Alpine.store('auth', auth);

// Create a store for landing page state
Alpine.store('landing', {
    showInternal: false,
    isDev: false, // Default to false for real users
    
    init() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const hasInternalParam = urlParams.has('internal');
        
        // If URL has internal parameter, set localStorage
        if (hasInternalParam) {
            localStorage.setItem('trackRecordInternal', 'true');
        }
        
        // Check localStorage for persistent access
        const hasInternalFlag = localStorage.getItem('trackRecordInternal') === 'true';
        
        // Set isDev based on environment OR internal flag
        // This means dev features are available in:
        // 1. Development mode
        // 2. Production mode with internal flag
        this.isDev = import.meta.env.MODE === 'development' || hasInternalFlag;
        
        // Set showInternal based on isDev
        this.showInternal = this.isDev;

        console.log('Landing store initialized:', {
            showInternal: this.showInternal,
            isDev: this.isDev,
            env: import.meta.env.MODE,
            hasInternalFlag
        });
    },

    toggleView() {
        // Allow toggling if we're in development mode OR have internal flag
        if (this.isDev) {
            this.showInternal = !this.showInternal;
            
            if (this.showInternal) {
                localStorage.setItem('trackRecordInternal', 'true');
            } else {
                localStorage.removeItem('trackRecordInternal');
            }
        }

        console.log('View toggled:', {
            showInternal: this.showInternal,
            isDev: this.isDev
        });
    }
});

// Add Alpine extensions here
Alpine.data('themes', () => ({
    selectedTheme: localStorage.getItem('theme') || 'neon',
    init() {
        console.log('Themes component initialized:', {
            selectedTheme: this.selectedTheme,
            storedTheme: localStorage.getItem('theme')
        });

        // Set initial theme
        this.setTheme(this.selectedTheme);

        // Watch for theme changes
        this.$watch('selectedTheme', (value) => {
            console.log('Theme changed:', value);
            this.setTheme(value);
        });
    },
    setTheme(theme) {
        console.log('Setting theme:', theme);
        this.selectedTheme = theme;
        
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Set theme variables
        document.documentElement.style.setProperty('--theme-neon', theme === 'neon' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-acid', theme === 'acid' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-ghibli', theme === 'ghibli' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-valorant', theme === 'valorant' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-lemonade', theme === 'lemonade' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-lofi', theme === 'lofi' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-lofi-dark', theme === 'lofi-dark' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-tech', theme === 'tech' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-neontech', theme === 'neontech' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-neontech-light', theme === 'neontech-light' ? 'true' : 'false');
        document.documentElement.style.setProperty('--theme-tech-light', theme === 'tech-light' ? 'true' : 'false');
        
        // Set font family based on theme
        const fontFamilies = {
            neon: '"Chakra Petch", system-ui, sans-serif',
            acid: '"Space Grotesk", system-ui, sans-serif',
            ghibli: '"Amaranth", system-ui, sans-serif',
            valorant: '"Work Sans", system-ui, sans-serif',
            lemonade: '"Quicksand", system-ui, sans-serif',
            lofi: '"Space Mono", monospace',
            'lofi-dark': '"Space Mono", monospace',
            tech: '"JetBrains Mono", monospace',
            neontech: '"Share Tech Mono", monospace',
            'neontech-light': '"Share Tech Mono", monospace',
            'tech-light': '"JetBrains Mono", monospace'
        };
        
        document.documentElement.style.setProperty('--font-family', fontFamilies[theme]);
        
        // Store theme preference
        localStorage.setItem('theme', theme);
        
        console.log('Theme set:', {
            theme,
            fontFamily: fontFamilies[theme],
            dataTheme: document.documentElement.getAttribute('data-theme'),
            cssFontFamily: getComputedStyle(document.documentElement).getPropertyValue('--font-family')
        });
    }
}));

// Register components
Alpine.data('mobileMenu', () => ({
    mobileMenuOpen: false,
    navigationLinks: [
        { href: '/posts/', text: 'Blog' },
        { href: '/about/', text: 'About' },
        { href: '/contact/', text: 'Contact' },
        { href: '/donate/', text: 'Donate' }
    ],
    authLinks1: [
        { href: '/app/profile/', text: 'Profile', icon: 'user' },
        { href: '/app/settings/', text: 'Settings', icon: 'settings' },
        { href: '/app/dashboard/', text: 'Dashboard', icon: 'chart-bar' },
        { href: '/app/onboarding/', text: 'Onboarding', icon: 'user-plus' },
    ],
    authLinks2: [
        { href: '/app/collections/', text: 'Collections', icon: 'bookmark' },
        { href: '/app/likes/', text: 'Likes', icon: 'heart' },
    ],
    adminLinks: [
        { href: '/app/admin/', text: 'Admin Dashboard', icon: 'shield-check' },
        { href: '/app/admin/comments/', text: 'Moderate Comments', icon: 'message-circle' },
    ],
    init() {
        // Close mobile menu on window resize if screen becomes larger than mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // md breakpoint
                this.mobileMenuOpen = false;
            }
        });
    },
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }
}));

Alpine.data('landingPage', () => ({
    init() {
        // Initialize the store
        Alpine.store('landing').init();
    }
}));

// Donation form component
Alpine.data('donationForm', donationForm);

Alpine.data('articlesGrid', () => ({
    isMobile: window.innerWidth < 768,
    isLoading: false,
    currentPage: 0,
    hasMore: true,
    showBackToTop: false,
    totalPages: 0,

    init() {
        this.handleResize();
        // Initialize from pagination data
        if (window.paginationInfo) {
            this.currentPage = window.paginationInfo.currentPage;
            this.totalPages = window.paginationInfo.totalPages;
            console.log('Initialized pagination:', {
                currentPage: this.currentPage,
                totalPages: this.totalPages
            });
        }
    },

    async loadMoreArticles() {
        if (this.isLoading || !this.hasMore) return;
        this.isLoading = true;
        this.showBackToTop = false;

        // Get the current URL path
        const currentPath = window.location.pathname;
        const basePath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
        
        // Calculate next page number
        const nextPageNumber = this.currentPage + 1;
        
        // Check if we've reached the last page
        if (nextPageNumber >= this.totalPages) {
            console.log('Reached the last page');
            this.hasMore = false;
            this.showBackToTop = true;
            this.isLoading = false;
            return;
        }

        // Construct the next page URL based on 11ty's pagination
        const nextPageUrl = nextPageNumber === 1 ? 
            `${basePath}1/` : 
            `${basePath}${nextPageNumber}/`;

        console.log('Loading more articles from:', nextPageUrl, {
            currentPage: this.currentPage,
            nextPageNumber,
            totalPages: this.totalPages
        });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const response = await fetch(nextPageUrl, {
                signal: controller.signal
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No more articles available');
                    this.hasMore = false;
                    this.showBackToTop = true;
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newArticles = doc.getElementsByTagName('article');

            if (newArticles.length === 0) {
                console.log('No more articles to load');
                this.hasMore = false;
                this.showBackToTop = true;
                return;
            }

            // Append new articles to the grid
            Array.from(newArticles).forEach(article => {
                document.getElementById('articles-grid').appendChild(article);
            });

            this.currentPage++;
            this.showBackToTop = true;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request timed out');
            } else {
                console.log('No more articles available');
            }
            this.hasMore = false;
            this.showBackToTop = true;
        } finally {
            clearTimeout(timeoutId);
            this.isLoading = false;
        }
    },

    handleResize() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
        });
    },

    goToRandomPost() {
        if (window.allPosts && window.allPosts.length > 0) {
            const randomIndex = Math.floor(Math.random() * window.allPosts.length);
            const randomPost = window.allPosts[randomIndex];
            console.log('Going to random post:', randomPost.title);
            window.location.href = randomPost.url;
        } else {
            console.error('No posts available for random selection');
        }
    }
}));

// Credentials page component
Alpine.data('credentials', () => ({
    // Form state
    showLogin: false,
    loading: false,
    error: '',
    success: '',
    
    // Signup form data
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: '',
    
    // Login form data  
    loginEmail: '',
    loginPassword: '',

    init() {
        // Check URL parameters to determine which form to show and redirect URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const redirect = urlParams.get('redirect');
        
        // Store redirect URL for later use
        if (redirect && redirect !== '/credentials' && redirect !== '/credentials/') {
            localStorage.setItem('authReturnUrl', redirect);
            console.log('📍 Stored redirect URL:', redirect);
        }
        
        if (mode === 'login') {
            this.showLogin = true;
        } else if (mode === 'signup') {
            this.showLogin = false;
        }
        
        console.log('🔐 Credentials page initialized:', {
            mode: mode || 'default',
            showLogin: this.showLogin,
            redirectUrl: redirect || 'none'
        });
    },

    toggleForm() {
        this.showLogin = !this.showLogin;
        this.error = '';
        this.success = '';
        
        // Update URL to reflect current mode while preserving redirect parameter
        const newMode = this.showLogin ? 'login' : 'signup';
        const url = new URL(window.location);
        url.searchParams.set('mode', newMode);
        // Keep the redirect parameter if it exists
        const redirect = url.searchParams.get('redirect');
        if (redirect) {
            url.searchParams.set('redirect', redirect);
        }
        window.history.replaceState({}, '', url);
        
        console.log('🔄 Toggled form to:', newMode);
    },

    async handleGoogleAuth() {
        this.loading = true;
        this.error = '';
        this.success = '';
        console.log('🔵 Starting Google OAuth...', {
            redirectTo: window.location.origin + '/app/onboarding/',
            currentUrl: window.location.href
        });
        try {
            await Alpine.store('auth').signInWithGoogle({
                options: {
                    redirectTo: window.location.origin + '/app/onboarding/'
                }
            });
            this.success = 'Redirecting to Google...';
            console.log('✅ Google OAuth initiated successfully');
        } catch (err) {
            console.error('❌ Google OAuth failed:', err);
            this.error = err.message || 'Google sign in failed';
        } finally {
            this.loading = false;
        }
    },

    async handleGitHubAuth() {
        this.loading = true;
        this.error = '';
        this.success = '';
        try {
            await Alpine.store('auth').signInWithGitHub({
                options: {
                    redirectTo: window.location.origin + '/app/onboarding/'
                }
            });
            this.success = 'Redirecting to GitHub...';
        } catch (err) {
            this.error = err.message || 'GitHub sign in failed';
        } finally {
            this.loading = false;
        }
    },

    async handleSignup() {
        if (this.signupPassword !== this.signupConfirmPassword) {
            this.error = 'Passwords do not match';
            return;
        }
        this.loading = true;
        this.error = '';
        this.success = '';
        try {
            await Alpine.store('auth').signUpWithEmail(this.signupEmail, this.signupPassword);
            this.success = 'Account created! Please check your email to verify your account.';
            this.signupEmail = '';
            this.signupPassword = '';
            this.signupConfirmPassword = '';
            
            // Check if there's a return URL to redirect back to
            const returnUrl = localStorage.getItem('authReturnUrl');
            if (returnUrl && returnUrl !== '/credentials/' && returnUrl !== '/credentials') {
                console.log('🔄 Redirecting to stored return URL after signup:', returnUrl);
                localStorage.removeItem('authReturnUrl');
                window.location.href = returnUrl;
            } else {
                // Redirect to onboarding page
                window.location.href = '/app/onboarding/';
            }
        } catch (err) {
            this.error = err.message || 'Sign up failed';
        } finally {
            this.loading = false;
        }
    },

    async handleLogin() {
        this.loading = true;
        this.error = '';
        this.success = '';
        try {
            await Alpine.store('auth').signInWithEmail(this.loginEmail, this.loginPassword);
            this.success = 'Successfully signed in!';
            this.loginEmail = '';
            this.loginPassword = '';
            // Check if there's a return URL to redirect back to
            const returnUrl = localStorage.getItem('authReturnUrl');
            if (returnUrl && returnUrl !== '/credentials/' && returnUrl !== '/credentials') {
                console.log('🔄 Redirecting to stored return URL:', returnUrl);
                localStorage.removeItem('authReturnUrl');
                window.location.href = returnUrl;
            } else {
                // Redirect to dashboard
                window.location.href = '/app/dashboard/';
            }
        } catch (err) {
            this.error = err.message || 'Sign in failed';
        } finally {
            this.loading = false;
        }
    }
}));

// Comment form component
Alpine.data('commentForm', () => ({
  user: null,
  debug: false,
  isSubmittingAuth: false,
  isSubmittingGuest: false,
  comments: [],
  loadingComments: false,
  
  init() {
    this.checkUser();
    this.loadComments();
    
    // Retry after Alpine is fully initialized
    setTimeout(() => {
      this.checkUser();
    }, 100);
    
    // Watch for auth changes using a different approach
    setTimeout(() => {
      if (window.Alpine && Alpine.store('auth')) {
        // Set up interval to check for auth changes
        setInterval(() => {
          this.checkUser();
        }, 1000);
      }
    }, 500);
    
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        this.checkUser();
      }
    });
  },
  
  checkUser() {
    if (this.debug) console.log('🔍 Checking user state...');
    
    // First try localStorage (more reliable for immediate access)
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id) {
          this.user = parsedUser;
          if (this.debug) console.log('💾 User from localStorage:', this.user);
          return;
        }
      } catch (e) {
        if (this.debug) console.log('❌ Error parsing user data:', e);
      }
    }
    
    // Fallback to Alpine auth store
    if (window.Alpine && Alpine.store('auth')) {
      const authStore = Alpine.store('auth');
      if (this.debug) console.log('🔐 Auth store state:', {
        isAuthenticated: authStore.isAuthenticated,
        hasUser: !!authStore.user,
        userName: authStore.userName,
        userEmail: authStore.userEmail
      });
      
      if (authStore.isAuthenticated && authStore.user) {
        this.user = {
          id: authStore.user.id,
          email: authStore.userEmail,
          name: authStore.userName,
          avatar: authStore.userAvatar || '/assets/images/profile.jpeg'
        };
        if (this.debug) console.log('🔐 User from auth store:', this.user);
        
        // Also update localStorage to sync
        localStorage.setItem('user', JSON.stringify(this.user));
        return;
      }
    }
    
    // No user found
    this.user = null;
    if (this.debug) console.log('👤 No user found in any source');
  },
  
  toggleDebug() {
    this.debug = !this.debug;
    this.checkUser();
  },
  
  signOut() {
    this.user = null;
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    if (Alpine.store('auth')) {
      Alpine.store('auth').signOut();
    }
  },
  
  async loadComments() {
    if (this.loadingComments) return;
    
    const postUrl = window.location.pathname;
    this.loadingComments = true;
    
    try {
      const response = await fetch(`/api/comments?post_url=${encodeURIComponent(postUrl)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.comments = result.comments || [];
        if (this.debug) console.log('📝 Loaded comments:', this.comments);
      } else {
        console.error('Failed to load comments:', result.error);
        this.comments = [];
      }
    } catch (error) {
      console.error('Error loading comments:', {
        message: error.message,
        stack: error.stack
      });
      this.comments = [];
      
      // Show user-friendly error if needed
      if (this.debug) {
        console.log('💡 Debug: Check that your API environment variables are set correctly');
      }
    } finally {
      this.loadingComments = false;
    }
  },
  
  async submitAuthForm(event) {
    event.preventDefault();
    this.isSubmittingAuth = true;
    
    const form = event.target;
    const formData = new FormData(form);
    const messageContainer = document.getElementById('comment-messages-auth');
    
    const requestData = {
      post_url: formData.get('post_url'),
      post_title: formData.get('post_title'),
      user_id: formData.get('user_id'),
      name: formData.get('name'),
      email: formData.get('email'),
      avatar: formData.get('avatar'),
      comment: formData.get('comment')
    };
    
    console.log('🚀 Submitting comment with data:', requestData);
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Show success toast
        if (window.notificationStore) {
          window.notificationStore.success('Comment published successfully! 🎉', {
            duration: 5000
          });
        }
        
        messageContainer.innerHTML = `
          <div class="alert alert-success">
            <span class="icon-[tabler--check-circle] size-5"></span>
            <span>${result.message}</span>
          </div>
        `;
        form.reset();
        // Reload comments to show the new one (if auto-approved)
        setTimeout(() => this.loadComments(), 1000);
      } else {
        throw new Error(result.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      
      // Show error toast
      if (window.notificationStore) {
        window.notificationStore.error(`Failed to submit comment: ${error.message}`, {
          duration: 6000
        });
      }
      
      messageContainer.innerHTML = `
        <div class="alert alert-error">
          <span class="icon-[tabler--x-circle] size-5"></span>
          <span>Error: ${error.message}</span>
        </div>
      `;
    } finally {
      this.isSubmittingAuth = false;
    }
  },
  
  async submitGuestForm(event) {
    event.preventDefault();
    this.isSubmittingGuest = true;
    
    const form = event.target;
    const formData = new FormData(form);
    const messageContainer = document.getElementById('comment-messages');
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_url: formData.get('post_url'),
          post_title: formData.get('post_title'),
          name: formData.get('name'),
          email: formData.get('email'),
          comment: formData.get('comment'),
          terms: formData.get('terms') === 'on'
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Show success toast
        if (window.notificationStore) {
          window.notificationStore.success('Comment submitted successfully! 📝 It will be visible after moderation.', {
            duration: 6000
          });
        }
        
        messageContainer.innerHTML = `
          <div class="alert alert-success">
            <span class="icon-[tabler--check-circle] size-5"></span>
            <span>${result.message}</span>
          </div>
        `;
        form.reset();
        // Reload comments to show the new one (if auto-approved)
        setTimeout(() => this.loadComments(), 1000);
      } else {
        throw new Error(result.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      
      // Show error toast
      if (window.notificationStore) {
        window.notificationStore.error(`Failed to submit comment: ${error.message}`, {
          duration: 6000
        });
      }
      
      messageContainer.innerHTML = `
        <div class="alert alert-error">
          <span class="icon-[tabler--x-circle] size-5"></span>
          <span>Error: ${error.message}</span>
        </div>
      `;
    } finally {
      this.isSubmittingGuest = false;
    }
  }
}));

// Admin Comments Component
Alpine.data('commentAdmin', () => ({
  // State
  comments: [],
  filteredComments: [],
  loading: true,
  processing: false,
  
  // Filters
  filterStatus: 'all', // 'all', 'pending', 'approved'
  searchQuery: '',
  searchTimeout: null,

  // Stats
  pendingCount: 0,
  approvedCount: 0,
  totalCount: 0,

  // Delete modal state
  commentToDelete: null,
  deleteModalInstance: null,

  // Toast messages
  toast: {
    show: false,
    message: '',
    type: 'success'
  },

  async init() {
    // Admin check is handled by admin-guard layout
    // Wait for auth to be ready before loading comments
    await this.waitForAuth();
    await this.loadComments();

    // Watch for auth changes and reload comments
    this.$watch('$store.auth.session', () => {
      if (Alpine.store('auth').session?.access_token) {
        this.loadComments();
      }
    });
  },

  async waitForAuth() {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (!Alpine.store('auth').loading && Alpine.store('auth').session?.access_token) {
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  },

  async loadComments() {
    this.loading = true;
    
    try {
      const authStore = Alpine.store('auth');
      const token = authStore.session?.access_token;
      
      if (!token) {
        console.error('Admin loadComments - No access token available:', {
          hasSession: !!authStore.session,
          isAuthenticated: authStore.isAuthenticated,
          loading: authStore.loading,
          user: authStore.user
        });
        throw new Error('No access token available. Please sign in again.');
      }

      const params = new URLSearchParams({
        status: this.filterStatus,
        limit: 100,
        offset: 0
      });

      if (this.searchQuery.trim()) {
        params.append('search', this.searchQuery.trim());
      }

      const response = await fetch(`/api/admin-comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load comments');
      }

      const data = await response.json();
      this.comments = data.comments || [];
      this.filteredComments = this.comments;
      
      // Update stats
      if (data.stats) {
        this.totalCount = data.stats.total;
        this.approvedCount = data.stats.approved;
        this.pendingCount = data.stats.pending;
      }

    } catch (error) {
      console.error('Error loading comments:', error);
      this.showToast('Failed to load comments: ' + error.message, 'error');
    } finally {
      this.loading = false;
    }
  },

  async approveComment(commentId) {
    await this.updateComment(commentId, 'approve');
  },

  async unapproveComment(commentId) {
    await this.updateComment(commentId, 'unapprove');
  },

  async updateComment(commentId, action) {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      const token = Alpine.store('auth').session?.access_token;
      if (!token) {
        throw new Error('No access token');
      }

      const response = await fetch('/api/admin-comments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: commentId,
          action: action
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      const data = await response.json();
      
      // Update the comment in our local state
      const commentIndex = this.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        this.comments[commentIndex] = data.comment;
        this.filterComments();
        this.updateStats();
      }

      this.showToast(
        action === 'approve' ? 'Comment approved successfully' : 'Comment unapproved successfully', 
        'success'
      );

    } catch (error) {
      console.error('Error updating comment:', error);
      this.showToast('Failed to update comment: ' + error.message, 'error');
    } finally {
      this.processing = false;
    }
  },

  openDeleteModal(comment) {
    this.commentToDelete = comment;
    
    // Initialize modal if not already done
    if (!this.deleteModalInstance) {
      this.deleteModalInstance = new HSOverlay(document.querySelector('#delete-modal'));
    }
    
    // Open the modal
    this.deleteModalInstance.open();
  },

  closeDeleteModal() {
    if (this.deleteModalInstance) {
      this.deleteModalInstance.close();
    }
    this.commentToDelete = null;
  },

  async confirmDelete() {
    if (!this.commentToDelete || this.processing) return;
    
    const commentId = this.commentToDelete.id;
    this.processing = true;
    
    try {
      const token = Alpine.store('auth').session?.access_token;
      if (!token) {
        throw new Error('No access token');
      }

      const response = await fetch('/api/admin-comments', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: commentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Remove the comment from our local state
      this.comments = this.comments.filter(c => c.id !== commentId);
      this.filterComments();
      this.updateStats();

      // Close the modal
      this.closeDeleteModal();

      this.showToast('Comment deleted successfully', 'success');

    } catch (error) {
      console.error('Error deleting comment:', error);
      this.showToast('Failed to delete comment: ' + error.message, 'error');
    } finally {
      this.processing = false;
    }
  },

  async deleteComment(commentId) {
    // Legacy method - kept for backwards compatibility
    // Now redirects to modal approach
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      this.openDeleteModal(comment);
    }
  },

  filterComments() {
    let filtered = [...this.comments];

    // Apply status filter
    if (this.filterStatus === 'approved') {
      filtered = filtered.filter(c => c.approved);
    } else if (this.filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.approved);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.comment.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.post_title.toLowerCase().includes(query)
      );
    }

    this.filteredComments = filtered;
  },

  debounceSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filterComments();
    }, 300);
  },

  updateStats() {
    this.totalCount = this.comments.length;
    this.approvedCount = this.comments.filter(c => c.approved).length;
    this.pendingCount = this.comments.filter(c => !c.approved).length;
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  showToast(message, type = 'success') {
    // Use the new notification store instead of custom toast
    notificationStore.show(message, type);
  }
}));

// import calendar from './calendar';
// Alpine.data('calendarComponent', calendar);

// Make notificationStore globally available
window.notificationStore = notificationStore;

// Register global Alpine directive for notification testing BEFORE Alpine.start()
Alpine.directive('notify', (el, { expression }, { evaluate }) => {
    el.addEventListener('click', () => {
        const config = evaluate(expression);
        const message = config.message || 'Test notification';
        const type = config.type || 'info';
        const options = config.options || {};
        
        notificationStore.show(message, type, options);
    });
});

// Start Alpine
window.Alpine = Alpine;
Alpine.start();

// Initialize store after Alpine is started
document.addEventListener('alpine:init', () => {
    console.log('Alpine:init event fired');
    Alpine.store('landing').init();
    Alpine.store('auth').init();
});

console.log('Track Record app initialized with notification system');

// Debug: Test notification store after a short delay
setTimeout(() => {
    console.log('Testing notification store:', window.notificationStore);
    if (window.notificationStore) {
        console.log('Notification store is available');
        // Uncomment the line below to test if notifications work at all
        // window.notificationStore.info('Notification system loaded successfully!');
    } else {
        console.error('Notification store is not available!');
    }
}, 1000);
