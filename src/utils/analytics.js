/**
 * Send a custom event to Google Analytics (GA4)
 * @param {string} eventName - Name of the event (use snake_case)
 * @param {Object} [params] - Optional parameters to send with the event
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * Set persistent properties for the current user session
 * @param {Object} properties - Key-value pairs of user attributes
 */
export const setUserProperties = (properties = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', properties);
  }
};
