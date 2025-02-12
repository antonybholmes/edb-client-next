// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from

export function range(start: number, stop?: number, step: number = 1) {
  if (!stop) {
    stop = start
    start = 0
  }

  // if (!step) {
  //   step = 1
  // }

  // we want to end on the index before the stop,
  // e.g. stop = 5 -> [0,1,2,3,4]
  --stop

  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  )
}

export function rangeMap<T>(
  f: (index: number) => T,
  start: number,
  stop?: number,
  step: number = 1
): T[] {
  if (!stop) {
    if (step > 0) {
      stop = start
      start = 0
    } else {
      stop = 0
    }
  }

  // step cannot be 0
  if (step === 0) {
    step = 1
  }

  // if (!step) {
  //   step = 1
  // }

  // we want to end on the index before the stop,
  // e.g. stop = 5 -> [0,1,2,3,4]

  if (step > 0) {
    --stop
  } else {
    ++stop
  }

  return Array.from({ length: Math.floor((stop - start) / step) + 1 }, (_, i) =>
    f(start + i * step)
  )
}
