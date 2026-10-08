import { PlayIcon } from '@/components/icons/play-icon'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { TEXT_OPTIONS } from '@/consts'
import { produce } from 'immer'
import { Weight } from 'lucide-react'
import { useExtGseaSettings } from '../ext-gsea-settings'
import { useViper } from '../use-viper'

export function ViperToolbar() {
  const { viperToExtGsea } = useViper()
  const { settings, updateSettings } = useExtGseaSettings()
  return (
    <>
      <ToolbarTabGroup title="Viper" className="gap-x-1">
        <ToolbarColSmallButton
          icon={<PlayIcon variant="app-theme" />}
          title="Plot Viper"
          onClick={() => {
            viperToExtGsea()
          }}
        >
          <PlayIcon variant="app-theme" />
          Viper
        </ToolbarColSmallButton>
        <ToolbarCol>
          {/* <ToolbarButton
            checked={settings.viper.reverse}
            onClick={() => {
              // update the setting when the checkbox is toggled
              // assuming you have an updateSettings function from useExtGseaSettings
              updateSettings(
                produce(settings, (draft) => {
                  draft.viper.reverse = !settings.viper.reverse
                })
              )
            }}
            title="Reverse the groups in the Viper analysis"
          >
            Reverse
          </ToolbarButton> */}

          <ToolbarIconButton
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
            <Weight size={16} />
          </ToolbarIconButton>
        </ToolbarCol>
      </ToolbarTabGroup>
      <ToolbarTabGroup title={TEXT_OPTIONS}>
        <ToolbarButton
          onClick={async () => {
            //const text = await httpFetch.getText(
            //</ToolbarTabGroup> '/data/modules/genes/gsea/ext-gsea/viper-gsea.r'
            //)

            // open a window to load a text file with title
            const w = window.open(
              `/apps/utils/text?url=/data/modules/genes/gsea/ext-gsea/viper-gsea.r`,
              '_blank',
              'width=800,height=600'
            )

            //w.document.title = `Viper GSEA Script | ${config.name}`
            //w.document.body.innerText = text
          }}
        >
          Export from Viper
        </ToolbarButton>
      </ToolbarTabGroup>
    </>
  )
}
