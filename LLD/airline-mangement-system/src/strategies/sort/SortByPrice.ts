import { IFlightSortStrategy } from './IFlightSortStrategy';
import { Flight } from '../../models/Flight';

export class SortByPrice implements IFlightSortStrategy {
  sort(flights: Flight[]): Flight[] {
    return [...flights].sort((a, b) => a.basePrice - b.basePrice);
  }

  getStrategyName(): string {
    return 'Sort by Price (Lowest First)';
  }
}
