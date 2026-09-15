import { useWorker } from '@/hooks/use-worker'
import type {
  IExtGseaWorkerMessage,
  IExtGseaWorkerResult,
} from './ext-gsea.worker'

function getWorker() {
  return new Worker(new URL('./ext-gsea.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function useExtGseaWorker() {
  return useWorker<IExtGseaWorkerMessage, IExtGseaWorkerResult>(getWorker)
}
