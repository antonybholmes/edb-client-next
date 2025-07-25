import { mannWhitneyU } from './mann-whitney'

describe('mannWhitneyU', () => {
  it('should return correct U and p values for simple cases', () => {
    //let xs = [1, 2, 3]
    //let ys = [4, 5, 6]

    //let xs = [12, 15, 14, 10, 13];
    //let ys = [22, 25, 20, 18, 21];

    let xs = [19, 22, 16, 29, 24]
    let ys = [20, 11, 17, 12]

    const result = mannWhitneyU(ys, ys)
    expect(result.u).toBe(17)
    expect(result.p).toBeCloseTo(0.11)
  })

  //   it('should handle ties correctly', () => {
  //     const xs = [1, 2, 2, 3]
  //     const ys = [2, 4, 5]
  //     const result = mannWhitneyU(xs, ys)
  //     expect(result.u).toBe(9)
  //     expect(result.p).toBeCloseTo(0.13333333333333333)
  //   })

  //   it('should handle different alternative hypotheses', () => {
  //     const xs = [1, 2, 3]
  //     const ys = [4, 5, 6]

  //     const greaterResult = mannWhitneyU(xs, ys, 'greater')
  //     expect(greaterResult.u).toBe(9)
  //     expect(greaterResult.p).toBeCloseTo(0.025)

  //     const lessResult = mannWhitneyU(xs, ys, 'less')
  //     expect(lessResult.u).toBe(9)
  //     expect(lessResult.p).toBeCloseTo(0.975)
  //   })

  //   it('should handle empty arrays', () => {
  //     const xs: number[] = []
  //     const ys = [1, 2, 3]
  //     const result = mannWhitneyU(xs, ys)
  //     expect(result.u).toBe(0)
  //     expect(result.p).toBeCloseTo(1)
  //   })

  //   it('should handle empty arrays', () => {
  //     const xs = [1, 2, 3]
  //     const ys: number[] = []
  //     const result = mannWhitneyU(xs, ys)
  //     expect(result.u).toBe(0)
  //     expect(result.p).toBeCloseTo(1)
  //   })

  //   it('should handle identical arrays', () => {
  //     const xs = [1, 2, 3]
  //     const ys = [1, 2, 3]
  //     const result = mannWhitneyU(xs, ys)
  //     expect(result.u).toBe(4.5)
  //     expect(result.p).toBeCloseTo(1)
  //   })

  //   it('should handle continuity correction', () => {
  //     const xs = [1, 2, 3]
  //     const ys = [4, 5, 6]

  //     const resultWithContinuity = mannWhitneyU(xs, ys, 'two-sided', true)
  //     const resultWithoutContinuity = mannWhitneyU(xs, ys, 'two-sided', false)

  //     expect(resultWithContinuity.p).toBeCloseTo(0.05)
  //     expect(resultWithoutContinuity.p).toBeCloseTo(0.02857142857142857)
  //   })

  //   it('should handle larger datasets', () => {
  //     const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  //     const ys = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  //     const result = mannWhitneyU(xs, ys)
  //     expect(result.u).toBe(100)
  //     expect(result.p).toBeCloseTo(0.0000010973281911010742)
  //   })
})
