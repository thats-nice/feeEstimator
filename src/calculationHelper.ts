export default class CalculationHelper {
  public static getAverage(numList: number[]): number {
    const sum: number = numList.reduce((x, y) => x + y, 0);
    return sum / numList.length;
  }
}
