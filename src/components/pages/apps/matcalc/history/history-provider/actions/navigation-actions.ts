import { IHistoryData } from '../history-types'
import { HistoryAction } from './action-types'
import { removeFile } from './file-actions'
import { removeGeneset } from './geneset-actions'
import { removeGroup } from './group-actions'
import { removePlot } from './plot-actions'
import { applyHistoryUpdate, getPathType, toPathId } from './shared'
import { removeSheet } from './sheet-actions'

export function handleRemove(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'remove' }>
): IHistoryData {
  if (action.paths.length === 0) {
    return state
  }

  const pathIds = action.paths.map(toPathId)

  return applyHistoryUpdate(state, `Remove objects`, '', (draft) => {
    for (const p of pathIds) {
      switch (getPathType(p)) {
        case 'file':
          removeFile(draft, p)
          break
        case 'sheet':
          removeSheet(draft, p)
          break
        case 'plot':
          removePlot(draft, p)
          break
        case 'group':
          removeGroup(draft, p)
          break
        case 'geneset':
          removeGeneset(draft, p)
          break
        default:
          console.warn(`Unknown path type for ${p}`)
          break
      }
    }
  })
}

export function handleGoto(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'goto' }>
): IHistoryData {
  const { path } = action
  const { file, sheet, plot } = toPathId(path)

  return applyHistoryUpdate(
    state,
    `Goto ${
      Boolean(plot)
        ? `plot ${plot}`
        : Boolean(sheet)
          ? `sheet ${sheet}`
          : `file ${file}`
    }`,
    '',
    (draft) => {
      if (draft.files.some((f) => f.id === file)) {
        draft.currentFile = draft.files.find((f) => f.id === file)!.id
      }

      if (plot) {
        if (draft.plots[file].some((p) => p.id === plot)) {
          draft.currentPlot = draft.plots[file].filter(
            (p) => p.id === plot
          )[0].id
          draft.currentSelections = [{ type: 'plot', id: plot }]
        }
      } else {
        if (draft.sheets[file]?.some((s) => s.id === sheet)) {
          draft.currentSheet = draft.sheets[file].filter(
            (s) => s.id === sheet
          )[0].id
          draft.currentSelections = [{ type: 'sheet', id: sheet }]
        }
      }
    }
  )
}
