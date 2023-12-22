import { ExponentialDelayGenerator, ConstantDelayGenerator } from './utils';
import { ConditionalNext, SingleNext } from './elements/helpers';
import {
  Worker,
  ElementWithLimitedResource,
  ElementWithUnlimitedResource,
} from './elements/resourcefull';

import Model from './Model';
import { PriorityQueue, Queue } from './queues';

function getDefaultModel(x1: number, x2: number, x3: number) {
  class Truck {
    constructor(private _capacity: number, private _excavator: number) {}

    public get capacity() {
      return this._capacity;
    }

    public get excavator() {
      return this._excavator;
    }
  }

  const getExcavatorDelayGenerator = (truck: Truck) => {
    if (truck.capacity === 20) {
      return new ExponentialDelayGenerator(5);
    }

    if (truck.capacity === 50) {
      return new ExponentialDelayGenerator(10);
    }

    throw new Error('Invalid truck capacity');
  };

  const getExcavator = (id: number) => {
    const excavator = new ElementWithLimitedResource<Truck>(
      `EXCAVATOR ${id}`,
      new Queue(Infinity, [new Truck(50, id)]),
      {
        workers: [new Worker(1, getExcavatorDelayGenerator)],
      },
    );
    excavator.inAct(new Truck(20, id));

    return excavator;
  };

  const excavator1 = getExcavator(1);
  const excavator2 = getExcavator(2);
  const excavator3 = getExcavator(3);
  const going = new ElementWithUnlimitedResource<Truck>(
    'GOING',
    (id) =>
      new Worker(id, (truck) => {
        if (truck.capacity === 20) {
          return new ConstantDelayGenerator(x1);
        }

        if (truck.capacity === 50) {
          return new ConstantDelayGenerator(x2);
        }

        throw new Error('Invalid truck capacity');
      }),
  );
  const crushing = new ElementWithLimitedResource<Truck>(
    'CRUSHING',
    new PriorityQueue<Truck>(Infinity, (a, b) => a.capacity > b.capacity),
    {
      workers: [
        new Worker(1, (truck) => {
          if (truck.capacity === 20) {
            return new ExponentialDelayGenerator(5);
          }

          if (truck.capacity === 50) {
            return new ExponentialDelayGenerator(4);
          }

          throw new Error('Invalid truck capacity');
        }),
      ],
    },
  );
  const goingBack = new ElementWithUnlimitedResource<Truck>(
    'GOING BACK',
    (id) =>
      new Worker(id, (truck) => {
        if (truck.capacity === 20) {
          return new ConstantDelayGenerator(1.5);
        }

        if (truck.capacity === 50) {
          return new ConstantDelayGenerator(x3);
        }

        throw new Error('Invalid truck capacity');
      }),
  );

  excavator1.next = new SingleNext({ element: going });
  excavator2.next = new SingleNext({ element: going });
  excavator3.next = new SingleNext({ element: going });
  going.next = new SingleNext({ element: crushing });
  crushing.next = new SingleNext({ element: goingBack });
  goingBack.next = new ConditionalNext<Truck>()
    .addNextElement(excavator1, (truck) => truck.excavator === 1)
    .addNextElement(excavator2, (truck) => truck.excavator === 2)
    .addNextElement(excavator3, (truck) => truck.excavator === 3);

  const model = new Model([
    excavator1,
    excavator2,
    excavator3,
    going,
    crushing,
    goingBack,
  ]);

  return model;
}

const NUMBER_OF_RUNS = 20;
const SIMULATION_TIME = 2000;
const SKIP_TIME = 900;

for (let i = 0; i < NUMBER_OF_RUNS; i++) {
  const model = getDefaultModel(0.6, 4.9, 0.1);
  model.simulate(SIMULATION_TIME, { skip: SKIP_TIME });
}
