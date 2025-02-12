import { BaseCol } from '@/components/layout/base-col'

import {
  BASE_SIMPLE_COLOR_EXT_CLS,
  ColorPickerButton,
} from '@/components/color-picker-button'
import { VCenterRow } from '@/components/layout/v-center-row'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/hover-card'
import { Input } from '@/components/shadcn/ui/themed/input'
import { Label } from '@/components/shadcn/ui/themed/label'
import { TEXT_CANCEL } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { cn } from '@lib/class-names'
import type { IClusterGroup } from '@lib/cluster-group'
import { useEffect, useState } from 'react'

export interface IProps extends IModalProps {
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export function GroupDialog({ group, callback, onReponse }: IProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(group.name)
    setSearch(group.search.join(', '))
    if (group.color.match(/#[0-9a-fA-F]+/)) {
      setColor(group.color)
    }
  }, [group])

  function makeGroup() {
    // return modified group
    callback?.({
      ...group,
      name,
      search: search.split(',').map((x) => x.trim().toLowerCase()),
      color,
    })
  }

  return (
    <OKCancelDialog
      open={true}
      title="Group Editor"
      onReponse={(r) => {
        if (r === TEXT_CANCEL) {
          onReponse?.(r)
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        <ColorPickerButton
          color={color}
          onColorChange={setColor}
          className={cn(BASE_SIMPLE_COLOR_EXT_CLS, 'rounded-full shadow')}
          title="Set group color"
        />
      }
      headerStyle={{ color }}
      headerChildren={
        <VCenterRow className="gap-x-1 bg-foreground/50 text-background rounded-full text-xs px-3 py-1.5 hidden xl:flex">
          <span className="text-nowrap shrink-0">Id</span>
          <span className="truncate">{group?.id}</span>
        </VCenterRow>
      }
      contentVariant="glass"
      headerVariant="default"
      bodyVariant="default"
      footerVariant="default"
    >
      <BaseCol className="gap-y-4 bg-background p-6 rounded-xl">
        <VCenterRow className="gap-x-4">
          <Label className="w-12">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            h="lg"
            variant="alt"
            className="grow"
          />
        </VCenterRow>
        <VCenterRow className="gap-x-4">
          <Label className="w-12">Match</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Matches"
            rightChildren={
              <BasicHoverCard>
                <h4 className="text-sm font-semibold">Matches</h4>
                <p className="text-sm">
                  A comma separated list of words or partial words that match
                  column names. All matching columns will belong to the group.
                </p>
              </BasicHoverCard>
            }
            h="lg"
            variant="alt"
            className="grow"
          />
        </VCenterRow>

        {/* <VCenterRow>
          <span className="w-24 shrink-0">Color</span>
          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow> */}

        {/* <span>Color</span> */}
      </BaseCol>
    </OKCancelDialog>
  )
}
