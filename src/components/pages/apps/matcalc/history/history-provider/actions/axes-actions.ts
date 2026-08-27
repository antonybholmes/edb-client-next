import { ID_DEFAULT } from '@/consts'
import { IHistoryData, IHistoryState } from '../history-types'
import { HistoryAction } from './action-types'
import { applyHistoryUpdate } from './shared'

export function handleRemoveAxes(state: IHistoryState, plot: string) {
  delete state.axes[plot]
}

export function handleUpdateAxes(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateAxes' }>
): IHistoryData {
  const { axes, opts } = action
  const { plot = ID_DEFAULT } = opts

  return applyHistoryUpdate(
    state,
    'Update axes',
    '',
    (draft: IHistoryState) => {
      draft.axes[plot] =
        plot in draft.axes ? { ...draft.axes[plot], ...axes } : axes
    }
  )
}
