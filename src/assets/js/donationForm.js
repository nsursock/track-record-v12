// Import donation functionality
import { loadStripe } from '@stripe/stripe-js';
import notificationStore from './notificationStore.js';

// Donation form component
export default () => ({
    // Form state
    donationType: 'one-time',
    selectedAmount: 25,
    customAmount: '',
    loading: false,
    
    // Preset amounts
    presetAmounts: [10, 25, 50, 100],
    
    // Donor information
    donorInfo: {
        firstName: '',
        lastName: '',
        email: ''
    },
    
    // Stripe elements
    cardNumberElement: null,
    cardExpiryElement: null,
    cardCvcElement: null,
    stripe: null,
    
    // Initialize Stripe Elements
    async init() {
        console.log('Donation form initialized');
        await this.initStripeElements();
    },
    
    async initStripeElements() {
        try {
            // Initialize Stripe
            this.stripe = await loadStripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here');
            
            if (!this.stripe) {
                console.error('Stripe not loaded');
                return;
            }
            
            // Get computed styles for better theme integration
            const computedStyle = getComputedStyle(document.documentElement);
            const htmlElement = document.documentElement;
            const theme = htmlElement.getAttribute('data-theme') || 'light';
            
            // More comprehensive theme detection and stronger colors  
            const lightThemes = ['neontech-light', 'tech-light', 'lemonade', 'ghibli'];
            const isDarkTheme = (theme.includes('dark') || theme === 'black' || theme === 'neon' || theme === 'tech' || theme === 'valorant' || theme === 'neontech') && !lightThemes.includes(theme);
            
            console.log('Stripe theme detection:', { theme, isDarkTheme });
            
            // Common styling for all elements
            const elementStyle = {
                base: {
                    fontSize: '16px',
                    color: isDarkTheme ? '#ffffff' : '#000000',
                    fontFamily: computedStyle.getPropertyValue('--font-family') || 'system-ui, sans-serif',
                    fontWeight: '500',
                    '::placeholder': {
                        color: isDarkTheme ? '#a1a1aa' : '#71717a',
                    },
                    backgroundColor: 'transparent',
                    iconColor: isDarkTheme ? '#e4e4e7' : '#27272a',
                },
                complete: {
                    color: '#16a34a',
                    iconColor: '#16a34a',
                },
                invalid: {
                    color: '#dc2626',
                    iconColor: '#dc2626',
                }
            };
            
            // Create separate elements
            const elements = this.stripe.elements();
            
            // Card number element
            this.cardNumberElement = elements.create('cardNumber', {
                style: elementStyle,
                placeholder: '1234 1234 1234 1234'
            });
            
            // Card expiry element
            this.cardExpiryElement = elements.create('cardExpiry', {
                style: elementStyle,
                placeholder: 'MM / YY'
            });
            
            // Card CVC element
            this.cardCvcElement = elements.create('cardCvc', {
                style: elementStyle,
                placeholder: 'CVC'
            });
            
            // Mount the elements
            this.cardNumberElement.mount('#card-number-element');
            this.cardExpiryElement.mount('#card-expiry-element');
            this.cardCvcElement.mount('#card-cvc-element');
            
            // Handle real-time validation errors from all card elements
            const displayError = document.getElementById('card-errors');
            
            [this.cardNumberElement, this.cardExpiryElement, this.cardCvcElement].forEach(element => {
                element.on('change', (event) => {
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });
            });
        } catch (error) {
            console.error('Error initializing Stripe:', error);
        }
    },
    
    // Get the final amount for donation
    getFinalAmount() {
        if (this.customAmount && this.customAmount > 0) {
            return parseInt(this.customAmount);
        }
        return this.selectedAmount || 0;
    },
    
    // Validate form
    isFormValid() {
        return this.getFinalAmount() > 0 && 
               this.donorInfo.firstName.trim() && 
               this.donorInfo.lastName.trim() && 
               this.donorInfo.email.trim() && 
               this.isValidEmail(this.donorInfo.email);
    },
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Submit donation
    async submitDonation() {
        if (!this.isFormValid()) {
            this.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        this.loading = true;
        
        try {
            const amount = this.getFinalAmount();
            
            if (this.donationType === 'one-time') {
                await this.processOneTimePayment(amount);
            } else {
                await this.processSubscription(amount);
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification('Payment failed. Please try again.', 'error');
        } finally {
            this.loading = false;
        }
    },
    
    // Process one-time payment
    async processOneTimePayment(amount) {
        try {
            // Create payment intent on server
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    currency: 'usd',
                    donor: this.donorInfo
                })
            });
            
            const { clientSecret, error } = await response.json();
            
            if (error) {
                throw new Error(error);
            }
            
            // Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardNumberElement,
                    billing_details: {
                        name: `${this.donorInfo.firstName} ${this.donorInfo.lastName}`,
                        email: this.donorInfo.email,
                    },
                }
            });
            
            if (stripeError) {
                throw new Error(stripeError.message);
            }
            
            if (paymentIntent.status === 'succeeded') {
                this.showSuccessMessage('one-time', amount);
                this.resetForm();
            }
        } catch (error) {
            throw error;
        }
    },
    
    // Process subscription
    async processSubscription(amount) {
        try {
            // Create subscription on server
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    donor: this.donorInfo
                })
            });
            
            const { clientSecret, subscriptionId, error } = await response.json();
            
            if (error) {
                throw new Error(error);
            }
            
            // Confirm subscription payment with Stripe
            const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardNumberElement,
                    billing_details: {
                        name: `${this.donorInfo.firstName} ${this.donorInfo.lastName}`,
                        email: this.donorInfo.email,
                    },
                }
            });
            
            if (stripeError) {
                throw new Error(stripeError.message);
            }
            
            if (paymentIntent.status === 'succeeded') {
                this.showSuccessMessage('monthly', amount);
                this.resetForm();
            }
        } catch (error) {
            throw error;
        }
    },
    
    // Show success message
    showSuccessMessage(type, amount) {
        const message = type === 'monthly' 
            ? `Thank you! Your monthly donation of $${amount} has been set up successfully.`
            : `Thank you! Your donation of $${amount} has been processed successfully.`;
        
        this.showNotification(message, 'success');
        
        // Optionally redirect to a thank you page
        setTimeout(() => {
            window.location.href = `/donate/thank-you/?type=${type}&amount=${amount}`;
        }, 2000);
    },
    
    // Show notification using Notyf store
    showNotification(message, type = 'info', options = {}) {
        return notificationStore.show(message, type, options);
    },
    
    // Reset form
    resetForm() {
        this.donationType = 'one-time';
        this.selectedAmount = 25;
        this.customAmount = '';
        this.donorInfo = {
            firstName: '',
            lastName: '',
            email: ''
        };
        
        // Clear Stripe elements
        if (this.cardNumberElement) {
            this.cardNumberElement.clear();
        }
        if (this.cardExpiryElement) {
            this.cardExpiryElement.clear();
        }
        if (this.cardCvcElement) {
            this.cardCvcElement.clear();
        }
        
        // Clear any error messages
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}); 