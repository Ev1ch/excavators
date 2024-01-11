import { Queue } from '../../queues';

import Worker, { WorkerState } from './Worker';
import ProcessWithResource from './ProcessWithResource';

export interface ProcessWithLimitedResourceOptions {
  queueSwitchDifference: number;
}

export default class ProcessWithLimitedResource<
  TItem,
> extends ProcessWithResource<TItem> {
  private _failuresNumber: number;
  private _queuesSizes: number;
  private _queueSwitchDifference: number;
  private _switchesNumber: number;

  constructor(
    name: string,
    private _queue: Queue<TItem>,
    workers: Worker<TItem>[],
    options?: ProcessWithLimitedResourceOptions,
  ) {
    super(name);
    this.workers = workers;
    this._queuesSizes = 0;
    this._failuresNumber = 0;
    this._switchesNumber = 0;
    this._queueSwitchDifference = options?.queueSwitchDifference ?? Infinity;
  }

  public inAct(item: TItem) {
    super.inAct(item);

    if (this.siblings.length && this._queue.size) {
      this.trySwitchQueue();
    }

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

  private trySwitchQueue() {
    for (let i = 0; i < this._queue.size; i++) {
      const sibling = this.siblings.find(
        (sibling) =>
          sibling instanceof ProcessWithLimitedResource &&
          this._queue.size - sibling.queue.size >= this._queueSwitchDifference,
      ) as ProcessWithLimitedResource<TItem> | undefined;

      if (!sibling) {
        break;
      }

      this._switchesNumber++;
      sibling.queue.push(this._queue.pop()!);
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

  public get switchesNumber() {
    return this._switchesNumber;
  }
}
