import { useWorker } from '@/hooks/use-worker'
import type { IViperWorkerMessage, IViperWorkerResult } from './viper.worker'

function getWorker() {
  return new Worker(new URL('./viper.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function useViperWorker() {
  return useWorker<IViperWorkerMessage, IViperWorkerResult>(getWorker)
}
