/**
 * Generic Repository Interface
 */

export interface IRepository<T> {
  save(item: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}
