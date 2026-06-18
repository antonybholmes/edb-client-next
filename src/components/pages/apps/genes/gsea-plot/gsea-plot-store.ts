import type { IBinaryFileOpen } from '@/components/pages/open-files'
import { makeUuid } from '@/lib/id'
import { textToTokens } from '@/lib/text/lines'
import { unzipSync } from 'fflate'

import { create } from 'zustand'

export const PLOT_ZOOM_CHANNEL = 'gsea-plot-zoom'

export interface IGseaPathway {
  id: string
  phen: string
  name: string
  size: number
  nes: number
  q: number
  rank: number
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
  reports: IGseaPathway[]
  allowSelectAll: boolean
  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) => void
  setAllowSelectAll: (allowSelectAll: boolean) => void
  setReports: (reports: IGseaPathway[]) => void
  loadGseaZip: (files: IBinaryFileOpen[]) => void
}

export const useGseaPlotStore = create<IGseaPlotStore>()(set => ({
  phenotypes: [],
  rankedGenes: [],
  searchResults: [],
  reportsMap: {},
  datasetsForUse: {},
  resultsMap: {},
  reports: [],
  allowSelectAll: false,

  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) =>
    set({ datasetsForUse }),

  setReports: (reports: IGseaPathway[]) => set({ reports }),

  setAllowSelectAll: (allowSelectAll: boolean) => set({ allowSelectAll }),

  loadGseaZip: async (files: IBinaryFileOpen[]) => {
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
      //console.log('Processing file: %s', filename)
      const text = new TextDecoder().decode(content)
      let lines = textToTokens(text)
      const headings = lines[0]!
      const rows = lines.slice(1).filter(tokens => tokens.length > 0)

      if (filename.includes('ranked_gene_list')) {
        // Check if the entry is a file, not a directory

        let geneIdx = headings.findIndex(h => h === 'NAME')

        if (geneIdx === -1) {
          geneIdx = headings.findIndex(h => h === 'GENE_SYMBOL')
        }

        const scoreIdx = headings.findIndex(h => h === 'SCORE')

        rankedGenes = rows.map((tokens, ti) => ({
          gene: tokens[geneIdx]!,
          rank: ti,
          score: Number(tokens[scoreIdx]!),
          leading: false,
        }))

        //console.log(content)
      }

      if (filename.endsWith('rpt')) {
        // Check if the entry is a file, not a directory

        lines = lines.filter(tokens => tokens.includes('cls'))

        if (lines.length > 0) {
          let tokens = lines[0]![2]!.split('#')

          const vs = tokens[1]!

          tokens = vs?.split('_versus_')

          const phen1 = tokens[0]!
          const phen2 = tokens[1]!

          phenotypes = [phen1, phen2]
        }

        //console.log(content)
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

          const sizeIdx = headings.findIndex(h => h === 'SIZE')
          const nesIdx = headings.findIndex(h => h === 'NES')
          const qIdx = headings.findIndex(h => h === 'FDR q-val')
          const rankIdx = headings.findIndex(h => h === 'RANK AT MAX')

          const report: IGseaPathway = {
            id: makeUuid(),
            name,
            phen,
            size: Number(tokens[sizeIdx]!),
            nes: Number(tokens[nesIdx]!),
            q: Number(tokens[qIdx]!),
            rank: Number(tokens[rankIdx]!),
          }

          //console.log('Parsed report: %o', report)

          reportsMap[phen]!.push(report)
        }
      }

      if (
        !filename.includes('ranked_gene_list') &&
        !filename.includes('gsea_report') &&
        !filename.includes('gene_set_sizes') &&
        (filename.includes('tsv') || filename.includes('xls'))
      ) {
        const name = filename
          .replace(/^.+\//, '')
          .replace('.xls', '')
          .replace('.tsv', '')

        const rankIdx = headings.findIndex(h => h === 'RANK IN GENE LIST')
        const leadingIdx = headings.findIndex(h => h === 'CORE ENRICHMENT')
        const scoreIdx = headings.findIndex(h => h === 'RUNNING ES')

        const es: IGseaGeneRankScore[] = rows.map(tokens => {
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

    const reports: IGseaPathway[] = phenotypes
      .filter(phen => phen in reportsMap)
      .map(phen => reportsMap[phen]!)
      .flat()

    //console.log('Phenotypes: %o', phenotypes)
    //console.log('Reports: %o', reports)
    //console.log('Results map: %o', resultsMap)

    const datasetsForUse: Record<string, boolean> = Object.fromEntries(
      reports.map(report => [report.id, true] as [string, boolean])
    )

    // for (const [rpi, rp] of reportPromises.entries()) {
    //   // Check if the entry is a file, not a directory
    //   const content = await rp

    //   textToTokens(content)
    //     .slice(1)
    //     .filter(tokens => tokens.length > 7)
    //     .forEach(tokens => {
    //       const name = tokens[0]!
    //       const phen = reportNames[rpi]!

    //       if (!(phen in reports)) {
    //         reports[phen] = []
    //       }

    //       reports[phen]!.push({
    //         id: makeUuid(),
    //         name,
    //         phen: reportNames[rpi]!,
    //         size: Number(tokens[3]),
    //         nes: Number(tokens[5]),
    //         q: Number(tokens[7]),
    //         rank: Number(tokens[9]),
    //       })
    //     })
    // }

    set({
      reportsMap,
      resultsMap,
      rankedGenes,
      phenotypes,
      reports,
      datasetsForUse,
    })

    // setDatasetsForUse(
    //   new Map<string, boolean>(
    //     [...reports.keys()]
    //       .sort()
    //       .map(report =>
    //         reports
    //           .get(report)!
    //           .map(
    //             pathway =>
    //               [pathway.id, selectAllDatasets] as [string, boolean]
    //           )
    //       )
    //       .flat()
    //   )
    // )
  },
}))

export function useGsea(): IGseaPlotStore {
  const phenotypes = useGseaPlotStore(state => state.phenotypes)
  const rankedGenes = useGseaPlotStore(state => state.rankedGenes)
  const searchResults = useGseaPlotStore(state => state.searchResults)
  const reportsMap = useGseaPlotStore(state => state.reportsMap)
  const datasetsForUse = useGseaPlotStore(state => state.datasetsForUse)
  const resultsMap = useGseaPlotStore(state => state.resultsMap)
  const reports = useGseaPlotStore(state => state.reports)
  const allowSelectAll = useGseaPlotStore(state => state.allowSelectAll)

  return {
    phenotypes,
    rankedGenes,
    searchResults,
    reportsMap,
    datasetsForUse,
    resultsMap,
    reports,
    allowSelectAll,
    setDatasetsForUse: useGseaPlotStore(state => state.setDatasetsForUse),
    setAllowSelectAll: useGseaPlotStore(state => state.setAllowSelectAll),
    setReports: useGseaPlotStore(state => state.setReports),
    loadGseaZip: useGseaPlotStore(state => state.loadGseaZip),
  }
}
