import { Flight } from '../../models/Flight';

/**
 * Strategy Pattern interface for flight search result sorting.
 * New sort orders can be added without modifying FlightService.
 */
export interface IFlightSortStrategy {
  sort(flights: Flight[]): Flight[];
  getStrategyName(): string;
}
