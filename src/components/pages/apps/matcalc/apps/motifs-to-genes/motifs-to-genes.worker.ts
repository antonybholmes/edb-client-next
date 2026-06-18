// workers need relative paths to import modules
import { API_MOTIF_TO_GENES_URL } from '../../../../../../lib/edb/edb'
import { httpFetch } from '../../../../../../lib/http/http-fetch'

const PAGE_SIZE = 100

export interface IMotifsToGenesWorkerMessage {
  ids: string[]
  pageSize?: number
}

export interface IMotifToGene {
  q: string
  genes: string[]
}

export interface IMotifsToGenesResults {
  genes: IMotifToGene[]
}

self.onmessage = async function (e: MessageEvent<IMotifsToGenesWorkerMessage>) {
  const { ids, pageSize = PAGE_SIZE } = e.data

  const genes: IMotifToGene[] = []

  // split into pages to avoid overloading the server. Note that
  // server has its own internal limits, so even if you send a large batch, it may not return all results.

  let idx = 0

  while (idx < ids.length) {
    // Attempt to annotate a batch of locations. The server may return fewer results than requested,
    // so we increment the index by the actual number of records returned to avoid skipping records.
    const pageIds = ids.slice(idx, idx + pageSize)

    console.log('annotating page', idx, pageIds.length)

    const res = await httpFetch.postJson<{
      data: IMotifToGene[]
    }>(API_MOTIF_TO_GENES_URL, {
      body: {
        ids: pageIds,
      },
    })

    const data = res.data

    genes.push(...data)

    // increment by the actual number of records returned, not the page size,
    // to avoid skipping records if server returns less than requested
    idx += data.length

    break
  }

  self.postMessage({ genes } as IMotifsToGenesResults)
}
