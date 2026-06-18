import { useWorker } from '../../../../../hooks/use-worker'
import type {
  IPathwayWorkerMessage,
  IPathwayWorkerResult,
} from './pathway.worker'
function getWorker() {
  return new Worker(new URL('./pathway.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function usePathwayWorker() {
  return useWorker<IPathwayWorkerMessage, IPathwayWorkerResult>(getWorker)
}
