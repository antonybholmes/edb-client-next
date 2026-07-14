import { VCenterRow } from '@/components/layout/v-center-row'
import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
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

import { FillButton } from '@/components/plot/fill-dropdown-menu'
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

  const { sheets } = useCurrentSheets()

  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  const [exactMatch, setExactMatch] = useState(false)

  useEffect(() => {
    setExactMatch(group?.exactMatch ?? settings.groups.match.exact)
  }, [group, settings.groups.match.exact])

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

      exactMatch,
    }

    setCols(getColNamesFromGroup(sheets[0] as AnnotationDataFrame, g))
  }, [name, search, exactMatch])

  function makeGroup() {
    const newGroup = {
      ...group,
      name,
      search: search.split(',').map((x) => x.trim().toLowerCase()),
      color,
      exactMatch,
    }

    // return modified group
    onResponse?.(TEXT_OK, newGroup)
  }

  return (
    <OKCancelDialog
      title={
        <h2 style={{ color }} className="font-semibold">
          {name.length > 0 ? `Edit ${name}` : 'New group'}
        </h2>
      }
      onResponse={(r) => {
        console.log('GroupDialog onResponse', r, name, search, color)
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        <FillButton
          colors={[
            {
              color,
              allowNoColor: false,
              onColorChange: ({ color }) => setColor(color),
            },
          ]}
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
      <div className="grid grid-cols-7 items-center gap-x-4 gap-y-2">
        <span className="text-alt-foreground text-right">Name</span>
        <Input
          id="name"
          h="lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group Name"
          className="col-span-5"
        />
        <span></span>
        <span className="text-alt-foreground text-right">Match</span>

        <Input
          id="search"
          h="lg"
          value={search}
          onTextChange={(e) => setSearch(e)}
          placeholder="Matches..."
          rightChildren={
            <InfoHoverCard>
              A comma separated list of words or partial words that match column
              names. All matching columns will belong to the group.
            </InfoHoverCard>
          }
          className="col-span-5"
        />
        <span></span>
        <span></span>
        <VCenterRow className="col-span-5">
          <Checkbox
            checked={exactMatch}
            onCheckedChange={(v) => {
              setExactMatch(v)
              // Store setting for exact match in global settings
              // so that it can be default for new groups and
              // remembered across sessions. We can still override it for
              // individual groups if needed.
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
        <span></span>
        {/* <VCenterRow className="col-span-4 text-xs text-alt-foreground">
          {cols.length > 0 && cols.join(', ')}
        </VCenterRow> */}

        <VCenterRow className="col-span-4 text-xs text-alt-foreground flex-wrap gap-1.5">
          {cols.map((c) => (
            <span key={c} className="bg-muted/50 p-1 px-2 rounded-full">
              {c}
            </span>
          ))}
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
