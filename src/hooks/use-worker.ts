import { useEffect, useRef } from 'react'

/**
 * A generic hook for running a web worker. The worker is created lazily when `run`
 * is called for the first time, and is terminated when the component unmounts or
 * when `cancel` is called. The worker is expected to communicate via `postMessage`
 * and `onmessage` with a single message type for simplicity.
 *
 * @param f A function that returns a new Worker instance.
 * @returns An object with `run` and `cancel` methods to interact with the worker.
 */
export function useWorker<P, R>(f: () => Worker) {
  const workerRef = useRef<Worker | null>(null)

  function getWorker() {
    if (!workerRef.current) {
      workerRef.current = f()
    }

    return workerRef.current
  }

  function run(payload: P, onResult: (res: R) => void) {
    // terminate any existing worker before starting a new one
    cancel()

    const worker = getWorker()

    worker.onmessage = (e: MessageEvent<R>) => {
      onResult(e.data)
    }

    worker.postMessage(payload)
  }

  function cancel() {
    workerRef.current?.terminate()
    workerRef.current = null
  }

  useEffect(() => {
    return cancel
  }, [])

  return { run, cancel }
}
