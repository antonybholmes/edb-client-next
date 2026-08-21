import { useDialogs } from '@/components/dialogs/dialogs'
import type { IBinaryFileOpen } from '@/components/pages/open-files'
import { makeUuid } from '@/lib/id'
import { textToTokens } from '@/lib/text/lines'
import { unzipSync } from 'fflate'

import { useEffect } from 'react'
import { create } from 'zustand'
import { useGseaSettings } from './gsea-settings-store'

export const PLOT_ZOOM_CHANNEL = 'gsea-plot-zoom'

export interface IGseaPathway {
  id: string
  phen: string
  name: string
  size: number
  nes: number
  q: number
  maxRank: number
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
  searchResults: IGseaPathway[]
  reportsMap: Record<string, IGseaPathway[]>
  datasetsForUse: Record<string, boolean>
  resultsMap: Record<string, IGseaResult>
  allReports: IGseaPathway[]
  reports: IGseaPathway[]
  allowSelectAll: boolean

  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) => void
  setAllowSelectAll: (allowSelectAll: boolean) => void
  setReports: (reports: IGseaPathway[]) => void
  loadGseaZip: (files: IBinaryFileOpen[]) => Promise<void>
}

export const useGseaPlotStore = create<IGseaPlotStore>()((set) => ({
  phenotypes: [],
  rankedGenes: [],
  searchResults: [],
  reportsMap: {},
  datasetsForUse: {},
  resultsMap: {},
  allReports: [],
  reports: [],
  allowSelectAll: false,

  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) =>
    set({ datasetsForUse }),

  setReports: (reports: IGseaPathway[]) => set({ reports }),

  setAllowSelectAll: (allowSelectAll: boolean) => set({ allowSelectAll }),

  loadGseaZip: async (files: IBinaryFileOpen[]) => {
    console.log('load zip', files)

    if (files.length === 0) {
      return
    }

    const reportsMap: Record<string, IGseaPathway[]> = {}

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

          const report: IGseaPathway = {
            id: makeUuid(),
            name,
            phen,
            size: Number(tokens[sizeIdx]!),
            nes: Number(tokens[nesIdx]!),
            q: Number(tokens[qIdx]!),
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

        console.log('Processing file:', filename)

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

    const allReports: IGseaPathway[] = phenotypes
      .filter((phen) => phen in reportsMap)
      .map((phen) => reportsMap[phen]!)
      .flat()

    const datasetsForUse: Record<string, boolean> = Object.fromEntries(
      allReports.map((report) => [report.id, true] as [string, boolean])
    )

    const reports = [...allReports]

    set({
      reportsMap,
      resultsMap,
      rankedGenes,
      phenotypes,
      allReports,
      reports,
      datasetsForUse,
    })
  },
}))

export function useGsea(): Omit<IGseaPlotStore, 'allReports' | 'reportsMap'> & {
  loadGseaZipWithErrorHandling: (files: IBinaryFileOpen[]) => void
} {
  const phenotypes = useGseaPlotStore((state) => state.phenotypes)
  const rankedGenes = useGseaPlotStore((state) => state.rankedGenes)
  const searchResults = useGseaPlotStore((state) => state.searchResults)
  //const reportsMap = useGseaPlotStore((state) => state.reportsMap)
  const datasetsForUse = useGseaPlotStore((state) => state.datasetsForUse)
  const resultsMap = useGseaPlotStore((state) => state.resultsMap)
  const allReports = useGseaPlotStore((state) => state.allReports)
  const reports = useGseaPlotStore((state) => state.reports)
  const allowSelectAll = useGseaPlotStore((state) => state.allowSelectAll)
  const loadGseaZip = useGseaPlotStore((state) => state.loadGseaZip)
  const setReports = useGseaPlotStore((state) => state.setReports)

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

  useEffect(() => {
    if (settings.filters.nes.on || settings.filters.q.on) {
      const filteredReports = allReports.filter((report) => {
        const nesPass =
          !settings.filters.nes.on ||
          report.nes >= settings.filters.nes.value ||
          report.nes <= -settings.filters.nes.value

        const qPass =
          !settings.filters.q.on || report.q <= settings.filters.q.value
        return nesPass && qPass
      })
      setReports(filteredReports)
    } else {
      setReports(allReports)
    }
  }, [settings.filters])

  return {
    phenotypes,
    rankedGenes,
    searchResults,
    //reportsMap,
    datasetsForUse,
    resultsMap,
    reports,
    allowSelectAll,

    setDatasetsForUse: useGseaPlotStore((state) => state.setDatasetsForUse),
    setAllowSelectAll: useGseaPlotStore((state) => state.setAllowSelectAll),
    setReports,

    loadGseaZip,
    loadGseaZipWithErrorHandling,
  }
}
