// leagueResetModal.js
// Modal dialog for resetting league matches with scheduling parameters

import { BASE_STYLES } from './leagueResetModal-styles.js';
import { League } from '@lovebowls/leaguejs';

class LeagueResetModalEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueResetModal extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'is-mobile', 'data'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._open = false;
    this._isMobile = false;
    this._league = null; // Store the League object
    this._error = '';
    this._boundOnKeydown = this._onKeydown.bind(this);
    this._firstFocusableElement = null;
    this._lastFocusableElement = null;
    
    // Form data
    this._formData = {
      startDate: '',
      maxMatchesPerDay: '',
      schedulingPattern: 'interval', // 'interval' or 'dayOfWeek'
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: [] // Array of day numbers (0=Sunday, 1=Monday, etc.)
    };
  }

  /**
   * @param {boolean} value
   */
  set open(value) {
    const shouldRender = this._open !== !!value;
    this._open = !!value;
    this.setAttribute('open', this._open.toString());
    
    if (this._open) {
      // Reset and initialize form data when opening the modal
      this._initializeFormData();
    }
    
    if (shouldRender) {
      this.render();
    }

    if (this._open) {
      this.shadowRoot.addEventListener('keydown', this._boundOnKeydown);
      setTimeout(() => this._focusFirstElement(), 0);
    } else {
      this.shadowRoot.removeEventListener('keydown', this._boundOnKeydown);
    }
  }
  get open() {
    return this._open;
  }

  /**
   * @param {boolean} value
   */
  set isMobile(value) {
    const shouldRender = this._isMobile !== !!value;
    this._isMobile = !!value;
    if (shouldRender) {
      this.render();
    }
  }
  get isMobile() { return this._isMobile; }

  /**
   * @param {Object|string} value - League object or JSON string
   */
  set data(value) {
    try {
      if (typeof value === 'string') {
        this._league = value ? JSON.parse(value) : null;
      } else {
        this._league = value || null;
      }
    } catch (error) {
      console.error('Failed to parse league data:', error);
      this._league = null;
    }
    this.render();
  }
  get data() { return this._league; }

  // Convenience getters for backward compatibility and ease of use
  get leagueName() { 
    return this._league?.name || 'Unknown League'; 
  }
  
  get teamCount() { 
    return this._league?.teams?.length || 0; 
  }
  
  get leagueSettings() { 
    return this._league?.settings || {}; 
  }

  /**
   * Get the maximum rinks per session from league settings
   * @returns {number|null} - The maximum rinks per session or null if not set
   */
  get maxRinksPerSession() {
    return this._league?.settings?.maxRinksPerSession || null;
  }

  /**
   * Get the default value for maximum matches per day
   * @returns {string} - The default value or empty string
   */
  get defaultMaxMatchesPerDay() {
    const maxRinks = this.maxRinksPerSession;
    return maxRinks ? maxRinks.toString() : '';
  }

  /**
   * Get the placeholder text for maximum matches per day field
   * @returns {string} - The placeholder text
   */
  get maxMatchesPerDayPlaceholder() {
    const maxRinks = this.maxRinksPerSession;
    return maxRinks ? `Default: ${maxRinks} (based on rinks available)` : 'No limit';
  }

  /**
   * Initialize form data with defaults
   */
  _initializeFormData() {
    // Reset form data to defaults
    this._formData = {
      startDate: '',
      maxMatchesPerDay: this.defaultMaxMatchesPerDay,
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'open':
        this.open = newValue === 'true';
        break;
      case 'is-mobile':
        this.isMobile = newValue === 'true';
        break;
      case 'data':
        this.data = newValue;
        break;
    }
  }

  connectedCallback() {
    this.render();
  }

  showError(msg) {
    this._error = msg || '';
    const errorElement = this.shadow.querySelector('#reset-modal-error');
    if (errorElement) {
      errorElement.textContent = this._error;
      errorElement.style.display = this._error ? 'block' : 'none';
    }
  }

  clearError() {
    this.showError('');
  }

  _onOk() {
    this.clearError();

    // Sync form data with current DOM values before validation
    this._syncFormDataFromDOM();

    // Validate form data
    const validation = this._validateForm();
    if (!validation.isValid) {
      this.showError(validation.error);
      return;
    }

    if (!this._league) {
      this.showError('No league data available');
      return;
    }

    try {

      
      const tempLeague = new League(this._league);
      
      // Generate fixtures using the enhanced initialiseFixtures method
      const schedulingParams = this._getSchedulingParams();
      const startDate = this._formData.startDate ? new Date(this._formData.startDate) : null;
      console.log(schedulingParams)
      const success = tempLeague.initialiseFixtures(startDate, schedulingParams);
      
      if (!success) {
        throw new Error('Failed to generate fixtures. Please check your team count and scheduling parameters.');
      }
      
      // Get the generated matches
      const generatedMatches = tempLeague.matches || [];
      
      // Calculate actual match count and date range from generated matches
      const actualMatches = generatedMatches.length;
      const actualDateRange = this._calculateActualDateRange(generatedMatches);

      // Dispatch save event with the generated matches
      this.dispatchEvent(new LeagueResetModalEvent('reset-save', {
        matches: generatedMatches,
        estimatedMatches: actualMatches,
        dateRange: actualDateRange
      }));
      
    } catch (error) {
      console.error('Error generating fixtures in modal:', error);
      this.showError(`Failed to generate fixtures: ${error.message}`);
    }
  }


  _calculateActualDateRange(matches) {
    if (!matches || matches.length === 0) return null;
    
    const datedMatches = matches.filter(m => m.date);
    if (datedMatches.length === 0) return null;
    
    const dates = datedMatches.map(m => new Date(m.date)).sort((a, b) => a - b);
    return {
      start: dates[0].toLocaleDateString(),
      end: dates[dates.length - 1].toLocaleDateString()
    };
  }

  _onCancel() {
    this.dispatchEvent(new LeagueResetModalEvent('reset-cancel', {}));
  }

  _validateForm() {
    // Validate start date
    if (!this._formData.startDate) {
      return { isValid: false, error: 'Start date is required.' };
    }

    const startDate = new Date(this._formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    if (startDate < today) {
      return { isValid: false, error: 'Start date must be today or in the future.' };
    }

    // Validate max matches per day if provided
    if (this._formData.maxMatchesPerDay) {
      const maxMatchesValue = parseInt(this._formData.maxMatchesPerDay, 10);
      
      if (maxMatchesValue <= 0) {
        return { isValid: false, error: 'Maximum matches per day must be a positive number.' };
      }
      
      // Check against maxRinksPerSession limit if it exists
      const maxRinks = this.maxRinksPerSession;
      if (maxRinks && maxMatchesValue > maxRinks) {
        return { isValid: false, error: `Maximum matches per day cannot exceed ${maxRinks} (based on available rinks).` };
      }
    }

    // Validate scheduling pattern
    if (this._formData.schedulingPattern === 'interval') {
      if (!this._formData.intervalNumber || this._formData.intervalNumber <= 0) {
        return { isValid: false, error: 'Interval must be a positive number.' };
      }
    } else if (this._formData.schedulingPattern === 'dayOfWeek') {
      if (this._formData.selectedDays.length === 0) {
        return { isValid: false, error: 'At least one day of the week must be selected.' };
      }
    }

    return { isValid: true };
  }

  _calculateEstimatedMatches() {
    const teamCount = this.teamCount;
    if (teamCount < 2) return 0;
    // Calculate total unique pairings: n * (n-1) / 2, then multiply by timesTeamsPlayOther
    const timesTeamsPlayOther = this.leagueSettings.timesTeamsPlayOther || 2;
    return (teamCount * (teamCount - 1) / 2) * timesTeamsPlayOther;
  }

  _getSchedulingParams() {
    return {
      schedulingPattern: this._formData.schedulingPattern,
      intervalNumber: this._formData.intervalNumber,
      intervalUnit: this._formData.intervalUnit,
      selectedDays: this._formData.selectedDays,
      maxMatchesPerDay: this._formData.maxMatchesPerDay ? parseInt(this._formData.maxMatchesPerDay, 10) : null
    };
  }

  _calculateDateRange() {
    if (!this._formData.startDate) return null;

    const startDate = new Date(this._formData.startDate);
    const estimatedMatches = this._calculateEstimatedMatches();
    
    if (estimatedMatches === 0) return null;

    let estimatedEndDate = new Date(startDate);
    
    if (this._formData.schedulingPattern === 'interval') {
      const maxMatchesPerDay = this._formData.maxMatchesPerDay ? parseInt(this._formData.maxMatchesPerDay, 10) : null;
      let daysNeeded;
      
      if (maxMatchesPerDay) {
        daysNeeded = Math.ceil(estimatedMatches / maxMatchesPerDay);
      } else {
        // No limit - estimate reasonable distribution over available match days
        // Assume teams can handle multiple matches with scheduling constraints
        daysNeeded = Math.ceil(estimatedMatches / Math.max(1, Math.floor(this.teamCount / 2)));
      }
      
      const intervalDays = this._formData.intervalUnit === 'weeks' ? this._formData.intervalNumber * 7 : this._formData.intervalNumber;
      const totalDays = (daysNeeded - 1) * intervalDays;
      estimatedEndDate.setDate(startDate.getDate() + totalDays);
    } else if (this._formData.schedulingPattern === 'dayOfWeek') {
      const maxMatchesPerDay = this._formData.maxMatchesPerDay ? parseInt(this._formData.maxMatchesPerDay, 10) : null;
      let daysNeeded;
      
      if (maxMatchesPerDay) {
        daysNeeded = Math.ceil(estimatedMatches / maxMatchesPerDay);
      } else {
        // No limit - estimate reasonable distribution over available match days
        daysNeeded = Math.ceil(estimatedMatches / Math.max(1, Math.floor(this.teamCount / 2)));
      }
      
      const availableDaysPerWeek = this._formData.selectedDays.length;
      const weeksNeeded = Math.ceil(daysNeeded / availableDaysPerWeek);
      estimatedEndDate.setDate(startDate.getDate() + (weeksNeeded * 7));
    }

    return {
      start: startDate.toLocaleDateString(),
      end: estimatedEndDate.toLocaleDateString()
    };
  }

  _getPreviewText() {
    const estimatedMatches = this._calculateEstimatedMatches();
    const dateRange = this._calculateDateRange();
    
    if (estimatedMatches === 0 || !dateRange) {
      return 'Please fill in the required fields to see a preview.';
    }

    return `Will schedule ${estimatedMatches} matches from ${dateRange.start} to approximately ${dateRange.end}`;
  }

  render() {
    const mobileClass = this._isMobile ? 'mobile-view' : '';
    
    // Check if the league has any matches
    const hasExistingMatches = this._league && this._league.matches && this._league.matches.length > 0;
    
    this.shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
      </style>
      <div class="modal-shared-overlay" style="display: ${this._open ? 'flex' : 'none'};">
        <div class="modal-shared-content ${mobileClass}">
          <div class="modal-shared-header">
            <div class="header-title-row">
              <h3>Reset League Matches</h3>
              <button type="button" class="modal-close-button" id="close-reset-modal" aria-label="Close">&times;</button>
            </div>
            ${hasExistingMatches ? '<div class="header-warning">This will clear all existing matches and generate new ones with the scheduling parameters below.</div>' : ''}
          </div>
          <div class="modal-shared-body">
            
            <div class="league-info">
              <p><strong>League:</strong> ${this._escapeHtml(this.leagueName)}</p>
              <p><strong>Teams:</strong> ${this.teamCount}</p>
            </div>

            <div class="form-row">
              <div class="form-group-shared">
                <label for="startDate" class="form-label-shared">Start Date *</label>
                <input type="date" id="startDate" class="form-input-shared" required>
              </div>

              <div class="form-group-shared">
                <label for="maxMatchesPerDay" class="form-label-shared">Max rinks per session</label>
                <input type="number" id="maxMatchesPerDay" class="form-input-shared" min="1" ${this.maxRinksPerSession ? `max="${this.maxRinksPerSession}"` : ''} placeholder="${this.maxMatchesPerDayPlaceholder}" value="${this.defaultMaxMatchesPerDay}">
              </div>
            </div>

            <fieldset class="form-fieldset-shared">
              <legend class="form-legend-shared">Scheduling Pattern</legend>
              
              <div class="form-group-shared">
                <label class="form-checkbox-label-shared">
                  <input type="radio" name="schedulingPattern" value="interval" id="intervalPattern" checked>
                  Schedule matches every
                </label>
                <div class="interval-inputs" id="intervalInputs">
                  <input type="number" id="intervalNumber" class="form-input-shared interval-number" min="1" value="1">
                  <select id="intervalUnit" class="form-select-shared">
                    <option value="days">days</option>
                    <option value="weeks" selected>weeks</option>
                  </select>
                </div>
              </div>

              <div class="form-group-shared">
                <label class="form-checkbox-label-shared">
                  <input type="radio" name="schedulingPattern" value="dayOfWeek" id="dayOfWeekPattern">
                  Schedule matches on these days
                </label>
                <div class="day-checkboxes" id="dayCheckboxes">
                  <label class="day-checkbox-label"><input type="checkbox" value="1"> Mon</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="2"> Tue</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="3"> Wed</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="4"> Thu</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="5"> Fri</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="6"> Sat</label>
                  <label class="day-checkbox-label"><input type="checkbox" value="0"> Sun</label>
                </div>
              </div>
            </fieldset>

            <div class="preview-section">
              <h4>Preview</h4>
              <p id="previewText" class="preview-text">${this._getPreviewText()}</p>
            </div>
          </div>
          <div class="modal-shared-footer">
            <div id="reset-modal-error" class="footer-error" style="display: none;"></div>
            <div class="footer-buttons">
              <button type="button" class="button-shared" id="cancel-reset-button">Cancel</button>
              <button type="button" class="button-shared button-primary" id="confirm-reset-button">Reset Matches</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._attachEventListeners();
    this._updateFormState();
    this._updateFormValues();
  }

  _attachEventListeners() {
    const closeBtn = this.shadow.querySelector('#close-reset-modal');
    const cancelBtn = this.shadow.querySelector('#cancel-reset-button');
    const confirmBtn = this.shadow.querySelector('#confirm-reset-button');

    if (closeBtn) closeBtn.addEventListener('click', () => this._onCancel());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._onCancel());
    if (confirmBtn) confirmBtn.addEventListener('click', () => this._onOk());

    // Form field event listeners
    const startDateInput = this.shadow.querySelector('#startDate');
    const maxMatchesInput = this.shadow.querySelector('#maxMatchesPerDay');
    const intervalPatternRadio = this.shadow.querySelector('#intervalPattern');
    const dayOfWeekPatternRadio = this.shadow.querySelector('#dayOfWeekPattern');
    const intervalNumberInput = this.shadow.querySelector('#intervalNumber');
    const intervalUnitSelect = this.shadow.querySelector('#intervalUnit');

    if (startDateInput) {
      startDateInput.addEventListener('change', (e) => {
        this._formData.startDate = e.target.value;
        this._updatePreview();
      });
    }

    if (maxMatchesInput) {
      maxMatchesInput.addEventListener('input', (e) => {
        this._formData.maxMatchesPerDay = e.target.value;
        this._updatePreview();
      });
    }

    if (intervalPatternRadio) {
      intervalPatternRadio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this._formData.schedulingPattern = 'interval';
          this._updateFormState();
          this._updatePreview();
        }
      });
    }

    if (dayOfWeekPatternRadio) {
      dayOfWeekPatternRadio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this._formData.schedulingPattern = 'dayOfWeek';
          this._updateFormState();
          this._updatePreview();
        }
      });
    }

    if (intervalNumberInput) {
      intervalNumberInput.addEventListener('input', (e) => {
        this._formData.intervalNumber = parseInt(e.target.value, 10) || 1;
        this._updatePreview();
      });
    }

    if (intervalUnitSelect) {
      intervalUnitSelect.addEventListener('change', (e) => {
        this._formData.intervalUnit = e.target.value;
        this._updatePreview();
      });
    }

    // Day checkboxes
    const dayCheckboxes = this.shadow.querySelectorAll('#dayCheckboxes input[type="checkbox"]');
    dayCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this._formData.selectedDays = Array.from(dayCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => parseInt(cb.value, 10));
        this._updatePreview();
      });
    });

    // Click outside to close
    const overlay = this.shadow.querySelector('.modal-shared-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._onCancel();
        }
      });
    }
  }

  _updateFormState() {
    const intervalInputs = this.shadow.querySelector('#intervalInputs');
    const dayCheckboxes = this.shadow.querySelector('#dayCheckboxes');

    if (intervalInputs && dayCheckboxes) {
      if (this._formData.schedulingPattern === 'interval') {
        intervalInputs.style.display = 'flex';
        dayCheckboxes.style.display = 'none';
      } else {
        intervalInputs.style.display = 'none';
        dayCheckboxes.style.display = 'flex';
      }
    }
  }

  _updateFormValues() {
    // Update form field values to match current form data
    const maxMatchesInput = this.shadow.querySelector('#maxMatchesPerDay');
    if (maxMatchesInput && this._formData.maxMatchesPerDay) {
      maxMatchesInput.value = this._formData.maxMatchesPerDay;
    }

    const startDateInput = this.shadow.querySelector('#startDate');
    if (startDateInput && this._formData.startDate) {
      startDateInput.value = this._formData.startDate;
    }

    const intervalNumberInput = this.shadow.querySelector('#intervalNumber');
    if (intervalNumberInput) {
      intervalNumberInput.value = this._formData.intervalNumber;
    }

    const intervalUnitSelect = this.shadow.querySelector('#intervalUnit');
    if (intervalUnitSelect) {
      intervalUnitSelect.value = this._formData.intervalUnit;
    }
  }

  _updatePreview() {
    const previewElement = this.shadow.querySelector('#previewText');
    if (previewElement) {
      previewElement.textContent = this._getPreviewText();
    }
  }

  /**
   * Sync internal form data with current DOM input values
   */
  _syncFormDataFromDOM() {
    const startDateInput = this.shadow.querySelector('#startDate');
    const maxMatchesInput = this.shadow.querySelector('#maxMatchesPerDay');
    const intervalPatternRadio = this.shadow.querySelector('#intervalPattern');
    const dayOfWeekPatternRadio = this.shadow.querySelector('#dayOfWeekPattern');
    const intervalNumberInput = this.shadow.querySelector('#intervalNumber');
    const intervalUnitSelect = this.shadow.querySelector('#intervalUnit');
    const dayCheckboxes = this.shadow.querySelectorAll('#dayCheckboxes input[type="checkbox"]');

    if (startDateInput) {
      this._formData.startDate = startDateInput.value;
    }

    if (maxMatchesInput) {
      this._formData.maxMatchesPerDay = maxMatchesInput.value;
    }

    if (intervalPatternRadio && intervalPatternRadio.checked) {
      this._formData.schedulingPattern = 'interval';
    } else if (dayOfWeekPatternRadio && dayOfWeekPatternRadio.checked) {
      this._formData.schedulingPattern = 'dayOfWeek';
    }

    if (intervalNumberInput) {
      this._formData.intervalNumber = parseInt(intervalNumberInput.value, 10) || 1;
    }

    if (intervalUnitSelect) {
      this._formData.intervalUnit = intervalUnitSelect.value;
    }

    if (dayCheckboxes) {
      this._formData.selectedDays = Array.from(dayCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value, 10));
    }
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this._onCancel();
      return;
    }

    if (e.key === 'Tab') {
      this._handleTabKey(e);
    }
  }

  _handleTabKey(e) {
    const focusableElements = this.shadow.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);
    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _focusFirstElement() {
    const firstFocusable = this.shadow.querySelector('input, select, button');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
}

// Register the custom element
import { safeDefine } from '../../utils/elementRegistry.js';

safeDefine('league-reset-modal', LeagueResetModal);

export default LeagueResetModal; 