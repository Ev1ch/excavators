import { SingleNext } from './elements/helpers';
import {
  Create,
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

const process = new ProcessWithLimitedResource<Item>('PROCESS', new Queue(1), [
  new Worker(1, () => new ConstantDelayGenerator(2)),
]);

create.next = new SingleNext({ element: process });

const model = new Model([create, process]);
model.simulate(1000);
