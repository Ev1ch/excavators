import Element from './Element';
import { ProcessWithLimitedResource } from './resourcefull';

export interface NextElement<
  TItem,
  TElement extends Element<TItem> = Element<TItem>,
> {
  element: TElement;
  withBlocking?: boolean;
}

export interface Next<TItem> {
  getNextElement(item: TItem): NextElement<TItem> | null;
}

export class SingleNext<TItem> implements Next<TItem> {
  constructor(private _nextElement: NextElement<TItem> | null) {}

  public getNextElement() {
    return this._nextElement;
  }
}

export class RandomNext<TItem> implements Next<TItem> {
  constructor(private _nextElements: NextElement<TItem>[]) {}

  public getNextElement() {
    return this._nextElements.at(this.getRandomIndex()) ?? null;
  }

  private getRandomIndex() {
    return Math.floor(Math.random() * this._nextElements.length);
  }
}

export interface NextElementWithPriority<TItem> extends NextElement<TItem> {
  priority: number;
}

export type FilterCondition<TItem> = (
  nextElement: NextElementWithPriority<TItem>,
) => boolean;

export class PrioritizedNext<TItem> implements Next<TItem> {
  constructor(
    private _nextElements: NextElementWithPriority<TItem>[],
    private _filterCondition: FilterCondition<TItem> = ({ element }) =>
      element.isFree,
  ) {}

  public getNextElement() {
    return this.getNextElementsSortedByPriority().at(0) ?? null;
  }

  private getNextElementsSortedByPriority() {
    return this._nextElements
      .toSorted((a, b) => b.priority - a.priority)
      .filter(this._filterCondition);
  }
}

export interface NextElementWithProbability<TItem> extends NextElement<TItem> {
  probability: number;
}

export class ProbabilisticNext<TItem> implements Next<TItem> {
  constructor(private _nextElements: NextElementWithProbability<TItem>[]) {}

  public getNextElement() {
    const random = Math.random();

    if (this.getNextElementsProbabilitiesSum() !== 1) {
      throw new Error('Sum of probabilities is not equal to 1');
    }

    let probabilitiesSum = 0;
    for (const nextElement of this._nextElements) {
      probabilitiesSum += nextElement.probability;

      if (random <= probabilitiesSum) {
        return nextElement;
      }
    }

    return null;
  }

  protected getNextElementsProbabilitiesSum() {
    return this._nextElements.reduce(
      (sum, { probability }) => sum + probability,
      0,
    );
  }
}

interface NextElementWithCondition<TItem> extends NextElement<TItem> {
  condition: (item: TItem) => boolean;
}

export class ConditionalNext<TItem> implements Next<TItem> {
  constructor(private _nextElements: NextElementWithCondition<TItem>[] = []) {}

  public getNextElement(item: TItem) {
    return this._nextElements.find(({ condition }) => condition(item)) ?? null;
  }

  public addNextElement(
    element: Element<TItem>,
    condition: (item: TItem) => boolean,
  ) {
    this._nextElements.push({ element, condition });
    return this;
  }
}

export class MinimumQueueSizeNext<TItem> implements Next<TItem> {
  constructor(
    private _nextElements: NextElement<
      TItem,
      ProcessWithLimitedResource<TItem>
    >[],
  ) {}

  public getNextElement() {
    return this.getNextElementsSortedByQueueSize().at(0) ?? null;
  }

  protected getNextElementsSortedByQueueSize() {
    return this._nextElements.sort(
      (a, b) => a.element.queue.size - b.element.queue.size,
    );
  }
}
