import { BaseCol } from '@layout/base-col'

import { TEXT_CANCEL } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import type { ISelectionRange } from '@providers/selection-range'

import { DataFrame } from '@lib/dataframe/dataframe'

import { useEffect, useState } from 'react'

import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { API_MOTIF_SEARCH_URL } from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { NA } from '@lib/text/text'
import { useQueryClient } from '@tanstack/react-query'
import { Checkbox } from '@themed/check-box'
import { useHistory } from '../../history/history-store'

export interface IProps {
  open?: boolean
  selection: ISelectionRange
  onConversion: () => void
  onCancel: () => void
}

export function MotifToGeneDialog({
  open = true,
  selection,
  onConversion,
  onCancel,
}: IProps) {
  const queryClient = useQueryClient()

  const [useIndex, setUseIndex] = useState(false)
  const [useColumns, setUseColumns] = useState(false)

  const { sheet, addStep } = useHistory()

  useEffect(() => {
    setUseIndex(selection.start.col === -1)
    setUseColumns(selection.start.col !== -1)
  }, [sheet, selection])

  // const dbQuery = useQuery({
  //   queryKey: ["database"],
  //   queryFn: async () => {
  //     const res = await axios.get("/data/modules/motifs/motif_to_gene.json")

  //     return res.data
  //   },
  // })

  //console.log(dbQuery)

  async function convert() {
    if (!sheet || sheet.size === 0) {
      return
    }
    try {
      // const res = await queryClient.fetchQuery("database", async () => {
      //   return axios.get("/data/modules/motifs/motif_to_gene.json")
      // })

      let rename: string[]

      if (useIndex) {
        // convert index
        rename = sheet.index.strs
      } else {
        rename = sheet.col(useColumns ? selection.start.col : 0)!.strs
      }

      const table: SeriesData[][] = []

      for (const [ri, row] of sheet.values.entries()) {
        const id = rename[ri] ?? NA

        const res = await queryClient.fetchQuery({
          queryKey: ['motiftogene'],
          queryFn: () =>
            httpFetch.postJson<{ data: { motifs: { genes: string[] }[] } }>(
              API_MOTIF_SEARCH_URL,
              {
                body: {
                  search: id,
                  reverse: false,
                  complement: false,
                },
              }
            ),
        })

        const data = res.data

        const genes = new Set<string>()

        // for every entry, get all the gesns and assemble into a set
        for (const motif of data.motifs) {
          for (const gene of motif.genes) {
            genes.add(gene)
          }
        }

        //if (data[ri].conversions.length > 0) {
        //  id = data[ri].conversions[0].genes.join("|")
        //}

        table.push(row.concat([...genes].sort().join(',')))
      }

      const header: string[] = sheet.colNames.concat(['Motif to gene'])

      const df_out = new DataFrame({
        data: table,
        index: sheet.index,
        columns: header,
      })

      addStep('Motif to gene', [df_out.setName('Motif to gene')])
    } catch (error) {
      console.log(error)
    }

    onConversion?.()
  }

  return (
    <OKCancelDialog
      open={open}
      title="Motif To Gene"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          convert()
        }
      }}
      className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <BaseCol className="gap-y-2 text-sm">
        <BaseCol className="gap-y-1">
          <Checkbox checked={useIndex} onCheckedChange={setUseIndex}>
            Convert index
          </Checkbox>

          <Checkbox checked={useColumns} onCheckedChange={setUseColumns}>
            Convert selected column
          </Checkbox>
        </BaseCol>
      </BaseCol>
    </OKCancelDialog>
  )
}
