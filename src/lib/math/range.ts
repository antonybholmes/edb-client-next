// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from

export function range(start: number, stop?: number, step: number = 1) {
  if (stop === undefined) {
    stop = start
    start = 0
  }

  if (step === 0) {
    throw new Error('step cannot be 0')
  }

  // we want to end on the index before the stop,
  // e.g. stop = 5 -> [0,1,2,3,4]

  const length = Math.max(Math.ceil((stop - start) / step), 0)
  const result = new Array<number>(length)

  let value = start
  for (let i = 0; i < length; i++) {
    result[i] = value
    value += step
  }

  return result
}

export function* rangeg(
  start: number,
  stop?: number,
  step = 1
): Iterable<number> {
  if (stop === undefined) {
    stop = start
    start = 0
  }

  if (step === 0) {
    throw new Error('step cannot be 0')
  }

  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      yield i
    }
  } else {
    for (let i = start; i > stop; i += step) {
      yield i
    }
  }
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
