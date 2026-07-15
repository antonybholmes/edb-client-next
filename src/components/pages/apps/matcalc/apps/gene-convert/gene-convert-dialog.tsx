import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { useSelectionRange } from '@/providers/selection-range-provider'

import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'

import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { createGeneConvTable, type Species } from '@/lib/gene/geneconv'
import { produce } from 'immer'
import { Rat, User } from 'lucide-react'
import { useEffect } from 'react'

import {
  ActionCheckRow,
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { useHistory } from '../../history/history-provider/history-provider'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

// const OUTPUT_TYPES = [
//   { name: 'Symbol' },
//   { name: 'Entrez' },
//   { name: 'RefSeq' },
//   { name: 'Ensembl' },
// ]

export interface IProps extends IModalProps<BaseDataFrame> {}

export function GeneConvertDialog({ onResponse }: IModalProps<BaseDataFrame>) {
  const { settings, updateSettings } = useMatcalcSettings()

  const { selection } = useSelectionRange()

  //const [outputSymbols, setOutputSymbols] = useState("Symbol")
  //const [useIndex, setUseIndex] = useState(false)
  //const [useColumns, setUseColumns] = useState(false)
  //const [delimiter, setDelimiter] = useState(" /// ")

  //const [duplicate, setDuplicate] = useState(false)

  const { addSheets } = useHistory()

  const { sheets } = useCurrentSheets()

  const df = sheets[0] as AnnotationDataFrame

  useEffect(() => {
    if (!selection) {
      return
    }

    updateSettings(
      produce(settings, (draft) => {
        //draft.apps.geneconv.convertIndex = !selection.cols
        draft.apps.geneconv.useSelectedColumns = !!selection.cols
      })
    )
  }, [selection])

  async function convert() {
    if (!df || df.size === 0) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    //   const token = await loadAccessToken()

    // if (!token) {
    //   return null
    // }

    //const conv = mouseToHuman ? ["mouse", "human"] : ["human", "mouse"]
    //const output = outputSymbols ? "symbols" : "entrez"
    //const f = `/modules/mouse_human/${conv}_${output}.json.gz`

    //const data = await fetchJson(f)

    const exact = true

    try {
      // let searches: string[]

      // if (settings.apps.geneconv.convertIndex) {
      //   // convert index
      //   searches = df.index.strs
      //   //range(df.shape[0]).map(i => {
      //   //   const g = df.index.getName(i)

      //   //   if (g in data) {
      //   //     return data[g].join(delimiter)
      //   //   } else {
      //   //     return "----"
      //   //   }
      //   // })
      // } else {
      //   const col =
      //     settings.apps.geneconv.useSelectedColumns &&
      //     selection &&
      //     selection.cols
      //       ? selection.cols.start
      //       : 0
      //   searches = df.col(col)!.strs
      // }

      const dfOut = await createGeneConvTable(df, {
        fromSpecies: settings.apps.geneconv.fromSpecies,
        toSpecies: settings.apps.geneconv.toSpecies,
        exact,
      })

      //return new DataFrame({ data: table, columns: header })

      const outName = `${settings.apps.geneconv.fromSpecies} to ${settings.apps.geneconv.toSpecies}`

      dfOut.setName(outName, true)

      // if (settings.apps.geneConvert.duplicateRows) {
      //   const d: SeriesData[][] = []

      //   const idCol = dfOut
      //     .col(settings.apps.geneConvert.toSpecies)!
      //     .values.map(v => v.toString())

      //   let columns = dfOut.columns
      //   if (settings.apps.geneConvert.convertIndex) {
      //     columns = ['', ...columns]
      //   }

      //   for (const rowid of range(dfOut.shape[0])) {
      //     const ids = idCol[rowid]!.split(settings.apps.geneConvert.delimiter)

      //     let origRow = dfOut.row(rowid)!.values

      //     if (settings.apps.geneConvert.convertIndex) {
      //       origRow = [dfOut.rowName(rowid), ...origRow]
      //     }

      //     for (const id of ids) {
      //       // copy row
      //       const rc = origRow.slice()
      //       rc[rc.length - 1] = id

      //       d.push(rc)
      //     }
      //   }

      //   dfOut = new DataFrame({ data: d, columns }).setName(outName)
      // }

      addSheets([dfOut], { name: outName })

      onResponse?.(TEXT_OK, dfOut)
    } catch (error) {
      onResponse?.(TEXT_CANCEL)
    }
  }

  return (
    <OKCancelDialog
      title="Gene Conversion"
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(TEXT_CANCEL)
        } else {
          convert()
        }
      }}
      //contentVariant="glass"
      //bodyVariant="card"
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title="Species">
            <VCenterRow className="gap-x-3">
              <VCenterRow className="gap-x-2">
                <ToggleGroup
                  className="gap-x-1"
                  value={[settings.apps.geneconv.fromSpecies]}
                  onValueChange={(value) =>
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.geneconv.fromSpecies = value[0]! as Species
                      })
                    )
                  }
                  variant="outline"
                  rounded="lg"
                >
                  <GroupToggle
                    value="human"
                    aria-label="Toggle human"
                    //className="flex flex-col gap-y-2 items-center"
                    size="colorful"
                    className="flex-col"
                  >
                    <User
                      className="w-6 h-6 aspect-square shrink-0"
                      strokeWidth={1.5}
                    />
                    <span>Human</span>
                  </GroupToggle>
                  <GroupToggle
                    value="mouse"
                    aria-label="Toggle mouse"
                    size="colorful"
                    className="flex-col"
                  >
                    <Rat
                      className="w-6 h-6 aspect-square shrink-0"
                      strokeWidth={1.5}
                    />
                    <span>Mouse</span>
                  </GroupToggle>
                </ToggleGroup>
              </VCenterRow>
            </VCenterRow>

            <VCenterRow className="gap-x-3">
              <h2 className="font-semibold text-center">To</h2>
              <VCenterRow className="gap-x-2">
                <ToggleGroup
                  className="gap-x-1"
                  value={[settings.apps.geneconv.toSpecies]}
                  onValueChange={(value) =>
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.geneconv.toSpecies = value[0]! as Species
                      })
                    )
                  }
                  variant="outline"
                  rounded="lg"
                >
                  <GroupToggle
                    value="human"
                    aria-label="Toggle human"
                    //className="flex flex-col gap-y-2 items-center"
                    size="colorful"
                    className="flex-col"
                  >
                    <User
                      className="w-6 h-6 aspect-square shrink-0"
                      strokeWidth={1.5}
                    />
                    <span>Human</span>
                  </GroupToggle>
                  <GroupToggle
                    value="mouse"
                    aria-label="Toggle mouse"
                    size="colorful"
                    className="flex-col"
                  >
                    <Rat
                      className="w-6 h-6 aspect-square shrink-0"
                      strokeWidth={1.5}
                    />
                    <span>Mouse</span>
                  </GroupToggle>
                </ToggleGroup>
              </VCenterRow>
            </VCenterRow>
          </ActionDialogRow>

          <ActionCheckRow
            checked={settings.apps.geneconv.convertIndex}
            onCheckedChange={(v) =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.apps.geneconv.convertIndex = v
                })
              )
            }
            title="Convert index"
          />

          <ActionCheckRow
            checked={settings.apps.geneconv.useSelectedColumns}
            onCheckedChange={(v) =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.apps.geneconv.useSelectedColumns = v
                })
              )
            }
            title="Convert selected columns only"
          />

          {/* <Checkbox
                checked={settings.apps.geneconv.duplicateRows}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.geneconv.duplicateRows = v
                    })
                  )
                }
              >
                Duplicate rows for multiple conversions
              </Checkbox> */}
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
