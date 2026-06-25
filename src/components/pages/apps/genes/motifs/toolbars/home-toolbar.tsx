import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_SAVE_IMAGE, TEXT_SEARCH } from '@/consts'
import { useFooter } from '@/providers/footer-provider'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { ArrowLeftRight } from 'lucide-react'
import { Mode, useMotifSettings } from '../motifs-settings'
import { useMotifs } from '../motifs-store'

export function HomeToolbar() {
  const { settings, updateSettings } = useMotifSettings()

  const { addIndicator, remove: removeFooter } = useFooter()
  const { search, updateSearch } = useMotifs()
  const { svgRef } = useSVG()
  const { open: openDialog } = useDialogs()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'motifs',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Display" className="gap-x-1">
        <ToggleGroup
          value={[settings.mode]}
          onValueChange={(v) => {
            if (v) {
              updateSettings(
                produce(settings, (draft) => {
                  draft.mode = v[0] as Mode
                })
              )
            }
          }}
          size="toolbar"
        >
          <GroupToggle
            value="prob"
            className="w-12"
            aria-label="Probability view"
          >
            Prob
          </GroupToggle>

          <GroupToggle value="bits" className="w-12" aria-label="Bits view">
            Bits
          </GroupToggle>
        </ToggleGroup>

        <ToolbarIconButton
          checked={settings.revComp}
          onClick={() => {
            updateSettings(
              produce(settings, (draft) => {
                draft.revComp = !settings.revComp
              })
            )
          }}
          title="Reverse Complement"
        >
          <ArrowLeftRight className="w-4.5" />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title={TEXT_SEARCH} className="gap-x-1">
        <ToolbarButton
          checked={search.mode === 'advanced'}
          onClick={() => {
            updateSearch(
              produce(search, (draft) => {
                if (search.mode === 'advanced') {
                  draft.mode = 'basic'
                } else {
                  draft.mode = 'advanced'
                }
              })
            )
          }}
          aria-label="Advanced Search"
        >
          Advanced
        </ToolbarButton>
      </ToolbarTabGroup>
    </>
  )
}
