import { VCenterRow } from '@/components/layout/v-center-row'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { IS_DEV_MODE, TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import type { IClusterGroup } from '@/lib/cluster-group'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { getColNamesFromGroup } from '@/lib/dataframe/dataframe-utils'
import { Checkbox } from '@/themed/v2/check-box'
import { Input } from '@/themed/v2/input'
import { produce } from 'immer'
import { useEffect, useState } from 'react'

import { useCurrentSheets } from '../history/history-provider/history-contexts'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export interface IProps extends IModalProps<IClusterGroup> {
  group: IClusterGroup
}

export function GroupDialog({ group, onResponse }: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const [name, setName] = useState('')
  const [search, setSearch] = useState('')

  const [cols, setCols] = useState<string[]>([])

  const { sheet } = useCurrentSheets()

  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(group.name)
    setSearch(group.search.join(', '))
    if (group.color.match(/#[0-9a-fA-F]+/)) {
      setColor(group.color)
    }
  }, [group])

  useEffect(() => {
    if (!search) {
      return
    }

    const g = {
      ...group,
      name,
      search: search.split(',').map((x) => x.trim().toLowerCase()),

      exactMatch: settings.groups.match.exact,
    }

    setCols(getColNamesFromGroup(sheet as AnnotationDataFrame, g))
  }, [name, search, settings.groups.match.exact])

  function makeGroup() {
    // return modified group
    onResponse?.(TEXT_OK, {
      ...group,
      name,
      search: search.split(',').map((x) => x.trim().toLowerCase()),
      color,
      exactMatch: settings.groups.match.exact,
    })
  }

  return (
    <OKCancelDialog
      title={
        <span style={{ color }}>
          {name.length > 0 ? `Edit ${name}` : 'New group'}
        </span>
      }
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        <ColorPickerButton
          colors={[{ color, onColorChange: (color) => setColor(color) }]}
          className={SIMPLE_COLOR_EXT_CLS}
        />
      }
      leftFooterChildren={
        IS_DEV_MODE ? (
          <span className="text-foreground/50">{group.id}</span>
        ) : undefined
      }
      bodyCls="gap-y-2"
    >
      <div className="grid grid-cols-5 items-center gap-2">
        <span>Name</span>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group Name"
          className="col-span-4"
          rightChildren={
            <ColorPickerButton
              colors={[{ color, onColorChange: (color) => setColor(color) }]}
              className={SIMPLE_COLOR_EXT_CLS}
            />
          }
        />

        <span>Match</span>

        <Input
          id="search"
          value={search}
          onTextChange={(e) => setSearch(e)}
          placeholder="Matches..."
          rightChildren={
            <InfoHoverCard>
              A comma separated list of words or partial words that match column
              names. All matching columns will belong to the group.
            </InfoHoverCard>
          }
          className="col-span-4"
        />
        <span></span>
        <VCenterRow className="col-span-4">
          <Checkbox
            checked={settings.groups.match.exact}
            onCheckedChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.groups.match.exact = v
                })
              )
            }}
          >
            Exact match
          </Checkbox>
        </VCenterRow>

        <span></span>
        <VCenterRow className="col-span-4 text-xs">
          {cols.length > 0 && cols.join(', ')}
        </VCenterRow>
      </div>

      {/* {IS_DEV_MODE && (
        <PropRow title="Id">
          <span className="text-foreground/50">{group.id}</span>
        </PropRow>
      )} */}

      {/* <VCenterRow>
          <span className="w-24 shrink-0">Color</span>
          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow>  

      {/* <span>Color</span> */}
    </OKCancelDialog>
  )
}
