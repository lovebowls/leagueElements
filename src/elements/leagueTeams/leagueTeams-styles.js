import { buttonStyles, modalStyles, formStyles, mobileStyles, desktopStyles } from '../shared-styles.js';

export const BASE_STYLES = `
  ${buttonStyles}
  ${modalStyles}
  ${formStyles}
  
  :host {
    display: none;
    position: fixed;
    z-index: var(--le-z-index-modal, 1001);
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--le-background-color-modal-overlay, rgba(0,0,0,0.4));
    align-items: center;
    justify-content: center;
  }
  
  :host([open][is-mobile="true"]) {
    display: flex;
    ${mobileStyles}
  }
  
  :host([open]) {
    display: flex;
    ${desktopStyles}
  }

  /* Teams Manager Layout */
  .teams-manager-content {
    background: var(--le-background-color-panel, #fff);
    border-radius: var(--le-border-radius-large, 8px);
    max-width: 900px;
    width: 90%;
    max-height: 80vh;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: auto; /* Center the modal */
  }

  .teams-manager-content.mobile-view {
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
  }

  .teams-manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-l, 1.5rem);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    background: var(--le-background-color-header, #f8f9fa);
  }

  .teams-manager-header h3 {
    margin: 0;
    color: var(--le-text-color-primary, #333);
  }

  .teams-manager-body {
    padding: var(--le-padding-l, 1.5rem);
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: var(--le-padding-l, 1.5rem);
  }

  .teams-manager-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--le-padding-m, 1rem);
    padding: var(--le-padding-l, 1.5rem);
    border-top: 1px solid var(--le-border-color-light, #eee);
    background: var(--le-background-color-footer, #f8f9fa);
  }

  .footer-options {
    display: flex;
    align-items: center;
  }

  .footer-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    justify-content: flex-end;
    margin-left: auto;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
    cursor: pointer;
    color: var(--le-text-color-primary, #333);
    user-select: none;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }

  /* Team Input with Inline Buttons */
  .team-input-with-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    align-items: flex-end;
  }

  .team-input-with-buttons .form-input-shared {
    flex: 1;
  }

  .inline-buttons {
    display: flex;
    gap: var(--le-padding-s, 0.5rem);
    flex-shrink: 0;
  }

  .inline-buttons .button-shared {
    min-width: 80px;
    white-space: nowrap;
  }



  /* Update button disabled state */
  .button-update:disabled {
    background-color: var(--le-background-color-disabled, #f5f5f5) !important;
    color: var(--le-text-color-disabled, #999) !important;
    border-color: var(--le-border-color-disabled, #ddd) !important;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button-update:disabled:hover {
    background-color: var(--le-background-color-disabled, #f5f5f5) !important;
    border-color: var(--le-border-color-disabled, #ddd) !important;
  }

  /* Action Buttons */
  .teams-action-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    flex-wrap: wrap;
  }

  .teams-action-buttons .button-shared {
    min-width: 100px;
  }

  .teams-action-buttons.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  /* Teams List Panel */
  .teams-list-panel {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    background: var(--le-background-color-panel, #fff);
  }

  .teams-list-panel h4 {
    margin: 0;
    padding: var(--le-padding-m, 1rem);
    background: var(--le-background-color-header, #f8f9fa);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    color: var(--le-text-color-primary, #333);
  }

  .teams-list-panel.disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .teams-list-panel.disabled .team-list-item {
    cursor: not-allowed;
  }

  .teams-list-container {
    max-height: 200px;
    overflow-y: auto;
  }

  .teams-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .team-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-m, 1rem);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .team-list-item:hover {
    background-color: var(--le-background-color-hover, #f5f5f5);
  }

  .team-list-item.selected {
    background-color: var(--le-background-color-selected, #e3f2fd);
    border-left: 3px solid var(--le-border-color-primary, #2196f3);
    animation: highlightTeam 0.6s ease-out;
  }

  @keyframes highlightTeam {
    0% {
      background-color: var(--le-background-color-accent, #4caf50);
      transform: scale(1.02);
    }
    100% {
      background-color: var(--le-background-color-selected, #e3f2fd);
      transform: scale(1);
    }
  }

  .team-list-item:last-child {
    border-bottom: none;
  }

  .team-info {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .team-name {
    font-weight: 500;
    color: var(--le-text-color-primary, #333);
  }

  .team-source {
    color: var(--le-text-color-secondary, #666);
    font-style: italic;
    margin-left: var(--le-padding-s, 0.5rem);
  }

  .team-actions {
    display: flex;
    gap: var(--le-padding-s, 0.5rem);
  }

  .team-actions .button-shared {
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  .team-actions .button-shared:hover {
    opacity: 1;
  }

  .no-teams-message {
    padding: var(--le-padding-l, 1.5rem);
    text-align: center;
    color: var(--le-text-color-secondary, #666);
    font-style: italic;
  }

  /* Team Editor Panel */
  .team-editor-panel {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    background: var(--le-background-color-panel, #fff);
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .team-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-m, 1rem);
    background: var(--le-background-color-header, #f8f9fa);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
  }

  .team-editor-header h4 {
    margin: 0;
    color: var(--le-text-color-primary, #333);
  }

  .team-editor-body {
    padding: var(--le-padding-l, 1.5rem);
  }



  .modal-close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--le-text-color-secondary, #666);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }

  .modal-close-button:hover {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    color: var(--le-text-color-primary, #333);
  }

  /* Form styles */
  .form-group-shared {
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .form-label-shared {
    display: block;
    margin-bottom: var(--le-padding-s, 0.5rem);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
  }

  .form-label-shared input[type="checkbox"] {
    margin-right: var(--le-padding-xs, 0.25rem);
  }

  .form-input-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.5rem);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    background-color: var(--le-background-color-panel, #fff);
    color: var(--le-text-color-primary, #333);
    box-sizing: border-box;
  }

  .form-input-shared:focus {
    outline: none;
    border-color: var(--le-border-color-focus, #007cba);
    box-shadow: 0 0 0 2px var(--le-background-color-focus-ring, rgba(0, 124, 186, 0.2));
  }

  .form-input-shared:disabled {
    background-color: var(--le-background-color-disabled, #f5f5f5);
    color: var(--le-text-color-disabled, #999);
    cursor: not-allowed;
  }

  .form-error-shared {
    color: var(--le-text-color-error, #d32f2f);
    background-color: var(--le-background-color-error, #ffeaa7);
    padding: var(--le-padding-s, 0.5rem);
    border: 1px solid var(--le-border-color-error, #e74c3c);
    border-radius: var(--le-border-radius-standard, 4px);
    margin-bottom: var(--le-padding-s, 0.5rem);
  }

  /* Update button styling */
  .button-update {
    background-color: var(--le-background-color-accent, #4caf50) !important;
    color: white !important;
    border-color: var(--le-border-color-accent, #45a049) !important;
  }

  .button-update:hover {
    background-color: var(--le-background-color-accent-hover, #45a049) !important;
    border-color: var(--le-border-color-accent-hover, #3d8b40) !important;
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .teams-manager-content {
      width: 95% !important;
      max-width: 95% !important;
      margin: 5% auto;
      max-height: 95vh;
    }
    
    .teams-manager-header {
      padding: 15px;
    }
    
    .teams-manager-header h3 {
    }
    
    .teams-manager-body {
      padding: 15px;
      gap: 15px;
    }
    
    .teams-manager-footer {
      padding: 15px;
      flex-direction: column;
      gap: 15px;
    }

    .footer-options {
      order: 1;
      justify-content: center;
    }

    .footer-buttons {
      order: 2;
      flex-direction: column-reverse;
      gap: 10px;
      margin-left: 0;
    }

    .footer-buttons .button-shared {
      width: 100%;
      margin: 0;
    }
    
    .teams-action-buttons {
      flex-direction: column;
      gap: 10px;
    }

    .teams-action-buttons .button-shared {
      width: 100%;
      min-width: auto;
    }

    .teams-list-container {
      max-height: 150px;
    }

    .team-list-item {
      padding: 15px 10px;
    }

    .team-list-item.selected {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .team-info {
      order: 1;
    }

    .team-actions {
      order: 2;
      justify-content: flex-end;
    }

    .team-actions .button-shared {
      width: auto;
      min-width: 80px;
    }

    .team-editor-header {
      padding: 15px 10px;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .team-editor-body {
      padding: 15px 10px;
    }

    /* Mobile inline buttons */
    .team-input-with-buttons {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    .inline-buttons {
      justify-content: flex-end;
      gap: 10px;
    }

    .inline-buttons .button-shared {
      min-width: 100px;
    }

    .form-label-shared {
      margin-bottom: 8px;
    }
    
    .form-input-shared {
      padding: 10px !important;
      height: auto !important;
    }
    
    .button-shared {
      padding: 10px 15px !important;
      min-height: 44px;
    }

  }
`; 