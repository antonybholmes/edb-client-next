import { VCenterRow } from '@/components/layout/v-center-row'
import { LabelContainer } from '@/components/shadcn/ui/themed/label'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/popover'
import { TEXT_CANCEL, TEXT_NAME } from '@/consts'
import { ColorPickerPopover } from '@components/color/color-picker-button'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import type { IClusterGroup } from '@lib/cluster-group'
import { Checkbox } from '@themed/check-box'
import { InfoHoverCard } from '@themed/hover-card'
import { Input } from '@themed/input'
import { Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface IProps extends IModalProps {
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export function GroupDialog({ group, callback, onResponse }: IProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [exactMatch, setExactMatch] = useState(true)

  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(group.name)
    setSearch(group.search.join(', '))
    if (group.color.match(/#[0-9a-fA-F]+/)) {
      setColor(group.color)
    }
    setExactMatch(group.exactMatch ?? true)
  }, [group])

  function makeGroup() {
    // return modified group
    callback?.({
      ...group,
      name,
      search: search.split(',').map((x) => x.trim().toLowerCase()),
      color,
      exactMatch,
    })
  }

  return (
    <OKCancelDialog
      open={true}
      title={
        <span style={{ color }}>
          {name.length > 0 ? `Edit ${name}` : 'New group'}
        </span>
      }
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r)
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        // <ColorPickerButton
        //   color={color}
        //   onColorChange={setColor}
        //   className={cn(XS_ICON_BUTTON_CLS, 'rounded-full')}
        //   title="Set color"
        // />

        <ColorPickerPopover color={color} onColorChange={setColor}>
          <PopoverTrigger title="Set color">
            <Palette style={{ fill: color }} className="stroke-foreground/80" />
          </PopoverTrigger>
        </ColorPickerPopover>
      }
      //headerStyle={{ color }}
      // headerChildren={
      //   <VCenterRow className="gap-x-1 bg-foreground/50 text-background rounded-full text-xs px-3 py-1.5 hidden xl:flex">
      //     <span className="text-nowrap shrink-0">Id</span>
      //     <span className="truncate">{group?.id}</span>
      //   </VCenterRow>
      // }
      leftFooterChildren={
        <span className="text-foreground/50" title="Group Id">
          {group?.id}
        </span>
      }
      //contentVariant="glass"
      //bodyVariant="card"
      //headerVariant="opaque"
      //bodyVariant="default"
      //footerVariant="default"
      bodyCls="gap-y-4"
    >
      <LabelContainer
        label={TEXT_NAME}
        labelPos="left"
        labelW="min-w-24"
        id="name"
      >
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group Name"
          //label="Group Name"
          //labelPos="left"
          //variant="dialog"
          //h="dialog"
          className="grow"
        />
      </LabelContainer>

      <VCenterRow className="gap-x-4">
        <LabelContainer
          label="Match"
          labelPos="left"
          labelW="min-w-24"
          id="search"
        >
          <Input
            id="search"
            value={search}
            onTextChange={(e) => setSearch(e)}
            placeholder="Matches..."
            rightChildren={
              <InfoHoverCard title="Matches">
                A comma separated list of words or partial words that match
                column names. All matching columns will belong to the group.
              </InfoHoverCard>
            }
            //label="Match"
            //labelPos="left"
            //variant="alt"
            //variant="dialog"
            //h="dialog"
            w="grow"
          />
        </LabelContainer>

        <Checkbox checked={exactMatch} onCheckedChange={setExactMatch}>
          Exact match
        </Checkbox>
      </VCenterRow>

      {/* <VCenterRow className="gap-x-1 mt-2">
        <span className="text-xs font-bold">Id {group?.id}</span>
      </VCenterRow> */}

      {/* <VCenterRow>
          <span className="w-24 shrink-0">Color</span>
          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow> */}

      {/* <span>Color</span> */}
    </OKCancelDialog>
  )
}
