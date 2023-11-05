import { ExponentialDelayGenerator, ConstantDelayGenerator } from './utils';
import { UnlimitedQueue } from './queues';
import { ConditionalNext, SingleNext } from './elements/helpers';
import {
  Worker,
  ElementWithLimitedResource,
  ElementWithUnlimitedResource,
} from './elements/resourcefull';

import Model from './Model';

class Models {
  public static getDefault() {
    class Truck {
      public _capacity: number;
      public _excavator: number;

      constructor(capacity: number, excavator: number) {
        this._capacity = capacity;
        this._excavator = excavator;
      }

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

    const excavator1 = new ElementWithLimitedResource<Truck>(
      'EXCAVATOR 1',
      new UnlimitedQueue([new Truck(50, 1)]),
      {
        workers: [new Worker(1, getExcavatorDelayGenerator)],
      },
    );
    excavator1.inAct(new Truck(20, 1));

    const excavator2 = new ElementWithLimitedResource<Truck>(
      'EXCAVATOR 2',
      new UnlimitedQueue([new Truck(50, 2)]),
      {
        workers: [new Worker(1, getExcavatorDelayGenerator)],
      },
    );
    excavator2.inAct(new Truck(20, 2));

    const excavator3 = new ElementWithLimitedResource<Truck>(
      'EXCAVATOR 3',
      new UnlimitedQueue([new Truck(20, 3), new Truck(50, 3)]),
      {
        workers: [new Worker(1, getExcavatorDelayGenerator)],
      },
    );
    excavator3.inAct(new Truck(20, 3));

    const going = new ElementWithUnlimitedResource<Truck>(
      'GOING',
      (id) =>
        new Worker(id, (truck) => {
          if (truck.capacity === 20) {
            return new ConstantDelayGenerator(2.5);
          }

          if (truck.capacity === 50) {
            return new ConstantDelayGenerator(3);
          }

          throw new Error('Invalid truck capacity');
        }),
    );

    const crushing = new ElementWithLimitedResource<Truck>(
      'CRUSHING',
      new UnlimitedQueue(),
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
            return new ConstantDelayGenerator(2);
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
}

const model = Models.getDefault();
model.simulate(1000);
