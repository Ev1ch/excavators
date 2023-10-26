import chalk from 'chalk';

import Settings from '../Settings';

abstract class Element<TItem> {
  private static NEXT_ID = 0;

  private _id: number;
  private _tCurrent: number;
  private _tNext: number;
  private _quantity: number;
  private _item: TItem | null;

  constructor(private _name: string) {
    this._id = Element.NEXT_ID++;
    this._tCurrent = 0;
    this._tNext = Infinity;
  }

  public abstract calculateStatistics(delta: number): void;

  public abstract get isFree(): boolean;

  public inAct(item: TItem | null) {
    this._item = item;
  }

  public outAct() {
    this._quantity++;
  }

  public get quantity() {
    return this._quantity;
  }

  public get tCurrent() {
    return this._tCurrent;
  }

  protected set tCurrent(tCurrent: number) {
    this._tCurrent = tCurrent;
  }

  public get tNext() {
    return this._tNext;
  }

  protected set tNext(tNext: number) {
    this._tNext = tNext;
  }

  public get id() {
    return this._id;
  }

  protected set id(id: number) {
    this._id = id;
  }

  public get name() {
    return this._name;
  }

  protected set name(name: string) {
    this._name = name;
  }

  protected get item() {
    return this._item;
  }

  protected set item(item: TItem | null) {
    this._item = item;
  }

  public printResult() {
    process.stdout.write(
      [chalk.green(this._name), `quantity = ${this._quantity}`].join(
        Settings.DIVIDER,
      ),
    );
  }

  public printInfo() {
    console.log(
      [
        chalk.green(this._name),
        `quantity = ${this.quantity}`,
        `tNext = ${this.tNext.toFixed(Settings.T_NEXT_PRECISION)}`,
      ].join(Settings.DIVIDER),
    );
  }
}

export default Element;
