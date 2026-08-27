import { textJoin } from '@/lib/text/text'
import { DEFAULT_FILE } from '../history-init'
import { IHistoryData, IHistoryState, PathId } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate } from './shared'

export function removeGeneset(state: IHistoryState, p: PathId) {
  state.genesets[p.file] = state.genesets[p.file]!.filter(
    (gs) => gs.id !== p.geneset
  )
}

export function handleAddGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGenesets' }>
): IHistoryData {
  const { genesets, opts } = action
  const { mode = 'set', file = state.present.currentFile.id } = opts

  // cannot add genesets to default file and empty genesets array does not require update
  if (file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Add ${textJoin(genesets.map((gs) => gs.name))} geneset${
      genesets.length > 1 ? 's' : ''
    }`,
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.genesets[file]?.push(...genesets)
      } else {
        draft.genesets[file] = genesets
      }
    }
  )
}

export function handleUpdateGeneset(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGeneset' }>
): IHistoryData {
  const { geneset, opts } = action
  const { file = state.present.currentFile.id } = opts

  return applyHistoryUpdate(
    state,
    'Update geneset',
    '',
    (draft: IHistoryState) => {
      // update geneset at specific index in the genesets array for the current file
      const index = draft.genesets[file]?.findIndex(
        (gs) => gs.id === geneset.id
      )

      if (index !== undefined && index !== -1) {
        draft.genesets[file]![index] = geneset
      }
    }
  )
}

export function handleClearGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'clearGenesets' }>
): IHistoryData {
  const { opts } = action
  const { file = state.present.currentFile.id } = opts

  // cannot add genesets to default file and empty genesets array does not require update
  if (file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear genesets',
    '',
    (draft: IHistoryState) => {
      draft.genesets[file] = []
    }
  )
}

export function handleRemoveGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGenesets' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile.id } = opts
  // cannot remove genesets from default file and empty ids array does not require update
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      draft.genesets[file] = draft.genesets[file]!.filter(
        (gs) => !ids.includes(gs.id)
      )
    }
  )
}
