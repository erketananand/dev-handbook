import { IFlightSortStrategy } from './IFlightSortStrategy';
import { Flight } from '../../models/Flight';

export class SortByDepartureTime implements IFlightSortStrategy {
  sort(flights: Flight[]): Flight[] {
    return [...flights].sort(
      (a, b) => a.departureTime.getTime() - b.departureTime.getTime()
    );
  }

  getStrategyName(): string {
    return 'Sort by Departure Time (Earliest First)';
  }
}
