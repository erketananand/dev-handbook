export interface IRepository<T> {
  save(entity: T): Promise<T>;
  findById(id: any): Promise<T | null>;
  delete(id: any): Promise<boolean>;
  update(id: any, data: Partial<T>): Promise<T>;
}
