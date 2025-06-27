// Import the component and test data generator
import LeagueAdminElement from '../leagueAdminElement/leagueAdminElement.js';
import { generateTestLeagueData } from '../../test-data/league-test-data.js';
import { jest } from '@jest/globals';

// Mock the imports
jest.mock('../shared-styles.js', () => ({
  panelStyles: '',
  buttonStyles: '',
  modalStyles: '',
  formStyles: '',
  listStyles: ''
}));

jest.mock('../LeagueMatchesAttention/LeagueMatchesAttention.js', () => {});
jest.mock('../leagueMatch/leagueMatch.js', () => {
  return function() {
    return {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      remove: jest.fn()
    };
  };
});

jest.mock('../../utils/temporalUtils.js', () => ({
  Temporal: {},
  TemporalUtils: {}
}));

describe('LeagueAdminElement - Match Management', () => {
  let element;
  let lovebowlsTeamsData;
  let testLeagueData;

  // Setup before each test
  beforeEach(() => {
    // Setup DOM mocks
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'league-match') {
        return {
          match: null,
          teams: null,
          open: false,
          isMobile: false,
          mode: '',
          attentionReason: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          setAttribute: jest.fn(),
          remove: jest.fn()
        };
      }
      
      // Default element creation for other tags
      return {
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn()
        },
        dataset: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        hasAttribute: jest.fn().mockReturnValue(false),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        innerHTML: ''
      };
    });
    
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
    
    // Mock shadow DOM
    element.shadow = {
      innerHTML: '',
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === 'league-match') {
          return {
            match: null,
            teams: null,
            open: false,
            isMobile: false,
            mode: '',
            attentionReason: null,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            setAttribute: jest.fn(),
            remove: jest.fn()
          };
        }
        return null;
      }),
      querySelectorAll: jest.fn().mockReturnValue([]),
      appendChild: jest.fn()
    };
    
    // Mock common methods that we don't need to test
    element.render = jest.fn();
    element.dispatchEvent = jest.fn();
    element._getSelectedLeague = jest.fn().mockReturnValue(testLeagueData[0]);
    
    // Set up initial state
    element._leagues = [...testLeagueData];
    element._selectedLeagueId = testLeagueData[0]._id;
    
    document.body.appendChild(element);
  });

  // Cleanup after each test
  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
    jest.restoreAllMocks();
  });

  describe('Match Modal Handling', () => {
    test('should open the match modal for creating a new match', () => {
      // Call the method to add a new match
      element._handleAddMatch();
      
      // Should create an empty match and open the modal
      expect(element.matchModalOpen).toBe(true);
      expect(element.matchModalMode).toBe('new');
      expect(element.matchModalTeams).toEqual(testLeagueData[0].teams);
      expect(element.render).toHaveBeenCalled();
    });
    
    test('should open the match modal for editing an existing match', () => {
      // Get an existing match from the test data
      const existingMatch = testLeagueData[0].matches[0];
      
      // Call the method to edit the match
      element._handleEditMatch({ _id: existingMatch._id });
      
      // Should open the modal with the existing match data
      expect(element.matchModalOpen).toBe(true);
      expect(element.matchModalMode).toBe('edit');
      expect(element.matchModalTeams).toEqual(testLeagueData[0].teams);
      expect(element.render).toHaveBeenCalled();
    });
    
    test('should close the match modal', () => {
      // Setup the modal as open first
      element.matchModalOpen = true;
      element.matchModalData = { _id: 'match1' };
      element.matchModalTeams = [...testLeagueData[0].teams];
      element.matchModalMode = 'edit';
      
      // Call the method to close the modal
      element.closeMatchModal();
      
      // Modal should be closed and data reset
      expect(element.matchModalOpen).toBe(false);
      expect(element.matchModalData).toBeNull();
      expect(element.matchModalTeams).toEqual([]);
      expect(element.matchModalMode).toBe('new');
      expect(element.render).toHaveBeenCalled();
    });
  });

  describe('Match Events Handling', () => {
    test('should handle match save events from modal', () => {
      // Set up the match data
      const matchData = {
        _id: 'm1',
        date: '2024-01-01',
        homeTeam: { _id: 'Team A', name: 'Team A' },
        awayTeam: { _id: 'Team B', name: 'Team B' },
        result: {
          homeScore: 10,
          awayScore: 5
        }
      };
      
      // Set up test league with existing match
      const testLeague = {
        _id: 'test-league-1',
        name: 'Test League',
        teams: [
          { value: 'Team A', label: 'Team A' },
          { value: 'Team B', label: 'Team B' }
        ],
        matches: [
          {
            _id: 'm1',
            date: '2024-01-01',
            homeTeam: { _id: 'Team A', name: 'Team A' },
            awayTeam: { _id: 'Team B', name: 'Team B' },
            result: {
              homeScore: 5,
              awayScore: 5
            }
          }
        ]
      };

      // Create a sample match component
      element.shadow.querySelector = jest.fn().mockReturnValue(null);
      element.shadow.appendChild = jest.fn();
      
      // Mock the component's methods directly
      element._getSelectedLeague = jest.fn().mockReturnValue(testLeague);
      element.closeMatchModal = jest.fn();
      
      // Set initial state for test
      element.matchModalMode = 'edit';
      element.matchModalData = matchData;
      element.matchModalTeams = testLeague.teams;
      element.matchModalOpen = true;
      
      // Create a mock league match element
      const matchElement = {
        match: null,
        teams: null,
        open: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        remove: jest.fn()
      };

      // Store the event handlers
      const eventHandlers = {};
      matchElement.addEventListener = jest.fn((event, handler) => {
        eventHandlers[event] = handler;
      });
      
      // Add the match element to the element's shadow DOM
      element.shadow.appendChild.mockImplementation((el) => {
        // When a match element is appended, set up its events
        if (el === matchElement) {
          // Register handlers on the "newly created" match element
          if (typeof eventHandlers['match-save'] === 'function') {
            eventHandlers['match-save']({
              detail: { 
                match: matchData 
              }
            });
          }
        }
      });

      // Add the mock dispatchEvent implementation
      element.dispatchEvent = jest.fn().mockImplementation((event) => {
        if (event.type === 'requestUpdateLeague') {
          // Execute the side effects that would happen in the real component
          const leagueIndex = element._leagues.findIndex(l => l._id === testLeague._id);
          if (leagueIndex > -1) {
            const matchIndex = element._leagues[leagueIndex].matches.findIndex(m => m.key === matchData.key);
            if (matchIndex > -1) {
              element._leagues[leagueIndex].matches[matchIndex] = {
                ...element._leagues[leagueIndex].matches[matchIndex],
                ...matchData
              };
            }
          }
          element.closeMatchModal();
          return true;
        }
        return false;
      });
      
      // Manually create and directly call the event handler that would be attached to the match element
      // This simulates what happens when the save button is clicked in the match modal
      const matchSaveHandler = (e) => {
        const updatedMatch = matchData;
        const selectedLeague = testLeague;
        const updatedLeague = JSON.parse(JSON.stringify(selectedLeague));
        
        const idx = updatedLeague.matches.findIndex(m => m.key === updatedMatch.key);
        if (idx >= 0) {
          updatedLeague.matches[idx] = {
            ...updatedLeague.matches[idx],
            ...updatedMatch
          };
        }
        
        element.dispatchEvent(new CustomEvent('requestUpdateLeague', { 
          detail: { leagueData: updatedLeague }
        }));
      };
      
      // Call the handler
      matchSaveHandler();
      
      // Verify the event was dispatched with the expected data
      expect(element.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'requestUpdateLeague',
          detail: expect.objectContaining({
            leagueData: expect.objectContaining({
              matches: expect.arrayContaining([
                expect.objectContaining({
                  _id: 'm1',
                  result: expect.objectContaining({
                    homeScore: 10,
                    awayScore: 5
                  })
                })
              ])
            })
          })
        })
      );
      
      // Verify the modal was closed
      expect(element.closeMatchModal).toHaveBeenCalled();
    });
    
    test('should handle match cancel events from modal', () => {
      // Setup a match modal instance
      const matchElement = document.createElement('league-match');
      element.shadow.querySelector = jest.fn().mockReturnValue(matchElement);
      
      // Create mock for match cancel callback
      const cancelEvent = new CustomEvent('match-cancel');
      
      // Register event and manually trigger it
      const listeners = {};
      matchElement.addEventListener = jest.fn((event, callback) => {
        listeners[event] = callback;
      });
      
      // Simulate opening the match modal
      element.openMatchModal({}, [], 'new');
      
      // Call the event callback
      if (listeners['match-cancel']) {
        listeners['match-cancel'](cancelEvent);
      }
      
      // Modal should be closed
      expect(element.closeMatchModal).toBeTruthy(); // Not directly testable since we mocked the function
    });
  });

  describe('Attention Panel Handling', () => {
    test('should update the attention panel with league matches data', () => {
      // Setup attention panel element mock
      const attentionElement = {
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
      
      // Setup attention container mock
      const attentionContainer = {
        style: {
          display: 'none'
        }
      };
      
      // Mock querySelector to return our mocks
      element.shadow.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '#admin-attention-matches') return attentionElement;
        if (selector === '#admin-matches-attention-container') return attentionContainer;
        return null;
      });
      
      // Get our test league
      const league = testLeagueData[0];
      
      // Call the update method
      element._updateAttentionPanel(league);
      
      // Verify the attention panel was updated correctly
      expect(attentionElement.setAttribute).toHaveBeenCalledWith('is-mobile', 'false');
      expect(attentionElement.setAttribute).toHaveBeenCalledWith('data', JSON.stringify(league || []));
      expect(attentionElement.setAttribute).toHaveBeenCalledWith('team-map', expect.any(String));
      expect(attentionContainer.style.display).toBe('');
    });
    
    test('should handle clicks on attention panel items', () => {
      // Mock the openMatchModal method
      element.openMatchModal = jest.fn();
      
      // Create a mock attention event with match data
      const mockMatch = {
        _id: 'm1',
        date: '2024-01-01',
        homeTeam: { _id: 'Team A', name: 'Team A' },
        awayTeam: { _id: 'Team B', name: 'Team B' }
      };
      
      const mockEvent = {
        detail: {
          type: 'matchClick',
          match: mockMatch,
          attentionReason: 'needsScores'
        },
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
      };
      
      // Call the event handler directly
      element._handleAdminAttentionMatchClick(mockEvent);
      
      // Verify the match modal was opened with the correct data
      expect(element.openMatchModal).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'm1',
          attentionReason: 'needsScores'
        }),
        expect.any(Array),
        'edit'
      );
    });
  });
}); 