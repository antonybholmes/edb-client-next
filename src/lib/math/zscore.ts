import { mean } from './mean'
import { populationStd } from './stats'

export class ZScore {
  private _mean: number
  private _std: number

  constructor() {
    this._mean = NaN
    this._std = NaN
  }

  fit(data: number[]): ZScore {
    this._mean = mean(data)
    this._std = populationStd(data, this._mean) // std(data, this._mean)

    return this
  }

  transform(data: number[]): number[] {
    return data.map((v) => (this._std !== 0 ? (v - this._mean) / this._std : 0))
  }

  /**
   *
   * @param data an array of numbers
   * @returns the array of numbers where each value has its mean subtracted and divided by the standard deviation.
   */
  fitTransform(data: number[]): number[] {
    return this.fit(data).transform(data)
  }
}
