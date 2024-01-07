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

    this.tNext = this.tCurrent + this._worker.getDelay();
    this.next?.getNextElement(this._createItem());
  }

  public get isFree() {
    return true;
  }
}