import { VCenterRow } from '@/layout/v-center-row'

import { Input } from '@/themed/v2/input'

import { useState } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { PropRow } from '@/dialogs/prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { IconButton } from '@/themed/icon-button'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { Button } from '@/themed/v2/button'
import { produce } from 'immer'
import { Brush, Palette } from 'lucide-react'
import { useLollipopSettings } from './lollipop-settings-store'
import {
  AA_COLOR_SCHEMES,
  AMINO_ACID_FULL_NAMES,
  AMINO_ACIDS,
  type AAColorScheme,
} from './variants'

import { FontPopover } from '@/components/plot/font/font-popover'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { ProteinPanel } from './protein-panel'

// export async function searchUniprot(
//   gene: string,
//   max: number = 5
// ): Promise<IProtein[]> {
//   gene = gene.replace(/[Pp]rotein/, '')
//   gene = gene.trim()
//   gene = gene.split(' ')[0]! // take the first word

//   const query = `gene:${gene} AND reviewed:true`
//   const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=${max}&fields=accession,gene_primary,protein_name,organism_name`

//   let res = await queryClient.fetchQuery({
//     queryKey: ['uniprot', gene],
//     queryFn: () => {
//       // console.log(
//       //   'search',
//       //   `https://rest.uniprot.org/uniprotkb/search?query=(gene:${gene})%20AND%20(reviewed:true)&format=json&size=${max}&fields=accession,gene_primary,protein_name,organism_name`
//       // )
//       const res = httpFetch.getJson<{
//         results: {
//           genes: { geneName: { value: string } }[]
//           primaryAccession: string
//           proteinDescription: {
//             recommendedName: { fullName: { value: string } }
//           }
//           organism: { commonName: string; taxonId: number }
//         }[]
//         sequence: { value: string; length: number }
//       }>(url)

//       return res
//     },
//   })

//   const ret: IProtein[] = []

//   for (const p of res.results) {
//     //const gene = data.genes[0].geneName.value
//     const accession = p.primaryAccession
//     const name = p.proteinDescription.recommendedName.fullName.value

//     const organism = p.organism.commonName
//     const taxonId = p.organism.taxonId

//     const officialGeneName = p.genes[0]?.geneName.value ?? gene

//     // now get the sequence

//     res = await queryClient.fetchQuery({
//       queryKey: ['uniprot-accession', accession],
//       queryFn: () =>
//         httpFetch.getJson<{ sequence: { value: string } }>(
//           `https://rest.uniprot.org/uniprotkb/${accession}.json`
//         ),
//     })

//     ret.push({
//       gene: officialGeneName,
//       name,
//       accession,
//       organism,
//       taxonId,
//       sequence: toAA(res.sequence.value),
//       //length: res.sequence.length,
//     })
//   }

//   return ret.sort((a, b) => a.organism.localeCompare(b.organism))
//}

export function LollipopPropsPanel({ ref }: IDivProps) {
  const { displayProps, setDisplayProps, aaColor, setAAColor } =
    useLollipopSettings()

  // const [tabs, setTabs] = useState<string[]>([
  //   'protein',
  //   'plot',
  //   'x-axis',
  //   'y-axis',
  //   'aa',
  // ])

  const [tabs, setTabs] = useState<string[]>(['plot'])

  return (
    <PropsPanel ref={ref} className="pr-1">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel
          minSize="10%"
          defaultSize="30%"
          className="flex flex-col gap-y-2 pb-2"
        >
          <ProteinPanel />
        </ResizablePanel>
        <ThinVResizeHandle />
        <ResizablePanel minSize="10%" defaultSize="70%" collapsible={true}>
          <ScrollAccordion
            value={tabs}
            onValueChange={(v) => setTabs(v as string[])}
            className="grow h-full"
          >
            <AccordionItem value="plot">
              <AccordionTrigger
                rightChildren={
                  <FontPopover
                    fonts={[
                      {
                        title: 'Title',
                        textProps: displayProps.title.text,
                        update: (font) =>
                          setDisplayProps(
                            produce(displayProps, (draft) => {
                              draft.title.text = font
                            })
                          ),
                      },
                    ]}
                  />
                }
              >
                Plot
              </AccordionTrigger>

              <AccordionContent>
                <PropRow title="Width">
                  <NumericalInput
                    id="w"
                    value={displayProps.axes.x.width}
                    limit={[1, 10000]}
                    onNumChange={(v) =>
                      setDisplayProps(
                        produce(displayProps, (draft) => {
                          draft.axes.x.width = v
                        })
                      )
                    }
                  />
                </PropRow>
                <PropRow title="Cell">
                  <NumericalInput
                    id="cell"
                    value={displayProps.grid.cell.w}
                    onNumChange={(v) =>
                      setDisplayProps(
                        produce(displayProps, (draft) => {
                          draft.grid.cell.w = v
                          draft.grid.cell.h = v
                        })
                      )
                    }
                  />
                </PropRow>

                {/* <PropRow title="Spacing">
              <DoubleNumericalInput
                v1={displayProps.grid.spacing.x}
                v2={displayProps.grid.spacing.y}
                dp={0}
                onNumChange1={v =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.spacing.x = v
                    })
                  )
                }
                onNumChange2={v =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.spacing.y = v
                    })
                  )
                }
              />
            </PropRow> */}

                {/* <CheckPropRow
                  title="Title"
                  checked={displayProps.title.text.show}
                  onCheckedChange={state =>
                    setDisplayProps(
                      produce(displayProps, draft => {
                        draft.title.text.show = state
                      })
                    )
                  }
                /> */}

                <CheckPropRow
                  title="Legend"
                  checked={displayProps.legend.show}
                  onCheckedChange={(state) =>
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.legend.show = state
                      })
                    )
                  }
                >
                  <Input
                    w="grow"
                    id="legend-mutations-label"
                    value={displayProps.legend.variants.label}
                    onTextChange={(v) =>
                      setDisplayProps(
                        produce(displayProps, (draft) => {
                          draft.legend.variants.label = v
                        })
                      )
                    }
                  />
                </CheckPropRow>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="x-axis">
              <AccordionTrigger
                rightChildren={
                  <>
                    <FontPopover
                      fonts={[
                        {
                          title: 'Axes Title',
                          textProps: displayProps.axes.title,
                          update: (font) =>
                            setDisplayProps(
                              produce(displayProps, (draft) => {
                                draft.axes.title = font
                              })
                            ),
                        },

                        {
                          title: 'Axes Labels',
                          textProps: displayProps.axes.labels,
                          update: (font) =>
                            setDisplayProps(
                              produce(displayProps, (draft) => {
                                draft.axes.labels = font
                              })
                            ),
                        },
                      ]}
                    />

                    <Switch
                      checked={displayProps.axes.x.show}
                      onCheckedChange={(state) =>
                        setDisplayProps(
                          produce(displayProps, (draft) => {
                            draft.axes.x.show = state
                          })
                        )
                      }
                    />
                  </>
                }
              >
                X-Axis
              </AccordionTrigger>
              <AccordionContent>
                <CheckPropRow
                  className="ml-4"
                  title="Last tick"
                  disabled={!displayProps.axes.x.show}
                  checked={displayProps.axes.x.showEndTick}
                  onCheckedChange={(state) =>
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.axes.x.showEndTick = state
                      })
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="y-axis">
              <AccordionTrigger
                rightChildren={
                  <>
                    <Switch
                      checked={displayProps.axes.y.show}
                      onCheckedChange={(state) =>
                        setDisplayProps(
                          produce(displayProps, (draft) => {
                            draft.axes.y.show = state
                          })
                        )
                      }
                    />
                  </>
                }
              >
                Y-Axis
              </AccordionTrigger>
              <AccordionContent>
                <CheckPropRow
                  title="Tick lines"
                  checked={displayProps.axes.y.ticks.lines.show}
                  onCheckedChange={(state) =>
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.axes.y.ticks.lines.show = state
                      })
                    )
                  }
                />
                <CheckPropRow
                  className="ml-4"
                  title="Zero line"
                  disabled={!displayProps.axes.y.ticks.lines.show}
                  checked={displayProps.axes.y.ticks.lines.showZeroLine}
                  onCheckedChange={(state) =>
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.axes.y.ticks.lines.showZeroLine = state
                      })
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="aa">
              <AccordionTrigger
                rightChildren={
                  <>
                    <FontPopover
                      fonts={[
                        {
                          title: 'Font',
                          textProps: displayProps.seq.text,
                          update: (font) =>
                            setDisplayProps(
                              produce(displayProps, (draft) => {
                                draft.seq.text = font
                              })
                            ),
                        },
                      ]}
                    />
                    <Switch
                      checked={displayProps.seq.show}
                      onCheckedChange={(state) =>
                        setDisplayProps(
                          produce(displayProps, (draft) => {
                            draft.seq.show = state
                          })
                        )
                      }
                    />
                  </>
                }
              >
                Amino Acids
              </AccordionTrigger>

              <AccordionContent>
                <CheckPropRow
                  title="Colors"
                  checked={aaColor.show}
                  onCheckedChange={(state) =>
                    setAAColor(
                      produce(aaColor, (draft) => {
                        draft.show = state
                      })
                    )
                  }
                >
                  <Popover>
                    <PopoverTrigger
                      render={
                        <IconButton
                          size="icon-sm"
                          className="shrink-0"
                          title="Color scheme"
                        >
                          <Palette className="w-4.5 h-4.5" />
                        </IconButton>
                      }
                    />

                    <PopoverContent
                      align="end"
                      className="gap-y-2 w-72"
                      variant="content"
                    >
                      <VCenterRow className="justify-end gap-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button className="shrink-0" title="Presets">
                                <Brush className="w-4 h-4" />
                                <span>Presets</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            {Object.keys(AA_COLOR_SCHEMES)
                              .sort()
                              .map((key) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() =>
                                    setAAColor({
                                      ...aaColor,
                                      scheme:
                                        AA_COLOR_SCHEMES[key as AAColorScheme]!,
                                    })
                                  }
                                >
                                  {key}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </VCenterRow>
                      <VScrollPanel className="h-72">
                        <ul className="flex flex-col pl-2 pr-3 gap-y-2">
                          {AMINO_ACIDS.map((aa, index) => (
                            <li
                              key={index}
                              className="flex flex-row items-center justify-between gap-x-2 border-b border-border/50 pb-2"
                            >
                              <VCenterRow className="shrink-0 gap-x-2">
                                <Label className="shrink-0 w-4 text-center font-bold">
                                  {aa}
                                </Label>
                                <span>
                                  {AMINO_ACID_FULL_NAMES[aa] ?? 'Unknown'}
                                </span>
                              </VCenterRow>
                              <ColorPickerButton
                                colors={[
                                  {
                                    color: aaColor.scheme[aa]!,
                                    onColorChange: (color) =>
                                      setAAColor(
                                        produce(aaColor, (draft) => {
                                          draft.scheme[aa] = color
                                        })
                                      ),
                                  },
                                ]}
                                className={SIMPLE_COLOR_EXT_CLS}
                              />
                            </li>
                          ))}
                        </ul>
                      </VScrollPanel>
                    </PopoverContent>
                  </Popover>
                </CheckPropRow>

                {/* <Select
                value={aaColor.scheme}
                onValueChange={value =>
                  setAAColor(
                    produce(aaColor, draft => {
                      draft.scheme = {...AA_COLOR_SCHEMES[value as AAColorScheme] }
                    })
                  )
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue data-placeholder="Select color scheme..." />
                </SelectTrigger>
                <SelectContent align="end">
                  {Object.keys(AA_COLOR_SCHEMES)
                    .sort()
                    .map((scheme, index) => (
                      <SelectItem key={index} value={scheme}>
                        {scheme}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select> */}

                <CheckPropRow
                  title="Invert"
                  checked={aaColor.invert}
                  onCheckedChange={(state) =>
                    setAAColor(
                      produce(aaColor, (draft) => {
                        draft.invert = state
                      })
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>

            {/* <CollapseBlock title="Variants">
          <VCenterRow className="justify-between gap-x-2">
            <Label className="shrink-0">Multi-mode</Label>
            <Select
              defaultValue={displayProps.multi}
              onValueChange={value => {
                setDisplayProps({
                  ...displayProps,
                  multi: value as MultiMode,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue data-placeholder="Multi mode..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multi">Multi</SelectItem>

                <SelectItem value="equalbar">Equal Bar</SelectItem>
                <SelectItem value="stackedbar">Stacked Bar</SelectItem>
              </SelectContent>
            </Select>
          </VCenterRow>
        </CollapseBlock> */}
          </ScrollAccordion>
        </ResizablePanel>
      </ResizablePanelGroup>
    </PropsPanel>
  )
}
