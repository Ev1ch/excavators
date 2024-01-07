import Element from '../Element';
import Worker, { WorkerState } from './Worker';

export default abstract class ProcessWithResource<
  TItem,
> extends Element<TItem> {
  private _workers: Worker<TItem>[];
  private _workingTime: number;

  constructor(name: string) {
    super(name);
    this._workers = [];
    this._workingTime = 0;
  }

  protected get workers() {
    return this._workers;
  }

  protected set workers(workers: Worker<TItem>[]) {
    this._workers = workers;
  }

  public get workingTime() {
    return this._workingTime;
  }

  protected set workingTime(workingTime: number) {
    this._workingTime = workingTime;
  }

  protected getFreeWorkers() {
    return this.workers.filter((worker) => worker.state === WorkerState.FREE);
  }

  protected getFreeWorker() {
    return (
      this.workers.find((worker) => worker.state === WorkerState.FREE) ?? null
    );
  }

  protected getBusyWorkers() {
    return this.workers.filter((worker) => worker.state === WorkerState.BUSY);
  }

  protected getBusyWorkerWithMinimumTNext() {
    const busyWorkers = this.getBusyWorkers();

    if (!busyWorkers.length) {
      return null;
    }

    let minimumTNext = Infinity;
    let busyWorkerWithMinimumTNext = null;
    for (const busyWorker of busyWorkers) {
      const { tNext } = busyWorker;

      if (tNext < minimumTNext) {
        busyWorkerWithMinimumTNext = busyWorker;
        minimumTNext = tNext;
      }
    }

    return busyWorkerWithMinimumTNext;
  }

  protected getMinimumTNextFromBusyWorkers() {
    const busyWorker = this.getBusyWorkerWithMinimumTNext();

    if (!busyWorker) {
      return Infinity;
    }

    return busyWorker.tNext;
  }

  protected removeWorker(worker: Worker<TItem>) {
    this.workers = this.workers.filter(
      (currentWorker) => currentWorker.id !== worker.id,
    );
  }
}
