import Random from './Random';

export interface DelayGenerator {
  get(): number;
}

export class ConstantDelay implements DelayGenerator {
  constructor(private _delay: number) {}

  public get() {
    return this._delay;
  }
}

export class UniformDelay implements DelayGenerator {
  constructor(private _min: number, private _max: number) {}

  public get() {
    return Random.getUniform(this._min, this._max);
  }
}

export class ExponentialDelay implements DelayGenerator {
  constructor(private _mean: number) {}

  public get() {
    return Random.getExponential(this._mean);
  }
}

export class NormalDelay implements DelayGenerator {
  constructor(private _mean: number, private _deviation: number) {}

  public get() {
    return Random.getNormal(this._mean, this._deviation);
  }
}

export class ErlangDelay implements DelayGenerator {
  constructor(private _mean: number, private _deviation: number) {}

  public get() {
    return Random.getErlang(this._mean, this._deviation);
  }
}

export class GaussianDelay implements DelayGenerator {
  public get() {
    return Random.getGaussian();
  }
}
