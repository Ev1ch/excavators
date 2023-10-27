import chalk from 'chalk';

import { Element } from './elements';
import {
  ElementWithLimitedResource,
  ElementWithUnlimitedResource,
} from './elements/resourcefull';

import Settings from './Settings';

export default class Model<TItem, TElement extends Element<TItem>> {
  private _tCurrent: number;
  private _tNext: number;
  private _time: number;

  constructor(private _list: TElement[]) {
    this._tCurrent = 0;
    this._tNext = 0;
    this._time = 0;
  }

  public simulate(time: number) {
    this._time = time;

    while (this._tCurrent < time) {
      this._tNext = Infinity;

      let currentElement = null;
      for (const element of this._list) {
        if (element.tNext < this._tNext) {
          this._tNext = element.tNext;
          currentElement = element;
        }
      }

      if (currentElement === null) {
        throw new Error('There is no current element');
      }

      console.log(
        chalk.yellow(
          `Item in ${chalk.green(
            currentElement.name,
          )}, time = ${this._tNext.toFixed(Settings.TIME_PRECISION)}:`,
        ),
      );

      for (const element of this._list) {
        element.calculateStatistics(this._tNext - this._tCurrent);
      }

      this._tCurrent = this._tNext;
      for (const element of this._list) {
        element.tCurrent = this._tCurrent;
      }

      currentElement.outAct();
      for (const element of this._list) {
        if (element.tNext === this._tCurrent) {
          element.outAct();
        }
      }

      this.printInformation();
    }

    this.printResults();
  }

  private printInformation() {
    for (const element of this._list) {
      element.printInfo();
    }

    console.log();
  }

  private printResults() {
    console.log(chalk.yellow('Results'));

    for (const element of this._list) {
      element.printResult();

      if (element instanceof ElementWithLimitedResource) {
        this.printResultsElementWithLimitedResources(element);
      } else if (element instanceof ElementWithUnlimitedResource) {
        this.printResultsForProcessWithUnlimitedResources(element);
      } else {
        process.stdout.write('\n');
      }
    }
  }

  private printResultsElementWithLimitedResources(
    element: ElementWithLimitedResource<TItem>,
  ) {
    process.stdout.write(
      Settings.DIVIDER +
        [
          `mean length of queue = ${(element.queuesSizes / this._time).toFixed(
            Settings.FLOAT_PRECISION,
          )}`,
          `failure = ${element.failuresNumber} (${(
            element.failuresNumber /
            (element.quantity + element.failuresNumber)
          ).toFixed(Settings.FLOAT_PRECISION)})`,
          `mean work time = ${(element.workingTime / this._time).toFixed(
            Settings.TIME_PRECISION,
          )}`,
          `mean time before in = ${(
            element.totalTimeBeforeIn / this._time
          ).toFixed(Settings.TIME_PRECISION)}`,
          `mean time before out = ${(
            element.totalTimeBeforeOut / this._time
          ).toFixed(Settings.TIME_PRECISION)}`,
        ]
          .map((string) => string.padEnd(Settings.PADDING))
          .join(Settings.DIVIDER) +
        '\n',
    );
  }

  private printResultsForProcessWithUnlimitedResources(
    element: ElementWithUnlimitedResource<TItem>,
  ) {
    process.stdout.write(
      Settings.DIVIDER +
        [
          `mean work time = ${(element.workingTime / this._time).toFixed(
            Settings.TIME_PRECISION,
          )}`,
          `mean time before in = ${(
            element.totalTimeBeforeIn / this._time
          ).toFixed(Settings.TIME_PRECISION)}`,
          `mean time before out = ${(
            element.totalTimeBeforeOut / this._time
          ).toFixed(Settings.TIME_PRECISION)}`,
        ]
          .map((string) => string.padEnd(Settings.PADDING))
          .join(Settings.DIVIDER) +
        '\n',
    );
  }
}
