import { normalDistributionPDF } from './normal-distribution'
import { iqr } from './quartile'
import { std } from './stats'
import { sum } from './sum'

const EST_POW = -1 / 5

// https://en.wikipedia.org/wiki/Kernel_density_estimation rule of thumb
export function scottBandwidthEstimator(x: number[]) {
  return 1.06 * std(x) * Math.pow(x.length, EST_POW)
}

export function silvermanBandwidthEstimator(x: number[]) {
  return 0.9 * Math.min(std(x), iqr(x) / 1.34) * Math.pow(x.length, EST_POW)
}

// https://en.wikipedia.org/wiki/Kernel_density_estimation
export class KDE {
  private _x: number[]
  private _kernel: (x: number) => number
  private _bandwidth: number
  private _A: number

  constructor(
    x: number[],
    kernel: (x: number) => number = normalDistributionPDF,
    bandwidth: number | 'scott' | 'silverman' | null = null
  ) {
    this._x = x
    this._kernel = kernel

    if (!bandwidth) {
      bandwidth = 'scott'
    }

    if (typeof bandwidth === 'number' && bandwidth > 0) {
      this._bandwidth = bandwidth
    } else {
      if (bandwidth === 'silverman') {
        this._bandwidth = silvermanBandwidthEstimator(x)
      } else {
        this._bandwidth = scottBandwidthEstimator(x)
      }
    }

    // normalization factor
    this._A = 1 / (x.length * this._bandwidth)

    //console.log("kde", this._bandwidth, this._A)
  }

  /**
   *
   * @param y a number or array of numbers to apply the KDE to
   * @returns an array of KDE estimates of y
   */
  f(y: number | number[]): number[] {
    if (!Array.isArray(y)) {
      y = [y]
    }

    return y.map(
      (yi) =>
        this._A *
        sum(this._x.map((xi) => this._kernel((yi - xi) / this._bandwidth)))
    )
  }
}
