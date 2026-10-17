import { describe, expect, it } from 'vitest'
import {
  KDE,
  scottBandwidthEstimator,
  silvermanBandwidthEstimator,
} from './kde'
import { normalDistributionPDF } from './normal-distribution'

describe('bandwidth estimators', () => {
  const values = [0, 1, 2, 3]
  const populationStd = Math.sqrt(1.25)
  const sampleScale = Math.pow(values.length, -0.2)

  it('estimates bandwidth with Scott’s rule', () => {
    expect(scottBandwidthEstimator(values)).toBeCloseTo(
      1.06 * populationStd * sampleScale
    )
  })

  it('estimates bandwidth with Silverman’s rule', () => {
    expect(silvermanBandwidthEstimator(values)).toBeCloseTo(
      0.9 * Math.min(populationStd, 1 / 1.34) * sampleScale
    )
  })
})

describe('KDE', () => {
  it('evaluates a custom kernel for one value or an array', () => {
    const distribution = new KDE([0, 2], (x) => x * x + 1, 2)

    expect(distribution.f(1)).toEqual([0.625])
    expect(distribution.f([0, 1])).toEqual([0.75, 0.625])
  })

  it('uses the normal PDF by default', () => {
    const distribution = new KDE([0, 2], undefined, 2)

    expect(distribution.f(1)[0]).toBeCloseTo(0.5 * normalDistributionPDF(0.5))
  })

  it('uses Scott’s bandwidth when none is provided', () => {
    const values = [0, 1, 2, 3]
    const distribution = new KDE(values)
    const bandwidth = scottBandwidthEstimator(values)
    const expected =
      values.reduce(
        (total, value) => total + normalDistributionPDF(-value / bandwidth),
        0
      ) /
      (values.length * bandwidth)

    expect(distribution.f(0)[0]).toBeCloseTo(expected)
  })
})
