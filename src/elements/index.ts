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