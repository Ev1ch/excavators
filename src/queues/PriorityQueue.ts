import Queue from './Queue';

/**
 * Priority queue, which return items in order of priority
 * (starting with higher priority by default).
 */
export default class PriorityQueue<TItem> extends Queue<TItem> {
  protected static readonly TOP_INDEX = 0;

  constructor(
    _capacity: number = 0,
    private _comparator = (a: TItem, b: TItem) => a > b,
    _items: TItem[] = [],
  ) {
    super(_capacity, _items);
  }

  public push(item: TItem) {
    this._items.push(item);
    this.shiftUp();
    return item;
  }

  public pop() {
    const poppedValue = this.peek();
    const bottom = this.size - 1;

    if (bottom > PriorityQueue.TOP_INDEX) {
      this.swap(PriorityQueue.TOP_INDEX, bottom);
    }

    this._items.pop();
    this.shiftDown();
    return poppedValue;
  }

  protected isGreater(i: number, j: number) {
    return this._comparator(this._items[i], this._items[j]);
  }

  protected swap(i: number, j: number) {
    [this._items[i], this._items[j]] = [this._items[j], this._items[i]];
  }

  protected shiftUp() {
    let node = this.size - 1;

    while (
      node > PriorityQueue.TOP_INDEX &&
      this.isGreater(node, this.getParentIndex(node))
    ) {
      this.swap(node, this.getParentIndex(node));
      node = this.getParentIndex(node);
    }
  }

  protected shiftDown() {
    let node = PriorityQueue.TOP_INDEX;
    while (
      (this.getLeftIndex(node) < this.size &&
        this.isGreater(this.getLeftIndex(node), node)) ||
      (this.getRightIndex(node) < this.size &&
        this.isGreater(this.getRightIndex(node), node))
    ) {
      let maxChild =
        this.getRightIndex(node) < this.size &&
        this.isGreater(this.getRightIndex(node), this.getLeftIndex(node))
          ? this.getRightIndex(node)
          : this.getLeftIndex(node);
      this.swap(node, maxChild);
      node = maxChild;
    }
  }

  protected getParentIndex(index: number) {
    return ((index + 1) >>> 1) - 1;
  }

  protected getLeftIndex(index: number) {
    return (index << 1) + 1;
  }

  protected getRightIndex(index: number) {
    return (index + 1) << 1;
  }
}
