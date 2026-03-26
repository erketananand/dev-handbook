import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Movie } from '../models/Movie';
import { ValidationUtil } from '../utils/ValidationUtil';

export class MovieService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public addMovie(
    title: string,
    description: string,
    genre: string,
    durationMinutes: number,
    language: string,
    rating: number,
    releaseDate: Date
  ): Movie {
    const movie = new Movie(
      title,
      description,
      genre,
      durationMinutes,
      language,
      rating,
      releaseDate
    );

    if (!movie.isValid()) {
      throw new Error('Movie validation failed');
    }

    this.db.movieRepository.save(movie);
    return movie;
  }

  public getMovieById(movieId: string): Movie | null {
    return this.db.movieRepository.findById(movieId);
  }

  public searchByTitle(title: string): Movie[] {
    return this.db.movieRepository.findByTitle(title);
  }

  public getMoviesByGenre(genre: string): Movie[] {
    return this.db.movieRepository.findByGenre(genre);
  }

  public getAllMovies(): Movie[] {
    return this.db.movieRepository.getAllMovies();
  }

  public updateMovie(movieId: string, updates: Partial<Movie>): Movie | null {
    const movie = this.db.movieRepository.findById(movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }

    if (updates.title) movie.title = updates.title;
    if (updates.description) movie.description = updates.description;
    if (updates.genre) movie.genre = updates.genre;
    if (updates.rating) movie.rating = updates.rating;

    this.db.movieRepository.update(movie);
    return movie;
  }

  public deleteMovie(movieId: string): boolean {
    return this.db.movieRepository.delete(movieId);
  }

  public getGenres(): string[] {
    const movies = this.getAllMovies();
    const genres = new Set(movies.map(m => m.genre));
    return Array.from(genres);
  }
}
