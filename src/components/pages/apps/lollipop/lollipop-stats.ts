import type { VariantType } from './lollipop-utils'

export interface IAAData {
  sample: string
  aa: string
}

/**
 * Interface for amino acid statistics in a lollipop plot.
 * It contains a position and a count map that maps events to databases and samples.
 * We need to use plain objects instead of Maps to ensure that the data can be serialized to JSON.
 */
export interface ILollipopStats {
  position: number
  countMap: Record<VariantType, Record<string, IAAData[]>>
}

export function newAAStats(position: number): ILollipopStats {
  return {
    position,
    countMap: {} as Record<VariantType, Record<string, IAAData[]>>,
  }
}

export function aaStatDatabases(stats: ILollipopStats): string[] {
  return Object.keys(stats.countMap).sort()
}

export function aaCountMap(
  stats: ILollipopStats
): Record<VariantType, Record<string, IAAData[]>> {
  return { ...stats.countMap }
}

export function aaSet(
  variant: VariantType,
  database: string,
  sample: string,
  aa: string,
  stats: ILollipopStats
): void {
  if (!(variant in stats.countMap)) {
    stats.countMap[variant] = {} //new Map<string, Set<IAAData>>())
  }
  if (!(database in stats.countMap[variant]!)) {
    stats.countMap[variant]![database] = []
  }

  stats.countMap[variant]![database]!.push({
    sample,
    aa,
  })
}

export function aaEventCounts(stats: ILollipopStats): [string, number][] {
  return Object.entries(stats.countMap)
    .map(dbEntry =>
      Object.entries(dbEntry[1]).map(
        entry => [entry[0]!, entry[1]!.length] as [string, number]
      )
    )
    .flat()
    .sort((a, b) => a[0].localeCompare(b[0]))
}

export function aaMaxEvent(stats: ILollipopStats): [string, number] {
  if (Object.keys(stats.countMap).length === 0) {
    return ['NA', -1]
  }

  return aaEventCounts(stats).sort((a, b) => b[1] - a[1])[0]!
}

export function aaSum(stats: ILollipopStats): number {
  return aaEventCounts(stats)
    .map(event => event[1])
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

//   get databases(): string[] {
//     return Object.keys(this._countMap).sort()
//   }

//   get countMap(): Record<string, Record<string, IAAData[]>> {
//     return { ...this._countMap }
//   }

//   set(event: string, database: string, sample: string, aa: string): void {
//     if (!(event in this._countMap)) {
//       this._countMap[event] = {} //new Map<string, Set<IAAData>>())
//     }
//     if (!(database in this._countMap[event]!)) {
//       this._countMap[event]![database] = []
//     }

//     this._countMap[event]![database]!.push({
//       sample,
//       aa,
//     })
//   }

//   get eventCounts(): [string, number][] {
//     return Object.entries(this._countMap)
//       .map(dbEntry =>
//         Object.entries(dbEntry[1]).map(
//           entry => [entry[0]!, entry[1]!.length] as [string, number]
//         )
//       )
//       .flat()
//       .sort((a, b) => a[0].localeCompare(b[0]))
//   }

//   get maxEvent(): [string, number] {
//     if (Object.keys(this._countMap).length === 0) {
//       return [NA, -1]
//     }

//     return this.eventCounts.sort((a, b) => b[1] - a[1])[0]!
//   }

//   get sum(): number {
//     return this.eventCounts
//       .map(event => event[1])
//       .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
//   }
// }
