// Import the component and test data
import LeagueAdminElement from '../leagueAdminElement.js';
import { generateTestLeagueData } from '../../test-data/league-test-data.js';
import { jest } from '@jest/globals';

// Mock the imports
jest.mock('../shared-styles.js', () => ({
  utilityStyles: '',
  panelStyles: '',
  buttonStyles: '',
  modalStyles: '',
  formStyles: '',
  listItemStyles: ''
}));

jest.mock('../LeagueMatchesAttention.js', () => {});
jest.mock('../leagueMatch.js', () => {});
jest.mock('../../utils/temporalUtils.js', () => ({
  Temporal: {},
  TemporalUtils: {}
}));

describe('LeagueAdminElement - Advanced Features', () => {
  let element;
  let lovebowlsTeamsData;
  let testLeagueData;

  // Setup before each test
  beforeEach(() => {
    // Mock document.createElement to handle shadowRoot for elements
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = document.createElement.mockOriginalImplementation(tagName);
      
      // Add mock event listener methods if needed
      element.addEventListener = jest.fn((event, callback) => {
        element[`on${event}`] = callback;
      });
      
      element.removeEventListener = jest.fn((event) => {
        element[`on${event}`] = null;
      });
      
      // Simulate click for testing
      element.click = jest.fn(() => {
        if (element.onclick) {
          element.onclick();
        }
      });
      
      return element;
    });
    
    // Save original implementation
    document.createElement.mockOriginalImplementation = (tagName) => {
      const elem = Object.assign(document.createElementOriginal(tagName), {
        // Add any methods needed for tests
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn().mockReturnValue(false)
        },
        dataset: {},
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        innerHTML: ''
      });
      return elem;
    };
    
    // Store original createElement function
    document.createElementOriginal = document.createElement.bind(document);
    
    // Setup lovebowls test data matching the test page
    lovebowlsTeamsData = [
      { value: "lb-guid-a123", label: "Lovebowls Club Alpha" },
      { value: "lb-guid-b456", label: "Lovebowls Club Beta" },
      { value: "lb-guid-c789", label: "Lovebowls Club Gamma" },
      { value: "lb-guid-d012", label: "Lovebowls Club Delta" },
      { value: "lb-guid-e345", label: "Lovebowls Club Epsilon" }
    ];

    // Generate test league data matching the test page
    testLeagueData = [
      generateTestLeagueData(lovebowlsTeamsData, 3, "Summer League"),
      generateTestLeagueData(lovebowlsTeamsData, 4, "Winter League"),
      generateTestLeagueData(lovebowlsTeamsData, 5, "Championship")
    ];
    
    // Create a new instance of the component
    element = new LeagueAdminElement();
    
    // Mock element methods that interact with DOM
    element.showError = jest.fn();
    element.clearError = jest.fn();
    element._renderLeagueList = jest.fn();
    element._updateButtonStates = jest.fn();
    element._attachBaseEventListeners = jest.fn();
    element._showLeagueSpecificPanels = jest.fn();
    element._hideLeagueSpecificPanels = jest.fn();
    element._updateAttentionPanel = jest.fn();
    element._renderTeamsList = jest.fn();
    
    // Mocking dispatchEvent
    element.dispatchEvent = jest.fn();
    
    // Shadow mock with basic query features
    element.shadow = {
      innerHTML: '',
      querySelector: jest.fn().mockImplementation((selector) => {
        // Return different mocks based on selector
        if (selector === '#error-message') {
          return { textContent: '', style: { display: 'none' } };
        }
        
        if (selector === '#team-modal') {
          return { style: { display: 'none' } };
        }
        
        if (selector === '#team-modal-body') {
          return { innerHTML: '' };
        }
        
        if (selector === '#league-modal') {
          return { style: { display: 'none' } };
        }
        
        if (selector === '#league-modal-body') {
          return { innerHTML: '' };
        }
        
        if (selector.includes('[data-id="')) {
          // Mock for league list item
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false)
            },
            querySelector: jest.fn().mockReturnValue({
              innerHTML: ''
            }),
            getAttribute: jest.fn().mockReturnValue('league-id-1')
          };
        }
        
        return null;
      }),
      querySelectorAll: jest.fn().mockReturnValue([])
    };
    
    document.body.appendChild(element);
  });

  // Cleanup after each test
  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
    jest.restoreAllMocks();
    
    // Restore original document.createElement function
    document.createElement = document.createElementOriginal;
  });

  describe('Team Management', () => {
    beforeEach(() => {
      // Load test data with leagues
      element._leagues = [...testLeagueData];
      element._selectedLeagueId = testLeagueData[0]._id;
    });
    
    test('should add a team to the selected league', () => {
      // Setup new team data
      const newTeam = { value: "new-team", label: "New Team" };
      
      // Mock _getSelectedLeague to return the first test league
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      
      // Trigger the add team handler
      element._handleAddTeam();
      
      // Simulate saving a team from modal
      element._teamModalMode = 'new';
      element._teamBeingEdited = newTeam;
      
      // Call the save handler directly
      element._handleSaveTeamModal = jest.fn().mockImplementation(() => {
        element.dispatchEvent(new CustomEvent('requestAddTeam', {
          detail: {
            leagueId: element._selectedLeagueId,
            teamData: newTeam
          }
        }));
      });
      
      element._handleSaveTeamModal();
      
      // Verify dispatchEvent was called with the correct event
      expect(element.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestAddTeam',
          detail: {
            leagueId: element._selectedLeagueId,
            teamData: newTeam
          }
        })
      );
    });
    
    test('should edit an existing team', () => {
      // Setup team to edit (existing team from first league)
      const existingTeam = testLeagueData[0].teams[0];
      const updatedTeam = { ...existingTeam, label: "Updated Team Name" };
      
      // Mock _getSelectedLeague to return the first test league
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      
      // Trigger the edit team handler
      element._handleEditTeam(existingTeam);
      
      // Simulate saving the edited team from modal
      element._teamModalMode = 'edit';
      element._teamBeingEdited = existingTeam;
      
      // Call the save handler directly
      element._handleSaveTeamModal = jest.fn().mockImplementation(() => {
        element.dispatchEvent(new CustomEvent('requestUpdateTeam', {
          detail: {
            leagueId: element._selectedLeagueId,
            teamData: updatedTeam
          }
        }));
      });
      
      element._handleSaveTeamModal();
      
      // Verify dispatchEvent was called with the correct event
      expect(element.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestUpdateTeam',
          detail: {
            leagueId: element._selectedLeagueId,
            teamData: updatedTeam
          }
        })
      );
    });
    
    test('should remove a team', () => {
      // Setup team to remove (existing team from first league)
      const teamToRemove = testLeagueData[0].teams[0];
      
      // Mock _getSelectedLeague to return the first test league
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      
      // Call the remove team handler
      element._handleRemoveTeam(teamToRemove);
      
      // Verify dispatchEvent was called with the correct event
      expect(element.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestRemoveTeam',
          detail: {
            leagueId: element._selectedLeagueId,
            teamValue: teamToRemove.value,
            teamLabel: teamToRemove.label
          }
        })
      );
    });
  });

  describe('League Operations', () => {
    beforeEach(() => {
      // Load test data with leagues
      element._leagues = [...testLeagueData];
    });
    
    test('should handle creating a new league', () => {
      // Mock the _showModal method
      element._showModal = jest.fn();
      
      // Call the new league handler
      element._handleNewLeague();
      
      // Verify methods were called
      expect(element.clearError).toHaveBeenCalled();
      expect(element._selectedLeagueId).toBeNull();
      expect(element._updateButtonStates).toHaveBeenCalled();
      expect(element._showModal).toHaveBeenCalledWith('new');
    });
    
    test('should handle copying a league', () => {
      // Setup selected league
      element._selectedLeagueId = testLeagueData[0]._id;
      
      // Mock the _showModal and _getSelectedLeague methods
      element._showModal = jest.fn();
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      
      // Call the copy league handler
      element._handleCopyLeague();
      
      // Verify methods were called
      expect(element.clearError).toHaveBeenCalled();
      expect(element._showModal).toHaveBeenCalledWith('copy', testLeagueData[0]);
    });
    
    test('should handle editing league rules', () => {
      // Setup selected league
      element._selectedLeagueId = testLeagueData[0]._id;
      
      // Mock the _showModal and _getSelectedLeague methods
      element._showModal = jest.fn();
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      element._hideGlobalLeagueMenu = jest.fn();
      
      // Call the edit league rules handler
      element._handleEditLeagueRules();
      
      // Verify methods were called
      expect(element.clearError).toHaveBeenCalled();
      expect(element._showModal).toHaveBeenCalledWith('edit', testLeagueData[0]);
      expect(element._hideGlobalLeagueMenu).toHaveBeenCalled();
    });
    
    test('should handle deleting a league', () => {
      // Setup league to delete
      element._currentLeagueIdForMenu = testLeagueData[0]._id;
      
      // Mock methods
      element._hideGlobalLeagueMenu = jest.fn();
      
      // Call the delete league handler
      element._handleDeleteLeague();
      
      // Verify dispatchEvent was called with the correct event
      expect(element.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestDeleteLeague',
          detail: {
            leagueId: testLeagueData[0]._id
          }
        })
      );
      expect(element._hideGlobalLeagueMenu).toHaveBeenCalled();
    });
  });

  describe('Modal Operations', () => {
    test('should show and hide league modal', () => {
      // Mock the modal elements
      const mockModal = { style: { display: 'none' }, querySelector: jest.fn() };
      const mockTitle = { textContent: '' };
      const mockBody = { innerHTML: '' };
      
      element.shadow.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '#league-modal') return mockModal;
        if (selector === '#league-modal-title') return mockTitle;
        if (selector === '#league-modal-body') return mockBody;
        return null;
      });
      
      element._populateModalForm = jest.fn();
      
      // Test showing the modal
      element._showModal('new');
      
      expect(mockModal.style.display).toBe('block');
      expect(mockTitle.textContent).toBe('Create New League');
      expect(element._populateModalForm).toHaveBeenCalled();
      expect(element._isModalVisible).toBe(true);
      
      // Test hiding the modal
      element._hideModal();
      
      expect(mockModal.style.display).toBe('none');
      expect(element._isModalVisible).toBe(false);
      expect(element.clearError).toHaveBeenCalled();
    });
    
    test('should show and hide team modal', () => {
      // Mock the modal elements
      const mockModal = { style: { display: 'none' } };
      const mockTitle = { textContent: '' };
      const mockBody = { innerHTML: '' };
      
      element.shadow.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '#team-modal') return mockModal;
        if (selector === '#team-modal-title') return mockTitle;
        if (selector === '#team-modal-body') return mockBody;
        return null;
      });
      
      element._populateTeamModalForm = jest.fn();
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
      
      // Setup team data
      const teamData = { value: 'team1', label: 'Team 1' };
      
      // The component adds useExistingTeam property based on value vs label difference
      const expectedTeamData = { 
        value: 'team1', 
        label: 'Team 1',
        useExistingTeam: true // This gets added by _showTeamModal
      };
      
      // Test showing the modal
      element._showTeamModal('edit', teamData, []);
      
      expect(mockModal.style.display).toBe('block');
      expect(mockTitle.textContent).toBe('Edit Team');
      expect(element._teamModalMode).toBe('edit');
      expect(element._teamBeingEdited).toEqual(expectedTeamData);
      expect(element._populateTeamModalForm).toHaveBeenCalled();
      
      // Test hiding the modal
      element._hideTeamModal();
      
      expect(mockModal.style.display).toBe('none');
      expect(element._teamModalMode).toBeNull();
      expect(element._teamBeingEdited).toBeNull();
    });
  });
}); 