import { useHistory } from '@/components/pages/apps/matcalc/history/history-provider/history-provider'
import { useExtGseaSettings } from './ext-gsea-settings'

import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { OKCancelDialog } from '@/components/dialogs/ok-cancel-dialog'
import { Button } from '@/components/shadcn/ui/themed/v2/button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { produce } from 'immer'
import { useExtGsea } from './use-ext-gsea'
import { useViper } from './use-viper'

export function ExtGseaInputDialog({ close }: ICustomDialogProps<unknown>) {
  const { settings, updateSettings } = useExtGseaSettings()

  const { addPlots } = useHistory()

  const { runExtGsea } = useExtGsea()

  const { viperToExtGsea } = useViper()

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
          viperToExtGsea(() => {
            close()
          })
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
