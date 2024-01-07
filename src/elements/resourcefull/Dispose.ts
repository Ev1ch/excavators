import Element from '../Element';

export default class Dispose<TItem> extends Element<TItem> {
  public inAct(item: TItem | null) {
    super.inAct(item);

    this.outAct();
  }

  public get isFree() {
    return true;
  }
}
