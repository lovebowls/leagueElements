// Import the component
import LeagueAdminElement from '../leagueAdminElement/leagueAdminElement.js';
import { generateTestLeagueData } from '../../test-data/league-test-data.js';
import { jest } from '@jest/globals';

// Mock the imports
jest.mock('../shared-styles.js', () => ({
  panelStyles: '',
  buttonStyles: '',
  modalStyles: '',
  formStyles: '',
  listItemStyles: ''
}));

jest.mock('../LeagueMatchesAttention/LeagueMatchesAttention.js', () => {});
jest.mock('../leagueMatch/leagueMatch.js', () => {});
jest.mock('../../utils/temporalUtils.js', () => ({
  Temporal: {},
  TemporalUtils: {}
}));

describe('LeagueAdminElement', () => {
  let element;
  let lovebowlsTeamsData;
  let testLeagueData;

  // Setup before each test
  beforeEach(() => {
    // Setup lovebowls test data matching the test page
    lovebowlsTeamsData = [
      { _id: "lb-guid-a123", name: "Lovebowls Club Alpha" },
      { _id: "lb-guid-b456", name: "Lovebowls Club Beta" },
      { _id: "lb-guid-c789", name: "Lovebowls Club Gamma" },
      { _id: "lb-guid-d012", name: "Lovebowls Club Delta" },
      { _id: "lb-guid-e345", name: "Lovebowls Club Epsilon" }
    ];

    // Generate test league data from our test data generator
    testLeagueData = [
      generateTestLeagueData(lovebowlsTeamsData, 3, "Summer League"),
      generateTestLeagueData(lovebowlsTeamsData, 4, "Winter League"),
      generateTestLeagueData(lovebowlsTeamsData, 5, "Championship")
    ];
    
    // Create a new instance of the component
    element = new LeagueAdminElement();
    
    // Directly mock the showError method for testing
    element.showError = jest.fn();
    element.clearError = jest.fn();
    
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

  // Test 1: Component initialization
  test('should initialize with default properties', () => {
    const element = new LeagueAdminElement();
    expect(element.shadow).toBeDefined();
    expect(element._leagues).toEqual([]);
    expect(element._selectedLeagueId).toBeNull();
    expect(element._selectedTeamId).toBeNull();
    expect(element._isModalVisible).toBe(false);
    expect(element._data).toBeNull();
  });

  // Test 2: Data loading
  test('should load leagues data from attribute', () => {
    // Create a spy to verify event dispatch
    const eventSpy = jest.spyOn(element, 'dispatchEvent');
    
    // Set data attribute with valid test data
    element.setAttribute('data', JSON.stringify(testLeagueData));
    
    // Verify the data was loaded into the component
    expect(element._leagues.length).toBe(testLeagueData.length);
    expect(element._data).not.toBeNull();
    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'onReady'
    }));
  });

  // Test 3: League selection
  test('should select a league when _handleLeagueSelect is called', () => {
    // Load test data
    element.setAttribute('data', JSON.stringify(testLeagueData));
    
    // Create a spy to verify event dispatch
    const eventSpy = jest.spyOn(element, 'dispatchEvent');
    
    // Select a league
    const leagueId = testLeagueData[0]._id;
    element._handleLeagueSelect(leagueId);
    
    // Verify league was selected
    expect(element._selectedLeagueId).toBe(leagueId);
    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'leagueSelected',
      detail: expect.objectContaining({ leagueId })
    }));
  });

  // Test 4: Error handling - FIXED
  test('should show error message when invalid data is provided', () => {
    // The showError method is already mocked in beforeEach
    
    // Provide invalid data
    element.setAttribute('data', 'invalid-json');
    
    // Verify error was shown
    expect(element.showError).toHaveBeenCalled();
    expect(element._leagues).toEqual([]);
    expect(element._data).toBeNull();
  });

}); 