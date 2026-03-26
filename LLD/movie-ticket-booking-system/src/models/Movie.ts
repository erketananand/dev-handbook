import { IdGenerator } from '../utils/IdGenerator';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Movie {
  public readonly id: string;
  public title: string;
  public description: string;
  public genre: string;
  public durationMinutes: number;
  public language: string;
  public rating: number;
  public releaseDate: Date;
  public readonly createdAt: Date;

  constructor(
    title: string,
    description: string,
    genre: string,
    durationMinutes: number,
    language: string,
    rating: number,
    releaseDate: Date,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.title = title;
    this.description = description;
    this.genre = genre;
    this.durationMinutes = durationMinutes;
    this.language = language;
    this.rating = rating;
    this.releaseDate = releaseDate;
    this.createdAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.title.length > 0 &&
      this.genre.length > 0 &&
      ValidationUtil.isValidDuration(this.durationMinutes) &&
      ValidationUtil.isValidRating(this.rating) &&
      this.language.length > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.title} (${this.language}) | ${this.genre} | ⭐${this.rating.toFixed(1)} | ${this.durationMinutes}min`;
  }
}
