import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'

import { useVariantSettings } from '../variant-settings-store'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { svgRef } = useSVG()
  const { settings, updateSettings } = useVariantSettings()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarIconButton
          title="Download image to local file"
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'variants',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="View">
        <ToggleGroup
          value={[settings.view]}
          onValueChange={(v) => {
            console.log('view change', v)
            if (v.length > 0) {
              updateSettings(
                produce(settings, (draft) => {
                  draft.view = v[0] as 'pileup' | 'maf'
                })
              )
            }
          }}
          size="toolbar"
          justify="start"
          direction="toolbar"
          //multiple={true}
        >
          <GroupToggle value="pileup">Pileup</GroupToggle>

          <GroupToggle value="maf">MAF</GroupToggle>
        </ToggleGroup>
      </ToolbarTabGroup>
    </>
  )
}
