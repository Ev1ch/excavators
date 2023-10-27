import Element from '../Element';

export interface NextElement<TItem> {
  element: Element<TItem>;
  withBlocking?: boolean;
}

export interface Nexter<TItem> {
  getNextElement(item: TItem): NextElement<TItem> | null;
}

export class SingleNexter<TItem> implements Nexter<TItem> {
  constructor(private _nextElement: NextElement<TItem> | null) {}

  public getNextElement() {
    return this._nextElement;
  }
}

export class RandomNexter<TItem> implements Nexter<TItem> {
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

export class PrioritizedNexter<TItem> implements Nexter<TItem> {
  constructor(private _nextElements: NextElementWithPriority<TItem>[]) {}

  public getNextElement() {
    return this.getNextElementsSortedByPriority().at(0) ?? null;
  }

  private getNextElementsSortedByPriority() {
    return this._nextElements.toSorted((a, b) => b.priority - a.priority);
  }
}

export interface NextElementWithProbability<TItem> extends NextElement<TItem> {
  probability: number;
}

export class ProbabilisticNexter<TItem> implements Nexter<TItem> {
  constructor(private _nextElements: NextElementWithProbability<TItem>[]) {}

  public getNextElement() {
    const random = Math.random();

    if (
      this._nextElements.reduce(
        (sum, { probability }) => sum + probability,
        0,
      ) !== 1
    ) {
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
}

interface NextElementWithCondition<TItem> extends NextElement<TItem> {
  condition: (item: TItem) => boolean;
}

export class ConditionalNexter<TItem> implements Nexter<TItem> {
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