import LeagueSchedule from '../LeagueSchedule/LeagueSchedule.js';
import { League } from '@lovebowls/leaguejs';
import { jest } from '@jest/globals';

// Mock the LeagueCalendar component
class MockLeagueCalendar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._matches = [];
  }

  setAttribute(name, value) {
    super.setAttribute(name, value);
    if (name === 'matches') {
      this._matches = JSON.parse(value);
    }
  }

  get matches() {
    return this._matches;
  }
}

// Mock the safeDefine function
jest.mock('../../utils/elementRegistry.js', () => ({
  safeDefine: jest.fn()
}));

// Register the mock calendar component
if (!customElements.get('league-calendar')) {
  customElements.define('league-calendar', MockLeagueCalendar);
}

describe('LeagueSchedule Calendar Filtering', () => {
  let element;
  let mockLeagueData;

  beforeEach(() => {
    // Create mock league data with multiple teams and matches
    mockLeagueData = {
      name: 'Test League',
      _id: 'test-league-1',
      teams: [
        { _id: 'team1', name: 'Team A' },
        { _id: 'team2', name: 'Team B' },
        { _id: 'team3', name: 'Team C' }
      ],
      matches: [
        {
          _id: 'match1',
          date: '2024-01-15',
          homeTeam: { _id: 'team1', name: 'Team A' },
          awayTeam: { _id: 'team2', name: 'Team B' },
          result: { homeScore: 2, awayScore: 1 }
        },
        {
          _id: 'match2',
          date: '2024-01-16',
          homeTeam: { _id: 'team1', name: 'Team A' },
          awayTeam: { _id: 'team3', name: 'Team C' },
          result: { homeScore: 1, awayScore: 1 }
        },
        {
          _id: 'match3',
          date: '2024-01-17',
          homeTeam: { _id: 'team2', name: 'Team B' },
          awayTeam: { _id: 'team3', name: 'Team C' },
          result: { homeScore: 0, awayScore: 2 }
        }
      ]
    };

    element = new LeagueSchedule();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
  });

  describe('Calendar Filtering', () => {
    it('should show all matches in calendar when no team is selected', () => {
      // Load the league data
      element.loadData(mockLeagueData);
      
      // Render the component
      element.render();
      
      // Get the calendar element
      const calendarElement = element.shadow.querySelector('#desktop-schedule-calendar');
      expect(calendarElement).toBeTruthy();
      
      // Check that all matches are shown in the calendar
      expect(calendarElement._matches).toHaveLength(3);
      expect(calendarElement._matches.map(m => m._id)).toEqual(['match1', 'match2', 'match3']);
    });

    it('should show only team-specific matches in calendar when a team is selected', () => {
      // Load the league data
      element.loadData(mockLeagueData);
      
      // Render the component
      element.render();
      
      // Select Team A
      element.selectedTeamId = 'team1';
      
      // Update the calendar
      const calendarElement = element.shadow.querySelector('#desktop-schedule-calendar');
      element._updateCalendarMatches(calendarElement);
      
      // Check that only Team A's matches are shown in the calendar
      expect(calendarElement._matches).toHaveLength(2);
      expect(calendarElement._matches.map(m => m._id)).toEqual(['match1', 'match2']);
      
      // Verify the matches are for Team A (either home or away)
      calendarElement._matches.forEach(match => {
        expect(match.homeTeam._id === 'team1' || match.awayTeam._id === 'team1').toBe(true);
      });
    });

    it('should reset calendar to show all matches when team filter is cleared', () => {
      // Load the league data
      element.loadData(mockLeagueData);
      
      // Render the component
      element.render();
      
      // Select Team A first
      element.selectedTeamId = 'team1';
      const calendarElement = element.shadow.querySelector('#desktop-schedule-calendar');
      element._updateCalendarMatches(calendarElement);
      
      // Verify only Team A's matches are shown
      expect(calendarElement._matches).toHaveLength(2);
      
      // Clear the team filter
      element.selectedTeamId = null;
      element._updateCalendarMatches(calendarElement);
      
      // Verify all matches are shown again
      expect(calendarElement._matches).toHaveLength(3);
      expect(calendarElement._matches.map(m => m._id)).toEqual(['match1', 'match2', 'match3']);
    });

    it('should handle team filter changes via attribute', () => {
      // Load the league data
      element.loadData(mockLeagueData);
      
      // Render the component
      element.render();
      
      // Set team filter via attribute
      element.setAttribute('selected-team', 'team2');
      
      // Wait for the attribute change to be processed
      setTimeout(() => {
        const calendarElement = element.shadow.querySelector('#desktop-schedule-calendar');
        expect(calendarElement).toBeTruthy();
        
        // Check that only Team B's matches are shown
        expect(calendarElement._matches).toHaveLength(2);
        expect(calendarElement._matches.map(m => m._id)).toEqual(['match1', 'match3']);
        
        // Verify the matches are for Team B
        calendarElement._matches.forEach(match => {
          expect(match.homeTeam._id === 'team2' || match.awayTeam._id === 'team2').toBe(true);
        });
      }, 10);
    });
  });
}); 