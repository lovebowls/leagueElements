// temporalUtils.js - Universal module for Temporal API support

// Import our bundled polyfill
import BundledTemporal from '../libs/temporal-polyfill.js';

// Define a placeholder for the Temporal object
let TemporalPolyfill;

// The Temporal object we'll export - start with our bundled implementation
export let Temporal = BundledTemporal;

// Ensure we have a minimal fallback implementation if the import fails
const createMinimalTemporal = () => {
  console.log('Using minimal Temporal implementation');
  return {
    PlainDate: {
      from(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return { year, month, day, toString: () => dateString };
      }
    },
    now: {
      plainDateISO() {
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return { 
          year, 
          month, 
          day,
          toString() {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          },
          equals(other) {
            return this.year === other.year && 
                  this.month === other.month && 
                  this.day === other.day;
          }
        };
      }
    }
  };
};

// First check if Temporal is already available in the global scope (from a directly loaded script)
if (typeof window !== 'undefined' && window.temporal && window.temporal.Temporal) {
  console.log('Using global Temporal polyfill that was already loaded');
  Temporal = window.temporal.Temporal;
} else {
  // Check if we're in a Node.js environment
  const isNode = typeof process !== 'undefined' && 
                process.versions != null && 
                process.versions.node != null;

  // Try to load the polyfill
  if (isNode) {
    // In Node.js environment
    try {
      // Use dynamic import for Node.js
      import('@js-temporal/polyfill').then(module => {
        TemporalPolyfill = module.Temporal;
        Temporal = TemporalPolyfill;
        console.log('Temporal polyfill loaded from npm package');
      }).catch(err => {
        console.warn('Failed to load Temporal polyfill from npm in Node.js, using bundled implementation', err);
      });
    } catch (e) {
      console.warn('Error importing Temporal polyfill in Node.js environment, using bundled implementation', e);
    }
  } else if (typeof window !== 'undefined') {
    // In browser environment
    try {
      // We already have our bundled implementation, but try to enhance with the full version if possible
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@js-temporal/polyfill@0.4.4/dist/index.global.js';
      script.async = true;
      
      script.onload = () => {
        if (window.temporal && window.temporal.Temporal) {
          TemporalPolyfill = window.temporal.Temporal;
          Temporal = TemporalPolyfill;
          console.log('Enhanced Temporal polyfill loaded from CDN');
        } else {
          console.log('CDN script loaded but Temporal object not found, using bundled implementation');
        }
      };
      
      script.onerror = () => {
        console.log('CDN load failed, using bundled Temporal implementation');
      };
      
      // Only try loading if we're in a document context
      if (document && document.head) {
        document.head.appendChild(script);
      }
    } catch (err) {
      console.log('Could not load enhanced Temporal polyfill, using bundled implementation', err);
    }
  }
}

/**
 * Utility functions for working with Temporal API
 */
export const TemporalUtils = {
  /**
   * Parse an ISO date string (YYYY-MM-DD) into a Temporal.PlainDate
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {Object|null} - PlainDate object or null if invalid
   */
  parseISODate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    
    try {
      // Handle ISO date strings directly
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return Temporal.PlainDate.from(dateString);
      }
      
      // If it's a full ISO datetime string, extract just the date part
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        return Temporal.PlainDate.from(datePart);
      }
      
      return null;
    } catch (err) {
      console.error('Error parsing ISO date string:', err);
      return null;
    }
  },
  
  /**
   * Create a PlainDate from year, month, day components
   * @param {number} year - Full year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @param {number} day - Day of month
   * @returns {Object} PlainDate object
   */
  createPlainDate(year, month, day) {
    try {
      // Check if Temporal.PlainDate can be used as a constructor
      if (typeof Temporal.PlainDate === 'function') {
        return new Temporal.PlainDate(year, month, day);
      }
    } catch (err) {
      console.warn('Error creating Temporal.PlainDate, using fallback', err);
    }
    
    // Fallback for minimal implementation
    return {
      year, 
      month, 
      day,
      toString() {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      },
      equals(other) {
        return this.year === other.year && 
              this.month === other.month && 
              this.day === other.day;
      }
    };
  },
  
  /**
   * Get today's date as a PlainDate
   * @returns {Object} Today's date
   */
  today() {
    return Temporal.now.plainDateISO();
  },
  
  /**
   * Convert a legacy Date object to a Temporal.PlainDate
   * @param {Date} legacyDate - JavaScript Date object
   * @returns {Object|null} PlainDate object or null if invalid
   */
  fromLegacyDate(legacyDate) {
    if (!legacyDate || !(legacyDate instanceof Date) || isNaN(legacyDate.getTime())) {
      return null;
    }
    
    return this.createPlainDate(
      legacyDate.getFullYear(),
      legacyDate.getMonth() + 1, // Month is 0-indexed in Date, 1-indexed in Temporal
      legacyDate.getDate()
    );
  },
  
  /**
   * Convert a Temporal.PlainDate to a legacy Date object
   * @param {Object} plainDate - Temporal PlainDate object
   * @returns {Date|null} JavaScript Date object or null if invalid
   */
  toLegacyDate(plainDate) {
    if (!plainDate) return null;
    
    try {
      // Create Date at local midnight
      return new Date(
        plainDate.year,
        plainDate.month - 1, // Month is 1-indexed in Temporal, 0-indexed in Date
        plainDate.day,
        0, 0, 0, 0
      );
    } catch (err) {
      console.error('Error converting PlainDate to legacy Date:', err);
      return null;
    }
  },
  
  /**
   * Format a PlainDate to ISO date string (YYYY-MM-DD)
   * @param {Object} plainDate - Temporal PlainDate object
   * @returns {string|null} ISO date string or null if invalid
   */
  formatToISODate(plainDate) {
    if (!plainDate) return null;
    return plainDate.toString();
  },
  
  /**
   * Check if two dates are equal, handling different date representations
   * @param {Object|Date|string} date1 - First date to compare
   * @param {Object|Date|string} date2 - Second date to compare
   * @returns {boolean} Whether the dates are equal
   */
  areDatesEqual(date1, date2) {
    // If either input is null or undefined, they can't be equal
    if (!date1 || !date2) return false;
    
    // Convert to Temporal.PlainDate if needed
    let plainDate1, plainDate2;
    
    if (typeof date1 === 'string') {
      plainDate1 = this.parseISODate(date1);
    } else if (date1 instanceof Date) {
      plainDate1 = this.fromLegacyDate(date1);
    } else {
      plainDate1 = date1; // Assume it's already a PlainDate
    }
    
    if (typeof date2 === 'string') {
      plainDate2 = this.parseISODate(date2);
    } else if (date2 instanceof Date) {
      plainDate2 = this.fromLegacyDate(date2);
    } else {
      plainDate2 = date2; // Assume it's already a PlainDate
    }
    
    // If we couldn't convert to PlainDate, compare as strings
    if (!plainDate1 || !plainDate2) {
      const str1 = String(date1);
      const str2 = String(date2);
      return str1 === str2;
    }
    
    // Compare the PlainDate objects
    if (plainDate1.equals && typeof plainDate1.equals === 'function') {
      return plainDate1.equals(plainDate2);
    } else {
      // Fallback comparison
      return plainDate1.year === plainDate2.year && 
             plainDate1.month === plainDate2.month && 
             plainDate1.day === plainDate2.day;
    }
  }
}; 