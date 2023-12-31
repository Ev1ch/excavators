import { DelayGenerator } from '../../utils';

export enum WorkerState {
  FREE = 'free',
  BUSY = 'busy',
}

export default class Worker<TItem> {
  private _state: WorkerState;
  private _item: TItem | null;
  private _tNext: number;

  constructor(
    private _id: number,
    private _getDelayGenerator: (item: TItem) => DelayGenerator,
  ) {
    this._state = WorkerState.FREE;
    this._tNext = Infinity;
    this._item = null;
  }

  public get id() {
    return this._id;
  }

  public get tNext() {
    return this._tNext;
  }

  public set tNext(tNext: number) {
    this._tNext = tNext;
  }

  public get state() {
    return this._state;
  }

  public set state(state: WorkerState) {
    this._state = state;
  }

  public get item() {
    return this._item;
  }

  public set item(item: TItem | null) {
    this._item = item;
  }

  public getDelay() {
    if (!this._item) {
      throw new Error('No item');
    }

    return this._getDelayGenerator(this._item).get();
  }
}
