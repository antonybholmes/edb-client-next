import { mean } from './mean'
import { std } from './stats'

export class ZScore {
  private _mean: number
  private _std: number

  constructor() {
    this._mean = NaN
    this._std = NaN
  }

  fit(data: number[]): ZScore {
    this._mean = mean(data)
    this._std = std(data, this._mean)

    //console.log('zscore', this._mean, this._std)

    return this
  }

  transform(data: number[]): number[] {
    return data.map(v => (v - this._mean) / this._std)
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

// function pickBy(dataItem: { [key: string]: number|undefined }, predicate: (v: any)=>boolean):{ [key: string]: number} {
// 	return Object.fromEntries(Object.entries(dataItem).filter(([, v]) => predicate(v)))
// }

// function stdDev(values: number[], mean: number) {
//   return Math.sqrt(variance(values, mean))
// }

// function variance(values: number[], mean: number) {
//   values = _.map(values, value => {
//     return Math.pow(value - mean, 2)
//   })
//   return _.sum(values) / values.length
// }
