import { useWorker } from '../../../../../../hooks/use-worker'
import type {
  IMotifsToGenesResults,
  IMotifsToGenesWorkerMessage,
} from './motifs-to-genes.worker'

function getWorker() {
  return new Worker(new URL('./motifs-to-genes.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function useMotifsToGenesWorker() {
  return useWorker<IMotifsToGenesWorkerMessage, IMotifsToGenesResults>(
    getWorker
  )
}
