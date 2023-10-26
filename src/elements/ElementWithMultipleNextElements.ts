import Element from './Element';
import Variation from './Variation';

export interface NextElement<TItem> {
  element: Element<TItem>;
  withBlocking?: boolean;
}

export interface NextElementWithProbability<TItem> extends NextElement<TItem> {
  probability: number;
}

export interface NextElementWithPriority<TItem> extends NextElement<TItem> {
  priority: number;
}

export interface NextElementWithCondition<TItem> extends NextElement<TItem> {
  condition: (item: TItem) => boolean;
}

export default abstract class ElementWithMultipleNextElements<
  TItem,
  TNextElement extends NextElement<TItem>,
> extends Element<TItem> {
  private static readonly MAXIMUM_PROBABILITY = 1;

  private _nextElements: TNextElement[];
  private _variation: Variation;

  constructor(name: string) {
    super(name);
    this._nextElements = [];
  }

  public set nextElements(nextElements: TNextElement[]) {
    this._nextElements = nextElements;
  }

  public get nextElements() {
    return this._nextElements;
  }

  public get variation() {
    return this._variation;
  }

  protected set variation(variation: Variation) {
    this._variation = variation;
  }

  protected getNextElement(item: TItem) {
    switch (this._variation) {
      case Variation.PROBABILISTIC:
        return this.getNextElementByProbability();
      case Variation.PRIORITIZED:
        return this.getNextElementByPriority();
      case Variation.RANDOM:
        return this.getRandomNextElement();
      case Variation.CONDITIONAL:
        return this.getNextElementByCondition(item);
      default:
        throw new Error('Wrong variation type');
    }
  }

  protected getNextElementByPriority(): NextElementWithPriority<TItem> | null {
    if (!this.areNextElementsWithPriority()) {
      throw new Error('Priority is not defined');
    }

    if (this._nextElements.length === 0) {
      return null;
    }

    const sortedNextElements = this._nextElements.toSorted(
      // @ts-ignore
      (a, b) => b.priority - a.priority,
    );

    for (const nextElement of sortedNextElements) {
      if (nextElement.element.isFree) {
        // @ts-ignore
        return nextElement;
      }
    }

    return null;
  }

  protected getNextElementByProbability(): NextElementWithProbability<TItem> | null {
    if (!this.areNextElementsWithProbability()) {
      throw new Error('Probability is not defined');
    }

    if (
      this._nextElements.reduce(
        // @ts-ignore
        (sum, { probability }) => sum + probability,
        0,
      ) !== ElementWithMultipleNextElements.MAXIMUM_PROBABILITY
    ) {
      throw new Error(
        `Sum of probabilities is not equal to ${ElementWithMultipleNextElements.MAXIMUM_PROBABILITY}`,
      );
    }

    const random = Math.random();

    let sum = 0;
    for (const nextElement of this._nextElements) {
      // @ts-ignore
      sum += nextElement.probability;

      if (random <= sum) {
        return nextElement;
      }
    }

    return null;
  }

  protected getRandomNextElement(): NextElement<TItem> | null {
    if (this._nextElements.length === 0) {
      return null;
    }

    return (
      this._nextElements.at(
        Math.floor(Math.random() * this._nextElements.length),
      ) ?? null
    );
  }

  protected getNextElementByCondition(
    item: TItem,
  ): NextElementWithCondition<TItem> | null {
    if (!this.areNextElementsWithCondition()) {
      throw new Error('Condition is not defined');
    }

    if (this._nextElements.length === 0) {
      return null;
    }

    for (const nextElement of this._nextElements) {
      if (nextElement.condition(item)) {
        return nextElement;
      }
    }

    return null;
  }

  protected areNextElementsWithPriority(): this is ElementWithMultipleNextElements<
    TItem,
    NextElementWithPriority<TItem>
  > {
    return this._nextElements.every((nextElement) =>
      Object.keys(nextElement).includes('priority'),
    );
  }

  protected areNextElementsWithProbability(): this is ElementWithMultipleNextElements<
    TItem,
    NextElementWithProbability<TItem>
  > {
    return this._nextElements.every((nextElement) =>
      Object.keys(nextElement).includes('probability'),
    );
  }

  protected areNextElementsWithCondition(): this is ElementWithMultipleNextElements<
    TItem,
    NextElementWithCondition<TItem>
  > {
    return this._nextElements.every((nextElement) =>
      Object.keys(nextElement).includes('condition'),
    );
  }
}
