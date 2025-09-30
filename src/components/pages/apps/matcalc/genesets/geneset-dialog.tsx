import { BaseCol } from '@layout/base-col'

import { TEXT_CANCEL, TEXT_NAME } from '@/consts'
import { ColorPickerPopover } from '@components/color/color-picker-button'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'

import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { LabelContainer } from '@/components/shadcn/ui/themed/label'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/popover'
import type { IGeneset } from '@lib/gsea/geneset'
import { textToLines } from '@lib/text/lines'
import { Input } from '@themed/input'
import { Textarea } from '@themed/textarea'
import { Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface IProps extends IModalProps {
  geneset: IGeneset
  callback?: (geneset: IGeneset) => void
}

export function GenesetDialog({ geneset, callback, onResponse }: IProps) {
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
      title={
        <span style={{ color }}>
          {name.length > 0 ? `Edit ${name}` : 'New Gene Set'}
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
      //contentVariant="glass"
      //headerVariant="default"
      //bodyVariant="default"
      //footerVariant="default"
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        // <ColorPickerButton
        //   color={color}
        //   onColorChange={setColor}
        //   className={cn(XS_ICON_BUTTON_CLS, 'rounded-full')}
        //   title="Set color"
        // />

        <ColorPickerPopover color={color} onColorChange={setColor}>
          <PopoverTrigger asChild>
            <IconButton
              variant="secondary"
              size="icon-sm"
              title="Gene set color"
            >
              <Palette
                style={{ fill: color, strokeWidth: 1 }}
                className="stroke-foreground/80 w-5"
              />
              {/* <Brush
                          style={{ strokeWidth: 1 }}
                          className="absolute bottom-1/5 left-1/2 fill-white w-5 stroke-black"
                        /> */}
            </IconButton>
          </PopoverTrigger>
        </ColorPickerPopover>
      }
      leftFooterChildren={
        <span className="text-foreground/50" title="Gene Set Id">
          {geneset?.id}
        </span>
      }
    >
      <BaseCol className="gap-y-4">
        <LabelContainer label={TEXT_NAME} id="name">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={TEXT_NAME}
          />
        </LabelContainer>

        <Textarea
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="List of genes (one per line)..."
          label="Genes"
          labelPos="left"
          //variant="dialog"
          className="grow h-48"
        />

        {/* <VCenterRow className="gap-x-1 mt-2">
          <span className="text-nowrap shrink-0  text-xs font-bold">
            Id {geneset?.id}
          </span>
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
      </BaseCol>
    </OKCancelDialog>
  )
}
