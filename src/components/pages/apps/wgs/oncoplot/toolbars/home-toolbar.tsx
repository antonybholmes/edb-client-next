import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/v2/select'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { useMessages } from '@/providers/message-provider'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import APP_INFO from '../manifest.json'
import { PANEL_ID } from '../oncoplot-panel'
import { useOncoplotSettings } from '../oncoplot-settings-store'
import { MULTI_MODE_MAP, MultiMode } from '../oncoplot-utils'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { open } = useOpen()
  const { svgRef } = useSVG()
  const { sendMessage } = useMessages('oncoplot') //'onco')
  const { displayProps, setDisplayProps } = useOncoplotSettings()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            open('variants')
          }}
        />

        <ToolbarIconButton
          title="Save image"
          onClick={() => {
            //save("txt")
            sendMessage({
              type: 'info',
              source: APP_INFO.name,
              target: PANEL_ID,
              data: 'save',
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Data">
        <ToolbarCol>
          <ToolbarButton
            aria-label="Open clinical information"
            onClick={() => {
              open('clinical')
            }}
          >
            Clinical
          </ToolbarButton>
          <ToolbarButton
            aria-label="Open location data"
            onClick={() => {
              open('locations')
            }}
          >
            Locations
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup
        title="Plot"
        className="gap-x-4"
        style={{ alignItems: 'flex-start' }}
      >
        <ToolbarRow className="gap-x-1">
          Sort
          <ToggleGroup
            value={[
              displayProps.sort.sortGenes ? ['rows'] : [],
              displayProps.sort.sortSamples ? ['columns'] : [],
            ].flat()}
            onValueChange={(v) => {
              const newSettings = produce(displayProps, (draft) => {
                draft.sort.sortGenes = v.includes('rows')

                draft.sort.sortSamples = v.includes('columns')
              })

              setDisplayProps(newSettings)
            }}
            size="toolbar"
            //justify="start"
            //direction="toolbar"
            multiple={true}
            className="gap-x-px"
          >
            <GroupToggle value="rows" className="w-14">
              Rows
            </GroupToggle>

            <GroupToggle value="columns" className="w-14">
              Columns
            </GroupToggle>
          </ToggleGroup>
        </ToolbarRow>

        <ToolbarCol>
          <Select
            defaultValue={displayProps.multi}
            onValueChange={(v) => {
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.multi = v as MultiMode
                })
              )
            }}
          >
            <SelectTrigger
              className="w-28"
              id="plot-mode-select"
              variant="toolbar"
            >
              <SelectValue data-placeholder="Select a mode">
                {(value: MultiMode) => <span>{MULTI_MODE_MAP[value]}</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multi">Multi</SelectItem>
              <SelectItem value="equal-bars">Equal bars</SelectItem>
              <SelectItem value="stacked-bars">Stacked bars</SelectItem>
            </SelectContent>
          </Select>

          <ToolbarButton
            title="Keep samples with no events"
            // invert the logic to match the checkbox label
            checked={!displayProps.removeEmptySamples}
            onClick={() => {
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.removeEmptySamples = !displayProps.removeEmptySamples
                })
              )
            }}
          >
            Empty samples
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
