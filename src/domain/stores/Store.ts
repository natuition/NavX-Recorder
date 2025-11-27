export interface Store<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  deleteById(id: string): Promise<void>;
  list?(): Promise<T[]>;
}
