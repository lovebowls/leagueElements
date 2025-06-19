# LeagueSchedule Component

## Overview
The LeagueSchedule component displays a complete schedule of matches from a League object with filtering, pagination, and export functionality. It provides a responsive design that works on both desktop and mobile devices with smart match state styling and auto-navigation to upcoming matches.

## Features
- Display matches in a paginated table format with intelligent match state styling
- **Match State Styling**: Past matches with results appear greyed out, past matches without results are highlighted with urgent styling
- **Smart Navigation**: Automatically navigates to the page containing the next scheduled future match on load or filter change
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

## Match States
The component automatically determines match states based on date and results:
- **Future matches**: Normal styling (matches scheduled for today or later)
- **Past matches with results**: Greyed out appearance with reduced opacity
- **Past matches without results**: Highlighted with warning styling (red border, urgent colors) and "RESULT NEEDED" text

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
      homeTeam: { _id: "team1" },
      awayTeam: { _id: "team2" },
      result: {
        homeScore: 3,
        awayScore: 1
      }
    },
    // ...
  ]
}
```

## Auto-Navigation Behavior
- When data is first loaded, the component automatically navigates to the page containing the next scheduled future match
- When the team filter changes, it similarly navigates to show the next future match for that team
- If no future matches exist, it remains on the first page

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

### Match State Styles
- **Past with result**: Uses reduced opacity (0.6) and secondary text color
- **Past no result**: Red left border (#ff6b6b), light red background (#fff5f5), red text (#d63031), with warning emoji
- **Future**: Normal styling

## Dependencies
- TemporalUtils from '../../utils/temporalUtils.js'

## Integration with LeagueElement
The LeagueSchedule component is integrated into the LeagueElement component as a new "Schedule" tab, providing users with a comprehensive view of all matches in the league with intelligent highlighting of matches requiring attention. 