import { useDialogs } from '@/components/dialogs/dialogs'
import type { IBinaryFileOpen } from '@/components/pages/open-files'
import { makeUuid } from '@/lib/id'
import { textToTokens } from '@/lib/text/lines'
import { unzipSync } from 'fflate'

import { useMemo } from 'react'
import { create } from 'zustand'
import { useGseaSettings } from './gsea-settings-store'

export const PLOT_ZOOM_CHANNEL = 'gsea-plot-zoom'

export const MAX_NEG_LOG10_P = 50

/**
 * Represents a gene set in the GSEA report.
 */
export interface IGseaGeneSet {
  id: string
  phen: string
  name: string
  size: number
  nes: number
  q: number
  log10q: number
  maxRank: number
}

export interface IGseaBubble {
  id: string
  name: string
  genesets: IGseaGeneSet[]
  nes: { label: string }
  size: { label: string }
  log10q: { label: string }
}

export interface IGseaGeneRankScore {
  gene: string
  rank: number
  score: number
  leading: boolean
}

export interface IGseaResult {
  name: string
  es: IGseaGeneRankScore[]
}

export interface IGseaPlotStore {
  phenotypes: string[]
  rankedGenes: IGseaGeneRankScore[]
  searchResults: IGseaGeneSet[]
  reportsMap: Record<string, IGseaGeneSet[]>
  geneSetsInUse: Record<string, boolean>
  resultsMap: Record<string, IGseaResult>
  allReports: IGseaGeneSet[]
  //reports: IGseaGeneSet[]
  allowSelectAll: boolean
  phenotypesFilter: Record<string, boolean>
  // ids of reports in manually dragged order; empty means natural order
  reportOrder: string[]

  setGeneSetsInUse: (geneSetsInUse: Record<string, boolean>) => void
  setAllowSelectAll: (allowSelectAll: boolean) => void
  //setReports: (reports: IGseaGeneSet[]) => void
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

export const useGseaPlotStore = create<IGseaPlotStore>()((set) => ({
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

    const reportsMap: Record<string, IGseaGeneSet[]> = {}

    const resultsMap: Record<string, IGseaResult> = {}

    let rankedGenes: IGseaGeneRankScore[] = []
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
          gene: tokens[geneIdx]!,
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

          const report: IGseaGeneSet = {
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

        console.log('Processing file 2:', filename)

        const es: IGseaGeneRankScore[] = rows.map((tokens) => {
          return {
            gene: tokens[1]!,
            rank: Number(tokens[rankIdx]!),
            score: Number(tokens[scoreIdx]!),
            leading: tokens[leadingIdx]!.includes('Yes'),
          }
        })

        resultsMap[name] = { name, es }
      }
    }

    // fall back to the report filenames if the ranked/rpt files didn't
    // yield a phenotype pair, otherwise allReports stays empty
    if (phenotypes.length === 0) {
      phenotypes = Object.keys(reportsMap)
    }

    const allReports: IGseaGeneSet[] = phenotypes
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
  IGseaPlotStore,
  'allReports' | 'reportsMap' | 'reportOrder' | 'setReportOrder'
> & {
  phenotypesFilter: Record<string, boolean>
  filteredReports: IGseaGeneSet[]
  inUseReports: IGseaGeneSet[]
  setPhenotypesFilter: (filter: Record<string, boolean>) => void
  setFilteredReports: (reports: IGseaGeneSet[]) => void
  loadGseaZipWithErrorHandling: (files: IBinaryFileOpen[]) => void
} {
  const phenotypes = useGseaPlotStore((state) => state.phenotypes)
  const rankedGenes = useGseaPlotStore((state) => state.rankedGenes)
  const searchResults = useGseaPlotStore((state) => state.searchResults)
  //const reportsMap = useGseaPlotStore((state) => state.reportsMap)
  const geneSetsInUse = useGseaPlotStore((state) => state.geneSetsInUse)
  const resultsMap = useGseaPlotStore((state) => state.resultsMap)
  const allReports = useGseaPlotStore((state) => state.allReports)

  const allowSelectAll = useGseaPlotStore((state) => state.allowSelectAll)
  const loadGseaZip = useGseaPlotStore((state) => state.loadGseaZip)

  const reportOrder = useGseaPlotStore((state) => state.reportOrder)
  const setReportOrder = useGseaPlotStore((state) => state.setReportOrder)

  const phenotypesFilter = useGseaPlotStore((state) => state.phenotypesFilter)
  const setPhenotypesFilter = useGseaPlotStore(
    (state) => state.setPhenotypesFilter
  )

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

  function _setFilteredReports(reports: IGseaGeneSet[]) {
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
      .filter((report): report is IGseaGeneSet => report != null)
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

  return {
    phenotypes,
    rankedGenes,
    searchResults,
    //reportsMap,
    geneSetsInUse,
    resultsMap,
    filteredReports,
    inUseReports,
    allowSelectAll,
    phenotypesFilter,
    setFilteredReports: _setFilteredReports,
    setPhenotypesFilter,
    setGeneSetsInUse: useGseaPlotStore((state) => state.setGeneSetsInUse),
    setAllowSelectAll: useGseaPlotStore((state) => state.setAllowSelectAll),

    loadGseaZip,
    loadGseaZipWithErrorHandling,
  }
}
