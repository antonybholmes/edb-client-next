'use client'

import { BaseCol } from '@/layout/base-col'

import { VCenterRow } from '@/layout/v-center-row'

import { useEffect, useState } from 'react'

import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import { TEXT_CLEAR } from '@/consts'

import {
  DEFAULT_VENN_CIRCLE_PROPS,
  useVennSettings,
} from '@/components/pages/apps/venn/venn-settings-store'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { DEFAULT_DEBOUNCE_DELAY_MS, useDebounce } from '@/hooks/debounce'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { type IVennList, useVenn } from './venn-store'

interface IProps {
  vennList: IVennList
}

export function VennList({ vennList }: IProps) {
  const { circles, updateCircles } = useVennSettings()

  const { vennLists, setVennLists, updateVennListFromText, updateCounter } =
    useVenn()

  const [text, setText] = useState(vennList.items.join('\n'))

  const debouncedText = useDebounce(text, {
    delayMs: DEFAULT_DEBOUNCE_DELAY_MS,
  })

  useEffect(() => {
    updateVennListFromText(vennList.listId, debouncedText)
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
  // const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
  //   new Map()
  // )

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

  const circle = circles[vennList.listId] ?? DEFAULT_VENN_CIRCLE_PROPS

  return (
    <BaseCol className="gap-y-1">
      <VCenterRow className="gap-x-2">
        <Input
          id={`label${vennList.listId}`}
          value={vennList.name ?? ''}
          onChange={(e) => {
            setVennLists(
              produce(vennLists, (draft) => {
                draft[vennList.listId]!.name = e.target.value
              })
            )
          }}
          className="w-0 grow rounded-theme"
          placeholder={`List ${vennList.listId} name...`}
        />
        <VCenterRow className="shrink-0">
          <FillButton
            colors={[
              {
                color: circle.fill.value,
                opacity: circle.fill.opacity,
                show: circle.fill.show,
                onColorChange: ({ color, opacity, show }) =>
                  updateCircles(
                    produce(circles, (draft) => {
                      draft[vennList.listId]!.fill.value = color
                      draft[vennList.listId]!.fill.opacity =
                        opacity ?? draft[vennList.listId]!.fill.opacity
                      draft[vennList.listId]!.fill.show =
                        show ?? draft[vennList.listId]!.fill.show
                    })
                  ),
              },
            ]}
            title="Fill"
          />
          <OutlineButton
            colors={[
              {
                color: circle.stroke.value,
                opacity: circle.stroke.opacity,
                show: circle.stroke.show,
                onColorChange: ({ color, opacity, show }) =>
                  updateCircles(
                    produce(circles, (draft) => {
                      draft[vennList.listId]!.stroke.value = color
                      draft[vennList.listId]!.stroke.opacity =
                        opacity ?? draft[vennList.listId]!.stroke.opacity
                      draft[vennList.listId]!.stroke.show =
                        show ?? draft[vennList.listId]!.stroke.show
                    })
                  ),
              },
            ]}
            title="Outline"
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
        id={`set${vennList.listId}`}
        aria-label={`Set ${vennList.listId}`}
        //placeholder={listLabelMap[index] ?? ''}
        value={text}
        onTextChange={(v) => {
          console.log('text changed:', v)
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
        // onTextChanged={(v) => {
        //   updateVennListFromText(vennList.setId, v)
        // }}
        className="h-24"
      />
      <VCenterRow className="justify-between pr-1">
        <span title="Total items / Unique items">
          {vennList.items.length || 0} / {vennList.uniqueItems.size || 0} unique
        </span>

        <Button
          variant="link"
          pad="none"

          onClick={() => {
            setText('')
            updateVennListFromText(vennList.listId, '')
          }}
        >
          {TEXT_CLEAR}
        </Button>
      </VCenterRow>
    </BaseCol>
  )
}
