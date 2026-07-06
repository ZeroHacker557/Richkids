window.META_PIXEL_ID = '3674548846025688';

/**
 * Ensures fbq is defined and window is available before tracking
 * @param {string} trackType - 'track' or 'trackCustom'
 * @param {string} eventName - Event name
 * @param {Object} [params] - Additional parameters
 */
const trackEvent = (trackType, eventName, params = {}) => {
  if (typeof window === 'undefined') return; // SSR guard

  if (!window.fbq) {
    console.warn('Meta Pixel is not initialized yet.');
    return;
  }

  if (Object.keys(params).length > 0) {
    window.fbq(trackType, eventName, params);
  } else {
    window.fbq(trackType, eventName);
  }
};

let pageViewTrackedUrl = '';

/**
 * Tracks a PageView event. Prevents duplicate firing on the same URL.
 */
window.trackPageView = () => {
  if (typeof window === 'undefined') return;
  const currentUrl = window.location.href;
  if (pageViewTrackedUrl === currentUrl) return;

  pageViewTrackedUrl = currentUrl;
  trackEvent('track', 'PageView');
};

window.trackViewContent = (params = {}) => {
  trackEvent('track', 'ViewContent', params);
};

window.trackSearch = (searchTerm) => {
  trackEvent('track', 'Search', { search_string: searchTerm });
};

window.trackAddToCart = (value, currency = 'UZS') => {
  trackEvent('track', 'AddToCart', { value, currency });
};

window.trackInitiateCheckout = (value, currency = 'UZS') => {
  trackEvent('track', 'InitiateCheckout', { value, currency });
};

window.trackAddPaymentInfo = () => {
  trackEvent('track', 'AddPaymentInfo');
};

window.trackPurchase = (value, currency = 'UZS', orderId = '') => {
  const payload = { value, currency };
  if (orderId) payload.order_id = orderId;
  trackEvent('track', 'Purchase', payload);
};

window.trackLead = () => {
  trackEvent('track', 'Lead');
};

window.trackCompleteRegistration = () => {
  trackEvent('track', 'CompleteRegistration');
};

window.trackContact = () => {
  trackEvent('track', 'Contact');
};
