import chalk from 'chalk';

import { Element } from './elements';
import {
  ElementWithLimitedResource,
  ElementWithUnlimitedResource,
} from './elements/resourcefull';

import Settings from './Settings';

type Row = readonly (string | number)[];
type Table = Row[];

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
        `Item in ${chalk.green(
          `'${currentElement.name}'`,
        )}, time = ${chalk.yellow(this.getFormattedNumber(this._tNext))}:`,
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
    const table: (string | number)[][] = [['Name', 'Quantity', 'Time next']];

    for (const element of this._list) {
      table.push([
        element.name,
        ...this.getFormattedRow(element.getInformation()),
      ]);
    }

    console.table(table);
    console.log();
  }

  private printResults() {
    console.log('Results');

    const table: Table = [
      [
        'Name',
        'Quantity',
        'Mean work time',
        'Mean time before in',
        'Mean time before out',
        'Mean queue size',
        'Failure',
        'Failure probability',
      ],
    ];
    for (const element of this._list) {
      const commonColumns = [element.name, element.quantity] as const;

      if (element instanceof ElementWithLimitedResource) {
        table.push([
          ...commonColumns,
          ...this.getFormattedRow(
            this.printResultsElementWithLimitedResources(element),
          ),
        ]);
      } else if (element instanceof ElementWithUnlimitedResource) {
        table.push([
          ...commonColumns,
          ...this.getFormattedRow(
            this.printResultsForProcessWithUnlimitedResources(element),
          ),
        ]);
      }
    }

    console.table(table);
  }

  private printResultsElementWithLimitedResources(
    element: ElementWithLimitedResource<TItem>,
  ) {
    const meanWorkingTime = element.workingTime / this._time;
    const meanTimeBeforeIn = element.totalTimeBeforeIn / this._time;
    const meanTimeBeforeOut = element.totalTimeBeforeOut / this._time;
    const failuresProbability =
      element.failuresNumber / (element.quantity + element.failuresNumber);
    const meanQueueSize = element.queuesSizes / this._time;

    return [
      meanWorkingTime,
      meanTimeBeforeIn,
      meanTimeBeforeOut,
      element.failuresNumber,
      failuresProbability,
      meanQueueSize,
    ] as const;
  }

  private printResultsForProcessWithUnlimitedResources(
    element: ElementWithUnlimitedResource<TItem>,
  ) {
    const meanWorkingTime = element.workingTime / this._time;
    const meanTimeBeforeIn = element.totalTimeBeforeIn / this._time;
    const meanTimeBeforeOut = element.totalTimeBeforeOut / this._time;

    return [
      meanWorkingTime,
      meanTimeBeforeIn,
      meanTimeBeforeOut,
      '-',
      '-',
      '-',
    ] as const;
  }

  private getFormattedRow(row: Row) {
    return row.map((value) =>
      typeof value === 'number' ? this.getFormattedNumber(value) : value,
    );
  }

  private getFormattedNumber(number: number) {
    if (number % 1 !== 0) {
      return Number(number.toFixed(Settings.FLOAT_PRECISION));
    }

    return number;
  }
}
