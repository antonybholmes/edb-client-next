import { makeUuid } from '@/lib/id'
import {
  Draft,
  Patch,
  applyPatches,
  enablePatches,
  produceWithPatches,
} from 'immer'
import { useSyncExternalStore } from 'react'

enablePatches()

const DEFAULT_MAX_HISTORY = 100

export interface HistoryOptions {
  label?: string
}

export interface IHistoryEntry<T> {
  id: string
  patches: Patch[]
  inversePatches: Patch[]
  label?: string
  timestamp: number
}

export interface IHistoryItem<T> {
  readonly value: T
  readonly canUndo: boolean
  readonly canRedo: boolean

  commit(recipe: (draft: Draft<T>) => void, options?: HistoryOptions): T

  undo(): boolean
  redo(): boolean
  goto(entryId: string): boolean
  reset(value: T): void
  clear(): void
  subscribe(listener: () => void): () => void
}

export class HistoryItem<T> implements IHistoryItem<T> {
  private readonly parent?: (change: IHistoryEntry<T>) => void

  private history: IHistoryEntry<T>[] = []
  private cursor = -1
  private maxHistory: number = DEFAULT_MAX_HISTORY

  private present: T
  private listeners = new Set<() => void>()

  constructor(
    initial: T,
    parent?: (change: IHistoryEntry<T>) => void,
    maxHistory = DEFAULT_MAX_HISTORY
  ) {
    this.present = initial
    this.parent = parent
    this.maxHistory = Math.max(1, maxHistory)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const listeners = Array.from(this.listeners)

    for (const listener of listeners) {
      listener()
    }
  }

  get value(): T {
    return this.present
  }

  get entries(): readonly IHistoryEntry<T>[] {
    return this.history
  }

  get length(): number {
    return this.history.length
  }

  get canUndo(): boolean {
    return this.cursor >= 0
  }

  get canRedo(): boolean {
    return this.cursor < this.history.length - 1
  }

  private applyEntry(entry: IHistoryEntry<T>, reverse = false): void {
    this.present = applyPatches(
      this.present,
      reverse ? entry.inversePatches : entry.patches
    )
  }

  commit(recipe: (draft: Draft<T>) => void, options: HistoryOptions = {}): T {
    const [next, patches, inversePatches] = produceWithPatches(
      this.present,
      recipe
    )

    if (patches.length === 0) {
      return this.present
    }

    const entry: IHistoryEntry<T> = {
      id: makeUuid(),
      patches,
      inversePatches,
      label: options.label,
      timestamp: Date.now(),
    }

    this.history = this.history.slice(0, this.cursor + 1)

    this.history.push(entry)
    this.cursor++

    // enforce max history length
    if (this.history.length > this.maxHistory) {
      this.history.shift()
      this.cursor--
    }

    this.present = next

    this.parent?.(entry)

    this.notify()

    return this.present
  }

  undo(): boolean {
    if (!this.canUndo) {
      return false
    }

    const entry = this.history[this.cursor]

    this.applyEntry(entry, true)

    this.cursor--

    this.notify()

    return true
  }

  redo(): boolean {
    if (!this.canRedo) {
      return false
    }

    const entry = this.history[this.cursor + 1]

    this.applyEntry(entry)

    this.cursor++

    this.notify()

    return true
  }

  goto(id: string): boolean {
    const target = this.history.findIndex((entry) => entry.id === id)

    if (target === -1) {
      return false
    }

    while (this.cursor < target) {
      const entry = this.history[this.cursor + 1]

      this.applyEntry(entry)

      this.cursor++
    }

    while (this.cursor > target) {
      const entry = this.history[this.cursor]

      this.applyEntry(entry, true)

      this.cursor--
    }

    this.notify()

    return true
  }

  reset(value: T): void {
    this.present = value
    this.history.length = 0
    this.cursor = -1
    this.notify()
  }

  clear(): void {
    this.history.length = 0
    this.cursor = -1
    this.notify()
  }
}

export function useHistoryItem<T>(item: HistoryItem<T>): T {
  return useSyncExternalStore(
    item.subscribe,
    () => item.value,
    () => item.value
  )
}
