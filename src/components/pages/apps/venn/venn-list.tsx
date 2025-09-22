'use client'

import { BaseCol } from '@layout/base-col'

import { VCenterRow } from '@layout/v-center-row'

import { useEffect, useState } from 'react'

import { Button } from '@themed/button'
import { Input } from '@themed/input'

import { TEXT_CLEAR } from '@/consts'
import { cn } from '@lib/shadcn-utils'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import { useDebounce } from '@/hooks/debounce'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { Textarea } from '@themed/textarea'
import { produce } from 'immer'
import { IVennList, useVenn } from './venn-store'

interface IProps {
  vennList: IVennList
}

export function VennList({ vennList }: IProps) {
  const { circles, updateCircles } = useVennSettings()

  const { vennLists, setVennLists, updateVennListFromText, updateCounter } =
    useVenn()

  const [text, setText] = useState(vennList.items.join('\n'))

  const debouncedText = useDebounce(text, 500)

  useEffect(() => {
    updateVennListFromText(vennList.id, debouncedText)
  }, [debouncedText])

  useEffect(() => {
    if (updateCounter === 0) {
      setText(vennList.items.join('\n'))
    }
  }, [vennList.items])

  // Stores a mapping between the lowercase labels used for
  // matching and the original values. Note that this picks
  // the last value found as being original, so if you overlap
  // Lab1, and lAb1, lAb1 will be kept as the original value
  const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
    new Map()
  )

  // track what is unique to each set so we get rid of repeats
  // const [uniqueCountMap, setUniqueCountMap] = useState<
  //   Map<number, Set<string>>
  // >(new Map(listIds.map((i) => [i, new Set<string>()])))

  // const [listLabelMap, setListLabelMap] = useState<Map<number, string>>(
  //   new Map<number, string>(listIds.map((i) => [i, `List ${i + 1}`]))
  // )

  // const [labelToIndexMap, setLabelToIndexMap] = useState<Map<string, number>>(
  //   new Map()
  // )

  // map of list id to the text contents for each list,
  // we split these later to get the actual items
  //const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  return (
    <BaseCol className="gap-y-1">
      <VCenterRow className="gap-x-2">
        <Input
          id={`label${vennList.id}`}
          value={vennList.name ?? ''}
          onChange={(e) => {
            //console.log(index, e.target.value)
            setVennLists(
              produce(vennLists, (draft) => {
                draft[vennList.id]!.name = e.target.value
              })
            )
          }}
          className="w-0 grow rounded-theme"
          placeholder={`List ${vennList.id} name...`}
        />
        <VCenterRow className={cn('shrink-0 gap-x-1 pr-1')}>
          <ColorPickerButton
            allowAlpha={true}
            color={circles[vennList.id]!.fill.color}
            opacity={circles[vennList.id]!.fill.opacity}
            onColorChange={(color, opacity) => {
              console.log('color', color, opacity)
              updateCircles(
                produce(circles, (draft) => {
                  draft[vennList.id]!.fill.color = color
                  draft[vennList.id]!.fill.opacity = opacity
                })
              )
            }}
            title="Fill color"
            className={SIMPLE_COLOR_EXT_CLS}
          />
          <ColorPickerButton
            allowAlpha={true}
            color={circles[vennList.id]!.stroke.color}
            onColorChange={(color, alpha) =>
              updateCircles(
                produce(circles, (draft) => {
                  draft[vennList.id]!.stroke.color = color
                  draft[vennList.id]!.stroke.opacity = alpha
                })
              )
            }
            title="Line color"
            className={SIMPLE_COLOR_EXT_CLS}
          />

          {/* <ColorPickerButton
            color={circles[vennList.id]!.text.color}
            onColorChange={(color, alpha) =>
              updateCircles(
                produce(circles, (draft) => {
                  draft[vennList.id]!.text.color = color
                  draft[vennList.id]!.text.opacity = alpha
                })
              )
            }
            title="Text color"
            className={SIMPLE_COLOR_EXT_CLS}
          /> */}
        </VCenterRow>
      </VCenterRow>

      <Textarea
        id={`set${vennList.id}`}
        aria-label={`Set ${vennList.id}`}
        //placeholder={listLabelMap[index] ?? ''}
        value={text}
        onTextChange={(v) => {
          setText(v)
          // setVennLists(
          //   produce(vennLists, (draft) => {
          //     draft[index]!.text = v
          //     draft[index]!.items = getItems(v)
          //     draft[index]!.uniqueItems = [
          //       ...new Set(draft[index]!.items.map((v) => v.toLowerCase())),
          //     ].sort()
          //   })
          // )
        }}
        className="h-28"
      />
      <VCenterRow className="justify-between pr-1">
        <span title="Total items / Unique items">
          {vennList.items.length || 0} / {vennList.uniqueItems.length || 0}{' '}
          unique
        </span>

        <Button
          variant="link"
          size="sm"
          // ripple={false}
          onClick={() => {
            setText('')
            updateVennListFromText(vennList.id, '')
          }}
        >
          {TEXT_CLEAR}
        </Button>
      </VCenterRow>
    </BaseCol>
  )
}
