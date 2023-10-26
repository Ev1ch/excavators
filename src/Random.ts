export default class Random {
  public static getExponential(mean: number) {
    let number = 0;

    while (number === 0) {
      number = Math.random();
    }

    number = -mean * Math.log(number);

    return number;
  }

  public static getUniform(min: number, max: number) {
    let number = 0;

    while (number === 0) {
      number = Math.random();
    }

    number = min + number * (max - min);

    return number;
  }

  public static getGaussian() {
    let number = 0;

    for (let i = 0; i < 6; i += 1) {
      number += Math.random();
    }

    return number / 6;
  }

  public static getNormal(mean: number, deviation: number) {
    return mean + Random.getGaussian() * deviation;
  }

  public static getErlang(mean: number, deviation: number) {
    let number = 0;

    for (let i = 0; i < deviation; i++) {
      number += Random.getExponential(mean);
    }

    return -1 / deviation / mean + Math.log(number);
  }

  public static getBoolean() {
    return Math.random() > 0.5;
  }
}
