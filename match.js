/**
 * Match model representing a bowls match between two teams
 * @typedef {Object} MatchData
 * @property {Object} homeTeam - Home team object with _id property
 * @property {Object} awayTeam - Away team object with _id property
 * @property {string} [_id] - Unique identifier for the match
 * @property {Date|string|null} [date] - Match date (can be null for unscheduled matches)
 * @property {Object} [result] - Optional match result data containing scores
 * @property {number} [result.homeScore] - Home team's score
 * @property {number} [result.awayScore] - Away team's score
 * @property {Array<Object>} [result.rinkScores] - Optional individual rink scores
 * @property {Date} [createdAt] - Creation date (defaults to current date)
 * @property {Date} [updatedAt] - Last update date (defaults to current date)
 */
import { validateMatch } from '../utils/validators.js';
import { generateGUID } from '../utils/shared.js';

export class Match {
  /**
   * Create a new Match
   * @param {Object} data - Match data
   * @param {Object} data.homeTeam - Home team object with _id property
   * @param {Object} data.awayTeam - Away team object with _id property
   * @param {Date|string|null} [data.date] - Match date (can be null for unscheduled matches)
   * @param {Object} [data.result] - Optional match result data containing scores
   * @param {number} [data.result.homeScore] - Home team's score
   * @param {number} [data.result.awayScore] - Away team's score
   * @param {Array<Object>} [data.result.rinkScores] - Optional individual rink scores
   * @param {Date} [data.createdAt] - Creation date (defaults to current date)
   * @param {Date} [data.updatedAt] - Last update date (defaults to current date)
   */
  constructor(data) {
    const validationResult = validateMatch(data);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors[0]);
    }

    if (data.homeTeam._id === data.awayTeam._id) {
      throw new Error('Home and away teams must be different');
    }

    this.homeTeam = data.homeTeam;
    this.awayTeam = data.awayTeam;
    this.date = data.date ? new Date(data.date) : null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this._id = data._id || generateGUID();

    // Process result if scores are provided
    if (data.result && typeof data.result.homeScore === 'number' && typeof data.result.awayScore === 'number') {
      this.result = {
        homeScore: data.result.homeScore,
        awayScore: data.result.awayScore,
        rinkScores: data.result.rinkScores || null
      };
    } else {
      this.result = null; // Ensure result is null if scores are not provided
    }
  }

  /**
   * Get the home team name
   * @returns {string} - The name of the home team
   */
  get homeTeamName() {
    return this.homeTeam.name;
  }

  /**
   * Get the away team name
   * @returns {string} - The name of the away team
   */
  get awayTeamName() {
    return this.awayTeam.name;
  }

  /**
   * Determines the winner of the match based on scores.
   * @returns {string|null} - The name of the winning team, 'draw', or null if no result is set.
   */
  getWinner() {
    if (!this.result) {
      return null;
    }
    if (this.result.homeScore > this.result.awayScore) {
      return this.homeTeamName;
    }
    if (this.result.awayScore > this.result.homeScore) {
      return this.awayTeamName;
    }
    return 'draw';
  }

  /**
   * Checks if the match resulted in a draw.
   * @returns {boolean|null} - True if it's a draw, false otherwise, or null if no result is set.
   */
  isDraw() {
    if (!this.result) {
      return null;
    }
    return this.result.homeScore === this.result.awayScore;
  }

  /**
   * Set rink scores for an existing match result
   * @param {Array} rinkScores - Array of rink scores [{homeScore, awayScore}, ...]
   * @returns {boolean} - True if scores were set, false if no result exists
   */
  setRinkScores(rinkScores) {
    if (!this.result) return false;
    
    this.result.rinkScores = rinkScores;
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Get rink win/draw counts
   * @returns {Object|null} - Object with rink win counts or null if no rink scores
   */
  getRinkResults() {
    if (!this.result || !this.result.rinkScores) return null;
    
    const rinkResults = {
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      total: this.result.rinkScores.length
    };
    
    this.result.rinkScores.forEach(rink => {
      if (rink.homeScore > rink.awayScore) {
        rinkResults.homeWins++;
      } else if (rink.awayScore > rink.homeScore) {
        rinkResults.awayWins++;
      } else {
        rinkResults.draws++;
      }
    });
    
    return rinkResults;
  }

  /**
   * Convert match to JSON
   * @returns {Object} - JSON representation of the match
   */
  toJSON() {
    const jsonResult = this.result ? {
      ...this.result,
      winner: this.getWinner(),
      isDraw: this.isDraw()
    } : null;

    return {
      _id: this._id,
      homeTeam: this.homeTeam,
      awayTeam: this.awayTeam,
      date: this.date,
      result: jsonResult,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 