import { useWorker } from '../../../../../hooks/use-worker'
import type {
  IAnnotateWorkerMessage,
  IAnnotationResult,
} from './annotate.worker'
function getWorker() {
  return new Worker(new URL('./annotate.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function useAnnotateWorker() {
  return useWorker<IAnnotateWorkerMessage, IAnnotationResult>(getWorker)
}
