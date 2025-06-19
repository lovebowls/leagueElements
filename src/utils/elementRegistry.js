/**
 * Safely register a custom element, avoiding duplicate registration errors
 * in single-page applications where modules may be loaded multiple times.
 * 
 * @param {string} tagName - The custom element tag name (e.g., 'league-element')
 * @param {CustomElementConstructor} elementClass - The element class constructor
 * @param {boolean} [logRegistration=false] - Whether to log successful registrations
 */
export function safeDefine(tagName, elementClass, logRegistration = false) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
    if (logRegistration) {
      console.log(`[ElementRegistry] Registered custom element: ${tagName}`);
    }
  } else if (logRegistration) {
    console.log(`[ElementRegistry] Custom element already registered: ${tagName}`);
  }
}

/**
 * Check if a custom element is already registered
 * @param {string} tagName - The custom element tag name
 * @returns {boolean} True if the element is already registered
 */
export function isRegistered(tagName) {
  return !!customElements.get(tagName);
}

/**
 * Get the constructor for a registered custom element
 * @param {string} tagName - The custom element tag name
 * @returns {CustomElementConstructor|undefined} The element constructor or undefined if not registered
 */
export function getElementConstructor(tagName) {
  return customElements.get(tagName);
} 