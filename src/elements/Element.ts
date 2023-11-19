import chalk from 'chalk';

import Settings from '../Settings';
import { Next } from './helpers';

export default abstract class Element<TItem> {
  private static NEXT_ID = 0;

  private _id: number;
  private _tCurrent: number;
  private _tNext: number;
  private _quantity: number;
  private _totalTimeBeforeIn: number;
  private _tInPrevious: number;
  private _totalTimeBeforeOut: number;
  private _tOutPrevious: number;
  private _next: Next<TItem> | null;

  constructor(private _name: string) {
    this._id = Element.NEXT_ID++;
    this._tCurrent = 0;
    this._tNext = Infinity;
    this._quantity = 0;
    this._totalTimeBeforeIn = 0;
    this._tInPrevious = 0;
    this._totalTimeBeforeOut = 0;
    this._tOutPrevious = 0;
    this._next = null;
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

  public get next() {
    return this._next;
  }

  public set next(next: Next<TItem> | null) {
    this._next = next;
  }

  public getInformation() {
    return [this.quantity, this.tNext] as const;
  }
}
