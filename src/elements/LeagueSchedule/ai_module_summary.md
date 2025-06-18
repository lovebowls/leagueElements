# LeagueSchedule Component

## Overview
The LeagueSchedule component displays a complete schedule of matches from a League object with filtering, pagination, and export functionality. It provides a responsive design that works on both desktop and mobile devices.

## Features
- Display matches in a paginated table format
- Filter matches by team
- Mobile and desktop responsive layouts
- Configurable items per page (default: 25)
- Export functionality (Excel, Word, PDF, JSON, CSV)
- Optional edit mode for matches
- Event emission for match selection and editing

## Usage
```html
<!-- Basic usage -->
<league-schedule data='{"teams": [...], "matches": [...]}'></league-schedule>

<!-- With editing enabled -->
<league-schedule data='{"teams": [...], "matches": []}' can-edit="true"></league-schedule>

<!-- Mobile view -->
<league-schedule data='{"teams": [...], "matches": []}' is-mobile="true"></league-schedule>

<!-- Custom items per page -->
<league-schedule data='{"teams": [...], "matches": []}' items-per-page="10"></league-schedule>
```

## Attributes
- `data` (required): JSON stringified League object containing teams and matches
- `is-mobile` (optional): Boolean attribute to enable mobile layout
- `can-edit` (optional): Boolean attribute to enable match editing
- `items-per-page` (optional): Number of matches to display per page (default: 25)

## Events
The component emits `league-schedule-event` custom events with the following detail types:
- `matchClick`: When a match is clicked (includes match object)
- `matchEdit`: When a match edit button is clicked (includes match object)
- `export`: When an export option is selected (includes format and data)
- `dataLoaded`: When data is loaded (includes matches and teams)
- `error`: When an error occurs (includes error message)

## Data Format
The component expects a League object with the following structure:
```javascript
{
  teams: [
    { id: "team1", name: "Team Name" },
    // ...
  ],
  matches: [
    {
      id: "match1",
      date: "2023-06-01T18:00:00",
      homeTeamId: "team1",
      awayTeamId: "team2",
      result: {
        homePoints: 3,
        awayPoints: 1
      }
    },
    // ...
  ]
}
```

## Styling
The component uses CSS variables for theming and can be styled using the following CSS variables:
- `--le-font-family-main`: Font family (default: 'Open Sans', Helvetica, Arial, sans-serif)
- `--le-font-size-base`: Base font size (default: 1em)
- `--le-font-size-small`: Small font size (default: 0.85em)
- `--le-text-color-primary`: Primary text color (default: #333)
- `--le-text-color-secondary`: Secondary text color (default: #666)
- `--le-background-color-header`: Header background color (default: #f5f5f5)
- `--le-background-color-row-hover`: Row hover background color (default: #f9f9f9)
- `--le-background-color-selected`: Selected row background color (default: #e6f7ff)
- `--le-border-color-light`: Light border color (default: #eee)
- `--le-border-color-medium`: Medium border color (default: #ddd)
- `--le-padding-xs`: Extra small padding (default: 0.25rem)
- `--le-padding-s`: Small padding (default: 0.5rem)
- `--le-padding-m`: Medium padding (default: 1rem)

## Dependencies
- TemporalUtils from '../../utils/temporalUtils.js'

## Integration with LeagueElement
The LeagueSchedule component is integrated into the LeagueElement component as a new "Schedule" tab, providing users with a comprehensive view of all matches in the league. 