export const dropdownStyles = `
  .dropdown-shared {
    position: relative;
    display: inline-block;
  }
  
  .dropdown-select-shared {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-color: var(--le-background-color-panel, #fff);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-small, 3px);
    padding: var(--le-padding-xs, 0.25rem) var(--le-padding-m, 0.75rem);
    padding-right: calc(var(--le-padding-m, 0.75rem) * 2);
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
  
  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .dropdown-select-shared {
      font-size: 1.1em;
      padding: 0.3rem 2rem 0.3rem 0.5rem;
      background-size: 0.8em;
    }
  }
  
  /* For dropdown containers that need to be right-aligned */
  .dropdown-container-right {
    display: flex;
    justify-content: flex-end;
  }
  
  /* For dropdowns within flexbox layouts */
  .dropdown-container-flex {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
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
  }

  .panel-content-shared {
    padding: var(--le-padding-m, 1.25em);
    background-color: var(--le-background-color-panel, #fff);
    /* Common border for content area if needed
    border: 1px solid var(--le-border-color-light, #f0f0f0);
    */
  }
`;

export const buttonStyles = `
  .button-shared {
    padding: var(--le-padding-s, 0.75em) var(--le-padding-m, 1.25em); /* Increased padding */
    border: 1px solid var(--le-border-color-medium, #ccc);
    background-color: var(--le-background-color-button, #f0f0f0);
    color: var(--le-text-color-primary, #333); /* Ensure text color contrasts with button background */
    cursor: pointer;
    border-radius: var(--le-border-radius-standard, 4px);
    font-size: var(--le-font-size-medium, 1.15em); /* Increased font size */
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

  /* Small button variant */
  .button-shared.button-sm {
    padding: var(--le-padding-xs, 0.4rem) var(--le-padding-s, 0.75rem); /* Increased padding */
    font-size: var(--le-font-size-small, 1em); /* Increased small font size */
    /* line-height can be tighter if needed for small buttons */
    /* line-height: 1.2; */
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
    /* Utilizes .panel-header-shared for base styling if desired, or define fully here */
    /* This example assumes it might be combined with .panel-header-shared or similar */
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
    font-size: 1.75em; /* Increased size */
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
    font-size: var(--le-font-size-medium, 1.15em); /* Increased font size */
  }

  .form-input-shared,
  .form-textarea-shared,
  .form-select-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.75em); /* Increased padding */
    border: 1px solid var(--le-border-color-dark, #ccc);
    border-radius: var(--le-border-radius-standard, 4px);
    box-sizing: border-box;
    font-size: var(--le-font-size-medium, 1.15em); /* Increased font size */
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
    font-size: var(--le-font-size-medium, 1.15em); /* Increased font size */
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
`;

export const listItemStyles = `
  .list-item-shared {
    padding: var(--le-padding-s, 0.75em) var(--le-padding-xs, 0.4em); /* Increased padding */
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    display: flex;
    align-items: center;
    justify-content: space-between; /* Common for items with actions on the right */
    gap: var(--le-padding-s, 0.75em); /* Increased gap */
  }

  .list-item-shared:last-child {
    border-bottom: none;
  }

  /* Example of a text part within a list item that should grow */
  .list-item-shared .list-item-text-primary {
    flex-grow: 1;
    font-size: var(--le-font-size-medium, 1.15em); /* Added explicit font size */
    /* Potentially add text overflow properties if needed */
    /* white-space: nowrap; */
    /* overflow: hidden; */
    /* text-overflow: ellipsis; */
  }

  /* Example of an actions container part within a list item */
  .list-item-shared .list-item-actions {
    flex-shrink: 0; /* Prevent actions from shrinking */
    display: flex;
    gap: var(--le-padding-xs, 0.4em); /* Increased gap */
  }
`;

export const mobileStyles = `
  /* Mobile-specific styling that can be added to host elements */
  
  /* Increased font sizes for better readability on mobile */
  --le-font-size-base: 1.4em;
  --le-font-size-small: 1.2em;
  --le-font-size-medium: 1.6em;
  --le-font-size-large: 1.8em;
  --le-font-size-xlarge: 2em;
  
  /* Adjust padding for better touch targets */
  --le-padding-s: 0.6rem;
  --le-padding-m: 1rem;
  
  /* Other mobile optimizations */
  font-size: var(--le-font-size-base);
  line-height: 1.4;
`; 

// SweetAlert2 Mobile-Specific Style Overrides
// These styles are specifically designed to improve the appearance and usability
// of SweetAlert2 dialogs on smaller screens (mobile devices).
// They should be injected globally by elements that use SweetAlert2.
export const sweetAlertMobileOverrides = `
      /* Injected SweetAlert2 Mobile Styles - Production v1 */
      .swal2-popup.lae-swal-popup-mobile {
        width: 90vw !important;
        max-width: 480px !important;
        padding: 1rem !important; /* Increased padding for better touch spacing */
        font-size: 1rem !important; /* Base font size for content */
      }

      .lae-swal-popup-mobile .swal2-title,
      .lae-swal-title-mobile {
        font-size: 1.4rem !important; /* Readable title size for mobile */
        padding: 0.5rem 0.5rem 0.75rem !important; /* Adjusted padding */
        margin-bottom: 0 !important; /* Remove default bottom margin if any, handled by container */
        line-height: 1.3 !important;
      }

      .lae-swal-popup-mobile .swal2-html-container,
      .lae-swal-html-container-mobile {
        font-size: 0.95rem !important; /* Slightly smaller for body text */
        margin: 0.75rem 0.5rem !important; /* Vertical and horizontal margin */
        line-height: 1.5 !important;
        text-align: center !important;
      }

      .lae-swal-popup-mobile .swal2-actions,
      .lae-swal-actions-mobile {
        width: 100% !important;
        margin-top: 1rem !important;
        gap: 0.65rem !important; /* Space between stacked buttons */
        flex-direction: column-reverse !important; /* Stack buttons, confirm on top */
      }

      .lae-swal-popup-mobile .swal2-styled,
      .lae-swal-styled-mobile {
        width: 100% !important; /* Full width buttons */
        padding: 0.85rem !important; /* Generous padding for touch targets */
        font-size: 1rem !important;
        margin: 0 !important; /* Remove individual margins, gap handles spacing */
        border-radius: 0.3rem !important;
      }

      /* Optional: If you want to ensure default button colors are explicitly set or overridden for mobile */
      /* .lae-swal-popup-mobile .swal2-confirm.lae-swal-styled-mobile {
        background-color: #3085d6 !important; /* Example: Default confirm blue */
      /* }
      .lae-swal-popup-mobile .swal2-cancel.lae-swal-styled-mobile {
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