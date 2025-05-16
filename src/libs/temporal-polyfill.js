// temporal-polyfill.js - Bundled Temporal API polyfill

// Minimal implementation of the Temporal API for date handling
// This file provides a bundled minimal implementation of the Temporal API
// that can be used when the full polyfill is not available

// Create a minimal Temporal implementation
const createMinimalTemporal = () => {
  const minimalImplementation = {
    PlainDate: {
      from(dateString) {
        if (typeof dateString === 'object' && dateString !== null) {
          // Handle existing PlainDate objects
          if (dateString.year && dateString.month && dateString.day) {
            return dateString;
          }
          
          // Handle Date objects
          if (dateString instanceof Date) {
            return {
              year: dateString.getFullYear(),
              month: dateString.getMonth() + 1,
              day: dateString.getDate(),
              toString() {
                return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
              },
              equals(other) {
                return this.year === other.year && 
                      this.month === other.month && 
                      this.day === other.day;
              }
            };
          }
        }
        
        // Handle ISO date strings
        if (typeof dateString === 'string') {
          // For ISO date strings
          const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const [_, year, month, day] = match;
            return {
              year: parseInt(year, 10),
              month: parseInt(month, 10),
              day: parseInt(day, 10),
              toString() {
                return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
              },
              equals(other) {
                return this.year === other.year && 
                      this.month === other.month && 
                      this.day === other.day;
              }
            };
          }
        }
        
        throw new Error(`Invalid date format: ${dateString}`);
      }
    },
    now: {
      plainDateISO() {
        const d = new Date();
        return {
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          toString() {
            return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
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
  
  console.log('Created minimal Temporal implementation');
  return minimalImplementation;
};

// Determine which Temporal implementation to use
let TemporalImpl;

// Check browser global first
if (typeof window !== 'undefined' && window.temporal && window.temporal.Temporal) {
  console.log('Using global Temporal API from window.temporal');
  TemporalImpl = window.temporal.Temporal;
} 
// Check if global Temporal exists (could be from polyfill loaded directly)
else if (typeof temporal !== 'undefined' && temporal.Temporal) {
  console.log('Using global Temporal API from global temporal object');
  TemporalImpl = temporal.Temporal;
}
// Use our minimal implementation as fallback
else {
  TemporalImpl = createMinimalTemporal();
}

// Export as an ES module
export const Temporal = TemporalImpl;
export default Temporal;

// Also set as a global for non-module contexts (like direct script inclusion)
if (typeof window !== 'undefined') {
  window.Temporal = TemporalImpl;
}

// For Node.js environments
if (typeof global !== 'undefined') {
  global.Temporal = TemporalImpl;
} 