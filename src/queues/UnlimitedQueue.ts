import Queue from './Queue';

export default class UnlimitedQueue<TItem> extends Queue<TItem> {
  constructor(items: TItem[] = []) {
    super(Infinity, items);
  }
}
