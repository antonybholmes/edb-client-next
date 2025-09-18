'use client'

import { BaseCol } from '@layout/base-col'

import { VCenterRow } from '@layout/v-center-row'

import { useState } from 'react'

import { Button } from '@themed/button'
import { Input } from '@themed/input'

import { TEXT_CLEAR } from '@/consts'
import { cn } from '@lib/shadcn-utils'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { Textarea } from '@themed/textarea'
import { produce } from 'immer'
import { getItems, useVenn } from './venn-store'

interface IProps {
  index: number
}

export function VennList({ index }: IProps) {
  const {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
  } = useVennSettings()

  const { vennLists, setVennLists, updateVennListText } = useVenn()

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
          id={`label${index}`}
          value={vennLists[index]?.name ?? ''}
          onChange={(e) => {
            //console.log(index, e.target.value)
            setVennLists(
              produce(vennLists, (draft) => {
                draft[index]!.name = e.target.value
              })
            )
          }}
          className="w-0 grow rounded-theme"
          placeholder={`List ${index} name...`}
        />
        <VCenterRow className={cn('shrink-0 gap-x-0.5')}>
          <ColorPickerButton
            allowAlpha={true}
            color={circles[index]!.fill}
            alpha={circles[index]!.fillOpacity}
            onColorChange={(color, alpha) =>
              updateCircles(
                produce(circles, (draft) => {
                  draft[index]!.fill = color
                  draft[index]!.fillOpacity = alpha
                })
              )
            }
            title="Fill color"
            className={SIMPLE_COLOR_EXT_CLS}
          />
          <ColorPickerButton
            color={circles[index]!.stroke}
            onColorChange={(color) =>
              updateCircles(
                Object.fromEntries([
                  ...[...Object.entries(circles)],
                  [
                    index,
                    {
                      ...circles[index]!,
                      stroke: color,
                    },
                  ],
                ])
              )
            }
            title="Line color"
            className={SIMPLE_COLOR_EXT_CLS}
          />

          <ColorPickerButton
            color={circles[index]!.color}
            onColorChange={(color) =>
              updateCircles(
                Object.fromEntries([
                  ...[...Object.entries(circles)],
                  [
                    index,
                    {
                      ...circles[index]!,
                      color,
                    },
                  ],
                ])
              )
            }
            title="Text color"
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow>
      </VCenterRow>

      <Textarea
        id={`set${index + 1}`}
        aria-label={`Set ${index + 1}`}
        //placeholder={listLabelMap[index] ?? ''}
        value={vennLists[index]?.text ?? ''}
        onTextChange={(v) => {
          setVennLists(
            produce(vennLists, (draft) => {
              draft[index]!.text = v
              draft[index]!.items = getItems(v)
              draft[index]!.uniqueItems = [
                ...new Set(draft[index]!.items.map((v) => v.toLowerCase())),
              ].sort()
            })
          )
        }}
        className="h-28"
      />
      <VCenterRow className="justify-between pr-1">
        <span title="Total items / Unique items">
          {vennLists[index]?.items.length || 0} /{' '}
          {vennLists[index]?.uniqueItems.length || 0} unique
        </span>

        <Button
          variant="link"
          size="sm"
          // ripple={false}
          onClick={() =>
            setVennLists(
              produce(vennLists, (draft) => {
                draft[index]!.text = ''
                draft[index]!.items = []
                draft[index]!.uniqueItems = []
              })
            )
          }
        >
          {TEXT_CLEAR}
        </Button>
      </VCenterRow>
    </BaseCol>
  )
}
