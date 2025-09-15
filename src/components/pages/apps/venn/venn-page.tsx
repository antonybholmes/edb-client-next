'use client'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { BaseCol } from '@layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { DEFAULT_ZOOM_SCALES, ZoomSlider } from '@toolbar/zoom-slider'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { VCenterRow } from '@layout/v-center-row'
import { ToolbarButton } from '@toolbar/toolbar-button'

import { FileImageIcon } from '@icons/file-image-icon'
import { LayersIcon } from '@icons/layers-icon'
import { SaveIcon } from '@icons/save-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { TableIcon } from '@icons/table-icon'
import { DataIndex } from '@lib/dataframe'

import { DataFrame } from '@lib/dataframe/dataframe'

import {
  downloadSvg,
  downloadSvgAsPng,
  downloadSvgAutoFormat,
} from '@lib/image-utils'
import { makeCombinations, numSort } from '@lib/math/math'

import {
  FOCUS_RING_CLS,
  PILL_BUTTON_CLS,
  SM_ICON_BUTTON_CLS,
  TOOLBAR_BUTTON_ICON_CLS,
  XS_ICON_BUTTON_CLS,
} from '@/theme'
import * as d3 from 'd3'

import { useEffect, useRef, useState } from 'react'
import { sortAreas, VennDiagram } from '../../../../ext/benfred/venn/diagram'

import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { PropsPanel } from '@components/props-panel'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@icons/upload-icon'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Button } from '@themed/button'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { Input } from '@themed/input'
import { NumericalInput } from '@themed/numerical-input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@themed/resizable'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_CLEAR,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_IMAGE,
  TEXT_SETTINGS,
  type IDialogParams,
} from '@/consts'
import { useWindowScrollListener } from '@hooks/use-window-scroll-listener'
import { OpenIcon } from '@icons/open-icon'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { range, rangeMap } from '@lib/math/range'
import { cn } from '@lib/shadcn-utils'
import { randId } from '@lib/utils'
import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { BaseSvg } from '@/components/base-svg'
import { SideTabs } from '@/components/tabs/side-tabs'
import { useZoom } from '@/providers/zoom-provider'
import { useVennCircleStore } from '@/stores/venn-circle-store'
import { useVennStore } from '@/stores/venn-store'
import { ColorPickerButton } from '@components/color/color-picker-button'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { TabContentPanel } from '@components/tabs/tab-content-panel'
import { TabProvider, type ITab } from '@components/tabs/tab-provider'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { FileIcon } from '@icons/file-icon'
import { ListIcon } from '@icons/list-icon'
import { BaseRow } from '@layout/base-row'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { textToLines } from '@lib/text/lines'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@themed/card'
import { LinkButton } from '@themed/link-button'
import { Textarea } from '@themed/textarea'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import axios from 'axios'
import { useHistory } from '../matcalc/history/history-store'
import MODULE_INFO from './module.json'

interface ISet {
  label?: string
  sets: string[]
  size: number
}

const DEFAULT_SIZE = 100
const DEFAULT_OVERLAP = 20
const LABEL_Y_OFFSET = 20
const EMPTY_SET = new Set<string>()

function VennPage() {
  const queryClient = useQueryClient()

  const [activeSideTab, setActiveSideTab] = useState('Items')
  const [rightTab, setSelectedRightTab] = useState('Lists')

  const [scale, setScale] = useState(1)

  const { zoom } = useZoom()

  const [keyPressed, setKeyPressed] = useState<string | null>(null)

  const [displayProps, updateProps, resetProps] = useVennStore()
  const [colorMap, setColorMap, resetColorMap] = useVennCircleStore()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [listIds] = useState<number[]>(range(4))

  // Stores a mapping between the lowercase labels used for
  // matching and the original values. Note that this picks
  // the last value found as being original, so if you overlap
  // Lab1, and lAb1, lAb1 will be kept as the original value
  const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
    new Map()
  )

  const [countMap, setCountMap] = useState<Map<number, string[]>>(
    new Map(listIds.map((i) => [i, []]))
  )

  // track what is unique to each set so we get rid of repeats
  const [uniqueCountMap, setUniqueCountMap] = useState<
    Map<number, Set<string>>
  >(new Map(listIds.map((i) => [i, new Set<string>()])))

  const [listLabelMap, setListLabelMap] = useState<Map<number, string>>(
    new Map<number, string>(listIds.map((i) => [i, `List ${i + 1}`]))
  )

  const [labelToIndexMap, setLabelToIndexMap] = useState<Map<string, number>>(
    new Map()
  )

  const [vennElemMap, setVennElemMap] = useState<Map<string, Set<string>>>(
    new Map()
  )

  const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  // https://github.com/benfred/venn.js/
  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [displayProps.isProportional, setProportional] = useState(true)

  const [sets, setSets] = useState<ISet[]>([])

  const svgRef = useRef<SVGSVGElement>(null)
  const overlapRef = useRef<HTMLTextAreaElement>(null)
  const intersectLabelRef = useRef<HTMLHeadingElement>(null)
  const [showSideBar, setShowSideBar] = useState(true)

  const { sheet, sheets, openBranch, gotoSheet } = useHistory()

  useWindowScrollListener((e: unknown) => console.log(e))

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file = files[0]!
  //   const name = file.name

  //   //setFile(files[0])
  //   //setShowLoadingDialog(true)

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       // since this seems to block rendering, delay by a second so that the
  //       // animation has time to start to indicate something is happening and
  //       // then finish processing the file
  //       setTimeout(() => {
  //         const text: string =
  //           typeof result === 'string' ? result : Buffer.from(result).toString()

  //         openFiles([{ name, text, ext: name.split('.').pop() || '' }])

  //         // historyState.current = {
  //         //   step: 0,
  //         //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
  //         // }

  //         //setShowLoadingDialog(false)
  //       }, 2000)
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function openFiles(files: ITextFileOpen[]) {
    const file = files[0]!
    const name = file.name

    const lines = textToLines(file.text)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .delimiter(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines).t

    setListLabelMap(
      new Map(rangeMap((ci) => [ci, table.index.str(ci)], table.shape[0]))
    )

    setListTextMap(
      new Map(
        table.values.map((r, ri) => [ri, r.map((c) => c.toString()).join('\n')])
      )
    )

    //resolve({ ...table, name: file.name })

    // historyDispatch({
    //   type: "reset",
    //   title: `Load ${name}`,
    //   df: table.setName(truncate(name, { length: 16 })),
    // })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/venn.json'),
    })

    setListTextMap(
      new Map(
        res.data.map((items: string[], i: number) => [i, items.join('\n')])
      )
    )
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  useEffect(() => {
    setListLabelMap(
      new Map(range(listIds.length).map((i) => [i, `List ${i + 1}`]))
    )
  }, [listIds])

  function getItems(text: string | undefined | null): string[] {
    if (!text) {
      return []
    }

    return textToLines(text, { trim: true })
  }

  useEffect(() => {
    // map text back to its original name
    const originalMap = new Map<string, string>()

    // count number of items
    const countMap = new Map<number, string[]>()

    listIds.forEach((i) => {
      const items = getItems(listTextMap.get(i)!)

      countMap.set(
        i,
        items.map((item) => item.toLowerCase())
      )

      items.forEach((item) => {
        originalMap.set(item.toLowerCase(), item)
      })
    })

    setOriginalMap(originalMap)

    // const countMap = new Map(
    //   listIds.map(i => [i, getItems(listTextMap.get(i)!)]),
    // )

    const uniqueCountMap = new Map(
      Array.from(countMap.entries()).map(([listId, items]) => [
        listId,
        new Set(items),
      ])
    )

    // const displayLabelMap = Object.fromEntries(
    //   listIds.map(i => [
    //     i,
    //     `${listLabelMap[i]} (${uniqueCountMap[i].size.toLocaleString()})`,
    //   ]),
    // )

    // determine which lists are in use
    const usableIds = numSort(
      Array.from(uniqueCountMap.entries())
        .filter(([, items]) => items.size > 0)
        .map(([listId]) => listId)
    )

    // get all the intersections in use by id combinations for
    // example [0] is list 1 and [0, 1] is the intersection of list 1
    // and list 2
    const combinations: number[][] = makeCombinations(usableIds).slice(1)

    // pool all items and annotate by who is in what
    const combs = new Map<string, number[]>()

    usableIds.forEach((listId) => {
      ;[...uniqueCountMap.get(listId)!].map((item) => {
        if (!combs.has(item)) {
          combs.set(item, [])
        }

        combs.get(item)!.push(listId)
      })
    })

    const newSets: ISet[] = []
    const vennMap = new Map<string, Set<string>>()
    let maxRows = 0

    //
    // counts for venn
    //

    const combs2 = new Map<string, Set<string>>()

    const subCombMap = new Map<string, string[]>()

    Array.from(combs.entries()).forEach(([item, listIds]) => {
      const id = listIds.join(':')

      if (!subCombMap.has(id)) {
        // cache the permutations we encounter
        subCombMap.set(
          id,
          makeCombinations(listIds.map((s) => listLabelMap.get(s)))
            .slice(1)
            .map((c) => c.join('_'))
        )
      }

      const labels: string[] = subCombMap.get(id)!

      labels.forEach((label) => {
        if (!combs2.has(label)) {
          combs2.set(label, new Set())
        }

        combs2.get(label)?.add(item)
      })
    })

    //console.log(combinations)

    combinations.forEach((c) => {
      const sets = c.map((s) => listLabelMap.get(s)!)
      const label = sets.join('_')

      const items: Set<string> = combs2.get(label) ?? EMPTY_SET

      let size = items.size

      if (size > 0 && !displayProps.isProportional) {
        if (sets.length === 1) {
          // all sets have the same size
          size = DEFAULT_SIZE
        } else {
          size = DEFAULT_OVERLAP
        }
      }

      newSets.push({
        sets,
        //label: sets.length === 1 && displayProps.showLabels ? label : "",
        size,
      })

      vennMap.set(label, items)

      maxRows = Math.max(maxRows, items.size)
    })

    setSets(newSets)
    setVennElemMap(vennMap)

    setCountMap(countMap)
    setUniqueCountMap(uniqueCountMap)

    setLabelToIndexMap(
      new Map<string, number>(
        Array.from(listLabelMap.entries()).map(([k, v]) => [v, k])
      )
    )
  }, [listLabelMap, listTextMap, displayProps])

  useEffect(() => {
    // make a dataframe

    if (vennElemMap.size === 0) {
      return
    }

    const index = Array.from(vennElemMap.keys()).sort()

    const maxRows = index
      .map((n) => vennElemMap.get(n)!.size)
      .reduce((a, b) => Math.max(a, b), 0)

    const d = index.map((n) =>
      [...vennElemMap.get(n)!]
        .sort()
        .concat(Array(maxRows - vennElemMap.get(n)!.size).fill(''))
    )

    const df = new DataFrame({
      name: 'Venn Sets',
      data: d,
      index: new DataIndex(index.map((n) => n.split('_').join(' AND '))),
    }).t

    openBranch(`Venn Sets`, [df])
  }, [vennElemMap])

  useEffect(() => {
    if (sets.length === 0) {
      return
    }

    const chart = VennDiagram()
      .width(displayProps.w)
      // @ts-expect-error: poor api design
      .height(displayProps.w)
      .duration(0)
      .normalize(displayProps.normalize)
    //displayProps.isProportional)

    const div = d3.select('#venn')

    // stop the animation and force refresh
    // so that intersection labels remain
    // in the correct place after resize
    div.select('svg').selectAll('*').remove()

    div.datum(sets).call(chart)

    //const svg = div.select("svg")

    div.select('svg').attr('class', 'absolute')

    const tooltip = d3.select('#tooltip') //.attr("class", "venntooltip")

    div
      .selectAll('path')
      .style('stroke-opacity', 0)
      .style('stroke', COLOR_WHITE)
      .style('stroke-width', 3)
      .style('cursor', 'pointer')

    // force node color
    Array.from(listLabelMap.entries()).forEach(([k, v]) => {
      const d = div.selectAll(`g[data-venn-sets='${v}']`)

      d.selectAll('path')
        .style('fill', colorMap[k]!.fill)
        .style('fill-opacity', displayProps.isFilled ? 1 : 0)

      if (displayProps.isOutlined) {
        d.selectAll('path')
          .style('stroke', colorMap[k]!.stroke)
          .style('stroke-opacity', 1)
      }

      d.selectAll('text').style('fill', colorMap[k]!.color)
    })

    // find the pieces who are labelled and where the
    // label contains "_" as these are the ones that
    // are intersections and whose labels are missing
    // from the venn diagram

    //div.select("svg").select("#size-group").remove()
    //div.select("svg").append("g").attr("id", "size-group")

    if (!displayProps.isProportional) {
      Array.from(vennElemMap.entries())
        //.filter(([k, v]) => k.includes("_"))
        .forEach(([k, v]) => {
          const d = div.selectAll(`g[data-venn-sets='${k}']`)

          if (d) {
            const path = d.select(k.includes('_') ? 'path' : 'tspan')

            // set the opacity of the auto labels
            if (!k.includes('_')) {
              path.attr('opacity', displayProps.showLabels ? 1 : 0)
            }

            if (path) {
              const node = path.node()

              if (node) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const box = node.getBBox()

                const idx = labelToIndexMap.get(k) ?? -1

                div
                  .select('svg')
                  .append('text')
                  .attr('x', box.x + 0.5 * box.width)
                  .attr(
                    'y',
                    box.y +
                      0.5 * box.height +
                      (k.includes('_') ? 0 : LABEL_Y_OFFSET)
                  )
                  .style(
                    'fill',
                    idx !== -1
                      ? colorMap[idx]!.color
                      : displayProps.intersectionColor
                  )
                  .attr('text-anchor', 'middle')
                  .attr('dominant-baseline', 'middle')
                  .attr('opacity', displayProps.showCounts ? 1 : 0)
                  .text(v.size.toLocaleString())
              }
            }
          }
        })
    }

    // add listeners to all the groups to display tooltip on mouseover
    div
      .selectAll('g')
      .on('mouseover', function (_e, d) {
        sortAreas(div, d)

        const selection = d3.select(this)

        const vennId = selection.attr('data-venn-sets')

        // highlight the current path

        const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

        // Display a tooltip with the current size
        tooltip.transition().duration(300).style('opacity', 0.9)
        tooltip.text(`${overlapSet.size} item${overlapSet.size > 1 ? 's' : ''}`)

        if (!displayProps.isOutlined) {
          // sort all the areas relative to the current item

          selection
            .transition('tooltip')
            .duration(300)
            .select('path')
            //.style("stroke-width", 3)
            //.style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
            .style('stroke-opacity', 1)
          //.style("stroke", "#fff")
        }
      })

      .on('mousedown', function (_e, d) {
        // sort all the areas relative to the current item
        sortAreas(div, d)

        // highlight the current path
        const selection = d3.select(this)
        const vennId = selection.attr('data-venn-sets')

        const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

        // label the header and remove counts from list ids

        const ids = vennId.split('_')

        const label = `There ${
          overlapSet.size !== 1 ? 'are' : 'is'
        } ${overlapSet.size.toLocaleString()} item${
          overlapSet.size !== 1 ? 's' : ''
        } in ${ids.length > 1 ? 'the intersection of' : ''} ${ids
          .map((x) => x.replace(/ \(.+/, ''))
          .join(' AND ')}`

        if (overlapRef.current) {
          // format the intersection of results into a string.
          // We use originalMap to convert the lowercase items
          // back to their original state, though we only keep
          // one such state for each id. Thus if you mix cases
          // for a label, e.g. Lab1, lAb1, LaB1, only one of the
          // original labels will be used since the intersection
          // doesn't know which label to pick from.
          overlapRef.current.value = [
            `#${label}`,
            ...[...overlapSet].sort().map((s) => _originalMap.get(s)),
          ].join('\n')
        }

        if (intersectLabelRef.current) {
          // label the header and remove counts from list ids

          intersectLabelRef.current.innerText = label
        }
      })

      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event)

        tooltip.style('left', x + 20 + 'px').style('top', y + 20 + 'px')
      })

      .on('mouseout', function () {
        const selection = d3.select(this)

        // determine if id represents one of the 4 circles

        tooltip.transition().duration(300).style('opacity', 0)

        if (!displayProps.isOutlined) {
          selection
            .transition('tooltip')
            .duration(300)
            .select('path')
            .style('stroke-opacity', 0)
        }
        //.style("stroke-width", 0)
        //.style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
        //.style("stroke-opacity", 0)
      })

    if (intersectLabelRef.current) {
      // label the header and remove counts from list ids

      intersectLabelRef.current.innerText = 'Items List'
    }

    if (overlapRef.current) {
      // label the header and remove counts from list ids

      overlapRef.current.value = ''
    }

    // if (sets.length > 0) {
    //   const g = div.select(
    //     `g[data-venn-sets='${listIds
    //       .map(i => listLabelWithNums[i])
    //       .join("_")}']`,
    //   )

    //   g.append("text").text(sets[sets.length - 1].size.toString())

    //   div
    //     .select("svg")
    //     .append("text")
    //     .text(sets[sets.length - 1].size.toString())

    //   console.log("g", g.node().getBBox())
    // }
  }, [sets, colorMap])

  useEffect(() => {
    updateProps({ ...displayProps, scale: zoom })
  }, [zoom])

  function save(format: 'txt' | 'csv') {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() => {
                setShowDialog({ id: 'export', params: {} })
              }}
            >
              <SaveIcon />
            </ToolbarIconButton>

            {/* <ToolbarSaveSvg
              svgRef={svgRef}
            /> */}
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const vennRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Lists',
      icon: <LayersIcon />,

      content: (
        <PropsPanel>
          <ScrollAccordion value={listIds.map((id) => `List ${id + 1}`)}>
            {listIds.map((index: number) => {
              const name = `List ${index + 1}`
              return (
                <AccordionItem value={name} key={index}>
                  <AccordionTrigger>{name}</AccordionTrigger>
                  <AccordionContent>
                    <BaseCol className="gap-y-1">
                      <VCenterRow className="gap-x-2">
                        <Input
                          id={`label${index + 1}`}
                          value={listLabelMap.get(index) ?? ''}
                          onChange={(e) => {
                            //console.log(index, e.target.value)
                            setListLabelMap(
                              new Map(listLabelMap).set(index, e.target.value)
                            )
                          }}
                          className="w-0 grow rounded-theme"
                          placeholder={`List ${index + 1} name...`}
                        />
                        <VCenterRow className={cn('shrink-0 gap-x-0.5')}>
                          <ColorPickerButton
                            color={colorMap[index]!.fill}
                            onColorChange={(color) =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      fill: color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Fill color"
                            className={cn('rounded-xs', XS_ICON_BUTTON_CLS)}
                          />
                          <ColorPickerButton
                            color={colorMap[index]!.stroke}
                            onColorChange={(color) =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      stroke: color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Line color"
                            className={cn('rounded-xs', XS_ICON_BUTTON_CLS)}
                          />

                          <ColorPickerButton
                            color={colorMap[index]!.color}
                            onColorChange={(color) =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Text color"
                            className={cn('rounded-xs', XS_ICON_BUTTON_CLS)}
                          />
                        </VCenterRow>
                      </VCenterRow>

                      <Textarea
                        id={`set${index + 1}`}
                        aria-label={`Set ${index + 1}`}
                        placeholder={listLabelMap.get(index) ?? ''}
                        value={listTextMap.get(index) ?? ''}
                        onChange={(e) =>
                          setListTextMap(
                            new Map(listTextMap).set(index, e.target.value)
                          )
                        }
                        className="h-28"
                      />
                      <VCenterRow className="justify-between pr-1">
                        <span title="Total items / Unique items">
                          {`${countMap.get(index)!.length} / ${
                            uniqueCountMap.get(index)!.size
                          }`}
                        </span>

                        <Button
                          variant="link"
                          size="sm"
                          ripple={false}
                          onClick={() =>
                            setListTextMap(new Map(listTextMap).set(index, ''))
                          }
                        >
                          {TEXT_CLEAR}
                        </Button>
                      </VCenterRow>
                    </BaseCol>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SETTINGS,
      icon: <SlidersIcon />,
      content: (
        <PropsPanel>
          <ScrollAccordion value={['plot', 'circles', 'text']}>
            <AccordionItem value="plot">
              <AccordionTrigger>Plot</AccordionTrigger>
              <AccordionContent>
                <PropRow title="Plot width">
                  <NumericalInput
                    id="w"
                    max={1000}
                    value={displayProps.w}
                    placeholder="Cell width..."
                    onNumChanged={(w) => {
                      updateProps({
                        ...displayProps,
                        w,
                      })
                    }}
                  />
                </PropRow>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="circles">
              <AccordionTrigger>Circles</AccordionTrigger>
              <AccordionContent>
                <SwitchPropRow
                  title="Fill"
                  checked={displayProps.isFilled}
                  onCheckedChange={(state) => {
                    let props = {
                      ...displayProps,
                      isFilled: state,
                      isOutlined: state ? displayProps.isOutlined : true,
                    }

                    if (displayProps.autoColorText) {
                      props = {
                        ...props,
                        intersectionColor: state ? COLOR_WHITE : COLOR_BLACK,
                      }

                      setColorMap(
                        Object.fromEntries(
                          Object.keys(colorMap).map((key) => [
                            key,
                            {
                              ...colorMap[key]!,
                              color: state
                                ? COLOR_WHITE
                                : colorMap[key]!.stroke,
                            },
                          ])
                        )
                      )
                    }

                    updateProps(props)
                  }}
                />

                <SwitchPropRow
                  title="Outline"
                  checked={displayProps.isOutlined}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      isOutlined: state,
                      isFilled: state ? displayProps.isFilled : true,
                    })
                  }
                />
                <SwitchPropRow
                  title="Proportional"
                  checked={displayProps.isProportional}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      isProportional: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Normalize"
                  checked={displayProps.normalize}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      normalize: state,
                    })
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="text">
              <AccordionTrigger>Text</AccordionTrigger>
              <AccordionContent>
                <SwitchPropRow
                  title="Labels"
                  checked={displayProps.showLabels}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      showLabels: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Counts"
                  checked={displayProps.showCounts}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      showCounts: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Auto-color"
                  checked={displayProps.autoColorText}
                  onCheckedChange={(state) =>
                    updateProps({
                      ...displayProps,
                      autoColorText: state,
                    })
                  }
                />
                <PropRow title="Intersection">
                  <ColorPickerButton
                    color={displayProps.intersectionColor}
                    onColorChange={(color) =>
                      updateProps({
                        ...displayProps,
                        intersectionColor: color,
                      })
                    }
                    className={cn(PILL_BUTTON_CLS, SM_ICON_BUTTON_CLS)}
                  />
                </PropRow>

                <BaseCol className="justify-start gap-y-1 pt-4">
                  <LinkButton ripple={false} onClick={() => resetProps()}>
                    Default settings
                  </LinkButton>

                  <LinkButton ripple={false} onClick={() => resetColorMap()}>
                    Default list colors
                  </LinkButton>
                </BaseCol>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
  ]

  function onWheel(e: { deltaY: number }) {
    if (keyPressed === 'Shift') {
      setScale(
        Math.max(
          DEFAULT_ZOOM_SCALES[0]!,
          Math.min(
            DEFAULT_ZOOM_SCALES[DEFAULT_ZOOM_SCALES.length - 1]!,
            scale + (e.deltaY >= 0 ? 0.25 : -0.25)
          )
        )
      )
    }
  }

  const sidebarTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'List view',
      icon: <ListIcon className={TOOLBAR_BUTTON_ICON_CLS} w="w-4" />,

      content: (
        <Textarea
          ref={overlapRef}
          id="text-overlap"
          aria-label="Overlaps"
          className="h-full text-sm my-2 grow"
          placeholder="A list of the items in each Venn subset will appear here when you click on the diagram..."
          readOnly
        />
      ),
    },
    {
      //id: nanoid(),
      id: 'Table view',
      icon: <TableIcon />,

      content: (
        <BaseCol className="grow mt-2 gap-y-1">
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Download pathway table"
              tooltip="Download pathway table"
              onClick={() => save('txt')}
            >
              <SaveIcon />
              <span>{TEXT_EXPORT}</span>
            </ToolbarButton>
          </ToolbarTabGroup>

          <TabbedDataFrames
            key="tabbed-data-frames"
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              gotoSheet(selectedTab.tab.id)
            }}
          />
        </BaseCol>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: '<divider>',
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => {
              save('txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('csv')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      //id: nanoid(),
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAsPng(svgRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvg(svgRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id.includes('export') && (
        <SaveImageDialog
          name="venn"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout info={MODULE_INFO} signedRequired="never">
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        <TabSlideBar
          id="venn-sidebar"
          limits={[50, 85]}
          side="right"
          tabs={vennRightTabs}
          onTabChange={(selectedTab) => setSelectedRightTab(selectedTab.tab.id)}
          value={rightTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="mx-2"
        >
          <ResizablePanelGroup
            direction="vertical"
            className="grow"
            //autoSaveId="venn-resizable-panels-v"
          >
            <ResizablePanel
              defaultSize={70}
              minSize={10}
              className="grow flex flex-col  overflow-hidden px-2"
              id="venn"
            >
              <Card className="grow" variant="content">
                <div
                  className={cn(
                    FOCUS_RING_CLS,
                    'custom-scrollbar relative grow overflow-scroll rounded-theme bg-background'
                  )}
                  id="venn"
                  onWheel={onWheel}
                  tabIndex={0}
                  onKeyDown={(e) => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <BaseSvg
                    className="absolute"
                    ref={svgRef}
                    scale={scale}
                    width={displayProps.w}
                    height={displayProps.w}
                  />
                  <div
                    id="tooltip"
                    className="venntooltip absolute z-(--z-modal) rounded-theme bg-black/80 px-4 py-2 text-white opacity-0"
                  />
                </div>
              </Card>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              id="list"
              defaultSize={30}
              minSize={10}
              collapsible={true}
              className="grow flex flex-col"
            >
              {/* <TopTabs
                tabs={sidebarTabs}
                value={activeSideTab}
                onValueChange={setActiveSideTab}
              /> */}

              {/* <ToggleButtons
                tabs={sidebarTabs}
                value={activeSideTab}
                onTabChange={selectedTab =>
                  setActiveSideTab(selectedTab.tab.name)
                }
                className="grow"
              >
                <VCenterRow>
                  <ToggleButtonTriggers className="text-xs" />
                </VCenterRow>
                <TabContentPanel />
              </ToggleButtons> */}

              <BaseRow className="grow">
                <SideTabs
                  tabs={sidebarTabs}
                  value={activeSideTab}
                  showLabels={false}
                  //defaultWidth={2}
                  onTabChange={(selectedTab) =>
                    setActiveSideTab(selectedTab.tab.id)
                  }
                />

                <TabProvider
                  value={activeSideTab}
                  //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
                  tabs={sidebarTabs}
                >
                  <BaseCol className="grow px-2">
                    <TabContentPanel />
                  </BaseCol>
                </TabProvider>
              </BaseRow>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooterPortal>
          <></>
          <></>
          <>{activeSideTab === 'Chart' && <ZoomSlider />}</>
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => openFiles(files))
            }
          />
        )}
      </ShortcutLayout>
    </>
  )
}

export function VennPageQuery() {
  return (
    <CoreProviders>
      {/* <ZoomProvider> */}
      <VennPage />
      {/* </ZoomProvider> */}
    </CoreProviders>
  )
}
