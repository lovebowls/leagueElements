/**
 * Base interface for all league elements
 */
export interface LeagueElement {
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration options for league elements
 */
export interface LeagueElementConfig {
  id?: string;
  type: string;
  [key: string]: unknown;
} 