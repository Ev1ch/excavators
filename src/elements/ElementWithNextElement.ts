import Element from './Element';

export interface NextElement<TItem> {
  element: Element<TItem>;
  withBlocking?: boolean;
}

export default abstract class ElementWithNextElement<
  TItem,
  TNextElement extends NextElement<TItem>,
> extends Element<TItem> {
  private _nextElement: TNextElement | null;

  constructor(name: string) {
    super(name);
    this._nextElement = null;
  }

  public set nextElement(nextElement: TNextElement | null) {
    this._nextElement = nextElement;
  }

  public get nextElement() {
    return this._nextElement;
  }
}
