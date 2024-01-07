import Element from '../Element';
import Worker from './Worker';

export default class Create<TItem> extends Element<TItem> {
  constructor(
    name: string,
    private _worker: Worker<TItem>,
    private _createItem: () => TItem,
  ) {
    super(name);
    this.tNext = 0;
  }

  public outAct() {
    super.outAct();

    const item = this._createItem();
    this._worker.item = item;
    this.tNext = this.tCurrent + this._worker.getDelay();

    const nextElement = this.next?.getNextElement(item);
    nextElement?.element.inAct(item);
  }

  public get isFree() {
    return true;
  }
}
