// Notification Store using Notyf
import { Notyf } from 'notyf';

class NotificationStore {
    constructor() {
        this.notyf = null;
        this.init();
    }
    
    init() {
        // Get current theme for styling
        const htmlElement = document.documentElement;
        const currentTheme = htmlElement.getAttribute('data-theme') || 'neon';
        
        // Define theme-specific configurations
        const themeConfigs = this.getThemeConfigs();
        const themeConfig = themeConfigs[currentTheme] || themeConfigs.neon;
        
        // Initialize Notyf with custom configuration
        this.notyf = new Notyf({
            duration: 4000,
            position: {
                x: 'right',
                y: 'top'
            },
            dismissible: true,
            ripple: true,
            types: [
                {
                    type: 'success',
                    background: themeConfig.success,
                    icon: { 
                        className: 'icon-[tabler--check]', 
                        tagName: 'i' 
                    },
                    color: '#ffffff'
                },
                {
                    type: 'error',
                    background: themeConfig.error,
                    icon: { 
                        className: 'icon-[tabler--x]', 
                        tagName: 'i' 
                    },
                    color: '#ffffff'
                },
                {
                    type: 'warning',
                    background: themeConfig.warning,
                    icon: { 
                        className: 'icon-[tabler--alert-triangle]', 
                        tagName: 'i' 
                    },
                    color: '#ffffff'
                },
                {
                    type: 'info',
                    background: themeConfig.info,
                    icon: { 
                        className: 'icon-[tabler--info-circle]', 
                        tagName: 'i' 
                    },
                    color: '#ffffff'
                },
                {
                    type: 'primary',
                    background: themeConfig.primary,
                    icon: { 
                        className: 'icon-[tabler--bell]', 
                        tagName: 'i' 
                    },
                    color: '#ffffff'
                }
            ]
        });
        
        // Listen for theme changes and reinitialize
        this.observeThemeChanges();
    }
    
    getThemeConfigs() {
        return {
            neon: {
                primary: '#6366f1',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            },
            acid: {
                primary: '#22c55e',
                success: '#16a34a',
                error: '#dc2626',
                warning: '#eab308',
                info: '#0ea5e9'
            },
            ghibli: {
                primary: '#8b5cf6',
                success: '#059669',
                error: '#dc2626',
                warning: '#d97706',
                info: '#0284c7'
            },
            valorant: {
                primary: '#14b8a6',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#06b6d4'
            },
            lemonade: {
                primary: '#eab308',
                success: '#22c55e',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            },
            lofi: {
                primary: '#f97316',
                success: '#22c55e',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            },
            'lofi-dark': {
                primary: '#f97316',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            },
            tech: {
                primary: '#06b6d4',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#0ea5e9'
            },
            'tech-light': {
                primary: '#0891b2',
                success: '#059669',
                error: '#dc2626',
                warning: '#d97706',
                info: '#0284c7'
            },
            neontech: {
                primary: '#8b5cf6',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            },
            'neontech-light': {
                primary: '#7c3aed',
                success: '#059669',
                error: '#dc2626',
                warning: '#d97706',
                info: '#0284c7'
            }
        };
    }
    
    observeThemeChanges() {
        // Create a MutationObserver to watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.init(); // Reinitialize with new theme
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    // Public methods for showing notifications
    success(message, options = {}) {
        return this.notyf.open({
            type: 'success',
            message,
            duration: options.duration || 4000,
            ripple: options.ripple !== false,
            dismissible: options.dismissible !== false,
            ...options
        });
    }
    
    error(message, options = {}) {
        return this.notyf.open({
            type: 'error',
            message,
            duration: options.duration || 6000,
            ripple: options.ripple !== false,
            dismissible: options.dismissible !== false,
            ...options
        });
    }
    
    warning(message, options = {}) {
        return this.notyf.open({
            type: 'warning',
            message,
            duration: options.duration || 5000,
            ripple: options.ripple !== false,
            dismissible: options.dismissible !== false,
            ...options
        });
    }
    
    info(message, options = {}) {
        return this.notyf.open({
            type: 'info',
            message,
            duration: options.duration || 4000,
            ripple: options.ripple !== false,
            dismissible: options.dismissible !== false,
            ...options
        });
    }
    
    primary(message, options = {}) {
        return this.notyf.open({
            type: 'primary',
            message,
            duration: options.duration || 4000,
            ripple: options.ripple !== false,
            dismissible: options.dismissible !== false,
            ...options
        });
    }
    
    // Generic notification method
    show(message, type = 'info', options = {}) {
        switch (type) {
            case 'success':
                return this.success(message, options);
            case 'error':
                return this.error(message, options);
            case 'warning':
                return this.warning(message, options);
            case 'primary':
                return this.primary(message, options);
            default:
                return this.info(message, options);
        }
    }
    
    // Clear all notifications
    dismissAll() {
        this.notyf.dismissAll();
    }
}

// Create and export a singleton instance
const notificationStore = new NotificationStore();
export default notificationStore; 