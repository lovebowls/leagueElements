/**
 * Form calculation utilities for league analysis
 * Provides reusable functions for calculating team form scores and historical form data
 */
export class FormUtils {
  /**
   * Standard form weights for recent matches (most recent to oldest)
   * Higher weights for more recent matches to emphasize current form
   */
  static FORM_WEIGHTS = [1.0, 0.8, 0.6, 0.4, 0.2];

  /**
   * Get all matches for a team up to a specific date, sorted by date (most recent first)
   * @param {string} teamId - The team ID
   * @param {Date|null} targetDate - The target date (null for all matches)
   * @param {Array<Object>} allMatches - Array of all match objects
   * @param {string} tableFilter - Filter type ('overall', 'home', 'away', 'form')
   * @returns {Array<Object>} Filtered and sorted matches
   */
  static getTeamMatchesUpToDate(teamId, targetDate, allMatches, tableFilter = 'overall') {
    if (!allMatches || !Array.isArray(allMatches)) {
      return [];
    }

    return allMatches
      .filter(match => {
        // Must have valid date and result
        if (!match.date || !match.result) return false;
        
        // Must involve this team
        if (match.homeTeam._id !== teamId && match.awayTeam._id !== teamId) return false;
        
        // Must respect table filter (home/away)
        if (tableFilter === 'home' && match.homeTeam._id !== teamId) return false;
        if (tableFilter === 'away' && match.awayTeam._id !== teamId) return false;
        
        // Must be before or on target date (if specified)
        if (targetDate) {
          const matchDate = new Date(match.date);
          matchDate.setHours(0, 0, 0, 0);
          const targetTimestamp = new Date(targetDate);
          targetTimestamp.setHours(0, 0, 0, 0);
          return matchDate.getTime() <= targetTimestamp.getTime();
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
  }

  /**
   * Calculate form score from a specific set of matches for a team
   * @param {Array<Object>} matches - Array of match objects (should be sorted most recent first)
   * @param {string} teamId - The team ID to calculate form for
   * @param {number} maxMatches - Maximum number of matches to consider (default: 5)
   * @returns {number} Form score (0-3 range)
   */
  static calculateFormScoreFromMatches(matches, teamId, maxMatches = 5) {
    if (!matches || matches.length === 0) {
      return 0;
    }

    const weights = FormUtils.FORM_WEIGHTS.slice(0, maxMatches);
    let totalScore = 0;
    let totalWeight = 0;

    matches.forEach((match, index) => {
      if (index >= maxMatches) return; // Only consider specified number of matches
      
      const weight = weights[index] || 0.1; // Fallback weight for matches beyond standard weights
      let matchPoints = 0;

      // Determine result for this team
      const homeTeamId = match.homeTeam._id;
      const awayTeamId = match.awayTeam._id;
      const homeScore = match.result.homeScore;
      const awayScore = match.result.awayScore;

      if (homeTeamId === teamId) {
        if (homeScore > awayScore) matchPoints = 1.0; // Win
        else if (homeScore === awayScore) matchPoints = 0.5; // Draw
        else matchPoints = 0.0; // Loss
      } else if (awayTeamId === teamId) {
        if (awayScore > homeScore) matchPoints = 1.0; // Win
        else if (awayScore === homeScore) matchPoints = 0.5; // Draw
        else matchPoints = 0.0; // Loss
      }

      totalScore += matchPoints * weight;
      totalWeight += weight;
    });

    // Scale the score to maintain a reasonable range
    // Use the actual total weight, not a fixed divisor
    const scaledScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    
    return Math.round(scaledScore * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Calculate form score at a specific date for a team
   * @param {string} teamId - The team ID
   * @param {Date|null} targetDate - The target date (null for current form)
   * @param {Array<Object>} allMatches - Array of all match objects
   * @param {string} tableFilter - Filter type ('overall', 'home', 'away', 'form')
   * @param {number} maxMatches - Maximum number of matches to consider (default: 5)
   * @returns {number} Form score (0-3 range)
   */
  static calculateFormScoreAtDate(teamId, targetDate, allMatches, tableFilter = 'overall', maxMatches = 5) {
    const teamMatches = FormUtils.getTeamMatchesUpToDate(teamId, targetDate, allMatches, tableFilter);
    return FormUtils.calculateFormScoreFromMatches(teamMatches.slice(0, maxMatches), teamId, maxMatches);
  }

  /**
   * Generate form over time data for multiple teams
   * @param {Array<string>} teamIds - Array of team IDs to analyze
   * @param {Array<Object>} allMatches - Array of all match objects
   * @param {string} tableFilter - Filter type ('overall', 'home', 'away', 'form')
   * @param {number} maxMatches - Maximum number of matches to consider for form (default: 5)
   * @returns {Object} Form over time data structure
   */
  static generateFormOverTimeData(teamIds, allMatches, tableFilter = 'overall', maxMatches = 5) {
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return { dates: [], teamSeries: {}, allTeamIds: [] };
    }

    // Get all valid matches involving any of the teams (against any opponent)
    const validMatches = allMatches.filter(match => {
      return match.date && 
             match.result && 
             typeof match.result.homeScore === 'number' && 
             typeof match.result.awayScore === 'number' &&
             (teamIds.includes(match.homeTeam._id) || teamIds.includes(match.awayTeam._id));
    });

    if (validMatches.length === 0) {
      const emptyData = { dates: [], teamSeries: {}, allTeamIds: teamIds };
      teamIds.forEach(teamId => {
        emptyData.teamSeries[teamId] = [];
      });
      return emptyData;
    }

    // Get unique dates sorted chronologically
    const uniqueDateTimestamps = [...new Set(
      validMatches.map(match => {
        const d = new Date(match.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )].sort((a, b) => a - b);

    // Initialize data structure
    const formOverTimeData = {
      dates: uniqueDateTimestamps,
      teamSeries: {},
      allTeamIds: teamIds
    };

    // Calculate form scores for each team at each date
    teamIds.forEach(teamId => {
      formOverTimeData.teamSeries[teamId] = [];
      
      uniqueDateTimestamps.forEach(dateTimestamp => {
        const targetDate = new Date(dateTimestamp);
        const formScore = FormUtils.calculateFormScoreAtDate(
          teamId, 
          targetDate, 
          allMatches, 
          tableFilter, 
          maxMatches
        );
        formOverTimeData.teamSeries[teamId].push(formScore);
      });
    });

    return formOverTimeData;
  }

  /**
   * Calculate form rank movements between two time periods
   * @param {Array<string>} teamIds - Array of team IDs
   * @param {Array<Object>} allMatches - Array of all match objects
   * @param {string} tableFilter - Filter type ('overall', 'home', 'away', 'form')
   * @returns {Object} Map of teamId to rank movement
   */
  static calculateFormRankMovements(teamIds, allMatches, tableFilter = 'overall') {
    const movements = {};
    
    teamIds.forEach(teamId => {
      // Use the generalized function to get team matches
      const teamMatches = FormUtils.getTeamMatchesUpToDate(teamId, null, allMatches, tableFilter);

      if (teamMatches.length < 2) {
        // Not enough matches to calculate movement
        movements[teamId] = 0;
        return;
      }

      // Current form: last 5 matches using generalized function
      const currentFormScore = FormUtils.calculateFormScoreFromMatches(teamMatches.slice(0, 5), teamId);

      // Previous form: exclude most recent match, take next 5 using generalized function
      const previousFormScore = FormUtils.calculateFormScoreFromMatches(teamMatches.slice(1, 6), teamId);

      // Store both scores for comparison
      movements[teamId] = {
        teamId,
        currentFormScore,
        previousFormScore
      };
    });

    // Create arrays for current and previous form rankings
    const currentFormRankings = teamIds.map(teamId => ({
      teamId,
      formScore: movements[teamId].currentFormScore || 0
    })).sort((a, b) => b.formScore - a.formScore);

    const previousFormRankings = teamIds.map(teamId => ({
      teamId,
      formScore: movements[teamId].previousFormScore || 0
    })).sort((a, b) => b.formScore - a.formScore);

    // Create rank maps
    const currentRanks = {};
    const previousRanks = {};
    
    currentFormRankings.forEach((team, index) => {
      currentRanks[team.teamId] = index + 1;
    });
    
    previousFormRankings.forEach((team, index) => {
      previousRanks[team.teamId] = index + 1;
    });

    // Calculate final movements
    const finalMovements = {};
    teamIds.forEach(teamId => {
      const currentRank = currentRanks[teamId];
      const previousRank = previousRanks[teamId];
      
      if (currentRank !== undefined && previousRank !== undefined) {
        // Movement is previous rank - current rank (positive = moved up, negative = moved down)
        finalMovements[teamId] = previousRank - currentRank;
      } else {
        finalMovements[teamId] = 0;
      }
    });

    return finalMovements;
  }
} 