import { BaseCol } from '@layout/base-col'

import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { Input } from '@themed/input'

import { TEXT_CANCEL } from '@/consts'
import { ToggleButtonTriggers, ToggleButtons } from '@components/toggle-buttons'
import { VCenterRow } from '@layout/v-center-row'
import type { ISelectionRange } from '@providers/selection-range'
import { Label } from '@themed/label'
import { RadioGroup, RadioGroupItem } from '@themed/radio-group'

import { DataFrame } from '@lib/dataframe/dataframe'
import { API_GENECONV_URL } from '@lib/edb/edb'
import { NA } from '@lib/text/text'

import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { httpFetch } from '@lib/http/http-fetch'
import { range } from '@lib/math/range'
import { useQueryClient } from '@tanstack/react-query'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@themed/accordion'
import { Checkbox } from '@themed/check-box'
import { produce } from 'immer'
import { useEffect } from 'react'
import { useCurrentSheet, useHistory } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

const OUTPUT_TYPES = [
  { name: 'Symbol' },
  { name: 'Entrez' },
  { name: 'RefSeq' },
  { name: 'Ensembl' },
]

export interface IProps {
  open?: boolean
  //df: BaseDataFrame | null
  selection: ISelectionRange
  onConversion: () => void
  onCancel?: () => void
}

export function GeneConvertDialog({
  open = true,
  //df,
  selection,
  onConversion,
  onCancel,
}: IProps) {
  const queryClient = useQueryClient()

  const { settings, updateSettings } = useMatcalcSettings()

  //const [outputSymbols, setOutputSymbols] = useState("Symbol")
  //const [useIndex, setUseIndex] = useState(false)
  //const [useColumns, setUseColumns] = useState(false)
  //const [delimiter, setDelimiter] = useState(" /// ")

  //const [duplicate, setDuplicate] = useState(false)
  const { addStep } = useHistory()

  const sheet = useCurrentSheet()

  useEffect(() => {
    updateSettings(
      produce(settings, draft => {
        draft.apps.geneConvert.convertIndex = selection.start.col === -1
        draft.apps.geneConvert.useSelectedColumns = selection.start.col !== -1
      })
    )
  }, [sheet, selection])

  async function convert() {
    if (!sheet! || sheet.size === 0) {
      return
    }

    //   const token = await loadAccessToken()

    // if (!token) {
    //   return null
    // }

    //const conv = mouseToHuman ? ["mouse", "human"] : ["human", "mouse"]
    //const output = outputSymbols ? "symbols" : "entrez"
    //const f = `/modules/mouse_human/${conv}_${output}.json.gz`
    //console.log(f)
    //const data = await fetchJson(f)

    const exact = true

    try {
      let searches: string[]

      if (settings.apps.geneConvert.convertIndex) {
        // convert index
        searches = sheet!.index.strs
        //range(df.shape[0]).map(i => {
        //   const g = df.index.getName(i)

        //   if (g in data) {
        //     return data[g].join(delimiter)
        //   } else {
        //     return "----"
        //   }
        // })
      } else {
        searches = sheet!.col(
          settings.apps.geneConvert.useSelectedColumns ? selection.start.col : 0
        )!.strs
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['geneconvert'],
        queryFn: () =>
          httpFetch.postJson<{
            data:
              | {
                  conversions: {
                    entrez: string
                    refseq: string[]
                    ensembl: string[]
                    symbol: string
                  }[][]
                }
              | {
                  entrez: string
                  refseq: string[]
                  ensembl: string[]
                  symbol: string
                }[][]
          }>(
            `${API_GENECONV_URL}/convert/${settings.apps.geneConvert.fromSpecies.toLowerCase()}/${settings.apps.geneConvert.toSpecies.toLowerCase()}`,
            {
              body: {
                searches,
                exact,
              },
            }
          ),
      })

      let data: {
        entrez: string
        refseq: string[]
        ensembl: string[]
        symbol: string
      }[][]

      // conversions store data in conversions entry,
      // but the entries are the same as for gene info
      // so we can just step 1 deeper into structure
      // and continue as normal
      if (
        settings.apps.geneConvert.fromSpecies !=
        settings.apps.geneConvert.toSpecies
      ) {
        data = (
          res.data as {
            conversions: {
              entrez: string
              refseq: string[]
              ensembl: string[]
              symbol: string
            }[][]
          }
        ).conversions
      } else {
        data = res.data as {
          entrez: string
          refseq: string[]
          ensembl: string[]
          symbol: string
        }[][]
      }

      const rename: string[] = []

      for (const [ri] of searches.entries()) {
        const conv = data[ri]!

        // let symbol = ""
        // let entrez = -1
        // let refseq = ""
        // let ensembl = ""

        // if (conv.genes.length > 0) {
        //   symbol = conv.genes[0].symbol
        //   entrez = conv.genes[0].entrez
        //   refseq = conv.genes[0].refseq.join("|")
        //   ensembl = conv.genes[0].ensembl.join("|")
        // }
        if (conv.length > 0) {
          switch (settings.apps.geneConvert.outputSymbols) {
            case 'Entrez':
              rename.push(conv[0]!.entrez)
              break
            case 'RefSeq':
              rename.push(
                conv[0]!.refseq.join(settings.apps.geneConvert.delimiter)
              )
              break
            case 'Ensembl':
              rename.push(
                conv[0]!.ensembl.join(settings.apps.geneConvert.delimiter)
              )
              break
            default:
              rename.push(conv[0]!.symbol)
              break
          }
        } else {
          //table.push(row.concat(symbol, entrez, refseq, ensembl))

          rename.push(NA)
        }
      }

      //return new DataFrame({ data: table, columns: header })

      const outName = `${settings.apps.geneConvert.fromSpecies} to ${settings.apps.geneConvert.toSpecies}`

      let df_out = sheet!
        .copy()
        .setName(outName)
        .setCol(settings.apps.geneConvert.toSpecies, rename, true)

      if (settings.apps.geneConvert.duplicateRows) {
        const d: SeriesData[][] = []

        const idCol = df_out
          .col(settings.apps.geneConvert.toSpecies)!
          .values.map(v => v.toString())
        console.log(idCol)

        let columns = df_out.columns.values
        if (settings.apps.geneConvert.convertIndex) {
          columns = ['', ...columns]
        }

        for (const rowid of range(df_out.shape[0])) {
          const ids = idCol[rowid]!.split(settings.apps.geneConvert.delimiter)

          let origRow = df_out.row(rowid)!.values

          if (settings.apps.geneConvert.convertIndex) {
            origRow = [df_out.rowName(rowid), ...origRow]
          }

          for (const id of ids) {
            // copy row
            const rc = origRow.slice()
            rc[rc.length - 1] = id

            d.push(rc)
          }
        }
        console.log(df_out.columns)

        df_out = new DataFrame({ data: d, columns }).setName(outName)
      }

      addStep(outName, [df_out])

      //data.push(row.concat([dj.data.dna]))
    } catch (error) {
      console.log(error)
    }

    onConversion?.()
  }

  return (
    <OKCancelDialog
      open={open}
      title="Gene Conversion"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel?.()
        } else {
          convert()
        }
      }}
      contentVariant="glass"
      bodyVariant="card"
    >
      <Accordion type="multiple" defaultValue={['species', 'output', 'input']}>
        <AccordionItem
          value="species"
          //className="bg-background p-2 rounded-lg mb-4"
        >
          <AccordionTrigger variant="settings">Species</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <VCenterRow className="gap-x-4">
              <VCenterRow className="gap-x-2">
                <span>From</span>
                <ToggleButtons
                  className="rounded-theme overflow-hidden"
                  tabs={[{ id: 'Human' }, { id: 'Mouse' }]}
                  value={settings.apps.geneConvert.fromSpecies}
                  onTabChange={selectedTab => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.apps.geneConvert.fromSpecies = selectedTab.tab.id
                      })
                    )
                  }}
                >
                  <ToggleButtonTriggers variant="tab" />
                </ToggleButtons>
              </VCenterRow>
              <VCenterRow className="gap-x-2">
                <span>To</span>
                <ToggleButtons
                  className="rounded-theme overflow-hidden"
                  tabs={[{ id: 'Human' }, { id: 'Mouse' }]}
                  value={settings.apps.geneConvert.toSpecies}
                  onTabChange={selectedTab => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.apps.geneConvert.toSpecies = selectedTab.tab.id
                      })
                    )
                  }}
                >
                  <ToggleButtonTriggers variant="tab" />
                </ToggleButtons>
              </VCenterRow>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="output"
          //className="bg-background p-2 rounded-lg mb-4"
        >
          <AccordionTrigger variant="settings">Output</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            {/* <ToggleButtons
            tabs={OUTPUT_TYPES}
            value={outputSymbols}
            onValueChange={setOutputSymbols}
          /> */}

            <RadioGroup
              value={settings.apps.geneConvert.outputSymbols}
              onValueChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.apps.geneConvert.outputSymbols = v
                  })
                )
              }}
              className="flex flex-col gap-y-1"
            >
              {OUTPUT_TYPES.map((tab, ti) => (
                <VCenterRow key={ti} className="gap-x-1.5">
                  <RadioGroupItem
                    value={tab.name}
                    //onClick={() => setAssembly(assembly)}
                  />
                  <Label htmlFor={tab.name}>{tab.name}</Label>
                </VCenterRow>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="input">
          <AccordionTrigger variant="settings">Input</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <VCenterRow>
              <span className="w-28">Delimiter</span>
              <Input
                value={settings.apps.geneConvert.delimiter}
                onChange={e => {
                  //console.log(index, e.target.value)

                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.geneConvert.delimiter = e.target.value
                    })
                  )
                }}
                className="w-24 rounded-theme"
                placeholder="Delimiter..."
              />
            </VCenterRow>
            <BaseCol className="gap-y-1">
              <Checkbox
                checked={settings.apps.geneConvert.convertIndex}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.geneConvert.convertIndex = v
                    })
                  )
                }
              >
                Convert index
              </Checkbox>

              <Checkbox
                checked={settings.apps.geneConvert.useSelectedColumns}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.geneConvert.useSelectedColumns = v
                    })
                  )
                }
              >
                Convert selected column
              </Checkbox>

              <Checkbox
                checked={settings.apps.geneConvert.duplicateRows}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.geneConvert.duplicateRows = v
                    })
                  )
                }
              >
                Duplicate rows for multiple conversions
              </Checkbox>
            </BaseCol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
