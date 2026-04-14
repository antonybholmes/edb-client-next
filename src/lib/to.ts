export async function to<T>(promise: Promise<T>): Promise<[null, T] | [Error]> {
  try {
    const data = await promise
    return [null, data]
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err))]
  }
}

export function toSync<T>(fn: () => T): [null, T] | [Error] {
  try {
    const result = fn()
    return [null, result]
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err))]
  }
}
