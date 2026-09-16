import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { IRankedGene } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { useRunning } from '@/components/toolbar/running-indicator'
import { makeUuid } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { useFooter } from '@/providers/footer-provider'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { newExtGseaPlot } from './ext-gsea-provider'
import { useExtGseaSettings } from './ext-gsea-settings'
import { IViper } from './viper-gsea'
import { useViperWorker } from './viper-worker'

export function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  let scores = df.col(0).nums

  // invert so negative scores appear first
  scores = scores.map((s) => -s)

  // want largest to smallest
  const idx = argsort(scores, { reverse: true })

  const signature: IRankedGene[] = idx.map((originalIndex, i) => ({
    name: genes[originalIndex],
    score: scores[originalIndex],
    rank: i,
  }))

  const tfs = range(1, df.shape[1]).map((tfi) => {
    const scores = df.col(tfi).nums

    let pos: IRankedGene[] = []
    let neg: IRankedGene[] = []

    for (const gi of idx) {
      const gene: IRankedGene = { name: genes[gi], score: scores[gi], rank: 0 }

      if (scores[gi] === -1000) {
        continue
      }

      if (scores[gi] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    pos = argsort(
      pos.map((g) => g.score),
      { reverse: true, abs: true }
    ).map((i) => ({ ...pos[i], rank: i }))
    neg = argsort(
      neg.map((g) => g.score),
      { reverse: true, abs: true }
    ).map((i) => ({ ...neg[i], rank: i }))

    return { id: makeUuid(), name: df.colName(tfi), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}

export function useViper() {
  const { sheet } = useCurrentSheets()
  const { settings } = useExtGseaSettings()
  const { remove: removeFooter, addIndicator } = useFooter()

  const { addPlots } = useHistory()

  const { run: runViperWorker } = useViperWorker()

  const { setMessage, clearMessage } = useRunning('ext-gsea')

  function viperToExtGsea(callback: () => void = () => {}) {
    const id = addIndicator('Running Viper GSEA...')
    setMessage('Running Viper GSEA...')

    const viper = dfToViper(sheet as BaseDataFrame)

    runViperWorker(
      {
        viper,
        useGeneScoreForES: settings.es.useGeneScoreForES,
      },
      (data) => {
        const { results } = data

        const plot = {
          ...newExtGseaPlot('Extended GSEA', {
            results,
          }),
        }

        addPlots([plot], { mode: 'set' })
        // we've finished so get rid of the animations
        //closeToast(id)

        removeFooter('left', id)

        clearMessage()
        callback?.()
      }
    )
  }

  return { viperToExtGsea }
}
