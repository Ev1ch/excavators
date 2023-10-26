export default class Queue<TItem> {
  constructor(private _capacity: number = 0, private _items: TItem[] = []) {}

  public get capacity() {
    return this._capacity;
  }

  public get size() {
    return this._items.length;
  }

  public addItem(item: TItem) {
    if (this.isFull) {
      throw new Error('Queue is full');
    }

    this._items.push(item);
    return item;
  }

  public removeItem() {
    if (this.isEmpty) {
      throw new Error('Queue is empty');
    }

    return this._items.shift();
  }

  public removeLastItem() {
    if (this.isEmpty) {
      throw new Error('Queue is empty');
    }

    return this._items.pop();
  }

  public get isFull() {
    return this._items.length === this._capacity;
  }

  public get isEmpty() {
    return this._items.length === 0;
  }
}
