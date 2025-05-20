-      console.log('[loadLeagueData] Started. Data type:', typeof data);
+      // console.log('[loadLeagueData] Started. Data type:', typeof data);
-        console.warn('League data is missing or incomplete for trends analysis. Trends tab might not display correctly.');
+        // console.warn('League data is missing or incomplete for trends analysis. Trends tab might not display correctly.');
-      console.error('Error loading league:', error);
+      // console.error('Error loading league:', error);
-    // Check if paging controls should be visible
-    // const showFixturesPaging = this.upcomingFixturesPage > 0 || this._upcomingFixturesHasNext(); // Moved to LeagueMatchesUpcoming
-    // const showAttentionPaging = this.attentionMatchesPage > 0 || this._attentionMatchesHasNext(); // Moved to LeagueMatchesAttention
-    
-    // const currentFilterDateISO = this.activeCalendarFilterDate 
-    //     ? this.activeCalendarFilterDate.toISOString().split('T')[0] 
-    //     : null; // This is not used in the template directly
-      // .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures()) // Handled by LeagueMatchesUpcoming element
-      // .replace('{{fixturesPrevDisabled}}', this.upcomingFixturesPage === 0 ? 'disabled' : '')
-      // .replace('{{fixturesNextDisabled}}', this._upcomingFixturesHasNext() ? '' : 'disabled')
-      // .replace('{{showFixturesPaging}}', showFixturesPaging ? '' : 'style="display: none;"')
-      // .replace('{{calendar}}', this.renderCalendar()) // Moved to LeagueMatchesUpcoming
-      // .replace('{{calendarFilter}}', this.renderCalendarFilter()) // Moved to LeagueMatchesUpcoming
-      // .replace('{{attentionMatches}}', this.renderMatchesRequiringAttention()) // Handled by LeagueMatchesAttention element
-      // .replace('{{attentionPrevDisabled}}', this.attentionMatchesPage === 0 ? 'disabled' : '')
-      // .replace('{{attentionNextDisabled}}', this._attentionMatchesHasNext() ? '' : 'disabled')
-      // .replace('{{showAttentionPaging}}', showAttentionPaging ? '' : 'style="display: none;"')
-      // REMOVED .replace('{{filterDate}}', currentFilterDateISO);
-    console.log('[LeagueElement] render START. isMobile:', isMobile);
-            // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
-            console.log('[LeagueElement] render: filter-date attribute SET on recentMatchesElement:', this.activeCalendarFilterDate);
-      console.log('[LeagueElement] render: Attempting to find upcomingFixturesElement');
-      // Configure the upcoming fixtures component
-      const upcomingFixturesElement = this.shadow.querySelector(isMobile ? '#mobile-upcoming-fixtures' : '#desktop-upcoming-fixtures');
-      if (upcomingFixturesElement) {
-        console.log('[LeagueElement] render: upcomingFixturesElement FOUND.');
-        upcomingFixturesElement.setAttribute('is-mobile', isMobile.toString());
-        if (this.data && this.data.matches) {
-            console.log('[LeagueElement] render: Setting data attribute on upcomingFixturesElement with:', JSON.stringify(this.data.matches).substring(0,100) + '...');
-            upcomingFixturesElement.setAttribute('data', JSON.stringify(this.data.matches));
-            console.log('[LeagueElement] render: data attribute SET on upcomingFixturesElement.');
-            // Set filter-date for upcoming fixtures
-            if (this.activeCalendarFilterDate) {
-                // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
-                upcomingFixturesElement.setAttribute('filter-date', this.activeCalendarFilterDate);
-                console.log('[LeagueElement] render: filter-date attribute SET on upcomingFixturesElement:', this.activeCalendarFilterDate);
-            } else {
-                upcomingFixturesElement.removeAttribute('filter-date');
-            }
-        } else {
-            console.log('[LeagueElement] render: this.data.matches is NOT available for upcomingFixturesElement.');
-        }
-        // Listen to date changes from the upcoming fixtures calendar -- THIS IS NO LONGER NEEDED HERE as calendar is separate
-        // upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Remove if it was mistakenly added for date changes before
-        // upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Keep for date changes
-        
-        // Add listener for match clicks
-        this._handleUpcomingMatchClickBound = this._handleUpcomingMatchClick.bind(this);
-        upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Remove previous if any
-        upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Listen for general events
-      }
-      // ADDED: Configure the league-calendar component
-      const calendarElement = this.shadow.querySelector(isMobile ? '#mobile-calendar' : '#desktop-calendar');
-      if (calendarElement) {
-        console.log('[LeagueElement] render: league-calendar element FOUND.');
-        calendarElement.setAttribute('is-mobile', isMobile.toString());
-        if (this.data && this.data.matches) {
-            console.log('[LeagueElement] render: Setting matches attribute on league-calendar with:', JSON.stringify(this.data.matches).substring(0,100) + '...');
-            calendarElement.setAttribute('matches', JSON.stringify(this.data.matches));
-        } else {
-            console.log('[LeagueElement] render: this.data.matches is NOT available for league-calendar.');
-        }
-        // Pass current filter date to keep calendar selection in sync if changed from parent
-        // (e.g. if filter was set by URL param or other means and leagueElement needs to inform calendar)
-        if (this.activeCalendarFilterDate) {
-            // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
-            calendarElement.setAttribute('current-filter-date', this.activeCalendarFilterDate);
-            console.log('[LeagueElement] render: current-filter-date attribute SET on calendarElement:', this.activeCalendarFilterDate);
-        } else {
-            calendarElement.removeAttribute('current-filter-date');
-        }
-        // Event listener for 'league-calendar-event' is set up in connectedCallback of leagueElement
-        // and handles updates from the calendar.
+      // console.log('[LeagueElement] render: upcomingFixturesElement FOUND.');
+      upcomingFixturesElement.setAttribute('is-mobile', isMobile.toString());
+      if (this.data && this.data.matches) {
+          // console.log('[LeagueElement] render: Setting data attribute on upcomingFixturesElement with:', JSON.stringify(this.data.matches).substring(0,100) + '...');
+          upcomingFixturesElement.setAttribute('data', JSON.stringify(this.data.matches));
+          // console.log('[LeagueElement] render: data attribute SET on upcomingFixturesElement.');
+          // Set filter-date for upcoming fixtures
+          if (this.activeCalendarFilterDate) {
+              // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
+              upcomingFixturesElement.setAttribute('filter-date', this.activeCalendarFilterDate);
+              // console.log('[LeagueElement] render: filter-date attribute SET on upcomingFixturesElement:', this.activeCalendarFilterDate);
+          } else {
+              upcomingFixturesElement.removeAttribute('filter-date');
+          }
+      } else {
+          // console.log('[LeagueElement] render: this.data.matches is NOT available for upcomingFixturesElement.');
+      // Listen to date changes from the upcoming fixtures calendar -- THIS IS NO LONGER NEEDED HERE as calendar is separate
+      // upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Remove if it was mistakenly added for date changes before
+      // upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Keep for date changes
+      
+      // Add listener for match clicks
+      this._handleUpcomingMatchClickBound = this._handleUpcomingMatchClick.bind(this);
+      upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Remove previous if any
+      upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Listen for general events
-    } else {
-      // Show error if data is missing or invalid
-      this.shadow.innerHTML = `<div class="error">Invalid or missing league data</div>`;
-    // After main content rendering:
-    if (this.matchModalOpen) {
-      // Remove any existing modal first
-      let modal = this.shadow.querySelector('league-match');
-      if (modal) modal.remove();
-      modal = document.createElement('league-match');
-      modal.match = this.matchModalData;
-      modal.teams = (this.data && this.data.table && Array.isArray(this.data.table.leagueData)) ? this.data.table.leagueData.map(t => t.teamName) : [];
-      modal.open = true; // This line sets the property
-      console.log('[LeagueElement] Just set modal.open. Property modal.open:', modal.open, 'Attribute modal.getAttribute("open"):', modal.getAttribute('open'));
-      modal.isMobile = this.getAttribute('is-mobile') === 'true';
-      modal.mode = this.matchModalMode;
-      modal.addEventListener('match-save', (e) => {
-        const savedMatch = e.detail.match;
-        if (!this.data || !this.data.matches) {
-          // Should not happen if modal was opened with data, but safety check
-          console.error('Cannot save match, league data or matches array is missing.');
-          this.closeMatchModal();
-          return;
-        }
+    // ADDED: Configure the league-calendar component
+    const calendarElement = this.shadow.querySelector(isMobile ? '#mobile-calendar' : '#desktop-calendar');
+    if (calendarElement) {
+      // console.log('[LeagueElement] render: league-calendar element FOUND.');
+      calendarElement.setAttribute('is-mobile', isMobile.toString());
+      if (this.data && this.data.matches) {
+          // console.log('[LeagueElement] render: Setting matches attribute on league-calendar with:', JSON.stringify(this.data.matches).substring(0,100) + '...');
+          calendarElement.setAttribute('matches', JSON.stringify(this.data.matches));
+      } else {
+          // console.log('[LeagueElement] render: this.data.matches is NOT available for league-calendar.');
+      }
+      // Pass current filter date to keep calendar selection in sync if changed from parent
+      // (e.g. if filter was set by URL param or other means and leagueElement needs to inform calendar)
+      if (this.activeCalendarFilterDate) {
+          // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
+          calendarElement.setAttribute('current-filter-date', this.activeCalendarFilterDate);
+          // console.log('[LeagueElement] render: current-filter-date attribute SET on calendarElement:', this.activeCalendarFilterDate);
+      } else {
+          calendarElement.removeAttribute('current-filter-date');
+      }
+      // Event listener for 'league-calendar-event' is set up in connectedCallback of leagueElement
+      // and handles updates from the calendar.
+    }
-        const updatedLeagueData = JSON.parse(JSON.stringify(this.data));
-        const matchIndex = updatedLeagueData.matches.findIndex(m => m.key === savedMatch.key);
+  } else {
+    // Show error if data is missing or invalid
+    this.shadow.innerHTML = `<div class="error">Invalid or missing league data</div>`;
+  }
-        if (matchIndex > -1) {
-          // Existing match, update it
-          updatedLeagueData.matches[matchIndex] = savedMatch;
-        } else {
-          // New match (could be from matrix with a temp key, or a completely new match if UI allowed)
-          // The parent/handler of requestUpdateLeague will be responsible for assigning a final key if temp
-          updatedLeagueData.matches.push(savedMatch);
-        }
-        
-        this.data = updatedLeagueData; // Update internal state
-        this.dispatchEvent(new LeagueEvent({ type: 'requestUpdateLeague', league: this.data }));
-        this.loadLeagueData(this.data); // Reprocess and re-render
+  // After main content rendering:
+  if (this.matchModalOpen) {
+    // Remove any existing modal first
+    let modal = this.shadow.querySelector('league-match');
+    if (modal) modal.remove();
+    modal = document.createElement('league-match');
+    modal.match = this.matchModalData;
+    modal.teams = (this.data && this.data.table && Array.isArray(this.data.table.leagueData)) ? this.data.table.leagueData.map(t => t.teamName) : [];
+    modal.open = true; // This line sets the property
+    // console.log('[LeagueElement] Just set modal.open. Property modal.open:', modal.open, 'Attribute modal.getAttribute("open"):', modal.getAttribute('open'));
+    modal.isMobile = this.getAttribute('is-mobile') === 'true';
+    modal.mode = this.matchModalMode;
+    modal.addEventListener('match-save', (e) => {
+      const savedMatch = e.detail.match;
+      if (!this.data || !this.data.matches) {
+        // Should not happen if modal was opened with data, but safety check
+        // console.error('Cannot save match, league data or matches array is missing.');
-      });
-      modal.addEventListener('match-cancel', () => {
-        this.closeMatchModal();
-      });
-      this.shadow.appendChild(modal);
-      console.log('[LeagueElement] Modal appended to shadow DOM:', modal);
-    } else {
-      // Remove modal if not open
-      let modal = this.shadow.querySelector('league-match');
-      if (modal) modal.remove();
-    }
-  }
+        return;
+      }
-  setupPaging() {
-    // Setup Settings icon click event
-    const settingsIcons = this.shadow.querySelectorAll('.settings-icon');
-    settingsIcons.forEach(icon => {
-      icon.onclick = () => {
-        this.dispatchEvent(new LeagueEvent({
-          type: 'editLeague',
-          league: this.data
-        }));
-      };
+      const updatedLeagueData = JSON.parse(JSON.stringify(this.data));
+      const matchIndex = updatedLeagueData.matches.findIndex(m => m.key === savedMatch.key);
+      if (matchIndex > -1) {
+        // Existing match, update it
+        updatedLeagueData.matches[matchIndex] = savedMatch;
+      } else {
+        // New match (could be from matrix with a temp key, or a completely new match if UI allowed)
+        // The parent/handler of requestUpdateLeague will be responsible for assigning a final key if temp
+        updatedLeagueData.matches.push(savedMatch);
+      }
+      
+      this.data = updatedLeagueData; // Update internal state
+      this.dispatchEvent(new LeagueEvent({ type: 'requestUpdateLeague', league: this.data }));
+      this.loadLeagueData(this.data); // Reprocess and re-render
+      this.closeMatchModal();
-    
-    // Upcoming Fixtures paging is now handled by LeagueMatchesUpcoming.js
-    // Attention Matches Paging is now handled by LeagueMatchesAttention.js
+    modal.addEventListener('match-cancel', () => {
+      this.closeMatchModal();
+    });
+    this.shadow.appendChild(modal);
+    console.log('[LeagueElement] Modal appended to shadow DOM:', modal);
+  } else {
+    // Remove modal if not open
+    let modal = this.shadow.querySelector('league-match');
+    if (modal) modal.remove();
+  }
+}
+setupPaging() {
+  // Setup Settings icon click event
+  const settingsIcons = this.shadow.querySelectorAll('.settings-icon');
+  settingsIcons.forEach(icon => {
+    icon.onclick = () => {
+      this.dispatchEvent(new LeagueEvent({
+        type: 'editLeague',
+        league: this.data
+      }));
+    };
+  });
+  
+  // Upcoming Fixtures paging is now handled by LeagueMatchesUpcoming.js
+  // Attention Matches Paging is now handled by LeagueMatchesAttention.js
+  // Match links from sub-components will be handled by them dispatching events
+  // if LeagueElement needs to act (e.g. open a modal from a central place)
+}
-    // Match links from sub-components will be handled by them dispatching events
-    // if LeagueElement needs to act (e.g. open a modal from a central place)
+setupResizer() {
+  const resizer = this.shadow.querySelector('.resizer');
+  const leftPanel = this.shadow.querySelector('.left-panel');
+  const rightPanel = this.shadow.querySelector('.right-panel');
+  
+  if (!resizer || !leftPanel || !rightPanel) {
+    // console.warn('Resizer or panels not found, skipping setupResizer.');
+    return;
-  setupResizer() {
-    const resizer = this.shadow.querySelector('.resizer');
-    const leftPanel = this.shadow.querySelector('.left-panel');
-    const rightPanel = this.shadow.querySelector('.right-panel');
-    
-    if (!resizer || !leftPanel || !rightPanel) {
-      console.warn('Resizer or panels not found, skipping setupResizer.');
-      return;
-    }
+  // Calculate and store minimum right panel width if not already done (first-time setup)
+  if (this.minRightPanelPixelWidth === null) {
+    const initialRightWidth = rightPanel.getBoundingClientRect().width;
+    const ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX = 300; // Increased fallback
+    this.minRightPanelPixelWidth = 
+      (initialRightWidth > 0 ? initialRightWidth : ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX) * 1.0; // Changed multiplier to 1.0
+  }
-    // Calculate and store minimum right panel width if not already done (first-time setup)
-    if (this.minRightPanelPixelWidth === null) {
-      const initialRightWidth = rightPanel.getBoundingClientRect().width;
-      const ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX = 300; // Increased fallback
-      this.minRightPanelPixelWidth = 
-        (initialRightWidth > 0 ? initialRightWidth : ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX) * 1.0; // Changed multiplier to 1.0
-    }
+  let x = 0;
+  let leftWidthAtMouseDown = 0;
-    let x = 0;
-    let leftWidthAtMouseDown = 0;
+  const mouseDownHandler = (e) => {
+    x = e.clientX;
+    leftWidthAtMouseDown = leftPanel.getBoundingClientRect().width;
-    const mouseDownHandler = (e) => {
-      x = e.clientX;
-      leftWidthAtMouseDown = leftPanel.getBoundingClientRect().width;
+    document.addEventListener('mousemove', mouseMoveHandler);
+    document.addEventListener('mouseup', mouseUpHandler);
+  };
-      document.addEventListener('mousemove', mouseMoveHandler);
-      document.addEventListener('mouseup', mouseUpHandler);
-    };
+  const mouseMoveHandler = (e) => {
+    const dx = e.clientX - x;
+    const hostWidth = this.shadow.host.getBoundingClientRect().width;
+    
+    if (hostWidth === 0) return;
-    const mouseMoveHandler = (e) => {
-      const dx = e.clientX - x;
-      const hostWidth = this.shadow.host.getBoundingClientRect().width;
-      
-      if (hostWidth === 0) return;
+    let finalLeftPanelPixelWidth = leftWidthAtMouseDown + dx;
-      let finalLeftPanelPixelWidth = leftWidthAtMouseDown + dx;
+    // 1. Apply left panel's own min/max percentage constraints
+    const minLeftPanelBoundPx = hostWidth * 0.20;
+    const maxLeftPanelBoundPx = hostWidth * 0.80;
+    finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
+    finalLeftPanelPixelWidth = Math.min(maxLeftPanelBoundPx, finalLeftPanelPixelWidth);
-      // 1. Apply left panel's own min/max percentage constraints
-      const minLeftPanelBoundPx = hostWidth * 0.20;
-      const maxLeftPanelBoundPx = hostWidth * 0.80;
-      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
-      finalLeftPanelPixelWidth = Math.min(maxLeftPanelBoundPx, finalLeftPanelPixelWidth);
+    // 2. Apply right panel's minimum pixel width constraint (if set)
+    if (this.minRightPanelPixelWidth !== null && this.minRightPanelPixelWidth > 0) {
+      const maxAllowedLeftForRightMinPx = hostWidth - this.minRightPanelPixelWidth;
+      finalLeftPanelPixelWidth = Math.min(finalLeftPanelPixelWidth, maxAllowedLeftForRightMinPx);
+    }
+    
+    // 3. Re-ensure left panel meets its own minimum after adjustments for right panel
+    finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
+    
+    // Convert final pixel width to percentage for flex-basis
+    const newLeftFlexPercentage = (finalLeftPanelPixelWidth / hostWidth) * 100;
+    
+    leftPanel.style.flex = `0 0 ${newLeftFlexPercentage}%`;
+  };
+  const mouseUpHandler = () => {
+    document.removeEventListener('mousemove', mouseMoveHandler);
+    document.removeEventListener('mouseup', mouseUpHandler);
+    if (leftPanel) {
+      this.leftPanelFlexBasis = leftPanel.style.flex;
+    }
+  };
-      // 2. Apply right panel's minimum pixel width constraint (if set)
-      if (this.minRightPanelPixelWidth !== null && this.minRightPanelPixelWidth > 0) {
-        const maxAllowedLeftForRightMinPx = hostWidth - this.minRightPanelPixelWidth;
-        finalLeftPanelPixelWidth = Math.min(finalLeftPanelPixelWidth, maxAllowedLeftForRightMinPx);
-      }
-      
-      // 3. Re-ensure left panel meets its own minimum after adjustments for right panel
-      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
-      
-      // Convert final pixel width to percentage for flex-basis
-      const newLeftFlexPercentage = (finalLeftPanelPixelWidth / hostWidth) * 100;
-      
-      leftPanel.style.flex = `0 0 ${newLeftFlexPercentage}%`;
-    };
+  resizer.addEventListener('mousedown', mouseDownHandler);
+}
-    const mouseUpHandler = () => {
-      document.removeEventListener('mousemove', mouseMoveHandler);
-      document.removeEventListener('mouseup', mouseUpHandler);
-      if (leftPanel) {
-        this.leftPanelFlexBasis = leftPanel.style.flex;
+/**
+ * Renders the form icons with tooltips for recent matches.
+ * @param {Array<Object>|string} [matches=[]] - An array of recent match objects or a form string
+ *                                Each object should have 'result' (W/D/L)
+ *                                and 'description' (the tooltip text).
+ * @returns {string} HTML string for the form icons.
+ */
+renderForm(matches = []) {
+  // Check if matches data is valid
+  if (!Array.isArray(matches)) {
+      // Check if the data passed might be the old form string for backward compatibility or error state
+      if (typeof matches === 'string') {
+          const matchesStr = String(matches); // Ensure it's a string
+          if (matchesStr.length <= 5) {
+              // console.warn('Received string instead of matches array for form rendering. Displaying basic icons.');
+              // Fallback to basic rendering if it looks like a form string
+              return matchesStr.split('').map(result => {
+                  const lowerResult = result.toLowerCase();
+                  let symbol = '?';
+                  if (lowerResult === 'w') symbol = 'G£ö';
+                  if (lowerResult === 'd') symbol = '-';
+                  if (lowerResult === 'l') symbol = 'G£û';
+                  // No title attribute in this fallback
+                  return `<span class="form-icon form-${lowerResult}">${symbol}</span>`;
+              }).join('');
+          }
-    };
-    resizer.addEventListener('mousedown', mouseDownHandler);
+      // console.warn('Invalid matches data provided to renderForm:', matches);
+      return ''; // Return empty string for other invalid data
-  /**
-   * Renders the form icons with tooltips for recent matches.
-   * @param {Array<Object>|string} [matches=[]] - An array of recent match objects or a form string
-   *                                Each object should have 'result' (W/D/L)
-   *                                and 'description' (the tooltip text).
-   * @returns {string} HTML string for the form icons.
-   */
-  renderForm(matches = []) {
-    // Check if matches data is valid
-    if (!Array.isArray(matches)) {
-        // Check if the data passed might be the old form string for backward compatibility or error state
-        if (typeof matches === 'string') {
-            const matchesStr = String(matches); // Ensure it's a string
-            if (matchesStr.length <= 5) {
-                console.warn('Received string instead of matches array for form rendering. Displaying basic icons.');
-                // Fallback to basic rendering if it looks like a form string
-                return matchesStr.split('').map(result => {
-                    const lowerResult = result.toLowerCase();
-                    let symbol = '?';
-                    if (lowerResult === 'w') symbol = 'G£ö';
-                    if (lowerResult === 'd') symbol = '-';
-                    if (lowerResult === 'l') symbol = 'G£û';
-                    // No title attribute in this fallback
-                    return `<span class="form-icon form-${lowerResult}">${symbol}</span>`;
-                }).join('');
-            }
-        }
-        console.warn('Invalid matches data provided to renderForm:', matches);
-        return ''; // Return empty string for other invalid data
-    }
-    return matches.map(match => {
-      // Ensure match object and properties exist
-      if (!match || typeof match.result !== 'string' || typeof match.description !== 'string') {
-          console.warn('Invalid match object within matches array:', match);
-          // Add a title attribute indicating invalid data for the placeholder too
-          return '<span class="form-icon" title="Invalid match data">?</span>'; 
-      }
+  return matches.map(match => {
+    // Ensure match object and properties exist
+    if (!match || typeof match.result !== 'string' || typeof match.description !== 'string') {
+        // console.warn('Invalid match object within matches array:', match);
+        // Add a title attribute indicating invalid data for the placeholder too
+        return '<span class="form-icon" title="Invalid match data">?</span>'; 
+    }
-      const lowerResult = match.result.toLowerCase();
-      let symbol = '?';
-      // Use match.result to determine symbol and class
-      if (lowerResult === 'w') symbol = 'G£ö';
-      if (lowerResult === 'd') symbol = '-';
-      if (lowerResult === 'l') symbol = 'G£û';
+    const lowerResult = match.result.toLowerCase();
+    let symbol = '?';
+    // Use match.result to determine symbol and class
+    if (lowerResult === 'w') symbol = 'G£ö';
+    if (lowerResult === 'd') symbol = '-';
+    if (lowerResult === 'l') symbol = 'G£û';
-      // Add the title attribute with escaped match.description for the tooltip
-      // Symbol is removed to allow CSS to render a colored block
-      return `<span class="form-icon form-${lowerResult}" title="${this.escapeHtml(match.description)}"></span>`;
-    }).join('');
-  }
-  /**
-   * Basic HTML escaping function to prevent XSS issues in tooltips.
-   * @param {string} unsafe - The string to escape.
-   * @returns {string} The escaped string.
-   */
-  escapeHtml(unsafe = '') {
-      // Ensure input is a string
-      const str = String(unsafe);
-      return str
-           .replace(/&/g, "&amp;")
-           .replace(/</g, "&lt;")
-           .replace(/>/g, "&gt;")
-           .replace(/"/g, "&quot;")
-           .replace(/'/g, "&#039;");
-  }
+    // Add the title attribute with escaped match.description for the tooltip
+    // Symbol is removed to allow CSS to render a colored block
+    return `<span class="form-icon form-${lowerResult}" title="${this.escapeHtml(match.description)}"></span>`;
+  }).join('');
+}
-  /**
-   * Formats a list of matches for tooltip display.
-   * If resultType is provided, only matches of that type are included.
-   * If not, all matches are included.
-   * @param {Array<Object>} matches - Array of match objects
-   * @param {string} [resultType] - Optional: 'W', 'D', or 'L'
-   * @param {boolean} [displayVerb=true] - Whether to show the verb (Won/Lost/Drew)
-   * @returns {string} Tooltip string
-   */
-  formatMatchList(matches = [], resultType, displayVerb = true) {
-    if (!Array.isArray(matches) || matches.length === 0) {
-      if (resultType) {
-        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
-      }
-      return 'No matches played';
-    }
+/**
+ * Basic HTML escaping function to prevent XSS issues in tooltips.
+ * @param {string} unsafe - The string to escape.
+ * @returns {string} The escaped string.
+ */
+escapeHtml(unsafe = '') {
+    // Ensure input is a string
+    const str = String(unsafe);
+    return str
+         .replace(/&/g, "&amp;")
+         .replace(/</g, "&lt;")
+         .replace(/>/g, "&gt;")
+         .replace(/"/g, "&quot;")
+         .replace(/'/g, "&#039;");
+}
-    // Filter if resultType is provided
-    let filtered = matches;
+/**
+ * Formats a list of matches for tooltip display.
+ * If resultType is provided, only matches of that type are included.
+ * If not, all matches are included.
+ * @param {Array<Object>} matches - Array of match objects
+ * @param {string} [resultType] - Optional: 'W', 'D', or 'L'
+ * @param {boolean} [displayVerb=true] - Whether to show the verb (Won/Lost/Drew)
+ * @returns {string} Tooltip string
+ */
+formatMatchList(matches = [], resultType, displayVerb = true) {
+  if (!Array.isArray(matches) || matches.length === 0) {
-      filtered = matches.filter(
-        match => match && match.result && match.result.toUpperCase() === resultType
-      );
+      return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
+    return 'No matches played';
+  }
-    // Sort by date ascending - matches should already have a valid 'date' property
-    filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
-    const tooltipContent = filtered.map(match => {
-      if (!match || !match.result || !match.date || !match.homeTeamName || !match.awayTeamName || typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
-        return 'Invalid match data for tooltip';
-      }
-      let resultVerb = '';
-      if (match.result.toUpperCase() === 'W') resultVerb = 'Won';
-      else if (match.result.toUpperCase() === 'L') resultVerb = 'Lost';
-      else if (match.result.toUpperCase() === 'D') resultVerb = 'Drew';
+  // Filter if resultType is provided
+  let filtered = matches;
+  if (resultType) {
+    filtered = matches.filter(
+      match => match && match.result && match.result.toUpperCase() === resultType
+    );
+  }
-      const dateStr = new Date(match.date).toLocaleDateString();
-      const matchDetails = `${match.homeTeamName} ${match.homeScore}-${match.awayScore} ${match.awayTeamName}`;
-      return `${displayVerb ? resultVerb + ' ' : ''}${matchDetails} on ${dateStr}`;
-    }).join('\n');
+  // Sort by date ascending - matches should already have a valid 'date' property
+  filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
-    if (!tooltipContent) {
-      if (resultType) {
-        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
-      }
-      return 'No matches played';
+  const tooltipContent = filtered.map(match => {
+    if (!match || !match.result || !match.date || !match.homeTeamName || !match.awayTeamName || typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
+      return 'Invalid match data for tooltip';
+    let resultVerb = '';
+    if (match.result.toUpperCase() === 'W') resultVerb = 'Won';
+    else if (match.result.toUpperCase() === 'L') resultVerb = 'Lost';
+    else if (match.result.toUpperCase() === 'D') resultVerb = 'Drew';
-    return this.escapeHtml(tooltipContent);
+    const dateStr = new Date(match.date).toLocaleDateString();
+    const matchDetails = `${match.homeTeamName} ${match.homeScore}-${match.awayScore} ${match.awayTeamName}`;
+    return `${displayVerb ? resultVerb + ' ' : ''}${matchDetails} on ${dateStr}`;
+  }).join('\n');
+  if (!tooltipContent) {
+    if (resultType) {
+      return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
+    }
+    return 'No matches played';
+  return this.escapeHtml(tooltipContent);
+}
-      console.warn('_preparePointsOverTimeData: Essential data is missing. Clearing chart data.');
+      // console.warn('_preparePointsOverTimeData: Essential data is missing. Clearing chart data.');
-      console.warn('_preparePointsOverTimeData: No teams found in leagueData. Clearing chart data.');
+      // console.warn('_preparePointsOverTimeData: No teams found in leagueData. Clearing chart data.');
-      console.warn('_preparePointsOverTimeData: No valid matches with results found for trend analysis.');
+      // console.warn('_preparePointsOverTimeData: No valid matches with results found for trend analysis.');
-    console.log("Prepared pointsOverTimeChartData:", JSON.parse(JSON.stringify(this.pointsOverTimeChartData)));
+    // console.log("Prepared pointsOverTimeChartData:", JSON.parse(JSON.stringify(this.pointsOverTimeChartData)));
-      console.warn('Cannot ensure team colors: leagueData is missing.');
+      // console.warn('Cannot ensure team colors: leagueData is missing.');
-    console.log("Team colors assigned:", JSON.parse(JSON.stringify(this.teamColors)));
+    // console.log("Team colors assigned:", JSON.parse(JSON.stringify(this.teamColors)));
-      console.error('SVG or Legend container not found for trends graph.');
+      // console.error('SVG or Legend container not found for trends graph.');
-    console.log("SVG graph drawn and legend populated.");
+    // console.log("SVG graph drawn and legend populated.");
-        console.log(`Active trend graph type changed to: ${this.activeTrendGraphType}`);
+        // console.log(`Active trend graph type changed to: ${this.activeTrendGraphType}`);
-          console.log(`Selected teams for graph updated:`, Array.from(this.selectedTeamsForGraph));
-  // END - Placeholder for Trends View Methods
-  // START - New methods for table filtering and data processing
-  _getFilteredLeagueData() {
-    if (!this.data || !this.data.matches || !this.data.table || !this.data.table.leagueData) {
-      return [];
-    }
+}
-    const allTeamNamesInLeague = this.data.table.leagueData.map(t => t.teamName);
-    const allMatchesWithResults = this.data.matches.filter(m => m.result && typeof m.result.homeScore === 'number' && typeof m.result.awayScore === 'number');
+customElements.define('league-element', LeagueElement);
-    console.log('[LeagueElement] openMatchModal called with:', { matchData, teams, mode });
+    // console.log('[LeagueElement] openMatchModal called with:', { matchData, teams, mode });
-      console.log('[LeagueElement] _handleRecentMatchClick called with match:', e.detail.match);
+      // console.log('[LeagueElement] _handleRecentMatchClick called with match:', e.detail.match);
-      // console.log('Date selected in upcoming fixtures calendar:', selectedDateFromUpcoming);
-      // If LeagueMatchesRecent or other components need to react to this specific date selection,
-      // you would update their 'selected-date' attributes here and re-render them or parts of the UI.
-      // For example, if LeagueMatchesRecent should also filter by this date:
-      // const recentMatchesEl = this.shadow.querySelector(this.getAttribute('isMobile') === 'true' ? '#mobile-recent-matches' : '#desktop-recent-matches');
-      // if (recentMatchesEl) {
-      //   if (selectedDateFromUpcoming) {
-      //     recentMatchesEl.setAttribute('selected-date', new Date(selectedDateFromUpcoming).toISOString().split('T')[0]);
-      //   } else {
-      //     recentMatchesEl.removeAttribute('selected-date');
-      //   }
-      // }
-      // Currently, selectedResultDate is distinct. If desired, we could unify them or sync them here.
-    console.log('[LeagueElement] _handleCalendarDateChange event received:', e.detail);
+    // console.log('[LeagueElement] _handleCalendarDateChange event received:', e.detail);
-            console.log('[LeagueElement] Date filter set from dateString:', this.activeCalendarFilterDate);
+            // console.log('[LeagueElement] Date filter set from dateString:', this.activeCalendarFilterDate);
-                console.log('[LeagueElement] Date filter set using Temporal from components:', this.activeCalendarFilterDate);
+                // console.log('[LeagueElement] Date filter set using Temporal from components:', this.activeCalendarFilterDate);
-                console.error('[LeagueElement] Error creating Temporal date:', err);
+                // console.error('[LeagueElement] Error creating Temporal date:', err);
-                    console.log('[LeagueElement] Date filter set using Temporal from legacy Date:', this.activeCalendarFilterDate);
+                    // console.log('[LeagueElement] Date filter set using Temporal from legacy Date:', this.activeCalendarFilterDate);
-                console.error('[LeagueElement] Error converting legacy Date:', err);
+                // console.error('[LeagueElement] Error converting legacy Date:', err);
-                console.log('[LeagueElement] Date filter set using fallback method:', this.activeCalendarFilterDate);
+                // console.log('[LeagueElement] Date filter set using fallback method:', this.activeCalendarFilterDate);
-            console.warn('[LeagueElement] No date information found in calendar event', e.detail);
+            // console.warn('[LeagueElement] No date information found in calendar event', e.detail);
-        console.log('[LeagueElement] Date filter cleared');
+        // console.log('[LeagueElement] Date filter cleared');
