import Element from '../Element';
import Worker from './Worker';

export default class Create<TItem> extends Element<TItem> {
  private _workingTime: number;

  constructor(
    name: string,
    private _worker: Worker<TItem>,
    private _createItem: () => TItem,
  ) {
    super(name);
    this.tNext = 0;
    this._workingTime = 0;
  }

  public outAct() {
    super.outAct();

    const item = this._createItem();
    this._worker.item = item;
    const delay = this._worker.getDelay();
    this.tNext = this.tCurrent + delay;

    if (!this.shouldSkip()) {
      this._workingTime += delay;
    }

    const nextElement = this.next?.getNextElement(item);
    nextElement?.element.inAct(item);
  }

  public get workingTime() {
    return this._workingTime;
  }

  public get isFree() {
    return true;
  }
}
