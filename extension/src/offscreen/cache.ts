export class Cache<E> {
  private store = {};
  private order = [];
  constructor(private capacity: number = 1024) {
    if (capacity < 1) {
      throw new Error(`Invalid capacity ${capacity}`);
    }
  }
  cap() {
    return this.capacity;
  }
  get(key: string): E | undefined {
    return this.store[key];
  }
  add(key: string, elem: E): number {
    this.store[key] = elem;
    if (this.order.length >= this.capacity) {
      const key = this.order.shift();
      delete this.store[key];
    }
    return this.order.push(key);
  }
}
