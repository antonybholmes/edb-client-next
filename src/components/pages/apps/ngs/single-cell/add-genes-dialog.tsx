import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { produce } from 'immer'

//import { API_SCRNA_SEARCH_GENES_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { API_SCRNA_DATASETS_URL } from '@/components/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { truncate } from '@/lib/text/text'
import { queryClient } from '@/qcp'
import { Textarea } from '@/themed/textarea'
import { Checkbox } from '@/themed/v2/check-box'
import { useState } from 'react'

import { usePlotGrid, type PlotMode } from './plot-grid-store'
import {
  useSingleCellSettings,
  type IGeneSet,
  type IScrnaGene,
} from './single-cell-settings'

export function AddGenesDialog({ onResponse }: IModalProps) {
  const { settings, updateSettings } = useSingleCellSettings()
  const { fetchAccessToken } = useEdbAuth()

  const [text, setText] = useState('')
  const [makeSignature, setMakeSignature] = useState(false)

  const { dataset } = usePlotGrid()

  async function search() {
    const ids = textToLines(text, { trim: true, splitOnPunctuation: true })

    // if signature, put all genes into one geneset
    // else, make one geneset per gene
    const signatures = makeSignature ? [ids] : ids.map((id) => [id])

    const genesets: IGeneSet[] = []

    // attempt to look up each id of each signature
    for (const sig of signatures) {
      const newGenes: IScrnaGene[] = []

      for (const id of sig) {
        const res = await queryClient.fetchQuery({
          queryKey: ['genes', dataset?.id, id],
          queryFn: async () => {
            const accessToken = await fetchAccessToken()

            if (!accessToken) {
              return []
            }

            const res = await httpFetch.getJson<{ data: IScrnaGene[] }>(
              `${API_SCRNA_DATASETS_URL}/${dataset?.id}/genes?q=${encodeURIComponent(id)}`,

              { headers: bearerHeaders(accessToken) }
            )

            return res.data
          },
        })

        const genes: IScrnaGene[] = res

        newGenes.push(...genes)
      }

      // if we found genes for this signature, make a geneset
      if (newGenes.length > 0) {
        const geneset = {
          id: makeUuid(),
          name: truncate(newGenes.map((g) => g.geneSymbol).join(',')),
          genes: newGenes,
          mode: settings.gex.useGlobalRange
            ? 'global-gex'
            : ('gex' as PlotMode),
        }

        genesets.push(geneset)
      }
    }

    if (genesets.length > 0) {
      updateSettings(
        produce(settings, (draft) => {
          draft.genesets.push(...genesets)
        })
      )
    }

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  return (
    <OKCancelDialog
      open={true}
      title="Add gene plots"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          search()
        }

        onResponse?.(r)
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"

      //headerStyle={{ color }}
      // headerChildren={
      //   <VCenterRow className="gap-x-1 bg-foreground/50 text-background rounded-full text-xs px-3 py-1.5 hidden xl:flex">
      //     <span className="text-nowrap shrink-0">Id</span>
      //     <span className="truncate">{group?.id}</span>
      //   </VCenterRow>
      // }
      leftFooterChildren={
        <Checkbox checked={makeSignature} onCheckedChange={setMakeSignature}>
          Gene signature
        </Checkbox>
      }
      //contentVariant="glass"
      //bodyVariant="card"
      //headerVariant="opaque"
      //bodyVariant="default"
      //footerVariant="default"
      bodyCls="gap-y-4"
    >
      <Textarea
        id="filter"
        aria-label="Filter"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="=aicda"
        className="h-32"
      />
    </OKCancelDialog>
  )
}
