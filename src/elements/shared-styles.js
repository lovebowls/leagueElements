export const utilityStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export const panelStyles = `
  .panel-header-shared {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em); /* Using --le- as a placeholder for theme variables */
    border-bottom: 1px solid var(--le-border-color-medium, #eee);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-header, #f9f9f9);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-content-shared {
    padding: var(--le-padding-m, 1em);
    background-color: var(--le-background-color-panel, #fff);
    /* Common border for content area if needed
    border: 1px solid var(--le-border-color-light, #f0f0f0);
    */
  }
`;

export const buttonStyles = `
  .button-shared {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
    border: 1px solid var(--le-border-color-medium, #ccc);
    background-color: var(--le-background-color-button, #f0f0f0);
    color: var(--le-text-color-primary, #333); /* Ensure text color contrasts with button background */
    cursor: pointer;
    border-radius: var(--le-border-radius-standard, 4px);
    font-size: var(--le-font-size-medium, 1em); /* Base button font size, can be overridden */
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
    padding: var(--le-padding-xs, 0.25rem) var(--le-padding-s, 0.5rem);
    font-size: var(--le-font-size-small, 0.9em);
    /* line-height can be tighter if needed for small buttons */
    /* line-height: 1.2; */
  }

  /* Variations - consider if needed, or handle with specific component styles */
  /*
  .button-shared.primary {
    background-color: var(--le-color-primary, #007bff);
    color: var(--le-text-color-on-primary, #fff);
    border-color: var(--le-color-primary, #007bff);
  }
  .button-shared.primary:hover:not(:disabled) {
    background-color: var(--le-color-primary-hover, #0056b3);
    border-color: var(--le-color-primary-hover, #0056b3);
  }

  .button-shared.accent {
    background-color: var(--le-color-accent, #2196f3);
    color: var(--le-text-color-on-primary, #fff);
    border-color: var(--le-color-accent, #2196f3);
  }
  .button-shared.accent:hover:not(:disabled) {
    background-color: var(--le-color-accent-hover, #1976d2);
    border-color: var(--le-color-accent-hover, #1976d2);
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
    width: var(--le-modal-width, 80%);
    max-width: var(--le-modal-max-width, 600px);
    border-radius: var(--le-border-radius-large, 8px);
    box-shadow: var(--le-shadow-modal, 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19));
    display: flex;
    flex-direction: column;
  }

  .modal-shared-header {
    /* Utilizes .panel-header-shared for base styling if desired, or define fully here */
    /* This example assumes it might be combined with .panel-header-shared or similar */
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
    border-bottom: 1px solid var(--le-border-color-medium, #eee);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-header, #f9f9f9); /* Modal header distinct background */
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--le-font-size-large, 1.2em);
    border-top-left-radius: var(--le-border-radius-large, 8px); /* Match content radius */
    border-top-right-radius: var(--le-border-radius-large, 8px); /* Match content radius */
  }

  .modal-shared-header .close-button-shared { /* Specific styling for a close button if needed */
    color: var(--le-text-color-secondary, #aaa);
    font-size: 1.5em;
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
    padding: var(--le-padding-m, 1em);
    overflow-y: auto; /* Allow body to scroll if content is too long */
    flex-grow: 1; /* Allows body to take up available space if modal has fixed height */
  }

  .modal-shared-footer {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
    text-align: right;
    border-top: 1px solid var(--le-border-color-medium, #eee);
    background-color: var(--le-background-color-header, #f9f9f9); /* Optional: footer background */
    border-bottom-left-radius: var(--le-border-radius-large, 8px); /* Match content radius */
    border-bottom-right-radius: var(--le-border-radius-large, 8px); /* Match content radius */
  }

  .modal-shared-footer .button-shared + .button-shared { /* Spacing between buttons in footer */
    margin-left: var(--le-padding-s, 0.5em);
  }
`;

export const formStyles = `
  .form-group-shared {
    margin-bottom: var(--le-padding-m, 1em);
  }

  .form-label-shared {
    display: block;
    margin-bottom: var(--le-padding-xs, 0.25em);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    font-size: var(--le-font-size-medium, 1em);
  }

  .form-input-shared,
  .form-textarea-shared,
  .form-select-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.5em);
    border: 1px solid var(--le-border-color-dark, #ccc);
    border-radius: var(--le-border-radius-standard, 4px);
    box-sizing: border-box;
    font-size: var(--le-font-size-medium, 1em);
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
    font-size: var(--le-font-size-medium, 1em);
    color: var(--le-text-color-primary, #333);
  }

  .form-checkbox-label-shared input[type="checkbox"] {
    margin-right: var(--le-padding-s, 0.5em);
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
    padding: var(--le-padding-s, 0.5em) var(--le-padding-xs, 0.25em); /* Vertical padding S, horizontal XS by default */
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    display: flex;
    align-items: center;
    justify-content: space-between; /* Common for items with actions on the right */
    gap: var(--le-padding-s, 0.5em); /* Gap between items if they wrap or have multiple elements */
  }

  .list-item-shared:last-child {
    border-bottom: none;
  }

  /* Example of a text part within a list item that should grow */
  .list-item-shared .list-item-text-primary {
    flex-grow: 1;
    /* Potentially add text overflow properties if needed */
    /* white-space: nowrap; */
    /* overflow: hidden; */
    /* text-overflow: ellipsis; */
  }

  /* Example of an actions container part within a list item */
  .list-item-shared .list-item-actions {
    flex-shrink: 0; /* Prevent actions from shrinking */
    display: flex;
    gap: var(--le-padding-xs, 0.25em);
  }
`; 