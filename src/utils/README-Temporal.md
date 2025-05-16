# Using Temporal API in League Elements

This document provides guidelines for using the Temporal API throughout the League Elements application.

## Benefits of Temporal API

The Temporal API provides several advantages over the legacy Date object:

1. **Immutability**: Temporal objects are immutable, preventing accidental state changes
2. **Timezone awareness**: Explicitly handles timezones to avoid confusion
3. **Clearer API**: More intuitive method names and better organization
4. **Consistent behavior**: Avoids unexpected timezone conversions and date parsing issues

## How to Use Temporal in League Elements

### Importing

Always import the `TemporalUtils` helper and the `Temporal` namespace:

```javascript
import { Temporal, TemporalUtils } from '../utils/temporalUtils.js';
```

### Creating Dates

Use the appropriate utility method based on your input:

```javascript
// From YYYY-MM-DD string
const plainDate = TemporalUtils.parseISODate('2025-05-10');

// From date components
const plainDate = TemporalUtils.createPlainDate(2025, 5, 10);

// Get today's date
const today = TemporalUtils.today();

// From legacy Date (fallback)
const plainDate = TemporalUtils.fromLegacyDate(legacyDate);
```

### Date Comparison

Use the Temporal API for date comparisons:

```javascript
// Check if dates are equal
if (date1.equals(date2)) {
  // Dates are the same
}

// Or use the utility method that handles multiple formats
if (TemporalUtils.areDatesEqual(date1, date2)) {
  // Dates are the same
}
```

### Converting to String

For consistent string representation:

```javascript
// To YYYY-MM-DD format
const dateString = plainDate.toString();
// Or
const dateString = TemporalUtils.formatToISODate(plainDate);
```

### Handling Events Between Components

When passing dates between components:

1. Always include a `dateString` property in ISO format (YYYY-MM-DD)
2. Include the `plainDate` object for direct Temporal usage when possible

```javascript
this.dispatchEvent(new CustomEvent('date-change', {
  detail: {
    dateString: date.toString(),
    plainDate: date,
    year: date.year,
    month: date.month,
    day: date.day
  }
}));
```

### Legacy Support

For backward compatibility:

```javascript
// Convert Temporal to legacy Date
const legacyDate = TemporalUtils.toLegacyDate(plainDate);
```

## Implementation Pattern

Throughout the application, components should:

1. Store dates in Temporal format (`_selectedTemporal`)
2. Store the ISO date string (`_selectedDateString`)
3. Keep legacy Date objects for backward compatibility (`_selectedDate`)

## Error Handling

Always use try/catch when working with Temporal and provide fallbacks:

```javascript
try {
  const plainDate = TemporalUtils.parseISODate(dateString);
  // Use plainDate
} catch (err) {
  console.error('Error using Temporal:', err);
  // Fallback to legacy method
  const legacyDate = new Date(dateString);
}
``` 