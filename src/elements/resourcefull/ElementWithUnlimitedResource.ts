import Worker, { WorkerState } from './Worker';
import ElementWithResource from './ElementWithResource';

export default class ElementWithUnlimitedResource<
  TItem,
> extends ElementWithResource<TItem> {
  private static NEXT_WORKER_ID = 0;

  constructor(
    name: string,
    private _createWorker: (id: number) => Worker<TItem>,
  ) {
    super(name);
  }

  public inAct(item: TItem) {
    super.inAct(item);

    const freeWorker = this._createWorker(
      ElementWithUnlimitedResource.NEXT_WORKER_ID++,
    );
    this.workers.push(freeWorker);
    freeWorker.state = WorkerState.BUSY;
    freeWorker.item = item;
    const delay = freeWorker.getDelay();
    freeWorker.tNext = this.tCurrent + delay;
    this.workingTime += delay;
    this.tNext = this.getMinimumTNextFromBusyWorkers();
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

    const nextElement = this.nexter?.getNextElement(item);
    if (
      nextElement &&
      !nextElement.element.isFree &&
      nextElement.withBlocking
    ) {
      busyWorker.tNext = nextElement.element.tNext;
      return;
    }

    this.removeWorker(busyWorker);
    this.tNext = this.getMinimumTNextFromBusyWorkers();

    nextElement?.element.inAct(item);
  }

  public get isFree() {
    return true;
  }
}
