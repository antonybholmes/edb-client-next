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
import { produce } from 'immer'
import { useRunExtGsea } from './use-run-ext-gsea'
import { dfToViper } from './viper'
import { useViperWorker } from './viper-worker'

export function ExtGseaInputDialog({ close }: ICustomDialogProps<unknown>) {
  const { sheet } = useCurrentSheets()
  const { settings, updateSettings } = useExtGseaSettings()
  const { remove: removeFooter, addIndicator } = useFooter()

  const { addPlots } = useHistory()

  const { run: runViperWorker } = useViperWorker()
  const { runExtGsea } = useRunExtGsea()

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
          runExtGsea((plot) => {
            addPlots([plot])
            close()
          })
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
