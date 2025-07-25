import { binomial } from './binomial'

//describe('binomialLn', () => {
//   it('should return 0 for n < 1', () => {
//     expect(binomialLn(0, 0)).toBe(0)
//     expect(binomialLn(0, 1)).toBe(NaN)
//     expect(binomialLn(-1, 0)).toBe(NaN)
//   })

//   it('should return correct values for small n and k', () => {
//     expect(binomialLn(5, 0)).toBeCloseTo(0)
//     expect(binomialLn(5, 1)).toBeCloseTo(1.6094379124341003)
//     expect(binomialLn(5, 2)).toBeCloseTo(2.302585092994046)
//     expect(binomialLn(5, 3)).toBeCloseTo(2.302585092994046)
//     expect(binomialLn(5, 4)).toBeCloseTo(1.6094379124341003)
//     expect(binomialLn(5, 5)).toBeCloseTo(0)
//   })

//   it('should return correct values for larger n and k', () => {
//     expect(binomialLn(10, 3)).toBeCloseTo(4.787491742782046)
//     expect(binomialLn(10, 5)).toBeCloseTo(5.529420690989331)
//     expect(binomialLn(10, 7)).toBeCloseTo(4.787491742782046)
//   })

//   it('should return correct values for n === k', () => {
//     expect(binomialLn(10, 10)).toBeCloseTo(0)
//     expect(binomialLn(5, 5)).toBeCloseTo(0)
//   })

//   it('should return correct values for k === 0', () => {
//     expect(binomialLn(10, 0)).toBeCloseTo(0)
//     expect(binomialLn(5, 0)).toBeCloseTo(0)
//   })
// })

describe('binomial', () => {
  it('should return 1 for n < 1', () => {
    expect(binomial(0, 0)).toBe(1)
    expect(binomial(0, 1)).toBe(0)
    expect(binomial(-1, 0)).toBe(NaN)
  })

  it('should return correct values for small n and k', () => {
    expect(binomial(5, 0)).toBe(1)
    expect(binomial(5, 1)).toBe(5)
    expect(binomial(5, 2)).toBe(10)
    expect(binomial(5, 3)).toBe(10)
    expect(binomial(5, 4)).toBe(5)
    expect(binomial(5, 5)).toBe(1)
  })

  it('should return correct values for larger n and k', () => {
    expect(binomial(10, 3)).toBe(120)
    expect(binomial(10, 5)).toBe(252)
    expect(binomial(10, 7)).toBe(120)
  })

  it('should return correct values for n === k', () => {
    expect(binomial(10, 10)).toBe(1)
    expect(binomial(5, 5)).toBe(1)
  })

  it('should return correct values for k === 0', () => {
    expect(binomial(10, 0)).toBe(1)
    expect(binomial(5, 0)).toBe(1)
  })
})
