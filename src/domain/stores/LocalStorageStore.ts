import type { Store } from "./Store";

const S = JSON.stringify
const P = JSON.parse

// >>> DEBUG
const DEBUG_DELAY_MS = 300;
// <<< DEBUG

export class LocalStorageStore<T extends { id: string }> implements Store<T> {
  private prefix: string;

  constructor(prefix: string = "store_") {
    this.prefix = prefix;
    if (!localStorage.getItem(this.prefix)) {
      localStorage.setItem(this.prefix, S([]));
    }
  }

  async findById(id: string): Promise<T | null> {
    // >>> DEBUG
    await this.simulateDelay(DEBUG_DELAY_MS);
    // <<< DEBUG
    const rawItems = localStorage.getItem(this.prefix);
    if (!rawItems) return null;
    const items: T[] = P(rawItems);
    const item = items.find((item) => item.id === id);
    return item || null;
  }

  async save(entity: T): Promise<void> {
    // >>> DEBUG
    await this.simulateDelay(DEBUG_DELAY_MS);
    // <<< DEBUG
    const items = this.getItems();
    const index = items.findIndex((item) => item.id === entity.id);
    if (index >= 0) {
      items[index] = entity;
    } else {
      items.push(entity);
    }
    localStorage.setItem(this.prefix, S(items));
  }

  async deleteById(id: string): Promise<void> {
    // >>> DEBUG
    await this.simulateDelay(DEBUG_DELAY_MS);
    // <<< DEBUG
    const items = this.getItems();
    const filteredItems = items.filter((item) => item.id !== id);
    localStorage.setItem(this.prefix, S(filteredItems));
  }

  async list(): Promise<T[]> {
    // >>> DEBUG
    await this.simulateDelay(DEBUG_DELAY_MS);
    // <<< DEBUG
    return this.getItems();
  }

  private getItems(): T[] {
    const rawItems = localStorage.getItem(this.prefix);
    if (!rawItems) return [];
    return P(rawItems) as T[];
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
