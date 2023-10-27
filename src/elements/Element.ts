import chalk from 'chalk';

import Settings from '../Settings';
import { Nexter } from './helpers';

abstract class Element<TItem> {
  private static NEXT_ID = 0;

  private _id: number;
  private _tCurrent: number;
  private _tNext: number;
  private _quantity: number;
  private _totalTimeBeforeIn: number;
  private _tInPrevious: number;
  private _totalTimeBeforeOut: number;
  private _tOutPrevious: number;
  private _nexter: Nexter<TItem> | null;

  constructor(private _name: string) {
    this._id = Element.NEXT_ID++;
    this._tCurrent = 0;
    this._tNext = Infinity;
    this._quantity = 0;
    this._totalTimeBeforeIn = 0;
    this._tInPrevious = 0;
    this._totalTimeBeforeOut = 0;
    this._tOutPrevious = 0;
    this._nexter = null;
  }

  public abstract get isFree(): boolean;

  public calculateStatistics(delta: number) {}

  public inAct(item: TItem | null) {
    this._totalTimeBeforeIn += this.tCurrent - this._tInPrevious;
    this._tInPrevious = this.tCurrent;
  }

  public outAct() {
    this._totalTimeBeforeOut += this.tCurrent - this._tOutPrevious;
    this._tOutPrevious = this.tCurrent;
    this._quantity++;
  }

  public get quantity() {
    return this._quantity;
  }

  public get totalTimeBeforeIn() {
    return this._totalTimeBeforeIn;
  }

  public get totalTimeBeforeOut() {
    return this._totalTimeBeforeOut;
  }

  public get tCurrent() {
    return this._tCurrent;
  }

  public set tCurrent(tCurrent: number) {
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

  public get nexter() {
    return this._nexter;
  }

  public set nexter(nexter: Nexter<TItem> | null) {
    this._nexter = nexter;
  }

  public printResult() {
    process.stdout.write(
      [
        chalk.green(this._name.padEnd(Settings.PADDING)),
        `quantity = ${this._quantity}`.padEnd(Settings.PADDING),
      ].join(Settings.DIVIDER),
    );
  }

  public printInfo() {
    console.log(
      [
        chalk.green(this._name.padEnd(Settings.PADDING)),
        ...[
          `quantity = ${this.quantity}`,
          `tNext = ${this.tNext.toFixed(Settings.TIME_PRECISION)}`,
        ].map((string) => string.padEnd(Settings.PADDING)),
      ].join(Settings.DIVIDER),
    );
  }
}

export default Element;
