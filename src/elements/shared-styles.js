const baseFontSizeConstants = (fontScale = 1.0) => `
/* Base font sizes for different contexts */
  --le-font-size-base-desktop: ${16 * fontScale}px;
  --le-font-size-base-mobile: ${18 * fontScale}px;
  line-height: 1.2;
`;

// Shared font size base variables and UI element font sizes (used internally)
const getFontSizeElementVariables = (isMobile = false) => `
  /* Specific sizes for common UI elements */
  --le-font-size-button: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-label: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-input: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-table-header: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-table-cell: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-paging: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-font-size-dropdown: var(--le-font-size-base-${isMobile ? 'mobile' : 'desktop'});
  --le-padding-xs: 0.25rem;
  --le-padding-s: 0.6rem;
  --le-padding-m: 1rem;
`;

export const getMobileStyles = (fontScale = 1.0) => `
  :host {
    ${baseFontSizeConstants(fontScale)}
    font-size: var(--le-font-size-base-mobile);

    /* Mobile-specific styling that can be added to host elements */
    --le-font-size-base: 1em;
    --le-font-size-xs: 0.6em;
    --le-font-size-small: 0.8em;
    --le-font-size-medium: 1.0em;
    --le-font-size-large: 1.2em;
    --le-font-size-xlarge: 1.4em;
    --le-font-size-xxlarge: 1.6em;
    
    ${getFontSizeElementVariables(true)}
    
  .controls-panel {
    gap: var(--le-padding-s, 0.5rem);
  }

  /* Mobile-specific dropdown styling */
  .controls-panel .filter-controls .dropdown-shared {
    flex: 1;
  }
  
  .controls-panel .dropdown-shared {
    flex: 1;
  }
  
  .controls-panel .dropdown-shared .dropdown-select-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.75rem) calc(var(--le-padding-m, 1rem) * 2.5) var(--le-padding-s, 0.75rem) var(--le-padding-m, 1rem);
    min-height: 44px; /* Minimum touch target size */
    background-size: 1.2rem;
    background-position: right 1rem center;
    border-width: 2px;
  }
  
  .controls-panel .dropdown-select-shared:focus {
    border-width: 2px;
  }

  /* Mobile-specific checkbox improvements */
  .form-label-shared input[type="checkbox"] {
    /* Make checkbox larger and more touch-friendly */
    width: 25px !important;
    height: 25px !important;
    min-width: 25px !important;
    min-height: 25px !important;
    margin-right: var(--le-padding-s, 0.75em) !important;
    /* Add visual enhancement */
    transform: scale(1.2) !important;
    cursor: pointer !important;
  }

  /* Target labels that contain checkboxes - multiple selectors for maximum compatibility */
  .form-label-shared[for*="Checkbox"],
  .form-label-shared[for*="checkbox"] {
    font-size: var(--le-font-size-small, 0.8em) !important;
    min-height: 44px !important;
    display: flex !important;
    align-items: center !important;
  }

  /* More general selector - any form-label-shared containing checkbox input */
  .form-label-shared:has(input[type="checkbox"]) {
    font-size: var(--le-font-size-small, 0.8em) !important;
    min-height: 44px !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Fallback for browsers that don't support :has() - use specific ID */
  #useExistingTeamLabel {
    font-size: var(--le-font-size-small, 0.8em) !important;
    min-height: 44px !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Input fields on mobile */
  .form-input-shared, .form-select-shared {
    min-height: 44px; /* Standard mobile touch target */
    padding: var(--le-padding-s, 0.75rem) var(--le-padding-m, 1rem);
    font-size: var(--le-font-size-medium, 1.0em);
    border-width: 2px;
  }

  .form-input-shared:focus, .form-select-shared:focus {
    border-width: 2px;
  }

  .form-label-shared {
    font-size: var(--le-font-size-small, 1.0em);
    margin-bottom: var(--le-padding-s, 0.75rem);
  }
}
`;


export const getDesktopStyles = (fontScale = 1.0) => `
  :host {
    ${baseFontSizeConstants(fontScale)}
    font-size: var(--le-font-size-base-desktop);

    /* Standardized font sizes for desktop - these cascade to all sub-components */
    --le-font-size-base: 1em;
    --le-font-size-xs: 0.75em;
    --le-font-size-small: 0.9em;
    --le-font-size-medium: 1.0em;
    --le-font-size-large: 1.2em;
    --le-font-size-xlarge: 1.4em;
    --le-font-size-xxlarge: 1.6em;

    ${getFontSizeElementVariables(false)}

    /* Desktop-specific dropdown styling */
    .controls-panel .filter-controls .dropdown-shared {
      width: auto;
      min-width: 200px;
    }

    .controls-panel .dropdown-shared .dropdown-select-shared {
      min-width: 160px;
      width: auto;
    }
  }
`;

// Shared base styles for dropdown elements
export const dropdownStyles = `
  /* Shared base styles for dropdown select elements */
  .dropdown-select-shared {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-color: var(--le-background-color-panel, #fff);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-small, 3px);
    padding: var(--le-padding-xs, 0.25rem);
    font-size: var(--le-font-size-base, 1em);
    color: var(--le-text-color-primary, #333);
    cursor: pointer;
    line-height: 1.4;
    max-width: 100%;
    width: auto;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5em center;
    background-size: 1em;
  }
  
  .dropdown-select-shared:hover {
    border-color: var(--le-border-color-dark, #ccc);
  }
  
  .dropdown-select-shared:focus {
    outline: none;
    border-color: var(--le-text-color-accent, #2196f3);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }

  .dropdown-shared {
    position: relative;
    display: inline-block;
  }

  /* Shared styles for dropdown menus (button-triggered) */
  .list-item-actions {
    position: relative; /* Ensure actions container can contain absolutely positioned menu */
  }
  
  .dropdown-menu {
    position: fixed; /* Use fixed positioning to escape container boundaries */
    background-color: var(--le-background-color-panel, #fff);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 120px;
    z-index: 9999; /* Much higher z-index to appear above list containers */
    margin-top: 2px; /* Small gap between button and menu */
  }
  
  .dropdown-menu-item {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 0.75em);
    cursor: pointer;
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    transition: background-color 0.2s ease;
    font-size: var(--le-font-size-base, 1em);
    color: var(--le-text-color-primary, #333);
  }
  
  .dropdown-menu-item:last-child {
    border-bottom: none;
  }
  
  .dropdown-menu-item:hover {
    background-color: var(--le-background-color-hover, #f5f5f5);
  }
  
  .dropdown-menu-item:first-child {
    border-top-left-radius: var(--le-border-radius-standard, 4px);
    border-top-right-radius: var(--le-border-radius-standard, 4px);
  }
  
  .dropdown-menu-item:last-child {
    border-bottom-left-radius: var(--le-border-radius-standard, 4px);
    border-bottom-right-radius: var(--le-border-radius-standard, 4px);
  }
`;

export const panelStyles = `
  .panel-header-shared {
    padding: var(--le-padding-s, 0.75em) var(--le-padding-m, 1.25em); /* Increased padding */
    border-bottom: 1px solid var(--le-border-color-medium, #eee);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-header, #f9f9f9);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--le-font-size-medium, 1.1em);
  }

  .panel-content {
    padding: var(--le-padding-m, 1.25em);
    background-color: var(--le-background-color-panel, #fff);
    /* Common border for content area if needed
    border: 1px solid var(--le-border-color-light, #f0f0f0);
    */
  }

  .controls-panel {
    /* Layout properties moved to mobile/desktop sections */
    padding: 0;
    margin-bottom: var(--le-padding-s, 0.5rem);
    margin-top: var(--le-padding-s, 0.5rem);
    background: transparent;
    border: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--le-padding-m, 1rem);
  }

  .filter-controls {
    gap: var(--le-padding-s, 0.5rem);
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  /* Enhanced dropdown styling for button-like appearance */
  .controls-panel .dropdown-shared {
    position: relative;
    display: inline-block;
  }
  
  .controls-panel .dropdown-select-shared {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-color: var(--le-background-color-button, #f0f0f0);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-xs, 0.25rem);
    font-size: var(--le-font-size-dropdown, 1em));
    color: var(--le-text-color-primary, #333);
    cursor: pointer;
    line-height: 1.4;
    min-width: 150px;
    transition: all 0.2s ease;
    font-weight: 500;
  }
  
  .controls-panel .dropdown-select-shared:hover {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    border-color: var(--le-border-color-dark, #ccc);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .controls-panel .dropdown-select-shared:focus {
    outline: none;
    border-color: var(--le-text-color-accent, #2196f3);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    background-color: var(--le-background-color-panel, #fff);
  }
  
  .controls-panel .dropdown-select-shared:active {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    transform: translateY(1px);
  }
`;

export const buttonStyles = `
  .button-shared {
    padding: 2px 8px;
    border: 1px solid var(--le-border-color-medium, #ccc);
    background-color: var(--le-background-color-button, #f0f0f0);
    color: var(--le-text-color-primary, #333); /* Ensure text color contrasts with button background */
    cursor: pointer;
    border-radius: var(--le-border-radius-standard, 4px);
    font-size: var(--le-font-size-button, var(--le-font-size-medium, 1.15em)); /* Use variable with fallback */
    text-decoration: none;
    display: inline-block;
    text-align: center;
    line-height: normal; /* Ensure consistent line height */
    white-space: nowrap; /* Prevent text wrapping */
    vertical-align: middle; /* Align nicely if next to text/icons */
    user-select: none; /* Prevent text selection on click */
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out; /* Smooth transitions */
  }

  .button-shared:hover:not(:disabled) {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    border-color: var(--le-border-color-dark, #bbb); /* Slightly darker border on hover */
    /* color: var(--le-text-color-accent-hover, inherit); Optional: change text color on hover */
  }

  .button-shared:active:not(:disabled) {
    /* Optional: style for active (pressed) state */
    /* background-color: var(--le-background-color-button-active, #d0d0d0); */
  }

  .button-shared:disabled,
  .button-shared.disabled { /* Allow class-based disabling too */
    background-color: var(--le-background-color-button-disabled, #eee);
    color: var(--le-text-color-secondary, #aaa);
    border-color: var(--le-border-color-medium, #ccc); /* Use medium border for disabled state */
    cursor: not-allowed;
    opacity: 0.7; /* Visually indicate disabled state */
  }

  /* Variations */
  .button-shared.button-primary {
    background-color: var(--le-color-primary, #007bff);
    color: var(--le-text-color-on-primary, #fff);
    border-color: var(--le-color-primary, #007bff);
  }
  .button-shared.button-primary:hover:not(:disabled) {
    background-color: var(--le-color-primary-hover, #0056b3);
    border-color: var(--le-color-primary-hover, #0056b3);
  }

  .button-shared.button-secondary-light {
    background-color: var(--le-background-color-button-secondary-light, #f8f9fa);
    color: var(--le-text-color-secondary-light-text, #212529);
    border-color: var(--le-border-color-secondary-light, #ced4da);
  }
  .button-shared.button-secondary-light:hover:not(:disabled) {
    background-color: var(--le-background-color-button-secondary-light-hover, #e2e6ea);
    border-color: var(--le-border-color-secondary-light-hover, #dae0e5);
    color: var(--le-text-color-secondary-light-text-hover, #212529);
  }

  /* Example for a darker secondary button if needed elsewhere 
  .button-shared.button-secondary {
    background-color: var(--le-color-secondary, #6c757d); 
    color: var(--le-text-color-on-secondary, #fff);
    border-color: var(--le-color-secondary, #6c757d);
  }
  .button-shared.button-secondary:hover:not(:disabled) {
    background-color: var(--le-color-secondary-hover, #5a6268);
    border-color: var(--le-color-secondary-hover, #5a6268);
  }
  */
`;

export const modalStyles = `
  .modal-shared-overlay {
    display: none; /* Hidden by default */
    position: fixed;
    z-index: var(--le-z-index-modal-overlay, 1000); /* Ensure it's on top */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--le-background-color-modal-overlay, rgba(0,0,0,0.4));
  }

  .modal-shared-content {
    background-color: var(--le-background-color-panel, #fff);
    margin: var(--le-modal-margin-top, 10%) auto; /* Default to 10% from top, centered */
    padding: 0; /* Remove padding, header/body/footer will handle it */
    border: 1px solid var(--le-border-color-dark, #ccc);
    width: var(--le-modal-width, 90%); /* Increased width for mobile */
    max-width: var(--le-modal-max-width, 600px);
    border-radius: var(--le-border-radius-large, 8px);
    box-shadow: var(--le-shadow-modal, 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19));
    display: flex;
    flex-direction: column;
  }

  /* Specific styles for mobile-view class, used by leagueMatch.js */
  .modal-shared-content.mobile-view {
    margin: 5% auto; /* Less margin from top on mobile */
    width: var(--le-modal-width-mobile, 95%); /* Even wider on mobile */
    max-width: var(--le-modal-max-width-mobile, 650px); /* Increased max-width for mobile */
  }

  .modal-shared-header {
    padding: var(--le-padding-s, 0.75em) var(--le-padding-m, 1.25em); /* Increased padding */
    border-bottom: 1px solid var(--le-border-color-medium, #eee);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-header, #f9f9f9); /* Modal header distinct background */
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--le-font-size-large, 1.4em); /* Increased large font size */
    border-top-left-radius: var(--le-border-radius-large, 8px); /* Match content radius */
    border-top-right-radius: var(--le-border-radius-large, 8px); /* Match content radius */
  }

  .modal-shared-header .close-button-shared { /* Specific styling for a close button if needed */
    color: var(--le-text-color-secondary, #aaa);
    font-size: var(--le-font-size-xxlarge, 1.8em); /* Increased size */
    font-weight: bold;
    background: none;
    border: none;
    cursor: pointer;
  }

  .modal-shared-header .close-button-shared:hover,
  .modal-shared-header .close-button-shared:focus {
    color: var(--le-text-color-primary, #000);
    text-decoration: none;
  }
  
  .modal-shared-body {
    padding: var(--le-padding-m, 1.25em); /* Increased padding */
    overflow-y: auto; /* Allow body to scroll if content is too long */
    flex-grow: 1; /* Allows body to take up available space if modal has fixed height */
  }

  .modal-shared-footer {
    padding: var(--le-padding-s, 0.75em) var(--le-padding-m, 1.25em); /* Increased padding */
    text-align: right;
    border-top: 1px solid var(--le-border-color-medium, #eee);
    background-color: var(--le-background-color-header, #f9f9f9); /* Optional: footer background */
    border-bottom-left-radius: var(--le-border-radius-large, 8px); /* Match content radius */
    border-bottom-right-radius: var(--le-border-radius-large, 8px); /* Match content radius */
  }

  .modal-shared-footer .button-shared + .button-shared { /* Spacing between buttons in footer */
    margin-left: var(--le-padding-s, 0.75em); /* Increased margin */
  }
`;

export const formStyles = `
  .form-group-shared {
    margin-bottom: var(--le-padding-m, 1.25em); /* Increased margin */
  }

  .form-label-shared {
    display: block;
    margin-bottom: var(--le-padding-xs, 0.4em); /* Increased margin */
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    font-size: var(--le-font-size-label, var(--le-font-size-small, 1.15em)); /* Use variable with fallback */
  }

  .form-input-shared,
  .form-textarea-shared,
  .form-select-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.75em); /* Increased padding */
    border: 1px solid var(--le-border-color-dark, #ccc);
    border-radius: var(--le-border-radius-standard, 4px);
    box-sizing: border-box;
    font-size: var(--le-font-size-input, var(--le-font-size-medium, 1.15em)); /* Use variable with fallback */
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-panel, #fff);
  }

  .form-input-shared:focus,
  .form-textarea-shared:focus,
  .form-select-shared:focus {
    border-color: var(--le-border-color-accent, #2196f3);
    outline: none; /* Or a custom focus ring */
    box-shadow: 0 0 0 2px var(--le-focus-ring-color, rgba(33, 150, 243, 0.3));
  }
  
  /* Specific styling for checkbox groups if needed */
  .form-checkbox-label-shared {
    display: flex; /* Changed to flex for better alignment */
    align-items: center;
    font-weight: normal; /* Typically labels for checkboxes are not bold by default */
    font-size: var(--le-font-size-label, var(--le-font-size-small, 1.15em)); /* Use variable with fallback */
    color: var(--le-text-color-primary, #333);
  }

  .form-checkbox-label-shared input[type="checkbox"] {
    margin-right: var(--le-padding-s, 0.75em); /* Increased margin */
    /* Consider custom styling for checkboxes if desired, or rely on browser defaults */
    /* For consistent appearance across browsers, custom checkbox styling can be complex */
    /* For now, using default with adjusted margin */
    width: auto; /* Override width: 100% from .form-input-shared if a generic class was applied */
    vertical-align: middle; /* Align checkbox with text */
  }

  /* Styling for a container of multiple checkboxes or radio buttons */
  .form-options-group-shared {
    /* Styles for a group of checkboxes/radios, e.g., display: flex; flex-direction: column; gap: ... */
  }

  /* Styling for individual option within a group */
  .form-option-item-shared {
     /* Styles for each checkbox/radio item within a group */
  }

  /* Enhanced checkbox styles for better mobile usability */
  .checkbox-enhanced-shared {
    position: relative;
    display: inline-block;
    cursor: pointer;
    user-select: none;
    margin-right: var(--le-padding-s, 0.75em);
  }

  .checkbox-enhanced-shared input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkbox-enhanced-shared .checkmark-shared {
    position: relative;
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    background-color: var(--le-background-color-panel, #fff);
    border: 2px solid var(--le-border-color-dark, #ccc);
    border-radius: var(--le-border-radius-small, 3px);
    transition: all 0.2s ease;
    vertical-align: middle;
    margin-right: var(--le-padding-xs, 0.25em);
  }

  /* Mobile-specific larger checkboxes */
  @media (max-width: 768px) {
    .checkbox-enhanced-shared .checkmark-shared {
      width: 2em;
      height: 2em;
      border-width: 2px;
    }
  }

  /* Hover state */
  .checkbox-enhanced-shared:hover input[type="checkbox"] ~ .checkmark-shared {
    border-color: var(--le-text-color-accent, #2196f3);
    background-color: var(--le-background-color-row-hover, #f9f9f9);
  }

  /* Focus state */
  .checkbox-enhanced-shared input[type="checkbox"]:focus ~ .checkmark-shared {
    border-color: var(--le-text-color-accent, #2196f3);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }

  /* Checked state */
  .checkbox-enhanced-shared input[type="checkbox"]:checked ~ .checkmark-shared {
    background-color: var(--le-text-color-accent, #2196f3);
    border-color: var(--le-text-color-accent, #2196f3);
  }

  /* Checkmark icon */
  .checkbox-enhanced-shared .checkmark-shared:after {
    content: "";
    position: absolute;
    display: none;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 0.4em;
    height: 0.8em;
    border: solid var(--le-text-color-on-primary, #fff);
    border-width: 0 0.15em 0.15em 0;
  }

  /* Mobile-specific larger checkmark */
  @media (max-width: 768px) {
    .checkbox-enhanced-shared .checkmark-shared:after {
      width: 0.5em;
      height: 1em;
      border-width: 0 0.2em 0.2em 0;
    }
  }

  /* Show checkmark when checked */
  .checkbox-enhanced-shared input[type="checkbox"]:checked ~ .checkmark-shared:after {
    display: block;
  }

  /* Disabled state */
  .checkbox-enhanced-shared input[type="checkbox"]:disabled ~ .checkmark-shared {
    background-color: var(--le-background-color-button-disabled, #eee);
    border-color: var(--le-border-color-medium, #ddd);
    cursor: not-allowed;
  }

  .checkbox-enhanced-shared input[type="checkbox"]:disabled ~ .checkmark-shared:after {
    border-color: var(--le-text-color-secondary, #aaa);
  }

  /* Legend/checkbox list styles for responsive layouts */
  .checkbox-list-responsive-shared {
    display: grid;
    gap: var(--le-padding-s, 0.75em);
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  /* Mobile-specific responsive checkbox list */
  @media (max-width: 768px) {
    .checkbox-list-responsive-shared {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--le-padding-m, 1em);
    }
  }

  /* Extra small screens - force 2 columns */
  @media (max-width: 480px) {
    .checkbox-list-responsive-shared {
      grid-template-columns: 1fr 1fr;
      gap: var(--le-padding-s, 0.75em);
    }
  }

  /* Legend item styling for checkbox lists */
  .legend-item-shared {
    display: flex;
    align-items: center;
    font-size: var(--le-font-size-small, 0.9em);
    padding: var(--le-padding-xs, 0.25em);
    border-radius: var(--le-border-radius-small, 3px);
    transition: background-color 0.2s ease;
  }

  .legend-item-shared:hover {
    background-color: var(--le-background-color-row-hover, #f9f9f9);
  }

  /* Mobile-specific legend item styling */
  @media (max-width: 768px) {
    .legend-item-shared {
      font-size: var(--le-font-size-medium, 1.2em);
      padding: var(--le-padding-s, 0.75em) var(--le-padding-xs, 0.25em);
      min-height: 3em;
    }
  }
`;

export const listStyles = `
  .list-container {
    max-height: 200px;
    overflow-y: auto;
  }
  .list-panel {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    background: var(--le-background-color-panel, #fff);
  }
  .list-panel h4 {
    margin: 0;
    padding: var(--le-padding-m, 1rem);
    background: var(--le-background-color-header, #f8f9fa);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    color: var(--le-text-color-primary, #333);
  }
  .list-panel.disabled {
    pointer-events: none;
    opacity: 0.6;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .list-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-m, 1rem);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    cursor: pointer;
    transition: background-color 0.2s ease;
    min-height: 3.5rem; /* Ensure consistent height for action buttons */
    box-sizing: border-box;
  }
  .list-panel.disabled .list-item {
    cursor: not-allowed;
  }
  .list-item:last-child {
    border-bottom: none;
  }

  /* Example of a text part within a list item that should grow */
  .list-item .list-item-text-primary {
    flex-grow: 1;
    font-size: var(--le-font-size-small, 1.2em);
    text-align: left; /* Ensure text is left-aligned */
    display: flex;
    align-items: center; /* Center text vertically within its container */
  }

  /* Example of an actions container part within a list item */
  .list-item .list-item-actions {
    flex-shrink: 0; /* Prevent actions from shrinking */
    display: flex;
    gap: var(--le-padding-xs, 0.4em); /* Increased gap */
    align-items: center;
    min-height: 2rem; /* Reserve space for buttons even when empty */
  }

  .list-item:hover {
    background-color: var(--le-background-color-hover, #f5f5f5);
  }

  .list-item.selected {
    background-color: var(--le-background-color-selected, #e3f2fd);
    border-left: 3px solid var(--le-border-color-primary, #2196f3);
    animation: highlightItem 0.6s ease-out;
  }

  @keyframes highlightItem {
    0% {
      background-color: var(--le-background-color-accent, #108CFF);
      box-shadow: 0 0 0 2px rgba(16, 140, 255, 0.3), 0 2px 8px rgba(16, 140, 255, 0.2);
    }
    100% {
      background-color: var(--le-background-color-selected, #e3f2fd);
      box-shadow: none;
    }
  }

  /* Mobile-specific list item adjustments */
  @media (max-width: 768px) {
    .list-item {
      min-height: 4rem; /* Slightly taller for mobile touch targets */
      padding: 0 var(--le-padding-xs, 1rem);;
    }
    
    .list-item .list-item-actions {
      min-height: 2.5rem; /* Larger touch targets for mobile */
    }
    
    .list-item .list-item-actions .button-shared {
      min-height: 2.5rem; /* Ensure buttons are touch-friendly */
    }
  }
`;

// SweetAlert2 Mobile-Specific Style Overrides
// These styles are specifically designed to improve the appearance and usability
// of SweetAlert2 dialogs on smaller screens (mobile devices).
// They should be injected globally by elements that use SweetAlert2.
export const sweetAlertMobileOverrides = `
      /* Injected SweetAlert2 Mobile Styles - Production v1 */
      .swal2-popup.swal-popup-mobile {
        width: 90vw !important;
        max-width: 480px !important;
        padding: var(--le-padding-m, 1rem) !important; /* Increased padding for better touch spacing */
        font-size: var(--le-font-size-base, 1.5em) !important; /* Use mobile base font size */
      }

      .swal-popup-mobile .swal2-title,
      .swal-title-mobile {
        font-size: var(--le-font-size-large, 1.4em) !important; /* Readable title size for mobile */
        padding: 0.5rem 0.5rem 0.75rem !important; /* Adjusted padding */
        margin-bottom: 0 !important; /* Remove default bottom margin if any, handled by container */
        line-height: 1.3 !important;
      }

      .swal-popup-mobile .swal2-html-container,
      .swal-html-container-mobile {
        font-size: var(--le-font-size-small, 1.0em) !important; /* Use shared variable instead of hardcoded rem */
        margin: 0.75rem 0.5rem !important; /* Vertical and horizontal margin */
        line-height: 1.5 !important;
        text-align: center !important;
      }

      .swal-popup-mobile .swal2-actions,
      .swal-actions-mobile {
        width: 100% !important;
        margin-top: 1rem !important;
        gap: 0.65rem !important; /* Space between stacked buttons */
        flex-direction: column-reverse !important; /* Stack buttons, confirm on top */
      }

      .swal-popup-mobile .swal2-styled,
      .swal-styled-mobile {
        width: 100% !important; /* Full width buttons */
        padding: 0.85rem !important; /* Generous padding for touch targets */
        font-size: var(--le-font-size-medium, 1.2em) !important;
        margin: 0 !important; /* Remove individual margins, gap handles spacing */
        border-radius: 0.3rem !important;
      }

      /* Optional: If you want to ensure default button colors are explicitly set or overridden for mobile */
      /* .swal-popup-mobile .swal2-confirm.swal-styled-mobile {
        background-color: #3085d6 !important; /* Example: Default confirm blue */
      /* }
      .swal-popup-mobile .swal2-cancel.swal-styled-mobile {
        background-color: #d33 !important; /* Example: Default cancel red */
      /* } */
`;
// SweetAlert2 Global Style Overrides
// These are general global styles for SweetAlert2 dialogs, ensuring a consistent
// base appearance. They should be injected globally by elements that use SweetAlert2.
export const sweetAlertGlobalStyles = `
  /* SweetAlert2 Global Styles */
  .swal2-popup {
    font-family: var(--le-font-family-base, sans-serif); /* Assuming you have a base font family variable */
    background-color: var(--le-background-color-panel, #fff) !important;
    border-radius: var(--le-border-radius-large, 8px) !important;
    border: 1px solid var(--le-border-color-dark, #ccc) !important;
    color: var(--le-text-color-primary, #333) !important;
  }

  .swal2-title {
    color: var(--le-text-color-primary, #333) !important;
    font-size: var(--le-font-size-large, 1.4em) !important; /* Match modal header */
    font-weight: bold !important;
  }

  .swal2-html-container {
    color: var(--le-text-color-primary, #333) !important;
    font-size: var(--le-font-size-base, 1em) !important;
    margin: var(--le-padding-m, 1.25em) !important; /* Add some margin */
  }

  .swal2-actions {
    margin-top: var(--le-padding-m, 1.25em) !important;
  }
  
  .swal2-styled { /* Base for swal buttons */
    padding: var(--le-padding-s, 0.75em) var(--le-padding-m, 1.25em) !important;
    border-radius: var(--le-border-radius-standard, 4px) !important;
    font-size: var(--le-font-size-medium, 1.15em) !important;
    text-decoration: none !important;
    /* display: inline-block !important; */ /* Removed to allow SweetAlert2 to control visibility */
    text-align: center !important;
    line-height: normal !important;
    white-space: nowrap !important;
    vertical-align: middle !important;
    user-select: none !important;
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out !important;
    border: 1px solid transparent !important; /* Start with transparent border, colors will override */
  }

  .swal2-styled:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2) !important; /* Example focus, adjust as needed */
  }

  .swal2-styled:hover:not(:disabled) {
    /* General hover, specific button types might override */
    filter: brightness(90%);
  }

  .swal2-confirm {
    background-color: var(--le-color-confirm, #28a745) !important; /* Define --le-color-confirm or use existing */
    color: var(--le-text-color-on-primary, #fff) !important;
    border-color: var(--le-color-confirm, #28a745) !important;
  }
  .swal2-confirm:hover:not(:disabled) {
    background-color: var(--le-color-confirm-hover, #218838) !important; /* Define --le-color-confirm-hover */
    border-color: var(--le-color-confirm-hover, #218838) !important;
  }

  .swal2-cancel {
    background-color: var(--le-color-cancel, #dc3545) !important; /* Define --le-color-cancel or use existing */
    color: var(--le-text-color-on-primary, #fff) !important;
    border-color: var(--le-color-cancel, #dc3545) !important;
  }
  .swal2-cancel:hover:not(:disabled) {
    background-color: var(--le-color-cancel-hover, #c82333) !important; /* Define --le-color-cancel-hover */
    border-color: var(--le-color-cancel-hover, #c82333) !important;
  }
  
  /* If you use a deny button */
  .swal2-deny {
    background-color: var(--le-color-deny, #6c757d) !important; /* Define --le-color-deny */
    color: var(--le-text-color-on-primary, #fff) !important;
    border-color: var(--le-color-deny, #6c757d) !important;
  }
  .swal2-deny:hover:not(:disabled) {
    background-color: var(--le-color-deny-hover, #5a6268) !important; /* Define --le-color-deny-hover */
    border-color: var(--le-color-deny-hover, #5a6268) !important;
  }

  /* Icon styling - optional, if you want to color default icons */
  .swal2-icon.swal2-warning {
    color: var(--le-text-color-warning, #ffc107) !important; /* Define --le-text-color-warning */
    border-color: var(--le-text-color-warning, #ffc107) !important;
  }
  .swal2-icon.swal2-error {
    color: var(--le-text-color-error, #dc3545) !important; /* Define --le-text-color-error */
    border-color: var(--le-text-color-error, #dc3545) !important;
  }
  .swal2-icon.swal2-success {
    color: var(--le-text-color-success, #28a745) !important; /* Define --le-text-color-success */
    border-color: var(--le-text-color-success, #28a745) !important;
  }
  .swal2-icon.swal2-info {
    color: var(--le-text-color-info, #17a2b8) !important; /* Define --le-text-color-info */
    border-color: var(--le-text-color-info, #17a2b8) !important;
  }
`;

export const tabStyles = `
  /* Tab System Styles */
  .modal-tabs-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
    
  .tab-navigation {
    display: flex;
    border-bottom: 2px solid var(--le-border-color-light);
    margin-bottom: var(--le-padding-m);
    gap: 0;
  }

  .tab-button {
    background: var(--le-background-color-button);
    border: 1px solid var(--le-border-color-medium);
    border-bottom: none;
    padding: var(--le-padding-s) var(--le-padding-m);
    cursor: pointer;
    font-size: var(--le-font-size-medium);
    font-weight: 500;
    color: var(--le-text-color-secondary);
    border-radius: var(--le-border-radius-standard) var(--le-border-radius-standard) 0 0;
    position: relative;
    transition: all 0.2s ease;
    min-width: 120px;
    text-align: center;
    user-select: none;
  }

  .tab-button:hover {
    background: var(--le-background-color-button-hover);
    color: var(--le-text-color-primary);
  }

  .tab-button.active {
    background: var(--le-background-color-panel);
    color: var(--le-text-color-primary);
    font-weight: 600;
    border-bottom: 2px solid var(--le-background-color-panel);
    margin-bottom: -2px;
    z-index: 1;
  }

  .tab-button:not(:last-child) {
    border-right: none;
  }

  .tab-content-container {
    flex: 1;
    min-height: 300px;
  }

  .tab-content {
    display: none;
    animation: fadeIn 0.2s ease-in;
  }

  .tab-content.active {
    display: block;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Enhanced fieldset styling for tabs */
  .tab-content fieldset {
    margin-bottom: var(--le-padding-m);
    border: 1px solid var(--le-border-color-medium);
    border-radius: var(--le-border-radius-standard);
    padding: var(--le-padding-m);
    background: var(--le-background-color-header);
  }

  .tab-content fieldset legend {
    font-weight: 600;
    color: var(--le-text-color-primary);
    padding: 0 var(--le-padding-s);
    font-size: var(--le-font-size-medium);
  }

  .tab-content fieldset:last-child {
    margin-bottom: 0;
  }

  /* Enhanced form styling within tabs */
  .tab-content .form-group {
    margin-bottom: var(--le-padding-m);
  }

  .tab-content .form-group:last-child {
    margin-bottom: 0;
  }

  .tab-content .form-group label {
    display: block;
    margin-bottom: var(--le-padding-xs);
    font-weight: 500;
    color: var(--le-text-color-primary);
  }

  .tab-content .form-group input[type="text"],
  .tab-content .form-group input[type="number"],
  .tab-content .form-group select {
    width: 100%;
    padding: var(--le-padding-s);
    border: 1px solid var(--le-border-color-dark);
    border-radius: var(--le-border-radius-standard);
    box-sizing: border-box;
    font-size: var(--le-font-size-medium);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .tab-content .form-group input[type="text"]:focus,
  .tab-content .form-group input[type="number"]:focus,
  .tab-content .form-group select:focus {
    outline: none;
    border-color: var(--le-text-color-accent);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  .tab-content .form-group input[type="checkbox"] {
    margin-right: var(--le-padding-s);
    transform: scale(1.1);
  }

  /* Enhanced rink points settings */
  .tab-content .rink-points-settings {
    border: 1px dashed var(--le-border-color-dark);
    padding: var(--le-padding-m);
    margin-top: var(--le-padding-s);
    background-color: var(--le-background-color-header);
    border-radius: var(--le-border-radius-standard);
    transition: opacity 0.3s ease;
  }

  .tab-content .rink-points-settings.disabled {
    opacity: 0.6;
  }

  /* Responsive adjustments for tabs */
  @media (max-width: 600px) {
    .tab-button {
      padding: var(--le-padding-xs) var(--le-padding-s);
      min-width: 100px;
      font-size: var(--le-font-size-small);
    }

    .form-group-grid {
      grid-template-columns: 1fr;
      gap: var(--le-padding-s);
    }

    .tab-content fieldset {
      padding: var(--le-padding-s);
    }
  }
`;

export const pagingStyles = `
  /* Paging Controls Styles */
  .paging-controls {
    display: flex;
    justify-content: flex-end;
    gap: var(--le-padding-s, 0.5rem);
    margin-top: var(--le-padding-s, 0.5rem);
  }

  .paging-btn {
    background: var(--le-background-color-button, #f5f5f5);
    border: 1px solid var(--le-border-color-dark, #ccc);
    border-radius: var(--le-border-radius-small, 3px);
    padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.7rem);
    cursor: pointer;
    font-size: var(--le-font-size-paging, var(--le-font-size-medium, 1em));
    color: var(--le-text-color-primary, #333);
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    user-select: none;
  }

  .paging-btn:hover:not(:disabled) {
    background: var(--le-background-color-button-hover, #e0e0e0);
    border-color: var(--le-border-color-dark, #bbb);
  }

  .paging-btn:disabled {
    background: var(--le-background-color-button-disabled, #eee);
    color: var(--le-text-color-secondary, #aaa);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;