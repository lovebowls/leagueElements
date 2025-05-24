import { buttonStyles, modalStyles, formStyles, mobileStyles } from './shared-styles.js';

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
      :host([open][is-mobile="true"]) {
        display: flex;
        ${mobileStyles}
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
      }
      .score-inputs label {
        /* flex-basis: auto; */ /* If they were form-label-shared they'd be block */
         margin-bottom: 0; /* Override if needed */
      }
      .score-inputs input[type="number"] {
        width: 80px; /* Increased from 60px to show placeholders better */
        min-width: 80px; /* Ensure minimum width even on small screens */
        /* padding: var(--le-padding-xs, 0.25em); Already form-input-shared */
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
      /* Right-align the home score input */
      .score-inputs input[type="number"]:first-of-type {
        text-align: right;
      }
      /* Responsive adjustment for mobile */
      @media (max-width: 480px) {
        .modal-shared-content {
          width: 90% !important; /* Override any fixed width from shared styles */
          max-width: 90% !important;
          margin: 10px auto;
          font-size: 16px !important; /* Base font size increase */
        }
        .modal-shared-header {
          padding: 15px;
          font-size: 18px !important;
        }
        .modal-shared-body {
          padding: 15px;
        }
        .modal-shared-footer {
          padding: 15px;
        }
        .form-label-shared {
          font-size: 16px !important;
          margin-bottom: 8px;
        }
        .form-input-shared, 
        .form-select-shared {
          font-size: 16px !important;
          padding: 10px !important;
          height: auto !important;
        }
        .form-checkbox-label-shared {
          font-size: 16px !important;
        }
        .score-inputs {
          gap: 10px;
        }
        .score-inputs input[type="number"] {
          width: 90px; /* Wider on mobile for touch targets */
          min-width: 90px;
          font-size: 16px !important;
          padding: 10px !important;
        }
        .score-inputs span {
          font-size: 18px;
          font-weight: bold;
        }
        .button-shared {
          font-size: 16px !important;
          padding: 10px 15px !important;
          min-height: 44px; /* Better touch target */
          margin: 5px;
        }
        #error-message-match-modal {
          font-size: 14px !important;
          padding: 10px;
        }
        .attention-banner {
          font-size: 14px !important;
          padding: 10px;
        }
      }
      
      /* Also add styles for when mobile-view class is applied regardless of screen size */
      .modal-shared-content.mobile-view {
        width: 90% !important; /* Override any fixed width from shared styles */
        max-width: 90% !important;
        min-width: 280px !important;
        margin: 10px auto;
        font-size: 16px !important; /* Base font size increase */
        transform: scale(1.05);
      }
      .mobile-view .modal-shared-header {
        padding: 15px;
        font-size: 20px !important;
      }
      .mobile-view .modal-shared-body {
        padding: 15px;
      }
      .mobile-view .modal-shared-footer {
        padding: 15px;
      }
      .mobile-view .form-label-shared {
        font-size: 16px !important;
        margin-bottom: 10px;
      }
      .mobile-view .form-input-shared, 
      .mobile-view .form-select-shared {
        font-size: 16px !important;
        padding: 12px !important;
        height: auto !important;
        border-radius: 6px !important;
      }
      .mobile-view .form-checkbox-label-shared {
        font-size: 16px !important;
        margin: 5px 0;
      }
      .mobile-view .score-inputs {
        gap: 15px;
        margin-top: 10px;
      }
      .mobile-view .score-inputs input[type="number"] {
        width: 100px; /* Wider on mobile for touch targets */
        min-width: 100px;
        font-size: 18px !important;
        padding: 12px !important;
        border-radius: 6px !important;
      }
      .mobile-view .score-inputs span {
        font-size: 20px;
        font-weight: bold;
      }
      .mobile-view .button-shared {
        font-size: 18px !important;
        padding: 12px 20px !important;
        min-height: 50px; /* Better touch target */
        margin: 5px;
        border-radius: 6px !important;
      }
      .mobile-view #error-message-match-modal {
        font-size: 16px !important;
        padding: 12px;
      }
      .mobile-view .attention-banner {
        font-size: 16px !important;
        padding: 12px;
      }
      #error-message-match-modal {
        color: var(--le-text-color-error, #D8000C);
        background-color: var(--le-background-color-error, #FFD2D2);
        padding: var(--le-padding-s);
        border: 1px solid var(--le-border-color-error, #D8000C);
        border-radius: var(--le-border-radius-standard);
        margin-bottom: var(--le-padding-m); 
        font-size: var(--le-font-size-small);
      }
      .attention-banner {
        background-color: var(--le-color-status-warning, #f39c12);
        color: var(--le-text-color-on-primary, #fff);
        padding: var(--le-padding-s, 0.5em);
        border-bottom: 1px solid var(--le-border-color-dark, #ccc);
        text-align: center;
        font-size: var(--le-font-size-small, 0.85em);
        border-top-left-radius: var(--le-border-radius-standard);
        border-top-right-radius: var(--le-border-radius-standard);
      }
    `; 