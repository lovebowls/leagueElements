import { LeagueElement, LeagueElementConfig } from '../types';

/**
 * Base class for all league elements
 */
export class BaseLeagueElement implements LeagueElement {
  public readonly id: string;
  public readonly type: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(config: LeagueElementConfig) {
    this.id = config.id ?? crypto.randomUUID();
    this.type = config.type;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Updates the element's data
   * @param data - The data to update
   */
  public update(data: Partial<LeagueElementConfig>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}

export { default as LeagueMatch } from './leagueMatch/leagueMatch.js';
export { default as LeagueAdminElement } from './leagueAdminElement/leagueAdminElement.js';
export { LeagueElement } from './leagueElement/leagueElement.js';
export { default as LeagueMatchesAttention } from './LeagueMatchesAttention/LeagueMatchesAttention.js';
export { default as LeagueSchedule } from './LeagueSchedule/LeagueSchedule.js';
export { default as LeagueTeams } from './leagueTeams/leagueTeams.js';
export { default as LeagueDashboard } from './leagueDashboard/LeagueDashboard.js'; 