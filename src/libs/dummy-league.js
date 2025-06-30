/**
 * Simplified League class for testing enhanced scheduling functionality
 * This is a minimal version without external dependencies
 */

// Simple Team class for testing
class Team {
  constructor(data) {
    this._id = data._id || `team_${Date.now()}_${Math.random()}`;
    this.name = data.name || 'Team';
  }
}

// Simple Match class for testing
class Match {
  constructor(data) {
    this._id = data._id || `match_${Date.now()}_${Math.random()}`;
    this.homeTeam = data.homeTeam;
    this.awayTeam = data.awayTeam;
    this.date = data.date;
    this.result = data.result || null;
    // Add rink property to preserve rink information
    if (data.rink !== undefined && data.rink !== null) {
      this.rink = data.rink;
    }
  }
}

export class League {
  /**
   * Create a new League
   * @param {Object} data - League data
   */
  constructor(data) {
    this._id = data._id || `league_${Date.now()}`;
    this.name = data.name || 'Test League';
    this.settings = {
      pointsForWin: data.settings?.pointsForWin || 3,
      pointsForDraw: data.settings?.pointsForDraw || 1,
      pointsForLoss: data.settings?.pointsForLoss || 0,
      promotionPositions: data.settings?.promotionPositions,
      relegationPositions: data.settings?.relegationPositions,
      timesTeamsPlayOther: data.settings?.timesTeamsPlayOther || 2
    };
    
    this.teams = (data.teams || []).map(team => new Team(team));
    this.matches = (data.matches || []).map(match => new Match(match));
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Add a team to the league
   */
  addTeam(team) {
    const teamInstance = team instanceof Team ? team : new Team(team);
    
    if (!this.teams.some(t => t._id === teamInstance._id)) {
      this.teams.push(teamInstance);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Add a match to the league
   */
  addMatch(match) {
    const matchInstance = match instanceof Match ? match : new Match(match);
    
    const homeTeamExists = this.teams.some(team => team._id === matchInstance.homeTeam._id);
    const awayTeamExists = this.teams.some(team => team._id === matchInstance.awayTeam._id);
    
    if (homeTeamExists && awayTeamExists) {
      if (this.matches.some(m => m._id === matchInstance._id)) {
        return false;
      }
      
      this.matches.push(matchInstance);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Initialise fixtures for the league using a round-robin algorithm.
   * Each team plays once per match day. Fixtures are scheduled according to the provided scheduling parameters.
   * Teams will play each other `this.settings.timesTeamsPlayOther` times, with home and away fixtures balanced
   * as per the cycles of the round-robin generation (e.g., first cycle A vs B, second cycle B vs A).
   *
   * @param {Date} [startDate] - The start date for the first round of matches. If null, matches will have null dates.
   * @param {Object} [schedulingParams] - Advanced scheduling parameters
   * @param {string} [schedulingParams.schedulingPattern='interval'] - 'interval' or 'dayOfWeek'
   * @param {number} [schedulingParams.intervalNumber=1] - Number of interval units between match days
   * @param {string} [schedulingParams.intervalUnit='weeks'] - 'days' or 'weeks'
   * @param {Array<number>} [schedulingParams.selectedDays] - Array of day numbers (0=Sunday, 1=Monday, etc.) for dayOfWeek pattern
   * @param {number} [schedulingParams.maxMatchesPerDay] - Maximum matches per day (optional)
   * @returns {boolean} - True if fixtures were successfully created, false if there are fewer than 2 teams or if a match fails to be added.
   */
  initialiseFixtures(startDate, schedulingParams = {}) {
    this.matches = []; // Clear any existing matches

    if (this.teams.length < 2) {
      return false; // Not enough teams to create fixtures
    }

    // Set default scheduling parameters
    const {
      schedulingPattern = 'interval',
      intervalNumber = 1,
      intervalUnit = 'weeks',
      selectedDays = [],
      maxMatchesPerDay = null
    } = schedulingParams;

    // Prepare team list for scheduling. Add a dummy "BYE" team if the number of teams is odd.
    let scheduleTeams = [...this.teams];
    const BYE_TEAM_MARKER = { _id: `__BYE_TEAM_INTERNAL_${Date.now()}__`, name: 'BYE' }; // Unique marker for the bye team
    if (scheduleTeams.length % 2 !== 0) {
      scheduleTeams.push(BYE_TEAM_MARKER);
    }
    const numEffectiveTeams = scheduleTeams.length; // This will now always be even

    // Calculate the number of rounds needed for all unique pairings once
    const roundsPerCycle = numEffectiveTeams - 1;

    // Generate all matches first, then assign dates
    const allMatches = [];

    // The round-robin algorithm fixes one team and rotates the others.
    // We'll fix the last team in the `scheduleTeams` list.
    const fixedTeam = scheduleTeams[numEffectiveTeams - 1];
    // The list of teams that will be rotated.
    const initialRotatingTeams = scheduleTeams.slice(0, numEffectiveTeams - 1);

    // Loop for each full set of fixtures (e.g., once for "home" games, once for "away" games if timesTeamsPlayOther is 2)
    for (let cycle = 0; cycle < this.settings.timesTeamsPlayOther; cycle++) {
      // For each cycle, re-initialize the rotating teams to ensure the same sequence of pairings.
      let currentRotatingTeams = [...initialRotatingTeams];

      for (let roundNum = 0; roundNum < roundsPerCycle; roundNum++) {
        const conceptualPairsForThisRound = []; // Stores {team1, team2} for this specific round

        // 1. Match involving the fixed team (e.g., scheduleTeams[n-1])
        // Its opponent is the first team in the current rotated list.
        const opponentForFixed = currentRotatingTeams[0];
        if (fixedTeam._id !== BYE_TEAM_MARKER._id && opponentForFixed._id !== BYE_TEAM_MARKER._id) {
          conceptualPairsForThisRound.push({ team1: fixedTeam, team2: opponentForFixed });
        }

        // 2. Other matches from the `currentRotatingTeams` list.
        // The list has `numEffectiveTeams - 1` elements (an odd number).
        // The first element `currentRotatingTeams[0]` is already paired with `fixedTeam`.
        // The remaining elements `currentRotatingTeams[1]` to `currentRotatingTeams[length-1]` are paired up.
        const rotatingListLength = currentRotatingTeams.length;
        for (let j = 1; j <= (rotatingListLength - 1) / 2; j++) {
          const teamA_idx = j;
          const teamB_idx = rotatingListLength - j; // Pairs j-th from start with j-th from end (0-indexed list)
          
          const teamA = currentRotatingTeams[teamA_idx];
          const teamB = currentRotatingTeams[teamB_idx];
          
          if (teamA._id !== BYE_TEAM_MARKER._id && teamB._id !== BYE_TEAM_MARKER._id) {
            conceptualPairsForThisRound.push({ team1: teamA, team2: teamB });
          }
        }

        // Store matches for this round
        for (const pair of conceptualPairsForThisRound) {
          let homeTeam, awayTeam;
          // For even cycles (0, 2, ...), team1 is home. For odd cycles (1, 3, ...), team2 is home.
          // This ensures that if pair (X,Y) is generated, cycle 0 schedules X vs Y, cycle 1 schedules Y vs X.
          if (cycle % 2 === 0) {
            homeTeam = pair.team1;
            awayTeam = pair.team2;
          } else {
            homeTeam = pair.team2;
            awayTeam = pair.team1;
          }

          allMatches.push({ homeTeam, awayTeam, roundKey: `${cycle}-${roundNum}` });
        }

        // Rotate `currentRotatingTeams` for the next round: the last element moves to the front.
        if (currentRotatingTeams.length > 1) { // Rotation only makes sense for 2+ teams
          const lastTeamInRotatingList = currentRotatingTeams.pop();
          currentRotatingTeams.unshift(lastTeamInRotatingList);
        }
      }
    }

    // Now assign dates to matches based on scheduling pattern
    if (startDate) {
      this._assignMatchDates(allMatches, startDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays, maxMatchesPerDay);
    } else {
      // No start date provided - create matches without dates
      for (const matchData of allMatches) {
        const match = new Match({
          homeTeam: matchData.homeTeam,
          awayTeam: matchData.awayTeam,
          date: null
        });

        if (!this.addMatch(match)) {
          return false; // If addMatch fails (e.g., duplicate _id), abort.
        }
      }
    }

    return true;
  }

  /**
   * Private helper method to assign dates to matches based on scheduling parameters
   */
  _assignMatchDates(allMatches, startDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays, maxMatchesPerDay) {
    // Group matches by round for scheduling
    const matchesByRound = {};
    for (const matchData of allMatches) {
      if (!matchesByRound[matchData.roundKey]) {
        matchesByRound[matchData.roundKey] = [];
      }
      matchesByRound[matchData.roundKey].push(matchData);
    }

    // Sort round keys to ensure consistent scheduling order
    const sortedRoundKeys = Object.keys(matchesByRound).sort();
    
    let currentDate = new Date(startDate);
    
    for (const roundKey of sortedRoundKeys) {
      const roundMatches = matchesByRound[roundKey];
      
      if (maxMatchesPerDay && roundMatches.length > maxMatchesPerDay) {
        // Split matches across multiple days if there's a limit
        let matchIndex = 0;
        
        while (matchIndex < roundMatches.length) {
          const matchesForThisDate = roundMatches.slice(matchIndex, matchIndex + maxMatchesPerDay);
          
          // Find the next valid date
          const validDate = this._findNextValidDate(currentDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays);
          
          // Create matches for this date
          for (const matchData of matchesForThisDate) {
            const match = new Match({
              homeTeam: matchData.homeTeam,
              awayTeam: matchData.awayTeam,
              date: new Date(validDate)
            });

            if (!this.addMatch(match)) {
              return false; // If addMatch fails, abort
            }
          }
          
          matchIndex += maxMatchesPerDay;
          
          // Move to next date for remaining matches
          if (matchIndex < roundMatches.length) {
            currentDate = this._getNextSchedulingDate(validDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays);
          } else {
            // Set current date for next round
            currentDate = this._getNextSchedulingDate(validDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays);
          }
        }
      } else {
        // All matches in this round can fit on one day
        const validDate = this._findNextValidDate(currentDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays);
        
        // Create matches for this date
        for (const matchData of roundMatches) {
          const match = new Match({
            homeTeam: matchData.homeTeam,
            awayTeam: matchData.awayTeam,
            date: new Date(validDate)
          });

          if (!this.addMatch(match)) {
            return false; // If addMatch fails, abort
          }
        }
        
        // Move to next date for next round
        currentDate = this._getNextSchedulingDate(validDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays);
      }
    }
  }

  /**
   * Find the next valid date based on scheduling pattern
   */
  _findNextValidDate(fromDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays) {
    if (schedulingPattern === 'dayOfWeek' && selectedDays.length > 0) {
      // Find the next occurrence of one of the selected days
      const currentDay = fromDate.getDay();
      let daysToAdd = 0;
      
      // Find the next selected day
      for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (selectedDays.includes(checkDay)) {
          daysToAdd = i;
          break;
        }
      }
      
      const nextDate = new Date(fromDate);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      return nextDate;
    } else {
      // Use interval pattern (or fallback)
      return new Date(fromDate);
    }
  }

  /**
   * Get the next scheduling date after a match date
   */
  _getNextSchedulingDate(currentDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays) {
    const nextDate = new Date(currentDate);
    
    if (schedulingPattern === 'interval') {
      // Add interval
      if (intervalUnit === 'weeks') {
        nextDate.setDate(nextDate.getDate() + (intervalNumber * 7));
      } else {
        nextDate.setDate(nextDate.getDate() + intervalNumber);
      }
    } else if (schedulingPattern === 'dayOfWeek' && selectedDays.length > 0) {
      // Move to next occurrence of selected days
      const currentDay = currentDate.getDay();
      let daysToAdd = 1; // Start from tomorrow
      
      // Find the next selected day
      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (selectedDays.includes(checkDay)) {
          daysToAdd = i;
          break;
        }
      }
      
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    } else {
      // Fallback to weekly
      nextDate.setDate(nextDate.getDate() + 7);
    }
    
    return nextDate;
  }
} 