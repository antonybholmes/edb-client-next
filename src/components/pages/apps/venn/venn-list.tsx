'use client'

import { BaseCol } from '@/layout/base-col'

import { VCenterRow } from '@/layout/v-center-row'

import { useEffect, useState } from 'react'

import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import { TEXT_CLEAR } from '@/consts'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
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

  return (
    <BaseCol className="gap-y-1">
      <VCenterRow className="gap-x-2">
        <Input
          id={`label${vennList.id}`}
          value={vennList.name ?? ''}
          onChange={(e) => {
            setVennLists(
              produce(vennLists, (draft) => {
                draft[vennList.id]!.name = e.target.value
              })
            )
          }}
          className="w-0 grow rounded-theme"
          placeholder={`List ${vennList.id} name...`}
        />
        <VCenterRow className="shrink-0">
          <FillButton
            colors={[
              {
                color: circles[vennList.id]!.fill.value,
                opacity: circles[vennList.id]!.fill.opacity,
                show: circles[vennList.id]!.fill.show,
                onColorChange: ({ color, opacity, show }) =>
                  updateCircles(
                    produce(circles, (draft) => {
                      draft[vennList.id]!.fill.value = color
                      draft[vennList.id]!.fill.opacity =
                        opacity ?? draft[vennList.id]!.fill.opacity
                      draft[vennList.id]!.fill.show =
                        show ?? draft[vennList.id]!.fill.show
                    })
                  ),
              },
            ]}
            title="Fill"
          />
          <OutlineButton
            colors={[
              {
                color: circles[vennList.id]!.stroke.value,
                opacity: circles[vennList.id]!.stroke.opacity,
                show: circles[vennList.id]!.stroke.show,
                onColorChange: ({ color, opacity, show }) =>
                  updateCircles(
                    produce(circles, (draft) => {
                      draft[vennList.id]!.stroke.value = color
                      draft[vennList.id]!.stroke.opacity =
                        opacity ?? draft[vennList.id]!.stroke.opacity
                      draft[vennList.id]!.stroke.show =
                        show ?? draft[vennList.id]!.stroke.show
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
          pad="none"

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
