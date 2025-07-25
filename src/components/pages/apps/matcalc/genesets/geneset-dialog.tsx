import { BaseCol } from '@layout/base-col'

import { TEXT_CANCEL, TEXT_NAME } from '@/consts'
import { ColorPickerButton } from '@components/color/color-picker-button'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { cn } from '@lib/shadcn-utils'

import { SM_ICON_BUTTON_CLS } from '@/theme'
import type { IGeneset } from '@lib/gsea/geneset'
import { textToLines } from '@lib/text/lines'
import { Input } from '@themed/input'
import { Textarea } from '@themed/textarea'
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
      title={name.length > 0 ? `Edit ${name}` : 'New Gene Set'}
      onResponse={r => {
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
        <ColorPickerButton
          color={color}
          onColorChange={setColor}
          className={cn(SM_ICON_BUTTON_CLS, 'rounded-full')}
          title="Set color"
        />
      }
      leftFooterChildren={
        <span className="text-foreground/50">Id: {geneset?.id}</span>
      }
    >
      <BaseCol className="gap-y-4">
        {/* <Label>Name</Label> */}
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={TEXT_NAME}
          label={TEXT_NAME}
          labelPos="left"
          //variant="dialog"
          //h="dialog"
          //variant="alt"
          //className="grow"
        />

        <Textarea
          id="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Genes"
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
