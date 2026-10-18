import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ZoomSelectList } from '@/components/toolbar/zoom-select-list'
import { useZoom } from '@/providers/zoom-provider'
import { Fullscreen } from 'lucide-react'

export function ViewToolbar() {
  const { setZoom } = useZoom()
  return (
    <>
      <ToolbarTabGroup title="Zoom" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>Zoom</span>
            <ZoomSelectList />
          </ToolbarRow>
          <ToolbarRow>
            <ToolbarButton onClick={() => setZoom(1)} title="Zoom To 100%">
              <Fullscreen size={16} />
              <span>100%</span>
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
