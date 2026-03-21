import { IFlightSortStrategy } from './IFlightSortStrategy';
import { Flight } from '../../models/Flight';

export class SortByDuration implements IFlightSortStrategy {
  sort(flights: Flight[]): Flight[] {
    return [...flights].sort((a, b) => a.getDurationMinutes() - b.getDurationMinutes());
  }

  getStrategyName(): string {
    return 'Sort by Duration (Shortest First)';
  }
}
