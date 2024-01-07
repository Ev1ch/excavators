import Element from '../Element';

export default class Dispose<TItem> extends Element<TItem> {
  public inAct() {
    this.outAct();
  }

  public get isFree() {
    return true;
  }
}
