import { HistoryAction } from './actions/action-types'
import { handleUpdateAxes } from './actions/axes-actions'
import { handleOpenFile, handleRemoveFiles } from './actions/file-actions'
import {
  handleAddGenesets,
  handleClearGenesets,
  handleRemoveGenesets,
  handleUpdateGeneset,
} from './actions/geneset-actions'
import {
  handleAddGroups,
  handleClearGroups,
  handleOpenGroupFiles,
  handleRemoveGroups,
  handleUpdateGroup,
} from './actions/group-actions'
import { handleGoto, handleRemove } from './actions/navigation-actions'
import { handleAddPlots, handleUpdatePlot } from './actions/plot-actions'
import { historyManager } from './actions/shared'
import { handleAddSheets } from './actions/sheet-actions'
import { init } from './history-init'
import { IHistoryData } from './history-types'

export type { HistoryAction } from './actions/action-types'
export { openGroupFiles } from './actions/group-actions'
export { pathJoin, strOrIdToStr } from './actions/shared'

export function historyReducer(
  state: IHistoryData,
  action: HistoryAction
): IHistoryData {
  switch (action.type) {
    case 'reset':
      return init()
    case 'undo':
      return {
        ...state,
        ...historyManager.undo(state),
      }
    case 'redo':
      return {
        ...state,
        ...historyManager.redo(state),
      }
    case 'seek':
      return {
        ...state,
        ...historyManager.goto(state, action.step),
      }
    case 'openFile':
      return handleOpenFile(state, action)
    case 'addSheets':
      return handleAddSheets(state, action)
    case 'remove':
      return handleRemove(state, action)
    case 'removeFiles':
      return handleRemoveFiles(state, action)
    //case 'reorderSheets':
    //  return handleReorderSheets(state, action)
    //case 'reorderPlots':
    //  return handleReorderPlots(state, action)
    case 'addPlots':
      return handleAddPlots(state, action)
    case 'updatePlot':
      return handleUpdatePlot(state, action)

    case 'updateAxes':
      return handleUpdateAxes(state, action)
    case 'addGroups':
      return handleAddGroups(state, action)
    case 'updateGroup':
      return handleUpdateGroup(state, action)
    case 'clearGroups':
      return handleClearGroups(state, action)
    case 'openGroupFiles':
      return handleOpenGroupFiles(state, action)
    case 'removeGroups':
      return handleRemoveGroups(state, action)
    //case 'reorderGroups':
    //  return handleReorderGroups(state, action)
    case 'addGenesets':
      return handleAddGenesets(state, action)
    case 'clearGenesets':
      return handleClearGenesets(state, action)
    case 'updateGeneset':
      return handleUpdateGeneset(state, action)
    case 'removeGenesets':
      return handleRemoveGenesets(state, action)
    //case 'reorderGenesets':
    //  return handleReorderGenesets(state, action)
    case 'goto':
      return handleGoto(state, action)
    default:
      return state
  }
}
