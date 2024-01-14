export default class Queue<TItem> {
  constructor(protected _capacity: number = 0, protected _items: TItem[] = []) {
    if (_capacity < 0) {
      throw new Error('Capacity cannot be less than 0');
    }

    if (_items.length > _capacity) {
      throw new Error('Items length cannot be greater than capacity');
    }
  }

  public get capacity() {
    return this._capacity;
  }

  public get size() {
    return this._items.length;
  }

  public peek() {
    return this._items[0];
  }

  public push(item: TItem) {
    if (this.isFull) {
      throw new Error('Queue is full');
    }

    this._items.push(item);
    return item;
  }

  public pop() {
    if (this.isEmpty) {
      throw new Error('Queue is empty');
    }

    return this._items.shift();
  }

  public get isFull() {
    return this._items.length === this._capacity;
  }

  public get isEmpty() {
    return this._items.length === 0;
  }

  public forEach(callback: (item: TItem) => void) {
    this._items.forEach(callback);
  }

  public [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
}
