'use client'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { BaseCol } from '@layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ZoomSlider } from '@toolbar/zoom-slider'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarButton } from '@toolbar/toolbar-button'

import { FileImageIcon } from '@icons/file-image-icon'
import { LayersIcon } from '@icons/layers-icon'
import { SaveIcon } from '@icons/save-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { TableIcon } from '@icons/table-icon'

import {
  downloadSvg,
  downloadSvgAsPng,
  downloadSvgAutoFormat,
} from '@lib/image-utils'

import {
  FOCUS_RING_CLS,
  PILL_BUTTON_CLS,
  SM_ICON_BUTTON_CLS,
  TOOLBAR_BUTTON_ICON_CLS,
} from '@/theme'

import { useEffect, useMemo, useRef, useState } from 'react'

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
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { NumericalInput } from '@themed/numerical-input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@themed/resizable'

import {
  NO_DIALOG,
  TEXT_CANCEL,
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
import { rangeMap } from '@lib/math/range'
import { cn } from '@lib/shadcn-utils'
import { randId } from '@lib/utils'
import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { BaseSvg } from '@/components/base-svg'
import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import { Tabs } from '@/components/shadcn/ui/themed/tabs'
import { SideTabs } from '@/components/tabs/side-tabs'
import { httpFetch } from '@/lib/http/http-fetch'
import { useZoom } from '@/providers/zoom-provider'
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
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { textToLines } from '@lib/text/lines'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@themed/card'
import { LinkButton } from '@themed/link-button'
import { Textarea } from '@themed/textarea'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { useHistory } from '../matcalc/history/history-store'
import MODULE_INFO from './module.json'
import { SVGFourWayVenn } from './svg-four-way-venn'
import { SVGThreeWayVenn } from './svg-three-way-venn'
import { VennList } from './venn-list'
import { IVennList, LIST_IDS, makeVennList, useVenn } from './venn-store'

function VennPage() {
  const queryClient = useQueryClient()

  const [activeSideTab, setActiveSideTab] = useState('Items')
  const [rightTab, setSelectedRightTab] = useState('Lists')

  const { selectedItems } = useVenn()

  //const [scale, setScale] = useState(1)

  const { zoom } = useZoom()

  const [keyPressed, setKeyPressed] = useState<string | null>(null)

  const {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
  } = useVennSettings()

  const { vennLists, setVennLists, originalNames } = useVenn()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [listIds] = useState<number[]>(range(4))

  // Stores a mapping between the lowercase labels used for
  // matching and the original values. Note that this picks
  // the last value found as being original, so if you overlap
  // Lab1, and lAb1, lAb1 will be kept as the original value
  // const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
  //   new Map()
  // )

  const [vennSets, setVennSets] = useState<Record<number, IVennList>>({})

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

  const [vennElemMap, setVennElemMap] = useState<Map<string, Set<string>>>(
    new Map()
  )

  // map of list id to the text contents for each list,
  // we split these later to get the actual items
  const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  // https://github.com/benfred/venn.js/
  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [settings.isProportional, setProportional] = useState(true)

  //const [sets, setSets] = useState<ISet[]>([])

  const svgRef = useRef<SVGSVGElement>(null)
  const overlapRef = useRef<HTMLTextAreaElement>(null)

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

    setVennLists(
      Object.fromEntries(
        rangeMap((ci) => {
          return [ci, makeVennList(ci, table.index.str(ci), table.row(ci).strs)]
        }, table.shape[0])
      )
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
      queryFn: () => httpFetch.getJson<string[][]>('/data/test/venn.json'),
    })

    console.log(res)

    setVennLists(
      Object.fromEntries(
        res.map((items: string[], ci: number) => {
          return [
            ci + 1,
            {
              id: ci + 1,
              name: `List ${ci + 1}`,
              items: items,
              uniqueItems: [
                ...new Set<string>(items.map((item) => item.toLowerCase())),
              ].sort(),
              text: items.join('\n'),
            } as IVennList,
          ]
        }, res.length)
      )
    )
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  // useEffect(() => {
  //   setListLabelMap(
  //     new Map(range(listIds.length).map((i) => [i, `List ${i + 1}`]))
  //   )
  // }, [listIds])

  useEffect(() => {
    // map text back to its original name
    //const originalNameMap = new Map<string, string>()

    // // store all items in lowercase for each list
    // const vennSetList: Map<
    //   number,
    //   {
    //     // if user skips entering a list, we need
    //     // an id from 0..n for each list in use
    //     // For example if they enter list 1 and 3
    //     // then ids will be 0 and 1
    //     id: number
    //     name: string
    //     items: string[]
    //     uniqueItems: string[]
    //   }
    // > = new Map()

    const vennSetList: Record<string, IVennList> = {}

    for (const [i, vl] of Object.entries(vennLists)) {
      //const items = getItems(listTextMap.get(i)!)

      if (vl.uniqueItems.length > 0) {
        vennSetList[i] = vl

        // for (const item of vl.uniqueItems) {
        //   originalNameMap.set(item.toLowerCase(), item)
        // }
      }
    }

    //setOriginalMap(originalNameMap)

    // const countMap = new Map(
    //   listIds.map(i => [i, getItems(listTextMap.get(i)!)]),
    // )

    // const uniqueCountMap = new Map(
    //   [...vennSetList].map(([listId, items]) => [listId, new Set(items)])
    // )

    // const displayLabelMap = Object.fromEntries(
    //   listIds.map(i => [
    //     i,
    //     `${listLabelMap[i]} (${uniqueCountMap[i].size.toLocaleString()})`,
    //   ]),
    // )

    // determine which lists are in use
    // const listsInUseIds = numSort(
    //   [...uniqueCountMap]
    //     .filter(([, items]) => items.size > 0)
    //     .map(([listId]) => listId)
    // )

    // we need to know which items are in which combination so
    // create a map of item to the lists it is found in for example
    // itemA -> [0, 1]
    const combs = new Map<string, Set<number>>()

    for (const vs of Object.values(vennSetList)) {
      for (const item of vs.uniqueItems) {
        if (!combs.has(item)) {
          combs.set(item, new Set())
        }

        combs.get(item)!.add(vs.id)
      }
    }

    //const newSets: ISet[] = []
    //const vennMap = new Map<string, Set<string>>()
    //let maxRows = 0

    //
    // counts for venn
    //

    const vennMap = new Map<string, Set<string>>()

    for (const [item, listIds] of combs.entries()) {
      //const sets = [...listIds].sort() //.map( (s) => listLabelMap.get(s)!)

      //console.log(item, listIds, 'item')

      const id = [...listIds].sort().join(':')

      if (!vennMap.has(id)) {
        vennMap.set(id, new Set())
      }

      vennMap.get(id)!.add(item)
    }

    // const combs2 = new Map<string, Set<string>>()

    // const subCombMap = new Map<string, string[]>()

    // Array.from(combs.entries()).forEach(([item, listIds]) => {
    //   const id = listIds.join(':')

    //   if (!subCombMap.has(id)) {
    //     // cache the permutations we encounter
    //     subCombMap.set(
    //       id,
    //       makeCombinations(listIds.map((s) => listLabelMap.get(s)))
    //         .slice(1)
    //         .map((c) => c.join('_'))
    //     )
    //   }

    //   const labels: string[] = subCombMap.get(id)!

    //   labels.forEach((label) => {
    //     if (!combs2.has(label)) {
    //       combs2.set(label, new Set())
    //     }

    //     combs2.get(label)?.add(item)
    //   })
    // })

    //console.log(combinations)

    // for (const c of combinations) {
    //   const sets = c.map((s) => listLabelMap.get(s)!)
    //   const label = sets.join('_')

    //   const items: Set<string> = combs.get(label) ?? EMPTY_SET

    //   let size = items.size

    //   if (size > 0 && !settings.isProportional) {
    //     if (sets.length === 1) {
    //       // all sets have the same size
    //       size = DEFAULT_SIZE
    //     } else {
    //       size = DEFAULT_OVERLAP
    //     }
    //   }

    //   newSets.push({
    //     sets,
    //     //label: sets.length === 1 && settings.showLabels ? label : "",
    //     size,
    //   })

    //   vennMap.set(label, items)

    //   maxRows = Math.max(maxRows, items.size)
    // }

    //setSets(newSets)

    setVennElemMap(vennMap)

    setVennSets(vennSetList)
    //setUniqueCountMap(uniqueCountMap)

    // setLabelToIndexMap(
    //   new Map<string, number>(
    //     Array.from(listLabelMap.entries()).map(([k, v]) => [v, k])
    //   )
    // )
  }, [vennLists, listTextMap, settings])

  useEffect(() => {
    // make a dataframe

    if (vennElemMap.size === 0) {
      return
    }

    const index = [...vennElemMap.keys()].sort((a, b) =>
      a.length !== b.length ? a.length - b.length : a.localeCompare(b)
    )

    const maxRows = index
      .map((n) => vennElemMap.get(n)!.size)
      .reduce((a, b) => Math.max(a, b), 0)

    const d = index.map((n) =>
      [...vennElemMap.get(n)!]
        .sort()
        .concat(Array(maxRows - vennElemMap.get(n)!.size).fill(''))
    )

    const df = new AnnotationDataFrame({
      name: 'Venn Sets',
      data: d,
      index: index.map((n) =>
        n
          .split(':')
          .map((s) => Number(s))
          .map((s) => vennLists[s]?.name ?? s)
          .join(' AND ')
      ),
    }).t

    openBranch(`Venn Sets`, [df])
  }, [vennElemMap])

  // useEffect(() => {
  //   const chart = VennDiagram()
  //     .width(settings.w)
  //     // @ts-expect-error: poor api design
  //     .height(settings.w)
  //     .duration(0)
  //     .normalize(settings.normalize)
  //   //settings.isProportional)

  //   const div = d3.select('#venn')

  //   // stop the animation and force refresh
  //   // so that intersection labels remain
  //   // in the correct place after resize
  //   div.select('svg').selectAll('*').remove()

  //   div.datum(sets).call(chart)

  //   //const svg = div.select("svg")

  //   div.select('svg').attr('class', 'absolute')

  //   const tooltip = d3.select('#tooltip') //.attr("class", "venntooltip")

  //   div
  //     .selectAll('path')
  //     .style('stroke-opacity', 0)
  //     .style('stroke', COLOR_WHITE)
  //     .style('stroke-width', 3)
  //     .style('cursor', 'pointer')

  //   // force node color
  //   Array.from(listLabelMap.entries()).forEach(([k, v]) => {
  //     const d = div.selectAll(`g[data-venn-sets='${v}']`)

  //     d.selectAll('path')
  //       .style('fill', circles[k]!.fill)
  //       .style('fill-opacity', settings.isFilled ? 1 : 0)

  //     if (settings.isOutlined) {
  //       d.selectAll('path')
  //         .style('stroke', circles[k]!.stroke)
  //         .style('stroke-opacity', 1)
  //     }

  //     d.selectAll('text').style('fill', circles[k]!.color)
  //   })

  //   // find the pieces who are labelled and where the
  //   // label contains "_" as these are the ones that
  //   // are intersections and whose labels are missing
  //   // from the venn diagram

  //   //div.select("svg").select("#size-group").remove()
  //   //div.select("svg").append("g").attr("id", "size-group")

  //   if (!settings.isProportional) {
  //     Array.from(vennElemMap.entries())
  //       //.filter(([k, v]) => k.includes("_"))
  //       .forEach(([k, v]) => {
  //         const d = div.selectAll(`g[data-venn-sets='${k}']`)

  //         if (d) {
  //           const path = d.select(k.includes('_') ? 'path' : 'tspan')

  //           // set the opacity of the auto labels
  //           if (!k.includes('_')) {
  //             path.attr('opacity', settings.showLabels ? 1 : 0)
  //           }

  //           if (path) {
  //             const node = path.node()

  //             if (node) {
  //               // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //               // @ts-expect-error
  //               const box = node.getBBox()

  //               const idx = labelToIndexMap.get(k) ?? -1

  //               div
  //                 .select('svg')
  //                 .append('text')
  //                 .attr('x', box.x + 0.5 * box.width)
  //                 .attr(
  //                   'y',
  //                   box.y +
  //                     0.5 * box.height +
  //                     (k.includes('_') ? 0 : LABEL_Y_OFFSET)
  //                 )
  //                 .style(
  //                   'fill',
  //                   idx !== -1
  //                     ? circles[idx]!.color
  //                     : settings.intersectionColor
  //                 )
  //                 .attr('text-anchor', 'middle')
  //                 .attr('dominant-baseline', 'middle')
  //                 .attr('opacity', settings.showCounts ? 1 : 0)
  //                 .text(v.size.toLocaleString())
  //             }
  //           }
  //         }
  //       })
  //   }

  //   // add listeners to all the groups to display tooltip on mouseover
  //   div
  //     .selectAll('g')
  //     .on('mouseover', function (_e, d) {
  //       sortAreas(div, d)

  //       const selection = d3.select(this)

  //       const vennId = selection.attr('data-venn-sets')

  //       // highlight the current path

  //       const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

  //       // Display a tooltip with the current size
  //       tooltip.transition().duration(300).style('opacity', 0.9)
  //       tooltip.text(`${overlapSet.size} item${overlapSet.size > 1 ? 's' : ''}`)

  //       if (!settings.isOutlined) {
  //         // sort all the areas relative to the current item

  //         selection
  //           .transition('tooltip')
  //           .duration(300)
  //           .select('path')
  //           //.style("stroke-width", 3)
  //           //.style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
  //           .style('stroke-opacity', 1)
  //         //.style("stroke", "#fff")
  //       }
  //     })

  //     .on('mousedown', function (_e, d) {
  //       // sort all the areas relative to the current item
  //       sortAreas(div, d)

  //       // highlight the current path
  //       const selection = d3.select(this)
  //       const vennId = selection.attr('data-venn-sets')

  //       const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

  //       // label the header and remove counts from list ids

  //       const ids = vennId.split('_')

  //       const label = `There ${
  //         overlapSet.size !== 1 ? 'are' : 'is'
  //       } ${overlapSet.size.toLocaleString()} item${
  //         overlapSet.size !== 1 ? 's' : ''
  //       } in ${ids.length > 1 ? 'the intersection of' : ''} ${ids
  //         .map((x) => x.replace(/ \(.+/, ''))
  //         .join(' AND ')}`

  //       if (overlapRef.current) {
  //         // format the intersection of results into a string.
  //         // We use originalMap to convert the lowercase items
  //         // back to their original state, though we only keep
  //         // one such state for each id. Thus if you mix cases
  //         // for a label, e.g. Lab1, lAb1, LaB1, only one of the
  //         // original labels will be used since the intersection
  //         // doesn't know which label to pick from.
  //         overlapRef.current.value = [
  //           `#${label}`,
  //           ...[...overlapSet].sort().map((s) => _originalMap.get(s)),
  //         ].join('\n')
  //       }

  //       if (intersectLabelRef.current) {
  //         // label the header and remove counts from list ids

  //         intersectLabelRef.current.innerText = label
  //       }
  //     })

  //     .on('mousemove', function (event) {
  //       const [x, y] = d3.pointer(event)

  //       tooltip.style('left', x + 20 + 'px').style('top', y + 20 + 'px')
  //     })

  //     .on('mouseout', function () {
  //       const selection = d3.select(this)

  //       // determine if id represents one of the 4 circles

  //       tooltip.transition().duration(300).style('opacity', 0)

  //       if (!settings.isOutlined) {
  //         selection
  //           .transition('tooltip')
  //           .duration(300)
  //           .select('path')
  //           .style('stroke-opacity', 0)
  //       }
  //       //.style("stroke-width", 0)
  //       //.style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
  //       //.style("stroke-opacity", 0)
  //     })

  //   if (intersectLabelRef.current) {
  //     // label the header and remove counts from list ids

  //     intersectLabelRef.current.innerText = 'Items List'
  //   }

  //   if (overlapRef.current) {
  //     // label the header and remove counts from list ids

  //     overlapRef.current.value = ''
  //   }

  //   // if (sets.length > 0) {
  //   //   const g = div.select(
  //   //     `g[data-venn-sets='${listIds
  //   //       .map(i => listLabelWithNums[i])
  //   //       .join("_")}']`,
  //   //   )

  //   //   g.append("text").text(sets[sets.length - 1].size.toString())

  //   //   div
  //   //     .select("svg")
  //   //     .append("text")
  //   //     .text(sets[sets.length - 1].size.toString())

  //   //   console.log("g", g.node().getBBox())
  //   // }
  // }, [circles])

  useEffect(() => {
    updateSettings({ ...settings, scale: zoom })
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
          <ScrollAccordion value={LIST_IDS.map((id) => `List ${id}`)}>
            {LIST_IDS.map((id: number) => {
              const name = `List ${id}`
              return (
                <AccordionItem value={name} key={name}>
                  <AccordionTrigger>{vennLists[id]?.name}</AccordionTrigger>
                  <AccordionContent>
                    <VennList index={id} />
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
                    max={10000}
                    value={settings.w}
                    placeholder="Cell width..."
                    onNumChanged={(w) => {
                      updateSettings({
                        ...settings,
                        w,
                      })
                    }}
                  />
                </PropRow>

                <PropRow title="Radius">
                  <NumericalInput
                    id="r"
                    max={1000}
                    value={settings.radius}
                    placeholder="Circle radius..."
                    onNumChanged={(r) => {
                      updateSettings({
                        ...settings,
                        radius: r,
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
                  checked={settings.isFilled}
                  onCheckedChange={(state) => {
                    let props = {
                      ...settings,
                      isFilled: state,
                      isOutlined: state ? settings.isOutlined : true,
                    }

                    if (settings.autoColorText) {
                      props = {
                        ...props,
                        intersectionColor: state ? COLOR_WHITE : COLOR_BLACK,
                      }

                      updateCircles(
                        Object.fromEntries(
                          Object.keys(circles).map((key) => [
                            key,
                            {
                              ...circles[key]!,
                              color: state ? COLOR_WHITE : circles[key]!.stroke,
                            },
                          ])
                        )
                      )
                    }

                    updateSettings(props)
                  }}
                />

                <SwitchPropRow
                  title="Outline"
                  checked={settings.isOutlined}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
                      isOutlined: state,
                      isFilled: state ? settings.isFilled : true,
                    })
                  }
                />
                <SwitchPropRow
                  title="Proportional"
                  checked={settings.isProportional}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
                      isProportional: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Normalize"
                  checked={settings.normalize}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
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
                  checked={settings.showLabels}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
                      showLabels: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Counts"
                  checked={settings.showCounts}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
                      showCounts: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Auto-color"
                  checked={settings.autoColorText}
                  onCheckedChange={(state) =>
                    updateSettings({
                      ...settings,
                      autoColorText: state,
                    })
                  }
                />
                <PropRow title="Intersection">
                  <ColorPickerButton
                    color={settings.intersectionColor}
                    onColorChange={(color) =>
                      updateSettings({
                        ...settings,
                        intersectionColor: color,
                      })
                    }
                    className={cn(PILL_BUTTON_CLS, SM_ICON_BUTTON_CLS)}
                  />
                </PropRow>

                <BaseCol className="justify-start gap-y-2 pt-4">
                  <LinkButton onClick={() => resetSettings()}>
                    Default settings
                  </LinkButton>

                  <LinkButton onClick={() => resetCircles()}>
                    Default colors
                  </LinkButton>
                </BaseCol>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
  ]

  // function onWheel(e: { deltaY: number }) {
  //   if (keyPressed === 'Shift') {
  //     setScale(
  //       Math.max(
  //         DEFAULT_ZOOM_SCALES[0]!,
  //         Math.min(
  //           DEFAULT_ZOOM_SCALES[DEFAULT_ZOOM_SCALES.length - 1]!,
  //           scale + (e.deltaY >= 0 ? 0.25 : -0.25)
  //         )
  //       )
  //     )
  //   }
  // }

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
          value={[
            selectedItems.name,
            ...selectedItems.items.sort().map((s) => originalNames[s] || s),
          ].join('\n')}
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

  const labels: string[] = useMemo(
    () =>
      [...Object.keys(vennSets)]
        .map(Number)
        .sort()
        .map((id, idx) => vennSets[id]?.name || `List ${idx + 1}`),

    [vennSets]
  )

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
              defaultSize={80}
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
                  //onWheel={onWheel}
                  tabIndex={0}
                  onKeyDown={(e) => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <BaseSvg
                    className="absolute"
                    ref={svgRef}
                    scale={zoom}
                    width={settings.w}
                    height={settings.w}
                  >
                    {labels.length > 3 ? (
                      <SVGFourWayVenn
                        labels={labels}
                        vennElemMap={vennElemMap}
                      />
                    ) : (
                      <SVGThreeWayVenn
                        labels={labels}
                        vennElemMap={vennElemMap}
                      />
                    )}
                  </BaseSvg>
                  {/* <div
                    id="tooltip"
                    className="venntooltip absolute z-(--z-modal) rounded-theme bg-black/80 px-4 py-2 text-white opacity-0"
                  />   */}
                </div>
              </Card>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              id="list"
              defaultSize={20}
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

              <Tabs
                value={activeSideTab}
                className="grow flex flex-row gap-x-2"
                orientation="vertical"
              >
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
                  <BaseCol className="grow">
                    <TabContentPanel />
                  </BaseCol>
                </TabProvider>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooterPortal>
          <></>
          <></>
          <>
            <ZoomSlider />
          </>
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
