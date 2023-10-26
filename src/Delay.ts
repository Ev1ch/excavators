import Random from './Random';

type Generator = (...args: unknown[]) => number;

export default class Delay<TGenerator extends Generator> {
  constructor(
    private generator: TGenerator,
    private args: Parameters<TGenerator>,
  ) {}

  public get value() {
    return this.generator(...this.args);
  }

  public static getConstant(value: number) {
    return new Delay((value: number) => value, [value]);
  }

  public static getExponential(mean: number) {
    return new Delay(Random.getExponential, [mean]);
  }

  public static getUniform(min: number, max: number) {
    return new Delay(Random.getUniform, [min, max]);
  }

  public static getNormal(mean: number, deviation: number) {
    return new Delay(Random.getNormal, [mean, deviation]);
  }

  public static getErlang(mean: number, deviation: number) {
    return new Delay(Random.getErlang, [mean, deviation]);
  }
}
