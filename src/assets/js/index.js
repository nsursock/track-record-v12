import '../css/index.css';

import Alpine from 'alpinejs'
 
window.Alpine = Alpine

// Add Alpine extensions here
Alpine.data('themes', () => ({
    selectedTheme: localStorage.getItem('theme') || 'cyberpunk',
    init() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.selectedTheme);

        // Watch for theme changes
        this.$watch('selectedTheme', (value) => {
            document.documentElement.setAttribute('data-theme', value);
            localStorage.setItem('theme', value);
        });
    },
    setTheme(theme) {
        this.selectedTheme = theme;
    }
}))

// Create a store for landing page state
Alpine.store('landing', {
    showInternal: false,
    isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    init() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const hasInternalParam = urlParams.has('internal');
        
        // If URL has internal parameter, set localStorage
        if (hasInternalParam) {
            localStorage.setItem('trackRecordInternal', 'true');
        }
        
        // Check localStorage for persistent access
        this.showInternal = localStorage.getItem('trackRecordInternal') === 'true';
        
        // If in development mode, always show internal view
        if (this.isDev) {
            this.showInternal = true;
        }
    },

    toggleView() {
        this.showInternal = !this.showInternal;
        
        if (this.showInternal) {
            localStorage.setItem('trackRecordInternal', 'true');
        } else {
            localStorage.removeItem('trackRecordInternal');
        }
    }
});
 
document.addEventListener('alpine:init', () => {
  console.log('Alpine:init event fired');

  Alpine.data('mobileMenu', () => ({
    mobileMenuOpen: false,
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
});

// Start Alpine
Alpine.start();
console.log('Alpine started');
