## AI Module Summary: leagueCalendar

### 1. Module Name

`leagueCalendar`

### 2. Purpose and Business Logic

The `leagueCalendar` module is a frontend custom element that provides a calendar view. Its primary purpose is to display a monthly calendar, highlight dates with scheduled fixtures or recorded results, allow navigation between months, and enable users to select a specific date. This selected date can then be used by other components (like `LeagueMatchesUpcoming`) to filter lists of matches.

Its business logic involves visualizing the league schedule on a calendar interface and providing a mechanism for date-based filtering of associated data.

### 3. Working Logic

`leagueCalendar` operates as a Custom HTML Element. Its core functions include managing the currently displayed calendar month, processing match data to identify and highlight dates with events, handling user interactions for month navigation and date selection, and signaling the selected date via a custom event.

-   **Data Handling:** Receives an array of match objects via the `matches` attribute and an optional `current-filter-date` string (ISO format YYYY-MM-DD) via another attribute. It parses the matches data (`_loadMatchesData`), extracts dates, and identifies which dates have fixtures (`!match.result`) or results (`match.result`), storing them as sets of timestamps (`_fixtureDates`, `_resultDates`). It parses the `current-filter-date` attribute to set the initially selected date (`_selectedDate`, `_selectedTemporal`, `_selectedDateString`). It observes the `is-mobile` attribute for responsive rendering.
-   **Calendar Navigation:** Manages the currently displayed month using `this._calendarDate` (legacy Date) and `this._calendarTemporal` (Temporal.PlainDate). Methods are in place to handle navigation to the previous (`_handleNavClick` - prev month) and next months.
-   **Date Highlighting:** The `_processMatchDates` method iterates through loaded matches to populate `_fixtureDates` and `_resultDates`. The `_renderCalendarHTML` method uses these sets to add specific CSS classes (`has-fixture`, `has-result`) to the corresponding days in the calendar grid, visually indicating events on those dates.
-   **Date Selection:** Handles clicks on calendar day cells (`_attachCalendarEventListeners`). When a day is clicked, it updates `this._selectedDate`, `this._selectedTemporal`, and `this._selectedDateString`. If the clicked date is not the currently selected one, it dispatches a `league-calendar-event` with `type: 'dateChange'` and the selected date information (including `dateString` and `plainDate`) in the detail. Clicking the already selected date clears the selection.
-   **Filter Indication:** Renders an indicator (`renderFilterIndicator`) if a date is currently selected, showing the selected date and a button to clear the filter (`_handleClearFilter`). Clearing the filter dispatches a `dateChange` event with `null` as the date.
-   **Rendering:** The `render` method builds the component's HTML using a template (`TEMPLATE`) and styles (based on `is-mobile`). It calls `_renderCalendarHTML` to render the calendar grid and `_renderCalendarFilterHTML` to render navigation and filter buttons. It updates the UI to show the selected date and highlights based on fixtures/results.
-   **Temporal API Usage:** Explicitly uses the `../../utils/temporalUtils.js` helper methods (`fromLegacyDate`, `createPlainDate`, `toLegacyDate`, `parseISODate`, `areDatesEqual`, `today`) for robust date handling and parsing, including addressing potential timezone issues when parsing attribute strings.

### 4. File and Folder Structure

The module is located at `/c:/lb/dev/leagueElements/src/elements/leagueCalendar`. The primary files analyzed are:

-   `leagueElements/src/elements/leagueCalendar/LeagueCalendar.js`: Contains the main class definition and logic for the custom element.
-   `leagueElements/src/elements/leagueCalendar/LeagueCalendar-styles.js`: Contains the CSS styles for the calendar grid, navigation, day states (today, fixture, result, selected), and filter controls, importing shared styles.
-   `leagueElements/src/elements/leagueCalendar/ai_module_update.md`: Instructions for this analysis.

Relevant files imported:

-   `../shared-styles.js` (for base mobile styles and potentially theme variables)
-   `../../utils/temporalUtils.js` (for date and time utilities, particularly Temporal API wrappers)

### 5. Database Table Structure

Based on the data consumed by this component (`matches` array), the backend database likely includes a table or collection for Matches with fields for:

-   A unique identifier (e.g., `key` or `_id`).
-   The match `date` (essential for calendar display and highlighting).
-   An optional `result` field (presence indicates a played match).
-   References to participating teams (though details are not used by the calendar itself for highlighting).
-   Potentially other metadata (e.g., league ID, needed by the parent to fetch relevant matches).

*   **Note:** This is an inference based on frontend data structures. Confirmation requires analyzing backend migration files or ORM models.

### 6. Tech Stack and Library Versions

-   **Frontend:** Custom Elements API, JavaScript (ES6+), HTML, CSS.
-   **Styling:** Uses shared CSS variables and classes imported via `../shared-styles.js` and module-specific styles from `LeagueCalendar-styles.js`.
-   **Date/Time Handling:** Heavily relies on the `@js-temporal/polyfill` via local wrapper functions in `../../utils/temporalUtils.js` for robust date parsing, manipulation, and comparison, alongside standard JavaScript `Date` objects for compatibility.
-   **Component Interaction:** Designed as a child component, receiving match data and selected date state via attributes and communicating date selection changes via a custom event (`league-calendar-event`).

*   **Information Needed:** Specific versions of `@js-temporal/polyfill` and any major frontend frameworks (if used in the wider project) or backend technologies.

### 7. Architecture and Code Organization Style

-   **Architecture:** Frontend is built as a self-contained Web Component (`LeagueCalendar`) extending `HTMLElement`. It uses Shadow DOM for encapsulation of styles and markup.
-   **Code Organization:** Follows a class-based structure with methods grouped by functionality (data loading, date processing, rendering calendar parts, handling events, managing state). Utilizes a dedicated styles file and a shared utilities module for date handling. The use of `_` prefixes for internal methods is consistent.

### 8. Module Routes

This module is a frontend custom element and does not define its own application routes. It is intended to be embedded within a larger application page or component that manages routing (e.g., the main `leagueElement`). The parent component is responsible for fetching the necessary match data (fixtures and results) for the relevant league and providing it to this calendar component via the `matches` attribute. Date selections made in the calendar are communicated back to the parent via the `league-calendar-event`, allowing the parent to update other components (like match lists) or the application's route/state.

### 9. Controllers and their Meaning

As a frontend component, this module does not contain backend controllers. It consumes match data provided by a parent component, which likely obtains this data from backend API endpoints responsible for retrieving league and match information. The calendar's logic for displaying and highlighting dates is entirely client-side.

User interaction (date selection, month navigation) is handled internally, but the *result* of a date selection (the `dateChange` event) is intended to be handled by a parent component, which might then trigger further backend interactions (e.g., fetching matches specifically for the selected date if not already available).

### 10. Module Services and their Logic

Similar to controllers, this frontend module does not contain backend services. It relies on backend services consumed by the parent application to provide the raw match data (`matches` array). The logic for determining which dates to highlight and managing calendar state is client-side within this component. Backend services would primarily handle the data retrieval for matches.

### 11. Interaction with Other Modules

-   **Frontend:**
    *   Uses shared styles (`../shared-styles.js`).
    *   Relies heavily on `../../utils/temporalUtils.js` for date handling.
    *   Communicates with its parent component/application by dispatching `league-calendar-event` (primarily for `dateChange` events).
    *   It is likely used by components like `leagueElement` to provide a visual calendar for navigating or filtering associated match lists (`LeagueMatchesUpcoming`, `LeagueMatchesRecent`). The parent (`leagueElement`) would listen for `dateChange` events and update the `filter-date` attributes of the list components.
-   **Backend:**
    *   Interacts *indirectly* by receiving match data via the `matches` attribute, which is populated by a parent component that obtains this data from backend services/controllers. 