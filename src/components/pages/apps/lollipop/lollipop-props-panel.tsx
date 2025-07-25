import { VCenterRow } from '@layout/v-center-row'

import { Input } from '@themed/input'

import { useContext, useState } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { PropRow } from '@/components/dialog/prop-row'
import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/accordion'
import { Button } from '@/components/shadcn/ui/themed/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/dropdown-menu'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Label } from '@/components/shadcn/ui/themed/label'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/popover'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import { VScrollPanel } from '@/components/v-scroll-panel'
import type { IDivProps } from '@/interfaces/div-props'
import { PropsPanel } from '@components/props-panel'
import { produce } from 'immer'
import { Brush, Palette } from 'lucide-react'
import {
  AA_COLOR_SCHEMES,
  AMINO_ACID_FULL_NAMES,
  AMINO_ACIDS,
  toAA,
  type AAColorScheme,
} from './amino-acids'
import { useLollipopSettings } from './lollipop-settings-store'

import { LollipopContext } from './lollipop-provider'

// export async function searchUniprot(
//   gene: string,
//   max: number = 5
// ): Promise<IProtein[]> {
//   gene = gene.replace(/[Pp]rotein/, '')
//   gene = gene.trim()
//   gene = gene.split(' ')[0]! // take the first word

//   const query = `gene:${gene} AND reviewed:true`
//   const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=${max}&fields=accession,gene_primary,protein_name,organism_name`

//   console.log(url)

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

//   //console.log('r', res.results)

//   const ret: IProtein[] = []

//   for (const p of res.results) {
//     //const gene = data.genes[0].geneName.value
//     const accession = p.primaryAccession
//     const name = p.proteinDescription.recommendedName.fullName.value

//     const organism = p.organism.commonName
//     const taxonId = p.organism.taxonId

//     const officialGeneName = p.genes[0]?.geneName.value ?? gene

//     console.log(officialGeneName, accession, name)

//     // now get the sequence

//     res = await queryClient.fetchQuery({
//       queryKey: ['uniprot-accession', accession],
//       queryFn: () =>
//         httpFetch.getJson<{ sequence: { value: string } }>(
//           `https://rest.uniprot.org/uniprotkb/${accession}.json`
//         ),
//     })

//     console.log(res)

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

export function ProteinPanel() {
  //const { protein, setProtein } = useLollipopSettings()

  const { protein, setProtein } = useContext(LollipopContext)!

  // const { step } = useHistory()

  // const [search, setSearch] = useState<string>('')

  // const [searchProteins, setSearchProteins] = useState<IProtein[]>([])

  // useEffect(() => {
  //   setSearch(protein.gene)
  // }, [protein])

  // useEffect(() => {
  //   searchForProtein(protein.name)
  // }, [])

  // async function searchForProtein(query: string) {
  //   if (query.length > 1) {
  //     try {
  //       console.log('Searching UniProt for:', query)
  //       const proteins = await searchUniprot(query)

  //       setSearchProteins(proteins)
  //     } catch (e) {
  //       console.log(e)
  //     }
  //   }
  // }

  // function lollipopPlot() {
  //   console.log('lollipopPlot')
  //   const mutDf = findSheet(step!, 'Mutations')

  //   if (!mutDf) {
  //     console.warn('No mutations data frame found')
  //     return
  //   }

  //   const errors = lollipopFromTable(mutDf, protein)

  //   if (errors.length > 0) {
  //     //console.warn('Errors found while parsing lollipop data:', errors)

  //     toast({
  //       title:
  //         'Errors were found while parsing the mutation data, but they were ignored',
  //       description: [...new Set(errors)].sort().slice(0, 4).join(',') + '...',
  //       variant: 'warning',
  //     })
  //     return
  //   }
  // }

  return (
    <>
      {/* <VCenterRow className="gap-x-2">
          <Autocomplete
            placeholder={TEXT_NAME}
            value={search}
            onTextChange={v => {
              console.log('Setting protein name:', v)
              setSearch(v)
            }}
            onTextChanged={v => {
              console.log('Searching for protein:', v)

              searchForProtein(v)
            }}
            aria-label="Protein name"
            className="grow"
          >
            {searchProteins.map((searchProtein, pi) => {
              return (
                <li key={pi}>
                  <button
                    className="justify-start text-left grow hover:bg-muted/50 p-2 w-full"
                    onClick={() => {
                      setProtein(searchProtein)

                      setSearchProteins([]) // clear search results
                    }}
                    aria-label={`Select ${searchProtein.name}`}
                  >
                    <span className="block font-bold">
                      {searchProtein.gene} ({searchProtein.sequence.length} aa)
                    </span>
                    <span className="block text-foreground/50">
                      {`${searchProtein.accession}, ${searchProtein.organism}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </Autocomplete>
        </VCenterRow> */}

      <Textarea
        id="seq"
        placeholder="Sequence"
        aria-label="Protein sequence"
        value={protein.sequence}
        onTextChange={v => {
          console.log('Setting protein sequence:', v)

          const p = produce(protein, draft => {
            draft.sequence = toAA(v[0]!)
          })

          setProtein(p)

          //setContextProtein(p)
        }}
        className="h-24"
      />

      <span className="text-foreground/50">
        Sequence length: {protein.sequence.length ?? 0}
      </span>

      {/* <VCenterRow className="mt-4">
        <Button variant="theme" onClick={() => lollipopPlot()}>
          Lollipop
        </Button>
      </VCenterRow> */}
    </>
  )
}

export function LollipopPropsPanel({ ref }: IDivProps) {
  const { displayProps, setDisplayProps, aaColor, setAAColor } =
    useLollipopSettings()

  const [tabs, setTabs] = useState<string[]>([
    'protein',
    'plot',
    'x-axis',
    'y-axis',
    'aa',
  ])

  return (
    <PropsPanel ref={ref}>
      {/* <h2 className={PROPS_TITLE_CLS}>Settings</h2> */}

      <ScrollAccordion value={tabs} onValueChange={setTabs}>
        <AccordionItem value="protein">
          <AccordionTrigger>Protein</AccordionTrigger>

          <AccordionContent>
            <ProteinPanel />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>

          <AccordionContent>
            <PropRow title="Width">
              <NumericalInput
                id="w"
                value={displayProps.axes.x.width}
                limit={[1, 10000]}
                //w="w-14"
                onNumChange={v =>
                  setDisplayProps(
                    produce(displayProps, draft => {
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
                w="w-14"
                onNumChange={v =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.cell.w = v
                      draft.grid.cell.h = v
                    })
                  )
                }
              />
            </PropRow>

            {/* <PropRow title="Spacing">
              <DoubleNumericalInput
                w="w-14"
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

            <SwitchPropRow
              title="Title"
              checked={displayProps.title.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.title.show = state
                  })
                )
              }
            />

            <SwitchPropRow
              title="Legend"
              checked={displayProps.legend.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.legend.show = state
                  })
                )
              }
            >
              <Input
                id="legend-mutations-label"
                value={displayProps.legend.mutations.label}
                className="w-full rounded-theme"
                onTextChange={v =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.legend.mutations.label = v
                    })
                  )
                }
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="x-axis">
          <AccordionTrigger>X-Axis</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.axes.x.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.axes.x.show = state
                  })
                )
              }
            />
            <SwitchPropRow
              className="ml-3"
              title="Last X-Tick"
              disabled={!displayProps.axes.x.show}
              checked={displayProps.axes.x.showEndTick}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.axes.x.showEndTick = state
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="y-axis">
          <AccordionTrigger>Y-Axis</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.axes.y.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.axes.y.show = state
                  })
                )
              }
            />
            <SwitchPropRow
              title="Y-Tick Lines"
              checked={displayProps.axes.y.ticks.lines.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.axes.y.ticks.lines.show = state
                  })
                )
              }
            />
            <SwitchPropRow
              className="ml-3"
              title="Y-Tick Zero Line"
              disabled={!displayProps.axes.y.ticks.lines.show}
              checked={displayProps.axes.y.ticks.lines.showZeroLine}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.axes.y.ticks.lines.showZeroLine = state
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="aa">
          <AccordionTrigger>Amino Acids</AccordionTrigger>

          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.seq.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.seq.show = state
                  })
                )
              }
            />

            <SwitchPropRow
              title="Colors"
              checked={aaColor.show}
              onCheckedChange={state =>
                setAAColor(
                  produce(aaColor, draft => {
                    draft.show = state
                  })
                )
              }
            >
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton
                    size="icon-sm"
                    className="shrink-0"
                    title="Color scheme"
                  >
                    <Palette className="w-4.5 h-4.5" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="gap-y-2 w-72"
                  variant="content"
                >
                  <VCenterRow className="justify-end gap-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="shrink-0" title="Presets">
                          <Brush className="w-4 h-4" />
                          <span>Presets</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {Object.keys(AA_COLOR_SCHEMES)
                          .sort()
                          .map(key => (
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
                            color={aaColor.scheme[aa]!}
                            onColorChange={color =>
                              setAAColor(
                                produce(aaColor, draft => {
                                  draft.scheme[aa] = color
                                })
                              )
                            }
                            className={SIMPLE_COLOR_EXT_CLS}
                          />
                        </li>
                      ))}
                    </ul>
                  </VScrollPanel>
                </PopoverContent>
              </Popover>
            </SwitchPropRow>

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
                  <SelectValue placeholder="Select color scheme..." />
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

            <SwitchPropRow
              title="Invert"
              checked={aaColor.invert}
              onCheckedChange={state =>
                setAAColor(
                  produce(aaColor, draft => {
                    draft.invert = state
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* <CollapseBlock title="Mutations">
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
                <SelectValue placeholder="Multi mode..." />
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
    </PropsPanel>
  )
}
