import { buttonStyles, modalStyles, formStyles } from '../shared-styles.js';

export const BASE_STYLES = `
      ${buttonStyles}
      ${modalStyles}
      ${formStyles}
      :host {
        /* Host itself might be the modal-shared-overlay or contain it */
        /* If host is the overlay: */
        display: none; /* Controlled by 'open' attribute/property */
        position: fixed;
        z-index: var(--le-z-index-modal, 1001); /* Higher than admin modal if stacked */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: var(--le-background-color-modal-overlay, rgba(0,0,0,0.4));
        /* Use flex to center the modal-shared-content if the host is the overlay */
        align-items: center;
        justify-content: center;
      }
      :host([open]) {
        display: flex; 
      }
      /* STYLES FOR .dialog-content, .dialog-header, .dialog-body, .dialog-footer REMOVED as they are covered by .modal-shared-* classes */
      /* GENERAL FORM STYLES for .form-group, label, input, select REMOVED as they are covered by .form-*-shared classes */

      /* Keep styles specific to leagueMatch.js */
      .score-inputs {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5em);
        flex-wrap: wrap;
      }
      .score-inputs label {
         margin-bottom: 0; /* Override if needed */
      }
      .score-inputs input[type="number"] {
        width: 80px; /* Increased from 60px to show placeholders better */
        flex: 1 1 60px;
      }
      /* Remove spinner buttons from number inputs */
      .score-inputs input[type="number"]::-webkit-inner-spin-button,
      .score-inputs input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .score-inputs input[type="number"] {
        -moz-appearance: textfield; /* Firefox */
      }
      
      /* Rink Results Styles */
      .rink-results-container {
        margin-top: 1rem;
        border: 1px solid var(--le-border-color, #ccc);
        border-radius: var(--le-border-radius-standard);
        padding: 0.75rem;
        background-color: var(--le-background-color-light, #f9f9f9);
      }
      
      .rink-results-header, .rink-result-row, .rink-results-totals, .rink-points-totals {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1.5fr; /* Rink Label, Home, Away */
        gap: 0.4rem;
        align-items: center;
        padding: 0.3rem 0;
      }

      .rink-results-header div,
      .rink-results-totals div,
      .rink-points-totals div {
        text-align: center; /* Center header and total texts */
      }

      .rink-results-header .rink-header-label {
        text-align: center; /* Rink label in header to the left */
      }

      .rink-results-totals .rink-total-label,
      .rink-points-totals .rink-points-label,
      .match-points-totals .rink-points-label,
      .final-total-points-totals .rink-points-label {
        text-align: center; /* Total labels to the left */
        font-weight: normal;
        font-size: var(--le-font-size-small, 0.8em);
      }
      .final-total-points-totals {
        font-weight: bold;
        font-size: var(--le-font-size-medium, 1em);
      }
      .rink-results-header {
        font-weight: bold;
        border-bottom: 1px solid var(--le-border-color, #ddd);
        margin-bottom: 0.5rem;
        padding-bottom: 0.75rem;
      }
      
      .rink-result-row { /* Changed from .rink-row to match JS output */
        border-bottom: 1px dashed var(--le-border-color-light, #eee);
      }
      
      .rink-result-row:last-child {
        border-bottom: none;
      }
      
      .rink-results-totals, .rink-points-totals {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--le-border-color, #ccc);
        text-align: left;
      }
      
      .rink-points-totals, .match-points-totals {
        text-align: left;
        border-top: 1px dashed var(--le-border-color-light, #eee); /* Lighter top border for points total */
        margin-top: 0.25rem;
        padding-top: 0.25rem;
      }

      .rink-result-row .rink-number { /* Style for the Rink X label in data rows */
        text-align: center;
        padding-left: 0.25rem;
      }
      
      .rink-input {
        width: 100%;
        text-align: center;
        padding: 0.35rem 0.5rem !important; /* Slightly increased padding */
        box-sizing: border-box;
      }
      
      /* Responsive adjustments for mobile */
      @media (max-width: 480px) {
        .rink-results-header, .rink-result-row, .rink-results-totals, .rink-points-totals {
          grid-template-columns: 1fr 1.5fr 1.5fr; /* Adjust fr units for mobile */
          gap: 0.3rem;
        }
        
        .rink-input {
          padding: 0.3rem 0.25rem !important;
        }
        .rink-results-container {
          padding: 0.5rem;
        }
      }
      
      /* Right-align the home score input */
      .score-inputs input[type="number"]:first-of-type {
        text-align: right;
      }
      
      /* Rink number input styling */
      #rinkNumber {
        width: 50%;
      }
      
      #error-message-match-modal {
        color: var(--le-text-color-error, #D8000C);
        background-color: var(--le-background-color-error, #FFD2D2);
        padding: var(--le-padding-s);
        border: 1px solid var(--le-border-color-error, #D8000C);
        border-radius: var(--le-border-radius-standard);
        margin-bottom: var(--le-padding-m); 
      }
      .attention-banner {
        background-color: var(--le-color-status-warning, #f39c12);
        color: var(--le-text-color-on-primary, #fff);
        padding: var(--le-padding-s, 0.5em);
        border-bottom: 1px solid var(--le-border-color-dark, #ccc);
        text-align: center;
        border-top-left-radius: var(--le-border-radius-standard);
        border-top-right-radius: var(--le-border-radius-standard);
      }
    `; 