import { BaseCol } from '@/layout/base-col'

import { IS_DEV_MODE, TEXT_CANCEL, TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { textToLines } from '@/lib/text/lines'
import { Textarea } from '@/themed/textarea'
import { Input } from '@/themed/v2/input'
import { useEffect, useState } from 'react'

export interface IProps extends IModalProps<IGeneSet> {
  geneset: IGeneSet
}

export function GenesetDialog({ geneset, onResponse }: IProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(geneset.name)
    setSearch(geneset.genes.join('\n'))
    if (geneset.color && geneset.color.match(/#[0-9a-fA-F]+/)) {
      setColor(geneset.color)
    }
  }, [geneset])

  function makeGroup() {
    // return modified group
    onResponse?.(TEXT_OK, {
      ...geneset,
      name,
      genes: textToLines(search),
      color,
    })
  }

  return (
    <OKCancelDialog
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
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
      leftFooterChildren={
        IS_DEV_MODE ? (
          <span className="text-foreground/50">{geneset.id}</span>
        ) : undefined
      }
      title={
        // <ColorPickerButton
        //   color={color}
        //   onColorChange={setColor}
        //   className={cn(XS_ICON_BUTTON_CLS, 'rounded-full')}
        //   title="Set color"
        // />
        <>
          <FillButton
            colors={[
              {
                color,
                allowNoColor: false,
                onColorChange: ({ color }) => setColor(color),
              },
            ]}
          />

          <Input
            id="name"
            value={name}
            h="lg"
            onChange={(e) => setName(e.target.value)}
            placeholder={TEXT_NAME}
          />
        </>
      }
      // leftFooterChildren={
      //   <span className="text-foreground/50" title="Gene Set Id">
      //     {geneset?.id}
      //   </span>
      // }
    >
      <BaseCol className="gap-y-2">
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
