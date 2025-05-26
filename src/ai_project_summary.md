## AI Project Summary: @lovebowls/leagueElements

### 1. Project Overview

-   **Name:** `@lovebowls/leagueElements`
-   **Version:** `0.1.18`
-   **Description:** League Elements package for LoveBowls
-   **Purpose:** This project provides a collection of reusable frontend Custom Elements for managing and displaying league-related information within the LoveBowls application. These elements are designed to be embedded in larger application pages and interact via attributes and custom events.

### 2. Technology Stack

-   **Frontend:** Custom Elements API, JavaScript (ES6+), HTML, CSS, Shadow DOM.
-   **Development/Build Tools:** TypeScript, Rollup, Babel, Jest, ESLint, Prettier, TypeDoc.
-   **Libraries:**
    *   `@js-temporal/polyfill`: For modern date and time handling.
    *   `tslib`: TypeScript helper functions.
    *   Shared styles and utility modules within the `src` directory (e.g., `shared-styles.js`, `temporalUtils.js`).
-   **Backend Interaction Pattern:** The frontend elements themselves do not directly interact with the backend. They receive data via attributes populated by a parent application and signal user actions requiring data persistence (create, update, delete) by dispatching custom events. The parent application is responsible for listening to these events and making appropriate API calls to the backend services/controllers.

### 3. Project Structure

The project follows a standard structure for a JavaScript/TypeScript library with custom elements:

-   `dist/`: Output directory for built files (CommonJS, ES Module, type declarations, browser bundle).
-   `src/`: Source files.
    -   `elements/`: Contains individual custom element modules.
        -   `leagueAdminElement/`: Files for the League Administration element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `leagueElement/`: Files for the main League Display element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `leagueMatch/`: Files for the Match Modal element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `LeagueMatchesAttention/`: Files for the Attention Matches list element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `LeagueMatchesRecent/`: Files for the Recent Matches list element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `LeagueMatchesUpcoming/`: Files for the Upcoming Matches list element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `leagueCalendar/`: Files for the League Calendar element (`.js`, `-styles.js`, `ai_module_summary.md`).
        -   `shared-styles.js`: Common CSS variables and classes used across elements.
        -   Other shared utility files (e.g., `temporalUtils.js`).
    -   `scripts/`: Build and utility scripts.
    -   `test-data/`: Test data for components.
    -   `index.ts`: Entry point for the library build.
    -   `ai_project_update.md`: Instructions for this project summary.
    -   `ai_project_summary.md`: This summary file.
-   `__tests__/`: Directory for test files (often mirrored under `src/elements/__tests__`).
-   `package.json`: Project metadata and scripts.
-   `tsconfig.json`: TypeScript compiler configuration.
-   `rollup.browser.config.js`: Rollup configuration for browser bundle (inferred from package.json build script).
-   `jest.config.mjs`: Jest test runner configuration.
-   `jest.setup.js`: Jest setup for the testing environment.
-   `typedoc.json`: TypeDoc documentation configuration.
-   `README.md`: Project readme file.

### 4. Build Process

The project uses Rollup and TypeScript for building:

-   `npm run build`: Compiles TypeScript to ESNext modules and generates declaration files (`.d.ts`). (Based on `tsc --emitDeclarationOnly` and `rollup -c`).
-   `npm run build:browser`: Creates a browser bundle using Rollup (configured in `rollup.browser.config.js`).
-   `npm run build:all`: Runs both `build` and `build:browser`.
-   `npm run dev`: Starts Rollup in watch mode for development.

### 5. Testing

Testing is configured using Jest (`jest`):

-   `npm test`: Runs tests using Jest with the specified configuration (`jest.config.mjs`). Uses `--experimental-vm-modules` for ES module support.
-   `npm test:watch`: Runs tests in watch mode.
-   `npm test:coverage`: Runs tests and generates a coverage report.
-   `npm test:leagueAdmin`: Runs tests specifically for the `leagueAdminElement` module.
-   `jest.setup.js`: Provides mocks for browser APIs like `CustomEvent` and `ShadowRoot` to enable testing in a Node.js environment with JSDOM.
-   Tests are typically located in `__tests__` directories alongside or within the `src/elements` structure.

### 6. Documentation

Documentation is generated using TypeDoc (`typedoc`):

-   `npm run docs`: Runs TypeDoc based on the configuration in `typedoc.json`.
-   `typedoc.json` is configured to generate documentation from `src/index.ts`, exclude test files, output to the `docs` directory, and use the default theme.

### 7. Core Modules/Elements

The project consists of several key Custom Elements, each summarized in their respective `ai_module_summary.md` files:

-   **`leagueAdminElement`**: Provides an administrative interface for managing leagues and teams (create, edit, delete, copy). Dispatches events for backend operations. (See `src/elements/leagueAdminElement/ai_module_summary.md`)
-   **`leagueElement`**: Displays a single league's information, including table, recent/upcoming/attention matches, matrix view, and trends graph. Consumes data via attributes and embeds other match list/calendar elements. (See `src/elements/leagueElement/ai_module_summary.md`)
-   **`leagueMatch`**: A modal dialog for creating or editing individual match details (teams, date, score). Dispatches a `match-save` event with collected data. (See `src/elements/leagueMatch/ai_module_summary.md`)
-   **`LeagueMatchesAttention`**: Displays a paginated list of matches requiring attention (overdue, conflicts, etc.). Filters and sorts client-side and dispatches events for match clicks. (See `src/elements/LeagueMatchesAttention/ai_module_summary.md`)
-   **`LeagueMatchesRecent`**: Displays a paginated list of recent matches with results. Filters by date and dispatches events for match clicks. (See `src/elements/LeagueMatchesRecent/ai_module_summary.md`)
-   **`LeagueMatchesUpcoming`**: Displays a paginated list of upcoming matches. Filters by future dates or a specific date and dispatches events for match clicks. (See `src/elements/LeagueMatchesUpcoming/ai_module_summary.md`)
-   **`leagueCalendar`**: Provides a calendar view, highlights dates with fixtures/results, allows month navigation and date selection, and signals selection changes via events. (See `src/elements/leagueCalendar/ai_module_summary.md`)

### 8. Data Flow and Backend Interaction

Data typically flows into the custom elements via HTML attributes (e.g., `data`, `filter-date`, `team-mapping`, `matches`), which are populated by a parent application framework or logic. User interactions within the elements that require state changes or data persistence (like saving a match or deleting a league) trigger the dispatch of custom events (e.g., `match-save`, `requestDeleteLeague`, `league-calendar-event` with `type: 'dateChange'`). The parent application listens for these events and is responsible for making the actual API calls to the backend to fetch or update data. This pattern promotes reusability and keeps the elements focused on UI and local state management.

The inferred backend database structure supports entities like Leagues, Teams (potentially with league-specific stats), and Matches, aligning with the data structures consumed and produced by the frontend elements.

### 9. Code Organization and Architecture Style

The project leverages the Web Components standard, building self-contained, reusable Custom Elements. Each element manages its own Shadow DOM for encapsulation of styles and markup. Shared styles (`shared-styles.js`) and utility functions (`temporalUtils.js`, particularly for date handling with `@js-temporal/polyfill`) promote consistency and reduce code duplication. The overall architecture is modular, with parent components composing child elements and managing data flow and backend communication.

### 10. Areas for Further Analysis

-   Specific implementation details of backend API endpoints, controllers, and services that interact with these elements.
-   Full database schema based on migration files or ORM definitions.
-   Specific versions of major libraries used across the entire project if not explicitly listed or inferred from `package.json`.
-   Detailed analysis of how the parent application integrates these elements and handles the event-driven backend communication (requires analyzing the parent application's codebase).
-   Analysis of utility files like `temporalUtils.js` and `shared-styles.js` for a deeper understanding of shared functionality and theming beyond what's mentioned in module summaries.
-   Review of build scripts and Rollup configuration for advanced build processes.
-   Detailed examination of test files (`**/*.test.ts`) to understand component behavior and expected interactions.
-   Analysis of the `scripts/` directory for any custom tooling or processes.
-   Review of the `README.md` for additional project context or setup instructions.
-   Examination of the `src/index.ts` entry point to understand how the elements are exported and intended for consumption.
-   Analysis of the `.eslintrc.js` and `.prettierrc.js` (if they exist) for code style guidelines. 