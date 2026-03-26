import { Movie } from '../models/Movie';

export class MovieRepository {
  private movies: Map<string, Movie> = new Map();

  public save(movie: Movie): void {
    this.movies.set(movie.id, movie);
  }

  public findById(id: string): Movie | null {
    return this.movies.get(id) || null;
  }

  public findByTitle(title: string): Movie[] {
    return Array.from(this.movies.values()).filter(m =>
      m.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  public findByGenre(genre: string): Movie[] {
    return Array.from(this.movies.values()).filter(m =>
      m.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  public getAllMovies(): Movie[] {
    return Array.from(this.movies.values());
  }

  public update(movie: Movie): void {
    if (this.movies.has(movie.id)) {
      this.movies.set(movie.id, movie);
    }
  }

  public delete(movieId: string): boolean {
    return this.movies.delete(movieId);
  }

  public clear(): void {
    this.movies.clear();
  }

  public getCount(): number {
    return this.movies.size;
  }
}
