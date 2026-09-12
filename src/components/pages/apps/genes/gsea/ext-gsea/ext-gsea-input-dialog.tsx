import { useCurrentSheets } from '@/components/pages/apps/matcalc/history/history-provider/history-contexts'
import { useHistory } from '@/components/pages/apps/matcalc/history/history-provider/history-provider'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { useFooter } from '@/providers/footer-provider'
import { newExtGseaPlot } from './ext-gsea-provider'
import { useExtGseaSettings } from './ext-gsea-settings'

import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { OKCancelDialog } from '@/components/dialogs/ok-cancel-dialog'
import { Button } from '@/components/shadcn/ui/themed/v2/button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { IRankedGene, IScoreGene } from '@/lib/gsea/geneset'
import { makeUuid } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { produce } from 'immer'
import { IViper } from './viper'
import { useViperWorker } from './viper-worker'

export function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  const scores = df.col(0).nums

  // want largest to smallest
  const idx = argsort(scores, true)

  const signature: IRankedGene[] = idx.map((originalIndex, i) => ({
    name: genes[originalIndex],
    score: scores[originalIndex],
    rank: i,
  }))

  const tfs = range(1, df.shape[1]).map((tfi) => {
    const scores = df.col(tfi).nums

    const pos: IScoreGene[] = []
    const neg: IScoreGene[] = []

    for (const gi of idx) {
      const gene: IScoreGene = { name: genes[gi], score: scores[gi] }

      if (scores[gi] === -1000) {
        continue
      }

      if (scores[gi] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    return { id: makeUuid(), name: df.colName(tfi), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}

export function ExtGseaInputDialog({ close }: ICustomDialogProps<unknown>) {
  const { sheet } = useCurrentSheets()
  const { settings, updateSettings } = useExtGseaSettings()
  const { remove: removeFooter, addIndicator } = useFooter()

  const { addPlots } = useHistory()

  const { run: runViperWorker } = useViperWorker()

  return (
    <OKCancelDialog
      title="Input Source"
      w="w-96"
      buttons={[]}
      contentCls="gap-y-2"
      onResponse={() => {
        close()
      }}
    >
      <Button
        variant="app-theme"
        size="lg"
        onClick={() => {
          close()
        }}
      >
        Expression
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          const id = addIndicator('Running Viper GSEA...')

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

              close()
            }
          )
        }}
      >
        Viper
      </Button>
      <Checkbox
        checked={settings.es.useGeneScoreForES}
        onCheckedChange={(v) => {
          // update the setting when the checkbox is toggled
          // assuming you have an updateSettings function from useExtGseaSettings
          updateSettings(
            produce(settings, (draft) => {
              draft.es.useGeneScoreForES = v
            })
          )
        }}
        title="Enrichment scores will be weighted by gene scores if present"
      >
        Use gene scores to weight enrichment
      </Checkbox>
    </OKCancelDialog>
  )
}
