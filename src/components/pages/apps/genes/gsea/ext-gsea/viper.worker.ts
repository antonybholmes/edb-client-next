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

  const results = viperToGsea(viper)

  self.postMessage({ viper, results } as IViperWorkerResult)
}
