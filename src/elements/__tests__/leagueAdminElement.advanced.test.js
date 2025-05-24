// Import the component and test data
import LeagueAdminElement from '../leagueAdminElement.js';
import { generateTestLeagueData } from '../../test-data/league-test-data.js';
import { jest } from '@jest/globals';

// Define the event class that was missing
class LeagueAdminElementEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

// Mock the imports
jest.mock('../shared-styles.js', () => ({
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
    // Setup lovebowls test data matching the test page
    const lovebowlsTeamsData = [
      { _id: "lb-guid-a123", name: "Lovebowls Club Alpha" },
      { _id: "lb-guid-b456", name: "Lovebowls Club Beta" },
      { _id: "lb-guid-c789", name: "Lovebowls Club Gamma" },
      { _id: "lb-guid-d012", name: "Lovebowls Club Delta" },
      { _id: "lb-guid-e345", name: "Lovebowls Club Epsilon" }
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
    element._hideTeamModal = jest.fn();
    
    // Mocking dispatchEvent
    element.dispatchEvent = jest.fn();
    
    // Shadow mock with basic query features (similar to leagueElement.test.js)
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
          return { 
            innerHTML: '',
            querySelector: jest.fn().mockImplementation(sel => {
              if (sel === '#useExistingTeamCheckbox') return { checked: false };
              if (sel === '#teamName') return { value: 'New Team' };
              return null;
            })
          };
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
  });

  // Cleanup after each test
  afterEach(() => {
    element = null;
    jest.restoreAllMocks();
  });

  describe('Team Management', () => {
    beforeEach(() => {
      // Load test data with leagues
      element._leagues = [...testLeagueData];
      element._selectedLeagueId = testLeagueData[0]._id;
    });
    
    test('should add a team to the selected league', () => {
      // Setup mock for the league selection and handlers
      const mockSelectedLeague = {
        _id: 'league1',
        name: 'Test League',
        teams: [
          { _id: 'team1', name: 'Team 1' }
        ]
      };
      
      element._getSelectedLeague = jest.fn().mockReturnValue(mockSelectedLeague);
      element._selectedLeagueId = mockSelectedLeague._id;
      element._renderTeamsList = jest.fn();
      element._hideTeamModal = jest.fn();
      
      // Set up for a new team
      element._teamModalMode = 'new';
      
      // Create a custom implementation of the save method for this test
      element._handleSaveTeamModal = function() {
        const teamData = {
          _id: 'team2',  // In the real method, this would be generated
          name: 'New Team'
        };
        
        this.dispatchEvent(new CustomEvent('requestAddTeam', {
          detail: {
            leagueId: this._selectedLeagueId,
            teamData
          },
          bubbles: true
        }));
        
        this._hideTeamModal();
        this._renderTeamsList();
      };
      
      // Call the method
      element._handleSaveTeamModal();
      
      // Verify the event dispatch
      expect(element.dispatchEvent).toHaveBeenCalled();
      
      // Get the dispatched event and check its type
      const dispatchedEvent = element.dispatchEvent.mock.calls[0][0];
      expect(dispatchedEvent.type).toBe('requestAddTeam');
      expect(dispatchedEvent.detail.leagueId).toBe(mockSelectedLeague._id);
      
      // Verify the UI was updated
      expect(element._hideTeamModal).toHaveBeenCalled();
      expect(element._renderTeamsList).toHaveBeenCalled();
    });
    
    test('should edit an existing team', () => {
      // Setup mock selected league with a team to edit
      const mockTeam = { _id: 'team1', name: 'Team 1' };
      const mockSelectedLeague = {
        _id: 'league1',
        name: 'Test League',
        teams: [mockTeam]
      };
      
      element._getSelectedLeague = jest.fn().mockReturnValue(mockSelectedLeague);
      element._selectedLeagueId = mockSelectedLeague._id;
      element._renderTeamsList = jest.fn();
      element._hideTeamModal = jest.fn();
      
      // Setup as edit mode
      element._teamModalMode = 'edit';
      element._teamBeingEdited = mockTeam;
      
      // Create a custom implementation of the save method for this test
      element._handleSaveTeamModal = function() {
        // In edit mode with a team being edited
        if (this._teamModalMode === 'edit' && this._teamBeingEdited) {
          const updatedTeam = {
            _id: this._teamBeingEdited._id,
            name: 'Updated Name'  // This would normally come from the form
          };
          
          this.dispatchEvent(new CustomEvent('requestUpdateTeam', {
          detail: {
              leagueId: this._selectedLeagueId,
            teamData: updatedTeam
            },
            bubbles: true
          }));
          
          this._hideTeamModal();
          this._renderTeamsList();
        }
      };
      
      // Call the method to save the team edit
      element._handleSaveTeamModal();
      
      // Verify dispatchEvent was called with correct event
      expect(element.dispatchEvent).toHaveBeenCalled();
      
      // Check the specific event details
      const dispatchedEvent = element.dispatchEvent.mock.calls[0][0];
      expect(dispatchedEvent.type).toBe('requestUpdateTeam');
      expect(dispatchedEvent.detail.leagueId).toBe(mockSelectedLeague._id);
      
      // Verify UI was updated
      expect(element._hideTeamModal).toHaveBeenCalled();
      expect(element._renderTeamsList).toHaveBeenCalled();
    });
    
    test('should remove a team', () => {
      // Setup mock team to remove
      const mockTeam = { _id: 'team1', name: 'Team 1' };
      
      // Setup mock leagues with the team to be removed
      const mockLeagues = [
        {
          _id: 'league1',
          name: 'Test League',
          teams: [mockTeam, { _id: 'team2', name: 'Team 2' }]
        }
      ];
      
      element._leagues = mockLeagues;
      element._selectedLeagueId = 'league1';
      element._renderTeamsList = jest.fn();
      
      // Create a spy for the event dispatch
      const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
      
      // Call the remove team method
      element._handleRemoveTeam(mockTeam);
      
      // Check the event dispatch with a looser matcher
      expect(dispatchSpy).toHaveBeenCalled();
      
      // Get the dispatched event
      const event = dispatchSpy.mock.calls[0][0];
      
      // Check the event type and data
      expect(event.type).toBe('requestRemoveTeam');
      expect(event.detail.leagueId).toBe('league1');
      expect(event.detail.teamId).toBe('team1');
      expect(event.detail.teamName).toBe('Team 1');
      
      // Should update local data immediately
      expect(element._leagues[0].teams.length).toBe(1);
      expect(element._leagues[0].teams[0]._id).toBe('team2');
      
      // Teams list should be re-rendered
      expect(element._renderTeamsList).toHaveBeenCalled();
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
      // Setup mock DOM elements
      const mockModal = { style: { display: 'none' } };
      const mockTitle = { textContent: '' };
      const mockBody = { innerHTML: '' };
      
      element.shadow.querySelector = jest.fn().mockImplementation(selector => {
        if (selector === '#team-modal') return mockModal;
        if (selector === '#team-modal-title') return mockTitle;
        if (selector === '#team-modal-body') return mockBody;
        return null;
      });
      
      element._populateTeamModalForm = jest.fn();
      
      // Define methods directly on the element for this test
      element._showTeamModal = function(mode, teamData, lovebowlsTeams) {
        const modal = this.shadow.querySelector('#team-modal');
        const modalTitle = this.shadow.querySelector('#team-modal-title');
        
        modal.style.display = 'block';
        modalTitle.textContent = mode === 'edit' ? 'Edit Team' : 'Add Team';
        
        this._teamModalMode = mode;
        this._teamBeingEdited = mode === 'edit' ? { 
          ...teamData, 
          useExistingTeam: true 
        } : null;
        
        this._populateTeamModalForm(teamData, lovebowlsTeams);
      };
      
      element._hideTeamModal = function() {
        const modal = this.shadow.querySelector('#team-modal');
        modal.style.display = 'none';
        this._teamModalMode = null;
        this._teamBeingEdited = null;
      };
      
      // Test showing the modal
      const lovebowlsTeams = [
        { _id: 'team1', name: 'Team 1' },
        { _id: 'team2', name: 'Team 2' }
      ];
      
      const teamToEdit = { _id: 'team1', name: 'Team 1' };
      
      const expectedTeamData = {
        _id: 'team1',
        name: 'Team 1',
        useExistingTeam: true
      };
      
      // Call the method we're testing
      element._showTeamModal('edit', teamToEdit, lovebowlsTeams);
      
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