import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ZoomSelectList } from '@/components/toolbar/zoom-select-list'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { Fullscreen } from 'lucide-react'
import { useNetworkSettings } from '../network-settings-store'

export function ViewToolbar() {
  const { setZoom } = useZoom()
  const { settings, updateSettings } = useNetworkSettings()

  return (
    <>
      <ToolbarTabGroup title="Zoom" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>Zoom</span>
            <ZoomSelectList />
          </ToolbarRow>
          <ToolbarRow>
            <ToolbarButton onClick={() => setZoom(1)} title="Zoom to 100%">
              <Fullscreen size={16} />
              <span>100%</span>
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
      <ToolbarTabGroup title="View" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <ToolbarButton
              checked={settings.plot.autoFit}
              onClick={() =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.autoFit = !settings.plot.autoFit
                  })
                )
              }
            >
              Auto Fit
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
