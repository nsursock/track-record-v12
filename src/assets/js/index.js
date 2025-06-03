import '../css/index.css';

import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { Calendar } from 'fullcalendar'
 
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

// Simple working Alpine + FullCalendar component
Alpine.data('calendarComponent', () => ({
  showModal: false,
  modalTitle: '',
  eventTitle: '',
  selectedEvent: null,
  selectedDateInfo: null,
  calendar: null,
  tasks: [], // Start with empty array, will be populated from YAML

  // Fetch tasks from YAML data
  async fetchTasks() {
    try {
      // Try to load tasks data directly 
      const tasksData = {
        "tasks": [
          {
            "title": "Strategic Planning: Define core mission and target audience personas",
            "start": "2025-06-03T02:00:00",
            "end": "2025-06-03T04:00:00",
            "classNames": ["fc-event-primary"]
          },
          {
            "title": "Platform Setup: Configure CMS and deploy initial site structure",
            "start": "2025-06-03T08:00:00",
            "end": "2025-06-03T11:00:00",
            "classNames": ["fc-event-info"]
          },
          {
            "title": "Content Strategy: Draft 3 pillar articles and newsletter framework",
            "start": "2025-06-03T19:00:00",
            "end": "2025-06-03T22:00:00",
            "classNames": ["fc-event-success"]
          },
          {
            "title": "Growth Planning: Set up analytics and conversion tracking",
            "start": "2025-06-04T02:00:00",
            "end": "2025-06-04T04:00:00",
            "classNames": ["fc-event-warning"]
          },
          {
            "title": "Community Building: Create and optimize social media profiles",
            "start": "2025-06-04T08:00:00",
            "end": "2025-06-04T11:00:00",
            "classNames": ["fc-event-secondary"]
          },
          {
            "title": "Content Creation: Write and polish first pillar article",
            "start": "2025-06-04T19:00:00",
            "end": "2025-06-04T22:00:00",
            "classNames": ["fc-event-primary"]
          },
          {
            "title": "Technical Setup: Implement newsletter system and automation",
            "start": "2025-06-05T02:00:00",
            "end": "2025-06-05T04:00:00",
            "classNames": ["fc-event-info"]
          },
          {
            "title": "Content Planning: Create 4-week editorial calendar",
            "start": "2025-06-05T08:00:00",
            "end": "2025-06-05T11:00:00",
            "classNames": ["fc-event-success"]
          },
          {
            "title": "Growth Strategy: Research and implement SEO best practices",
            "start": "2025-06-05T19:00:00",
            "end": "2025-06-05T22:00:00",
            "classNames": ["fc-event-warning"]
          },
          {
            "title": "Content Creation: Draft second pillar article",
            "start": "2025-06-06T02:00:00",
            "end": "2025-06-06T04:00:00",
            "classNames": ["fc-event-primary"]
          },
          {
            "title": "Community Engagement: Plan and schedule first social media campaign",
            "start": "2025-06-06T08:00:00",
            "end": "2025-06-06T11:00:00",
            "classNames": ["fc-event-secondary"]
          },
          {
            "title": "Technical Optimization: Implement performance improvements",
            "start": "2025-06-06T19:00:00",
            "end": "2025-06-06T22:00:00",
            "classNames": ["fc-event-info"]
          },
          {
            "title": "Analytics Review: Analyze initial traffic and engagement metrics",
            "start": "2025-06-07T02:00:00",
            "end": "2025-06-07T04:00:00",
            "classNames": ["fc-event-warning"]
          },
          {
            "title": "Content Refinement: Polish and optimize existing articles",
            "start": "2025-06-07T08:00:00",
            "end": "2025-06-07T11:00:00",
            "classNames": ["fc-event-success"]
          },
          {
            "title": "Growth Tactics: Implement A/B testing and conversion optimization",
            "start": "2025-06-07T19:00:00",
            "end": "2025-06-07T22:00:00",
            "classNames": ["fc-event-warning"]
          },
          {
            "title": "Final Review: Audit all systems and content for launch",
            "start": "2025-06-08T02:00:00",
            "end": "2025-06-08T04:00:00",
            "classNames": ["fc-event-primary"]
          },
          {
            "title": "Launch Prep: Finalize all launch materials and checklists",
            "start": "2025-06-08T08:00:00",
            "end": "2025-06-08T11:00:00",
            "classNames": ["fc-event-info"]
          },
          {
            "title": "Community Activation: Prepare launch announcement and outreach",
            "start": "2025-06-08T19:00:00",
            "end": "2025-06-08T22:00:00",
            "classNames": ["fc-event-secondary"]
          }
        ]
      };

      this.tasks = tasksData.tasks;
    } catch (error) {
      console.warn('Could not load tasks data, using fallback tasks');
      // Fallback tasks if loading fails
      this.tasks = [
        {
          title: 'Define the mission, voice, and target reader',
          start: '2025-06-03T08:00:00',
          end: '2025-06-03T11:00:00',
          classNames: ['fc-event-primary']
        }
      ];
    }
  },
  
  async initCalendar() {
    // Load tasks first
    await this.fetchTasks();
    
    const self = this;
    const calendarEl = document.getElementById('calendar-custom');
    
    this.calendar = new Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      initialDate: new Date().toISOString().split('T')[0],
      editable: true,
      selectable: true,
      headerToolbar: {
        left: 'prev,next title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      buttonText: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        list: 'List'
      },
      events: self.tasks, // Use tasks loaded from YAML
      select: function(info) {
        self.selectedEvent = null;
        self.selectedDateInfo = info;
        self.modalTitle = self.formatDate(info.start);
        self.eventTitle = '';
        self.showModal = true;
      },
      eventClick: function(info) {
        self.selectedEvent = info.event;
        self.modalTitle = self.formatDate(info.event.start);
        self.eventTitle = info.event.title;
        self.showModal = true;
      }
    });
    
    this.calendar.render();
  },
  
  formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  },
  
  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
    this.selectedDateInfo = null;
    this.eventTitle = '';
  },
  
  saveEvent() {
    if (this.eventTitle) {
      if (this.selectedEvent) {
        this.selectedEvent.setProp('title', this.eventTitle);
      } else if (this.selectedDateInfo) {
        this.calendar.addEvent({
          title: this.eventTitle,
          start: this.selectedDateInfo.startStr,
          end: this.selectedDateInfo.endStr,
          allDay: true,
          classNames: ['fc-event-primary']
        });
      }
      this.closeModal();
    }
  }
}));

// NOTE: In your HTML, use x-data="calendarComponent()" (with parentheses) for Alpine 3+ compatibility.
// Example: <div x-data="calendarComponent()" x-init="initCalendar()">...</div>

// Start Alpine
window.Alpine = Alpine;
Alpine.start();

// Initialize store after Alpine is started
document.addEventListener('alpine:init', () => {
    console.log('Alpine:init event fired');
    Alpine.store('landing').init();
});
