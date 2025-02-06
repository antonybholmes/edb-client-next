// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* combinations(arr: any[], k: number): Generator<any, any, any> {
  if (k === 0) {
    yield []
    return
  }

  for (let i = 0; i < arr.length; i++) {
    for (const combo of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...combo]
    }
  }
}

// const array = [1, 2, 3, 4]
// const k = 2

// for (const combo of combinations(array, k)) {
//   console.log(combo)
// }
