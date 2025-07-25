// const P = 0.3275911
// const A1: number = 0.254829592
// const A2: number = -0.284496736
// const A3: number = 1.421413741
// const A4: number = -1.453152027
// const A5: number = 1.061405429
// const A: number[] = [A1, A2, A3, A4, A5]

/**
 * Approximation of error function.
 *
 * See https://en.wikipedia.org/wiki/Error_function and
 * https://stackoverflow.com/questions/809362/how-to-calculate-cumulative-normal-distribution/809402#809402
 * but the stackoverflow answer seems wrong so I modified to match the wiki definition
 *
 * @param x
 * @returns
 */
// export function erf(x: number): number {
//   // let t = 1 / (1 + P * x)

//   // let s = 0

//   // for (let i = 0; i < 5; ++i) {
//   //   s += A[i] * t
//   //   t *= t
//   // }

//   // return 1 - s * Math.exp(-(x * x))

//   const z = Math.abs(x)
//   const t = 1 / (1 + 0.5 * z)
//   const r =
//     t *
//     Math.exp(
//       -z * z -
//         1.26551223 +
//         t *
//           (1.00002368 +
//             t *
//               (0.37409196 +
//                 t *
//                   (0.09678418 +
//                     t *
//                       (-0.18628806 +
//                         t *
//                           (0.27886807 +
//                             t *
//                               (-1.13520398 +
//                                 t *
//                                   (1.48851587 +
//                                     t * (-0.82215223 + t * 0.17087277))))))))
//     )

//   if (x >= 0) {
//     return 1 - r
//   } else {
//     return r - 1
//   }
// }

const a1 = 0.254829592
const a2 = -0.284496736
const a3 = 1.421413741
const a4 = -1.453152027
const a5 = 1.061405429
const p = 0.3275911

export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}
