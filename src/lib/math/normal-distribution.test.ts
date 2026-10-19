import { describe, expect, it } from 'vitest'
import {
  normalDistributionCDF,
  normalDistributionPDF,
  normSF,
} from './normal-distribution'

describe('normalDistributionPDF()', () => {
  it('returns the standard normal density at the center and one standard deviation', () => {
    expect(normalDistributionPDF(0)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI))
    expect(normalDistributionPDF(1)).toBeCloseTo(
      Math.exp(-0.5) / Math.sqrt(2 * Math.PI)
    )
  })

  it('uses the supplied mean and absolute standard deviation', () => {
    expect(normalDistributionPDF(5, 5, 2)).toBeCloseTo(
      1 / (2 * Math.sqrt(2 * Math.PI))
    )
    expect(normalDistributionPDF(7, 5, -2)).toBeCloseTo(
      normalDistributionPDF(7, 5, 2)
    )
  })

  it('is symmetric around its mean', () => {
    expect(normalDistributionPDF(-1)).toBeCloseTo(normalDistributionPDF(1))
  })
})

describe('normalDistributionCDF()', () => {
  it('returns the standard normal cumulative probabilities', () => {
    expect(normalDistributionCDF(0)).toBeCloseTo(0.5)
    expect(normalDistributionCDF(1)).toBeCloseTo(0.8413447, 6)
    expect(normalDistributionCDF(-1)).toBeCloseTo(0.1586553, 6)
  })

  it('standardizes using the supplied mean and absolute standard deviation', () => {
    expect(normalDistributionCDF(7, 5, 2)).toBeCloseTo(normalDistributionCDF(1))
    expect(normalDistributionCDF(7, 5, -2)).toBeCloseTo(
      normalDistributionCDF(1)
    )
  })
})

describe('normSF()', () => {
  it('returns the upper-tail probability complementary to the CDF', () => {
    expect(normSF(0)).toBeCloseTo(0.5)
    expect(normSF(1)).toBeCloseTo(0.1586553, 6)
    expect(normSF(1)).toBeCloseTo(1 - normalDistributionCDF(1))
  })

  it('standardizes using the supplied mean and absolute standard deviation', () => {
    expect(normSF(7, 5, 2)).toBeCloseTo(normSF(1))
    expect(normSF(7, 5, -2)).toBeCloseTo(normSF(1))
  })
})
