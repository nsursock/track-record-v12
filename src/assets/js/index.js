import '../css/index.css';

import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
 
Alpine.plugin(intersect)

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
        
        // Set font family based on theme
        const fontFamilies = {
            neon: '"Chakra Petch", system-ui, sans-serif',
            acid: '"Space Grotesk", system-ui, sans-serif',
            ghibli: '"Amaranth", system-ui, sans-serif',
            valorant: '"Work Sans", system-ui, sans-serif',
            lemonade: '"Quicksand", system-ui, sans-serif',
            lofi: '"Space Mono", monospace',
            'lofi-dark': '"Space Mono", monospace',
            tech: '"JetBrains Mono", monospace'
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
    }
}));

// Start Alpine
window.Alpine = Alpine;
Alpine.start();

// Initialize store after Alpine is started
document.addEventListener('alpine:init', () => {
    console.log('Alpine:init event fired');
    Alpine.store('landing').init();
});
