import { factorial } from './factorial'

// describe('factorialLn', () => {
//   it('should return NaN for x < 1', () => {
//     expect(factorialLn(0)).toBe(NaN)
//     expect(factorialLn(-1)).toBe(NaN)
//   })

//   it('should return correct values for small x', () => {
//     expect(factorialLn(1)).toBeCloseTo(0)
//     expect(factorialLn(2)).toBeCloseTo(0.6931471805599453)
//     expect(factorialLn(3)).toBeCloseTo(1.791759469228055)
//     expect(factorialLn(4)).toBeCloseTo(3.1780538303479458)
//     expect(factorialLn(5)).toBeCloseTo(4.787491742782046)
//   })

//   it('should return correct values for larger x', () => {
//     expect(factorialLn(10)).toBeCloseTo(15.104412573075515)
//     expect(factorialLn(20)).toBeCloseTo(42.33561646070108)
//   })
// })

describe('factorial', () => {
  it('should return 1 for x === 0', () => {
    expect(factorial(0)).toBe(1)
  })

  it('should return NaN for x < 0', () => {
    expect(factorial(-1)).toBe(NaN)
    expect(factorial(-5)).toBe(NaN)
  })

  it('should return correct values for small x', () => {
    expect(factorial(1)).toBe(1)
    expect(factorial(2)).toBe(2)
    expect(factorial(3)).toBe(6)
    expect(factorial(4)).toBe(24)
    expect(factorial(5)).toBe(120)
  })

  it('should return correct values for larger x', () => {
    expect(factorial(10)).toBe(3628800)
    expect(factorial(15)).toBe(1307674368000)
  })
})
