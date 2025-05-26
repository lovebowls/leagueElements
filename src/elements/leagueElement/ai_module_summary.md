## AI Module Summary: leagueElement

### 1. Module Name

`leagueElement`

### 2. Purpose and Business Logic

The primary purpose of the `leagueElement` module is to display league-related information to the user. This includes the main league table with team standings and form, upcoming and recent matches, matches requiring attention, a matrix view of team matchups, and a points-over-time trend graph.

It solves the business problem of providing users with a detailed and interactive view of a specific league's progress, results, and statistics.

### 3. Working Logic

`leagueElement` is implemented as a Custom HTML Element, extending `HTMLElement`. Its logic is contained within the `LeagueElement` class and driven by lifecycle callbacks and attribute changes.

-   **Data Handling:** The element receives comprehensive league data via the `data` attribute (expected to be a JSON string). It parses this data (`loadLeagueData`) and updates its internal state (`this.data`). It also receives `lovebowls-teams` data via an attribute, used potentially for team name resolution (`parseLovebowlsTeams`). It dispatches `LeagueEvent` for various state changes and potentially user actions (e.g., clicking a match).
-   **Rendering:** The `render` method is responsible for generating the element's HTML structure based on the current state (`this.data`, `activeView`, `tableFilter`, `is-mobile` attribute). It uses templates (`MOBILE_TEMPLATE`, `DESKTOP_TEMPLATE`) and populates them with dynamic content like table rows (`tableRows`), matrix views, and trend graphs.
-   **Views and Filters:** The element supports different views (`table`, `matrix`, `trends`) and allows filtering the league table (`overall`, `home`, `away`) via internal state (`activeView`, `tableFilter`). It calculates filtered table data (`_getFilteredLeagueData`).
-   **Interactivity:** It handles user interactions such as changing tabs (`setupTabs`), filtering the table (`setupTableFilterDropdown`), interacting with the matrix view (`setupMatrixEventListeners`), handling match clicks (`_handleRecentMatchClick`, `_handleAttentionMatchClick`, `_handleUpcomingMatchClick`), and responding to calendar date changes (`_handleCalendarDateChange`).
-   **Match Modals:** It includes logic to open and close a match modal, likely for viewing or potentially editing match results (`openMatchModal`, `closeMatchModal`).
-   **Trend Graph:** It prepares data for and renders a points-over-time SVG graph (`_preparePointsOverTimeData`, `drawPointsOverTimeSVG`), including logic for selecting teams and ensuring consistent team colors (`selectedTeamsForGraph`, `ensureTeamColors`).
-   **Helper Functions:** Includes various helper methods for formatting match lists (`formatMatchList`), escaping HTML (`escapeHtml`), calculating ranks (`_calculateRanksFromMatches`), and rendering UI components like rank movement indicators (`renderRankMovementIndicator`) and form icons (`renderForm`).

### 4. File and Folder Structure

The module is located at `/c:/lb/dev/leagueElements/src/elements/leagueElement`. The primary files analyzed are:

-   `leagueElements/src/elements/leagueElement/leagueElement.js`: Contains the main class definition and logic for the custom element.
-   `leagueElements/src/elements/leagueElement/leagueElement-styles.js`: Contains the CSS styles for the element, importing shared styles.
-   `leagueElements/src/elements/leagueElement/ai_module_update.md`: Instructions for this analysis.

Other relevant files imported include:

-   `../LeagueMatchesRecent/LeagueMatchesRecent.js`
-   `../LeagueMatchesUpcoming/LeagueMatchesUpcoming.js`
-   `../LeagueMatchesAttention/LeagueMatchesAttention.js`
-   `../leagueMatch/leagueMatch.js`
-   `../leagueCalendar/LeagueCalendar.js`
-   `../shared-styles.js`
-   `../../utils/temporalUtils.js`

### 5. Database Table Structure

Based on the data consumed by the frontend element (as seen in `leagueElement.js` logic and inferred from related components), the backend database likely contains collections or tables structured to provide the following information:

-   **League:** Contains fields for basic league information (like `name`), league settings (e.g., points rules, promotion/relegation spots), and potentially nested or referenced data for the league `table` and `matches` list.
-   **League Table Data:** An array or collection associated with a league, containing per-team statistics within that league (e.g., `teamId`, `teamDisplayName`, `played`, `won`, `drawn`, `lost`, `shotsFor`, `shotsAgainst`, `shotDifference`, `points`, and a list of associated `matches` or match keys).
-   **Matches:** Contains fields like a unique `key`, `date`, references to `homeTeam` and `awayTeam` (likely including `_id` and `name`), and a `result` object (with `homeScore` and `awayScore`).
-   **Teams:** A global or league-associated collection with `_id` and `name` for teams (referenced by matches and league data).

*   **Note:** This structure is inferred from the frontend data requirements. Confirmation requires analyzing backend migration files or ORM models.

### 6. Tech Stack and Library Versions

-   **Frontend:** Custom Elements API, JavaScript (ES6+), HTML, CSS.
-   **Styling:** Utilizes shared CSS variables and classes imported from `../shared-styles.js`, as well as module-specific styles from `leagueElement-styles.js`.
-   **Date/Time Handling:** Uses `Temporal` API utilities imported from `../../utils/temporalUtils.js`.
-   **Component Interaction:** Integrates with and uses several other custom elements (`LeagueMatchesRecent`, `LeagueMatchesUpcoming`, `LeagueMatchesAttention`, `leagueMatch`, `LeagueCalendar`).
-   **Backend Interaction:** The element receives all necessary data via attributes (`data`, `lovebowls-teams`), implying that a parent component fetches this data from the backend (likely via API calls using Fetch API, Axios, etc.) and passes it down. User actions requiring data updates (e.g., submitting a match result) are likely handled by dispatching custom events that a parent component listens for and uses to trigger backend API calls.

*   **Information Needed:** Specific versions of any major frontend frameworks (if used in the wider project) or backend technologies.

### 7. Architecture and Code Organization Style

-   **Architecture:** Frontend is built as a self-contained Web Component (`LeagueElement`) extending `HTMLElement`. It uses Shadow DOM for style and DOM encapsulation.
-   **Code Organization:** Follows a class-based structure with distinct methods for handling data loading, attribute changes, rendering different sections (table, matrix, trends), managing view/filter state, and handling various user interactions and events. Styles are separated into a dedicated file, leveraging shared styles where possible.

### 8. Module Routes

This module is a frontend custom element and does not define its own application routes. It is designed to be embedded within a larger application structure that manages routing. The element receives the data for the specific league to display via its `data` attribute, which would be populated by the parent application based on the current route or state.

Interactions that might typically involve routing (like clicking a match to see details or edit) are handled by dispatching custom events (e.g., implied from `openMatchModal`), allowing the parent application to navigate or show a modal overlay.

### 9. Controllers and their Meaning

As a frontend component, this module does not contain backend controllers. It consumes data provided by a parent component. The data is likely fetched from a backend API via controllers that handle requests for specific league data. User actions originating from this element that require data modification (e.g., submitting a result via the match modal, if that functionality is present) would be communicated via custom events, which a parent component would intercept and use to call relevant backend controller endpoints.

### 10. Module Services and their Logic

Similar to controllers, this frontend module does not contain backend services. It relies on backend services consumed by the parent application to retrieve and potentially update league, team, and match data. These services would encapsulate the business logic for data retrieval, calculations (like league standings), validation, and data persistence.

### 11. Interaction with Other Modules

-   **Frontend:**
    *   Imports and utilizes several other custom elements: `LeagueMatchesRecent`, `LeagueMatchesUpcoming`, `LeagueMatchesAttention`, `leagueMatch`, and `LeagueCalendar`. It passes relevant data and handles events from these child components.
    *   Uses shared styles (`../shared-styles.js`) and module-specific styles (`leagueElement-styles.js`).
    *   Relies on `TemporalUtils` (`../../utils/temporalUtils.js`) for date handling.
    *   Communicates with its parent component/application by dispatching `LeagueEvent` and other specific custom events (e.g., for match clicks or potentially data update requests).
-   **Backend:**
    *   Interacts *indirectly* with backend services and controllers by receiving data via attributes populated by the parent application. User actions requiring backend interaction are signaled via custom events, which the parent application is expected to handle by making API calls. 