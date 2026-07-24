import { findIndexEx } from '@/lib/collections'
import { makeUuid } from '@/lib/id'
import { applyPatches, produceWithPatches, type Patch } from 'immer'
export const MAX_HISTORY_ITEMS = 1000

export interface IHistoryPatch {
  id: string
  name: string
  description: string
  // keep track of patches for undo/redo
  patches: Patch[]
  inversePatches: Patch[]
  createdAt: number
  type: 'patch'
}

export interface IHistorySnapshot<T> {
  id: string
  name: string
  description: string
  state: T
  createdAt: number
  type: 'snapshot'
}

export type IHistoryEntry<T> = IHistoryPatch | IHistorySnapshot<T>

export interface IUndoState<T> {
  present: T
  history: IHistoryEntry<T>[]
  cursor: number
  /**
   * The current version of the history state which is a monotonically increasing number.
   */
  version: number
}

function createHistoryEntry<T>(
  type: 'snapshot' | 'patch',
  name: string,
  description: string,
  payload: { state?: T; patches?: Patch[]; inversePatches?: Patch[] }
): IHistoryEntry<T> {
  return {
    id: makeUuid(),
    name,
    description,
    createdAt: Date.now(),
    type,
    ...(type === 'snapshot'
      ? { state: payload.state }
      : { patches: payload.patches, inversePatches: payload.inversePatches }),
  } as IHistoryEntry<T>
}

function shouldSnapshot(step: number, patchesLength: number): boolean {
  return step % 10 === 0 || patchesLength > 50
}

export class HistoryManager<T extends object> {
  private _maxItems: number

  constructor(maxItems: number = MAX_HISTORY_ITEMS) {
    this._maxItems = maxItems
  }

  trim(history: IHistoryEntry<T>[]): IHistoryEntry<T>[] {
    if (history.length <= this._maxItems) {
      return history
    }

    const start = history.length - this._maxItems
    const snapshotIndex = findIndexEx(
      history,
      (h) => h.type === 'snapshot',
      start
    )
    return snapshotIndex !== -1
      ? history.slice(snapshotIndex)
      : history.slice(start)
  }

  applyUpdate(
    state: IUndoState<T>,
    name: string,
    description: string,
    fn: (draft: T) => void
  ): IUndoState<T> {
    const [next, patches, inversePatches] = produceWithPatches(
      state.present,
      fn
    )
    if (patches.length === 0) {
      return state
    }

    const step = state.cursor + 1
    const entry = shouldSnapshot(step, patches.length)
      ? createHistoryEntry<T>('snapshot', name, description, { state: next })
      : createHistoryEntry<T>('patch', name, description, {
          patches,
          inversePatches,
        })

    let history: IHistoryEntry<T>[] = [
      ...state.history.slice(0, state.cursor + 1),
      entry,
    ]

    history = this.trim(history)

    return {
      present: next,
      history,
      cursor: history.length - 1,
      version: state.version + 1,
    }
  }

  undo(state: IUndoState<T>): IUndoState<T> {
    if (state.cursor <= 0) {
      return state
    }

    const entry = state.history[state.cursor]!

    let prevState: T = state.present

    if (entry.type === 'patch') {
      // undo patch
      prevState = applyPatches(state.present, entry.inversePatches)
    } else {
      let snapshotIndex = state.cursor - 1
      while (
        snapshotIndex >= 0 &&
        state.history[snapshotIndex]!.type !== 'snapshot'
      ) {
        snapshotIndex--
      }

      if (snapshotIndex >= 0) {
        // start from previous snapshot and apply all patches up to current cursor
        prevState = (state.history[snapshotIndex]! as IHistorySnapshot<T>).state
        for (let i = snapshotIndex + 1; i < state.cursor; i++) {
          const e = state.history[i]! as IHistoryPatch
          prevState = applyPatches(prevState, e.patches)
        }
      }
    }

    return {
      ...state,
      present: prevState,
      cursor: state.cursor - 1,
    }
  }

  redo(state: IUndoState<T>): IUndoState<T> {
    if (state.cursor >= state.history.length - 1) {
      return state
    }

    // look ahead to next entry and either switch to
    // it if a snapshot, or apply the patches if a patch entry
    const nextEntry = state.history[state.cursor + 1]!
    const nextState =
      nextEntry.type === 'snapshot'
        ? nextEntry.state
        : applyPatches(state.present, nextEntry.patches)

    return { ...state, present: nextState, cursor: state.cursor + 1 }
  }

  goto(state: IUndoState<T>, step: number | string): IUndoState<T> {
    // where we are currently in the history
    const stepIndex = findHistoryEntry(state.history, step)

    if (stepIndex === -1) {
      console.warn(`History step ${step} not found`)
      return state
    }

    // find nearest snapshot before the target we want
    const { snapshot, index: startIndex } = findNearestSnapshot(
      state.history,
      stepIndex
    )

    // apply all patches from that snapshot up to the target step
    // to get the new present state
    let newPresent = snapshot

    for (let i = startIndex + 1; i <= stepIndex; i++) {
      const entry = state.history[i]!
      if (entry.type === 'patch') {
        newPresent = applyPatches(newPresent, entry.patches!)
      }
    }

    return { ...state, present: newPresent, cursor: stepIndex }
  }
}

/**
 * Finds the nearest snapshot before the target index in the history.
 *
 * @param history The history array.
 * @param targetIndex The target index to find the nearest snapshot for.
 * @returns An object containing the nearest snapshot state and its index.
 */
export function findNearestSnapshot<T>(
  history: IHistoryEntry<T>[],
  targetIndex: number
): { snapshot: T; index: number } {
  let index = 0

  for (let i = targetIndex; i >= 0; i--) {
    if (history[i]!.type === 'snapshot') {
      index = i
      break
    }
  }
  // If none found, fallback: start from scratch (empty state)
  return {
    snapshot: (history[index] as IHistorySnapshot<T>).state,
    index,
  }
}

/**
 * Finds the index of a history entry by its index, id or name.
 *
 * @param history The history array.
 * @param step The index, id, or name of the history entry to find.
 * @returns The index of the history entry, or -1 if not found.
 */
export function findHistoryEntry<T>(
  history: IHistoryEntry<T>[],
  step: number | string
): number {
  if (typeof step === 'number') {
    return step
  }

  const lid = step.toLowerCase()

  return history.findIndex((s) => s.id === step || s.name.toLowerCase() === lid)
}
