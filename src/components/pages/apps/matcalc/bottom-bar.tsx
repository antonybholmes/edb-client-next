import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { type ReactNode } from 'react'
import { ToolbarIconButton } from '../../../toolbar/toolbar-icon-button'

import { type IFileDropProps } from '@/components/file-drop-panel'
import { IClassProps } from '@/interfaces/class-props'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { FileDropZonePanel } from '../../../file-dropzone-panel'
import { HamburgerIcon } from '../../../icons/hamburger-icon'
import { IconButton } from '../../../shadcn/ui/themed/icon-button'
import {
  Select,
  SelectContent,
  SelectItem,
} from '../../../shadcn/ui/themed/v2/select'
import { getTabName } from '../../../tabs/tab-provider'
import { type ITabMenu } from '../../../tabs/underline-tabs'
import {
  useCurrentSheets,
  useFiles,
} from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'
import { ReorderTabs } from './reorder-tabs'
// const LINE_CLS =
//   "tab-line absolute bottom-0 left-0 block h-0.5 bg-theme"

interface IBottomBarProps extends IFileDropProps, ITabMenu, IClassProps {
  maxNameLength?: number
  padding?: number
  scale?: number
  buttonClassName?: string
  rightContent?: ReactNode
  allowReorder?: boolean
}

export function BottomBar({
  maxNameLength = 16,
  rightContent,
  onFileDrop = undefined,
  allowReorder = false,
  className,
  style = {},
  //onReorder = () => {},
  menuCallback = () => {},
  menuActions = [],
}: IBottomBarProps) {
  const { goto } = useHistory()
  const { file } = useFiles()

  const { sheet, sheets } = useCurrentSheets()

  let content: ReactNode = (
    <VCenterRow className="shrink-0 justify-between text-xs">
      <VCenterRow className="gap-x-2">
        <VCenterRow>
          <ToolbarIconButton
            title="Previous Sheet"
            variant="flat"
            size="icon-sm"
            //rounded="full"
            onClick={() => {
              let selectedTabIndex = sheets
                .map((t, ti) => ({ tab: t, index: ti }))
                .filter((t) => t.tab.id === sheet?.id)
                .map((t) => t.index)[0]!

              selectedTabIndex =
                selectedTabIndex === 0
                  ? sheets.length - 1
                  : selectedTabIndex - 1

              goto({ file, sheet: sheets[selectedTabIndex]?.id })
            }}
          >
            <ChevronRightIcon size="w-4" className="-scale-x-100" />
          </ToolbarIconButton>
          <ToolbarIconButton
            title="Next Sheet"
            size="icon-sm"
            onClick={() => {
              const selectedTabIndex = sheets
                .map((t, ti) => ({ tab: t, index: ti }))
                .filter((t) => t.tab.id === sheet?.id)
                .map((t) => t.index)[0]!

              const nextTabIndex = (selectedTabIndex + 1) % sheets.length
              goto({ file, sheet: sheets[nextTabIndex]?.id })
            }}
          >
            <ChevronRightIcon size="w-4" />
          </ToolbarIconButton>

          <Select
            value={sheet?.id ?? ''}
            onValueChange={(v) => {
              if (v) {
                goto({ file, sheet: v })
              }
            }}
          >
            <SelectPrimitive.Trigger
              render={
                <IconButton size="icon-sm" title="Sheet List">
                  <HamburgerIcon />
                </IconButton>
              }
            />

            <SelectContent side="top" align="start">
              {sheets.map((sheet) => (
                <SelectItem key={sheet.id} value={sheet.id}>
                  {getTabName(sheet)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VCenterRow>

        <ReorderTabs
          maxNameLength={maxNameLength}
          variant="sheet"
          menuCallback={menuCallback}
          menuActions={menuActions}
          allowReorder={allowReorder}
        />
      </VCenterRow>
      {rightContent}
    </VCenterRow>
    // </Tabs>
  )

  if (onFileDrop) {
    content = (
      <FileDropZonePanel onFileDrop={onFileDrop}>{content}</FileDropZonePanel>
    )
  }

  return content
}
