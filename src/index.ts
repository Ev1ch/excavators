import { RandomNext, SingleNext } from './elements';
import {
  Create,
  Dispose,
  ProcessWithLimitedResource,
  Worker,
} from './elements/resourcefull';
import { Queue } from './queues';
import { ConstantDelayGenerator } from './utils';
import Model from './Model';

class Item {}

const create = new Create<Item>(
  'CREATE',
  new Worker(1, () => new ConstantDelayGenerator(1)),
  () => new Item(),
);

const process1 = new ProcessWithLimitedResource<Item>(
  'PROCESS 1',
  new Queue(1),
  [new Worker(1, () => new ConstantDelayGenerator(2))],
);
const process2 = new ProcessWithLimitedResource<Item>(
  'PROCESS 2',
  new Queue(1),
  [new Worker(2, () => new ConstantDelayGenerator(2))],
);

const dispose = new Dispose('DISPOSE');

create.next = new RandomNext([{ element: process1 }, { element: process2 }]);
process1.next = new SingleNext({ element: dispose });
process2.next = new SingleNext({ element: dispose });
process1.siblings = [process2];
process2.siblings = [process1];

const model = new Model([create, process1, process2, dispose]);
model.simulate(1000);
