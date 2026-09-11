import { IExtGseaPlotResult } from './ext-gsea-provider'
import { IViper, viperToGsea } from './viper'

export interface IViperWorkerMessage {
  viper: IViper
}

export interface IViperWorkerResult {
  viper: IViper
  results: IExtGseaPlotResult[]
}

self.onmessage = function (e: MessageEvent<IViperWorkerMessage>) {
  const { viper } = e.data

  console.log('aha', viper)

  const results = viperToGsea(viper)

  console.log(results)

  self.postMessage({ viper, results } as IViperWorkerResult)
}
