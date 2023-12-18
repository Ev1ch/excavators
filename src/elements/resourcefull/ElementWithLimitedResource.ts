import { Queue } from '../../queues';

import Worker, { WorkerState } from './Worker';
import ElementWithResource from './ElementWithResource';

export interface ElementWithLimitedResourceOptions<TItem> {
  workers: Worker<TItem>[];
}

export default class ElementWithLimitedResource<
  TItem,
> extends ElementWithResource<TItem> {
  private _failuresNumber: number;
  private _queuesSizes: number;

  constructor(
    name: string,
    private _queue: Queue<TItem>,
    { workers }: ElementWithLimitedResourceOptions<TItem>,
  ) {
    super(name);
    this.workers = workers;
    this._queuesSizes = 0;
    this._failuresNumber = 0;
  }

  public inAct(item: TItem) {
    super.inAct(item);

    const freeWorker = this.getFreeWorker();

    if (freeWorker) {
      freeWorker.state = WorkerState.BUSY;
      freeWorker.item = item;
      const delay = freeWorker.getDelay();
      freeWorker.tNext = this.tCurrent + delay;

      if (!this.shouldSkip()) {
        this.workingTime += delay;
      }

      this.tNext = this.getMinimumTNextFromBusyWorkers();
      return;
    }

    if (!this._queue.isFull) {
      this._queue.push(item);
      return;
    }

    if (!this.shouldSkip()) {
      this._failuresNumber++;
    }
  }

  public outAct() {
    super.outAct();

    const busyWorker = this.getBusyWorkerWithMinimumTNext();

    if (!busyWorker) {
      throw new Error('There is no busy workers');
    }

    const item = busyWorker.item;

    if (!item) {
      throw new Error('There is no item in busy worker');
    }

    busyWorker.tNext = Infinity;
    busyWorker.state = WorkerState.FREE;
    busyWorker.item = null;
    this.tNext = this.getMinimumTNextFromBusyWorkers();

    const nextElement = this.next?.getNextElement(item);

    if (
      nextElement &&
      !nextElement.element.isFree &&
      nextElement.withBlocking
    ) {
      busyWorker.tNext = nextElement.element.tNext;
      busyWorker.item = item;
      busyWorker.state = WorkerState.BUSY;
      return;
    }

    if (!this._queue.isEmpty) {
      const item = this._queue.pop()!;
      busyWorker.state = WorkerState.BUSY;
      busyWorker.item = item;
      const delay = busyWorker.getDelay();
      busyWorker.tNext = this.tCurrent + delay;

      if (!this.shouldSkip()) {
        this.workingTime += delay;
      }

      this.tNext = this.getMinimumTNextFromBusyWorkers();
    }

    nextElement?.element.inAct(item);
  }

  public calculateStatistics(delta: number) {
    if (!this.shouldSkip()) {
      this._queuesSizes += this._queue.size * delta;
    }
  }

  public get isFree() {
    return Boolean(this.getFreeWorker());
  }

  public get queue() {
    return this._queue;
  }

  public set queue(queue: Queue<TItem>) {
    this._queue = queue;
  }

  public get failuresNumber() {
    return this._failuresNumber;
  }

  public get queuesSizes() {
    return this._queuesSizes;
  }
}
