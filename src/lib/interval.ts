export function createInterval(
  handler: () => void,
  step: number = 1000
): unknown {
  return setInterval(() => {
    handler()
  }, step)
}
