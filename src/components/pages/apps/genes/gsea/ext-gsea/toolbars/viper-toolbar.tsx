import { PlayIcon } from '@/components/icons/play-icon'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { config } from '@/config'
import { TEXT_OPTIONS } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'
import { produce } from 'immer'
import { useExtGseaSettings } from '../ext-gsea-settings'
import { useViper } from '../viper'

export function ViperToolbar() {
  const { viperToExtGsea } = useViper()
  const { settings, updateSettings } = useExtGseaSettings()
  return (
    <>
      <ToolbarTabGroup title="Viper" className="gap-x-2">
        <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title="Plot Viper"
          onClick={() => {
            viperToExtGsea()
          }}
        >
          <PlayIcon variant="app-theme" />
          Viper
        </ToolbarColButton>
        <ToolbarRow>
          <ToolbarButton
            checked={settings.es.useGeneScoreForES}
            onClick={() => {
              // update the setting when the checkbox is toggled
              // assuming you have an updateSettings function from useExtGseaSettings
              updateSettings(
                produce(settings, (draft) => {
                  draft.es.useGeneScoreForES = !settings.es.useGeneScoreForES
                })
              )
            }}
            title="Enrichment scores will be weighted by gene scores if present"
          >
            Target weights
          </ToolbarButton>
        </ToolbarRow>
      </ToolbarTabGroup>
      <ToolbarTabGroup title={TEXT_OPTIONS}>
        <ToolbarButton
          onClick={async () => {
            const text = await httpFetch.getText(
              '/data/modules/genes/gsea/ext-gsea/viper-gsea.r'
            )

            // open a window to load a text file with title
            const w = window.open(
              '',
              '_blank',
              'popup=yes,width=800,height=600'
            )
            w.document.title = `Viper GSEA Script | ${config.name}`
            w.document.body.innerText = text
          }}
        >
          Export from Viper
        </ToolbarButton>
      </ToolbarTabGroup>
    </>
  )
}
