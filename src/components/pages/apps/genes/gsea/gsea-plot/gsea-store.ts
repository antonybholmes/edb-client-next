import { useDialogs } from '@/components/dialogs/dialogs'
import type { IBinaryFileOpen } from '@/components/pages/open-files'
import { makeUuid } from '@/lib/id'
import { textToTokens } from '@/lib/text/lines'
import { unzipSync } from 'fflate'

import { IDBEntity } from '@/interfaces/db-entity'
import { IRankedGene } from '@/lib/gsea/geneset'
import { useMemo } from 'react'
import { create } from 'zustand'
import { useGseaSettings } from './gsea-settings-store'

export const MAX_NEG_LOG10_P = 50

/**
 * Represents a gene set in the GSEA report.
 */
export interface IGseaTableResult extends IDBEntity {
  phen: string
  size: number
  nes: number
  q: number
  log10q: number
  maxRank: number
}

export interface IGseaBubble extends IDBEntity {
  genesets: IGseaTableResult[]
  nes: { label: string }
  size: { label: string }
  log10q: { label: string }
}

export interface IGseaResult {
  name: string
  es: IRankedGene[]
}

export interface IGseaStore {
  phenotypes: string[]
  rankedGenes: IRankedGene[]
  searchResults: IGseaTableResult[]
  reportsMap: Record<string, IGseaTableResult[]>
  geneSetsInUse: Record<string, boolean>
  resultsMap: Record<string, IGseaResult>
  allReports: IGseaTableResult[]
  //reports: IGseaGeneSet[]
  allowSelectAll: boolean
  phenotypesFilter: Record<string, boolean>
  // ids of reports in manually dragged order; empty means natural order
  reportOrder: string[]

  setGeneSetsInUse: (geneSetsInUse: Record<string, boolean>) => void
  setAllowSelectAll: (allowSelectAll: boolean) => void
  setPhenotypesFilter: (phenotypesFilter: Record<string, boolean>) => void
  setReportOrder: (reportOrder: string[]) => void
  loadGseaZip: (files: IBinaryFileOpen[]) => Promise<void>
}

/**
 * For plotting purposes, we often need to convert the q-value to -log10(q) for visualization.
 * This function takes a q-value and returns its -log10 transformation.
 * If the q-value is 0 or negative, it returns a predefined maximum value to avoid issues with
 * logarithmic calculations.
 *
 * @param q
 * @returns
 */
export function getGseaLog10q(q: number): number {
  return q > 0 ? -Math.log10(q) : MAX_NEG_LOG10_P
}

export const useGseaStore = create<IGseaStore>()((set) => ({
  phenotypes: [],
  rankedGenes: [],
  searchResults: [],
  reportsMap: {},
  geneSetsInUse: {},
  resultsMap: {},
  allReports: [],
  //reports: [],
  allowSelectAll: false,
  phenotypesFilter: {},
  reportOrder: [],

  setGeneSetsInUse: (geneSetsInUse: Record<string, boolean>) =>
    set({ geneSetsInUse }),

  //setReports: (reports: IGseaGeneSet[]) => set({ reports }),

  setAllowSelectAll: (allowSelectAll: boolean) => set({ allowSelectAll }),

  setPhenotypesFilter: (phenotypesFilter: Record<string, boolean>) =>
    set({ phenotypesFilter }),

  setReportOrder: (reportOrder: string[]) => set({ reportOrder }),

  loadGseaZip: async (files: IBinaryFileOpen[]) => {
    console.log('load zip', files)

    if (files.length === 0) {
      return
    }

    const reportsMap: Record<string, IGseaTableResult[]> = {}

    const resultsMap: Record<string, IGseaResult> = {}

    let rankedGenes: IRankedGene[] = []
    let phenotypes: string[] = []

    const file = files[0]!

    const entries = unzipSync(file.data)

    for (const [filename, content] of Object.entries(entries)) {
      const lcfilename = filename.toLowerCase()
      const text = new TextDecoder().decode(content)
      let lines = textToTokens(text)
      const headings = lines[0]!
      const rows = lines.slice(1).filter((tokens) => tokens.length > 0)

      //console.log('Processing file:', filename)

      if (lcfilename.includes('ranked_gene_list')) {
        // Check if the entry is a file, not a directory

        const matcher = filename.match(
          /.*ranked_gene_list_(.+)_versus_(.+)_\d+\.(?:tsv|xls)/
        )

        // determine phenotypes from the filename which is
        // useful for preranked
        if (matcher && phenotypes.length === 0) {
          const phen = matcher[1]!
          const phen2 = matcher[2]!
          phenotypes = [phen, phen2]
        }

        let geneIdx = headings.findIndex((h) => h === 'NAME')

        if (geneIdx === -1) {
          geneIdx = headings.findIndex((h) => h === 'GENE_SYMBOL')
        }

        const scoreIdx = headings.findIndex((h) => h === 'SCORE')

        rankedGenes = rows.map((tokens, ti) => ({
          name: tokens[geneIdx]!,
          rank: ti,
          score: Number(tokens[scoreIdx]!),
          leading: false,
        }))
      }

      // alternative method of determining phenotypes
      if (lcfilename.endsWith('rpt') && phenotypes.length === 0) {
        // Check if the entry is a file, not a directory

        lines = lines.filter((tokens) => tokens.includes('cls'))

        if (lines.length > 0) {
          let tokens = lines[0]![2]!.split('#')

          const vs = tokens[1]!

          tokens = vs?.split('_versus_')

          const phen1 = tokens[0]!
          const phen2 = tokens[1]!

          phenotypes = [phen1, phen2]
        }
      }

      const matcher = filename.match(/.*gsea_report_for_(.+)_\d+\.(?:tsv|xls)/)

      if (matcher) {
        const phen = matcher[1]!
        // we cache files as we read them for processing later

        for (const tokens of rows) {
          const name = tokens[0]!

          if (!(phen in reportsMap)) {
            reportsMap[phen] = []
          }

          const sizeIdx = headings.findIndex((h) => h === 'SIZE')
          const nesIdx = headings.findIndex((h) => h === 'NES')
          const qIdx = headings.findIndex((h) => h === 'FDR q-val')
          const rankIdx = headings.findIndex((h) => h === 'RANK AT MAX')

          const q = Number(tokens[qIdx]!)
          const log10q = getGseaLog10q(q)

          const report: IGseaTableResult = {
            id: makeUuid(),
            name,
            phen,
            size: Number(tokens[sizeIdx]!),
            nes: Number(tokens[nesIdx]!),
            q,
            log10q,
            maxRank: Number(tokens[rankIdx]!),
          }

          reportsMap[phen]!.push(report)
        }
      }

      if (
        !lcfilename.includes('ranked_gene_list') &&
        !lcfilename.includes('gsea_report') &&
        !lcfilename.includes('gene_set_sizes') &&
        !lcfilename.includes('symbol_to_probe') &&
        (lcfilename.includes('tsv') || lcfilename.includes('xls'))
      ) {
        const name = filename
          .replace(/^.+\//, '')
          .replace('.xls', '')
          .replace('.tsv', '')

        const rankIdx = headings.findIndex((h) => h === 'RANK IN GENE LIST')
        const leadingIdx = headings.findIndex((h) => h === 'CORE ENRICHMENT')
        const scoreIdx = headings.findIndex((h) => h === 'RUNNING ES')

        const es: IRankedGene[] = rows.map((tokens) => {
          return {
            name: tokens[1]!,
            rank: Number(tokens[rankIdx]!),
            score: Number(tokens[scoreIdx]!),
            leading: tokens[leadingIdx]!.includes('Yes'),
          }
        })

        console.log('cheese', es)

        resultsMap[name] = { name, es }
      }
    }

    // fall back to the report filenames if the ranked/rpt files didn't
    // yield a phenotype pair, otherwise allReports stays empty
    if (phenotypes.length === 0) {
      phenotypes = Object.keys(reportsMap).sort()
    }

    const allReports: IGseaTableResult[] = phenotypes
      .filter((phen) => phen in reportsMap)
      .map((phen) => reportsMap[phen]!)
      .flat()

    const geneSetsInUse: Record<string, boolean> = Object.fromEntries(
      allReports.map((report) => [report.id, true] as [string, boolean])
    )

    const phenotypesFilter: Record<string, boolean> = Object.fromEntries(
      phenotypes.map((phen) => [phen, true] as [string, boolean])
    )

    set({
      reportsMap,
      resultsMap,
      rankedGenes,
      phenotypes,
      allReports,
      geneSetsInUse,
      phenotypesFilter,
      reportOrder: [],
    })
  },
}))

export function useGsea(): Omit<
  IGseaStore,
  'allReports' | 'reportsMap' | 'reportOrder' | 'setReportOrder'
> & {
  phenotypesFilter: Record<string, boolean>
  filteredReports: IGseaTableResult[]
  inUseReports: IGseaTableResult[]
  inUsePhenotypes: string[]
  setPhenotypesFilter: (filter: Record<string, boolean>) => void
  setFilteredReports: (reports: IGseaTableResult[]) => void
  loadGseaZipWithErrorHandling: (files: IBinaryFileOpen[]) => void
} {
  const phenotypes = useGseaStore((state) => state.phenotypes)
  const rankedGenes = useGseaStore((state) => state.rankedGenes)
  const searchResults = useGseaStore((state) => state.searchResults)
  //const reportsMap = useGseaPlotStore((state) => state.reportsMap)
  const geneSetsInUse = useGseaStore((state) => state.geneSetsInUse)
  const resultsMap = useGseaStore((state) => state.resultsMap)
  const allReports = useGseaStore((state) => state.allReports)

  const allowSelectAll = useGseaStore((state) => state.allowSelectAll)
  const loadGseaZip = useGseaStore((state) => state.loadGseaZip)

  const reportOrder = useGseaStore((state) => state.reportOrder)
  const setReportOrder = useGseaStore((state) => state.setReportOrder)

  const phenotypesFilter = useGseaStore((state) => state.phenotypesFilter)
  const setPhenotypesFilter = useGseaStore((state) => state.setPhenotypesFilter)

  const { settings } = useGseaSettings()

  const { open: openDialog } = useDialogs()

  async function loadGseaZipWithErrorHandling(files: IBinaryFileOpen[]) {
    console.log('Loading GSEA zip with files:', files)
    try {
      await loadGseaZip(files)
    } catch (error) {
      console.error('Failed to load GSEA zip:', error)

      openDialog({
        type: 'error',
        payload: { content: 'Failed to load GSEA zip' },
      })
    }
  }

  function _setFilteredReports(reports: IGseaTableResult[]) {
    // ids must match the reports in the store as
    // this function is for reordering and not filtering
    const reportIds = new Set(allReports.map((report) => report.id))

    const match = reports.every((report) => reportIds.has(report.id))

    if (!match) {
      console.error(
        'Attempted to set filtered reports with mismatched IDs. The provided reports do not match the existing reports in the store.'
      )
      return
    }

    // persist just the new order; filtering is always derived fresh
    setReportOrder(reports.map((report) => report.id))
  }

  const filteredReports = useMemo(() => {
    const filtered = allReports.filter((report) => {
      const nesPass =
        !settings.genesets.filters.nes.on ||
        report.nes >= settings.genesets.filters.nes.value ||
        report.nes <= -settings.genesets.filters.nes.value

      const qPass =
        !settings.genesets.filters.q.on ||
        report.q <= settings.genesets.filters.q.value

      const phenPass = phenotypesFilter[report.phen] ?? false

      return nesPass && qPass && phenPass
    })

    // if we have no manual order, just return the filtered reports
    if (reportOrder.length === 0) {
      return filtered
    }

    // apply any manual drag order, appending reports not covered by it
    const byId = new Map(filtered.map((report) => [report.id, report]))
    const ordered = reportOrder
      .map((id) => byId.get(id))
      .filter((report): report is IGseaTableResult => report != null)
    const orderedIds = new Set(ordered.map((report) => report.id))
    const remaining = filtered.filter((report) => !orderedIds.has(report.id))

    return [...ordered, ...remaining]
  }, [
    allReports,
    phenotypesFilter,
    reportOrder,
    settings.genesets.filters.nes.on,
    settings.genesets.filters.nes.value,
    settings.genesets.filters.q.on,
    settings.genesets.filters.q.value,
  ])

  const inUseReports = useMemo(() => {
    return filteredReports.filter((report) => geneSetsInUse[report.id] ?? false)
  }, [filteredReports, geneSetsInUse])

  const inUsePhenotypes = useMemo(() => {
    return phenotypes.filter((phen) => phenotypesFilter[phen] ?? false)
  }, [phenotypes, phenotypesFilter])

  return {
    phenotypes,
    inUsePhenotypes,
    rankedGenes,
    searchResults,
    geneSetsInUse,
    resultsMap,
    filteredReports,
    inUseReports,
    allowSelectAll,
    phenotypesFilter,
    setFilteredReports: _setFilteredReports,
    setPhenotypesFilter,
    setGeneSetsInUse: useGseaStore((state) => state.setGeneSetsInUse),
    setAllowSelectAll: useGseaStore((state) => state.setAllowSelectAll),
    loadGseaZip,
    loadGseaZipWithErrorHandling,
  }
}

export function useGseaData(resultName: string): {
  phenotypes: string[]
  rankedGenes: IRankedGene[]
  result: IGseaResult | undefined
} {
  const phenotypes = useGseaStore((state) => state.phenotypes)
  const rankedGenes = useGseaStore((state) => state.rankedGenes)
  const result = useGseaStore((state) => state.resultsMap[resultName])

  return { phenotypes, rankedGenes, result }
}

// narrow selectors for building axes: avoids subscribing to search
// results, report order, and actions that useGsea() also tracks
export function useGseaInUse(): {
  rankedGenes: IRankedGene[]
  resultsMap: Record<string, IGseaResult>
  inUseReports: IGseaTableResult[]
} {
  const rankedGenes = useGseaStore((state) => state.rankedGenes)
  const resultsMap = useGseaStore((state) => state.resultsMap)
  const allReports = useGseaStore((state) => state.allReports)
  const geneSetsInUse = useGseaStore((state) => state.geneSetsInUse)
  const phenotypesFilter = useGseaStore((state) => state.phenotypesFilter)
  const { settings } = useGseaSettings()

  const inUseReports = useMemo(() => {
    return allReports.filter((report) => {
      if (!(geneSetsInUse[report.id] ?? false)) {
        return false
      }

      const nesPass =
        !settings.genesets.filters.nes.on ||
        report.nes >= settings.genesets.filters.nes.value ||
        report.nes <= -settings.genesets.filters.nes.value

      const qPass =
        !settings.genesets.filters.q.on ||
        report.q <= settings.genesets.filters.q.value

      const phenPass = phenotypesFilter[report.phen] ?? false

      return nesPass && qPass && phenPass
    })
  }, [
    allReports,
    geneSetsInUse,
    phenotypesFilter,
    settings.genesets.filters.nes.on,
    settings.genesets.filters.nes.value,
    settings.genesets.filters.q.on,
    settings.genesets.filters.q.value,
  ])

  return { rankedGenes, resultsMap, inUseReports }
}
