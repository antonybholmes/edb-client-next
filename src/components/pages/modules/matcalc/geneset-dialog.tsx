import { BaseCol } from '@/components/layout/base-col'

import {
  BASE_SIMPLE_COLOR_EXT_CLS,
  ColorPickerButton,
} from '@/components/color-picker-button'
import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_CANCEL } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { cn } from '@lib/class-names'

import { Input } from '@/components/shadcn/ui/themed/input'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import type { IGeneset } from '@/lib/gsea/geneset'
import { textToLines } from '@/lib/text/lines'
import { useEffect, useState } from 'react'

export interface IProps extends IModalProps {
  geneset: IGeneset
  callback?: (geneset: IGeneset) => void
}

export function GenesetDialog({ geneset, callback, onReponse }: IProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(geneset.name)
    setSearch(geneset.genes.join('\n'))
    if (geneset.color.match(/#[0-9a-fA-F]+/)) {
      setColor(geneset.color)
    }
  }, [geneset])

  function makeGroup() {
    // return modified group
    callback?.({
      ...geneset,
      name,
      genes: textToLines(search),
      color,
    })
  }

  return (
    <OKCancelDialog
      open={true}
      title="Gene Set Editor"
      onReponse={(r) => {
        if (r === TEXT_CANCEL) {
          onReponse?.(r)
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      contentVariant="glass"
      headerVariant="default"
      bodyVariant="default"
      footerVariant="default"
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
          <span className="truncate">{geneset?.id}</span>
        </VCenterRow>
      }
    >
      <BaseCol className="gap-y-4 px-4 py-6 bg-background rounded-xl">
        <VCenterRow className="gap-x-4">
          {/* <Label>Name</Label> */}
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            h="lg"
            variant="alt"
            className="grow"
          />
        </VCenterRow>

        <VCenterRow className="gap-x-2 pl-1">
          <Textarea
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Genes"
            className="grow h-48"
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
