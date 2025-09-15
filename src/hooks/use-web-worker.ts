import { useEffect, useRef, type RefObject } from 'react'

export function useWebWorker(url: string): RefObject<Worker | null> {
  const workerRef: RefObject<Worker | null> = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL(url, import.meta.url), {
      type: 'module',
    })

    return () => {
      // Terminate the worker when component unmounts
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [url])

  return workerRef
}
