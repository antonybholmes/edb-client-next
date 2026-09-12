import { IExtGseaPlotResult } from './ext-gsea-provider'
import { IViper, viperToGsea } from './viper'

export interface IViperWorkerMessage {
  viper: IViper
  useGeneScoreForES: boolean
}

export interface IViperWorkerResult {
  viper: IViper
  results: IExtGseaPlotResult[]
}

self.onmessage = function (e: MessageEvent<IViperWorkerMessage>) {
  const { viper, useGeneScoreForES } = e.data

  const results = viperToGsea(viper, { useGeneScoreForES })

  self.postMessage({ viper, results } as IViperWorkerResult)
}
