// temporalUtils.js - Universal module for Temporal API support

// Import from the standard npm package. Rollup will bundle this.
import { Temporal as PolyfillTemporal } from '@js-temporal/polyfill';

// Use the polyfill if native Temporal is not available and export it
export const Temporal = typeof globalThis.Temporal !== 'undefined' 
  ? globalThis.Temporal 
  : PolyfillTemporal;

// Optional: Log to confirm which Temporal is used.
// console.log('Using Temporal polyfill from @js-temporal/polyfill via Rollup bundle.');

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
    try {
      return Temporal.Now.plainDateISO();
    } catch (error) {
      console.error('Error getting today\'s date with Temporal:', error);
      // Fallback to current date
      const now = new Date();
      return this.createPlainDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
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
  },

  /**
   * Format a date to display format with ordinal suffix (e.g., "25th Aug")
   * @param {Date} date - JavaScript Date object
   * @returns {string} Formatted date string
   */
  formatDateString(date) {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month}`;
  }
}; 