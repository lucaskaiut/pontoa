class AnalyticsService {
    constructor() {
        this.providers = [];
    }

    registerProvider(provider) {
        this.providers.push(provider);
    }

    trackEvent(event) {
        this.providers.forEach(provider => {
            try {
                provider(event);
            } catch (error) {
                console.error('Error tracking event:', error);
            }
        });
    }

    trackSignUp(params = {}) {
        this.trackEvent({
            event: 'sign_up',
            method: params.method || 'email',
            page_type: params.page_type || 'registration',
            ...params,
        });
    }

    trackCTA(params) {
        this.trackEvent({
            event: 'cta_click',
            page_type: params.page_type || 'landing_page',
            ...params,
        });
    }
}

const googleAnalyticsProvider = (event) => {
    if (typeof window !== 'undefined' && window.gtag) {
        const { event: eventName, ...params } = event;
        window.gtag('event', eventName, params);
    }
};

export const analytics = new AnalyticsService();

analytics.registerProvider(googleAnalyticsProvider);
