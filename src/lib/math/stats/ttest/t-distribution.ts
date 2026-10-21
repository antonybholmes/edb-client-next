// Lanczos approximation (g = 7, n = 9)
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
]

/** Natural log of the gamma function for x > 0. */
export function lnGamma(x: number): number {
  if (x < 0.5) {
    // reflection formula
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x)
  }

  x -= 1

  let a = LANCZOS[0]!
  const t = x + 7.5

  for (let i = 1; i < LANCZOS.length; ++i) {
    a += LANCZOS[i]! / (x + i)
  }

  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

// Continued fraction for the incomplete beta function (modified Lentz)
function betaCF(a: number, b: number, x: number): number {
  const tiny = 1e-300
  const eps = 1e-15

  const qab = a + b
  const qap = a + 1
  const qam = a - 1

  let c = 1
  let d = 1 - (qab * x) / qap

  if (Math.abs(d) < tiny) {
    d = tiny
  }

  d = 1 / d
  let h = d

  for (let m = 1; m <= 1000; ++m) {
    const m2 = 2 * m

    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < tiny) d = tiny
    c = 1 + aa / c
    if (Math.abs(c) < tiny) c = tiny
    d = 1 / d
    h *= d * c

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < tiny) d = tiny
    c = 1 + aa / c
    if (Math.abs(c) < tiny) c = tiny
    d = 1 / d

    const del = d * c
    h *= del

    if (Math.abs(del - 1) < eps) {
      break
    }
  }

  return h
}

/** Regularized incomplete beta function I_x(a, b). */
export function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) {
    return 0
  }

  if (x >= 1) {
    return 1
  }

  const front = Math.exp(
    lnGamma(a + b) -
      lnGamma(a) -
      lnGamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x)
  )

  // use the symmetry relation where the continued fraction converges faster
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaCF(a, b, x)) / a
  }

  return 1 - (front * betaCF(b, a, 1 - x)) / b
}

/** Survival function P(T > t) of Student's t distribution with `df` degrees of freedom. */
export function tSF(t: number, df: number): number {
  if (Number.isNaN(t) || !(df > 0)) {
    return NaN
  }

  if (!Number.isFinite(t)) {
    return t > 0 ? 0 : 1
  }

  // P(|T| > |t|) = I_{df / (df + t^2)}(df / 2, 1 / 2)
  const tail = 0.5 * betaInc(df / 2, 0.5, df / (df + t * t))

  return t > 0 ? tail : 1 - tail
}
