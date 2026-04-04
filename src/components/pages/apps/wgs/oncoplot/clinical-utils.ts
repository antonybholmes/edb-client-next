import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import {
  COLOR_PALETTE,
  EventCountMap,
  MULTI_MUTATION,
  type IClinicalTrackProps,
  type IEvent,
} from './oncoplot-utils'

import { COLOR_REGEX } from '@/lib/color/color'

import type { SeriesData } from '@/lib/dataframe'
import { range } from '@/lib/math/range'

const LABEL_SEP_REGEX = /[\/\|]/

//const NUMERICAL_DIST_REGEX = /^\d+([\/\|]\d+)*$/

type ClinicalDataType = 'number' | 'log' | 'log2' | 'dist' | 'category'

export interface IClinicalCategory {
  name: string
  color: string
}

export interface IClinicalTrack {
  name: string
  type: ClinicalDataType
  categories: string[]
  events: [string, number][]
}

export class ClinicalDataTrack {
  _name: string
  _type: ClinicalDataType
  _samples: Map<string, EventCountMap> = new Map<string, EventCountMap>()

  private _categories: string[] = []

  constructor(type: ClinicalDataType, name: string, categories: string[] = []) {
    this._type = type
    this._name = name

    this._categories = categories
  }

  get name(): string {
    return this._name
  }

  /**
   * Get the default color for the track. This is used for number tracks
   * to set the color of the bar.
   */
  // get color(): string {
  //   return this._color
  // }

  // /**
  //  * Returns the color for a specific category/event or undefined
  //  * if not found. These colors are defined when the track is created
  //  * and therefore should be undefined
  //  * @param category
  //  * @returns
  //  */
  // categoryColor(category: string): string {
  //   return this._categoryColors.get(category) ?? COLOR_BLACK
  // }

  /**
   * Get all events for a track
   */
  get events(): IEvent[] {
    return [
      ...new Set(
        [...this._samples.entries()].map(entry => entry[1].events).flat()
      ),
    ].sort()
  }

  get eventsInUse(): IEvent[] {
    return this.events.filter(event => event.value > 0)
  }

  /**
   * The ordered categories to plot
   */
  get categories(): string[] {
    //console.log(this._name, this._categories.length > 0, this.events)
    return this._categories
  }

  /**
   * Return the ordered categories that are in use
   */
  get categoriesInUse(): string[] {
    const events = new Set(this.eventsInUse.map(event => event.name))

    //console.log('categoriesInUse:', this._name, events, this.categories)

    return this.categories.filter(category =>
      events.has(category.toLowerCase())
    )
  }

  get type(): ClinicalDataType {
    return this._type
  }

  getEvents(sample: string): EventCountMap {
    if (!this._samples.has(sample)) {
      this._samples.set(sample, new EventCountMap())
    }

    return this._samples.get(sample)!
  }

  /**
   * Returns the category with the highest count for a sample.
   * We use this for categorical clinical tracks where the
   * count is not used.
   * @param sample
   * @returns
   */
  category(sample: string): string {
    return this.getEvents(sample).maxEvent.name
  }

  add(sample: string, category: string, count: number = 1) {
    this.getEvents(sample)?.add(category, count)
  }

  get maxEvent(): IEvent {
    // scan all samples and find highest n
    return [...this._samples.entries()]
      .map(entry => entry[1].maxEvent)
      .sort((a, b) => b.value - a.value)[0]!
  }

  getClinicalData(sample: string): IEvent[] {
    const countMap = this.getEvents(sample)

    switch (this._type) {
      case 'number':
        return [{ name: 'counts', value: countMap.sum }]
      case 'dist':
        return countMap.normCountDist(this._categories)
      default:
        // label
        return [countMap.maxEvent]
    }
  }
}

export function makeClinicalTracks(
  df: BaseDataFrame | undefined | null
): [ClinicalDataTrack[], Record<string, IClinicalTrackProps>] {
  if (!df) {
    return [[], {}]
  }

  // assume first col is sample and all others are the tracks of interest

  const tracksProps: Record<string, IClinicalTrackProps> = {}

  const tracks: ClinicalDataTrack[] = df.columns.slice(1).map((header, hi) => {
    //const matcher = header.match(/^([^\(\)]+)(?:\((.+)\))?/)

    const tokens = header.split(':')

    const name: string = tokens[0]!.trim()
    const type: ClinicalDataType =
      (tokens[1]?.trim().toLowerCase() as ClinicalDataType) ?? 'category'

    const opts: Record<string, string> = {}

    if (tokens.length > 2) {
      for (const kv of tokens[2]!.split(',')) {
        const [key, value] = kv.split('=')
        opts[key!.trim().toLowerCase()] = value!.trim()
      }
    }

    // default medium seagreen

    const categories: IClinicalCategory[] = []

    const multi = header.toLowerCase().includes('multi=t')

    //const colorMap: Record<string, string> = {}

    //events = [name]

    // medium seagreen
    const color = opts['color'] ?? '#3cb371'

    // Add track name with color if specified, this can be used
    // to set the color of number tracks, but will not affect
    // dist or labelled tracks unless the title of the track
    // is the same as a value in the track data, in which case
    // the color of the track will be used, rather than the event
    //colorMap[name] = color

    switch (type) {
      case 'dist':
        if (!multi) {
          for (const [ci, label] of (
            opts['labels']?.split(LABEL_SEP_REGEX) ?? []
          ).entries()) {
            const lt = label.split(':')
            const event: string = lt[0]!

            const color =
              lt.length > 1 && COLOR_REGEX.test(lt[1]!)
                ? lt[1]!
                : COLOR_PALETTE[ci % COLOR_PALETTE.length]!

            categories.push({ name: event, color: color })
          }
        }

        break
      case 'category':
        // categorial track, extract all unique values from the column
        categories.push(
          ...[...new Set<string>(df.col(hi + 1).strs)]
            .sort()
            .map((category, ci) => {
              return {
                name: category,
                color: COLOR_PALETTE[ci % COLOR_PALETTE.length]!,
              }
            })
        )

        break
      default:
        break
    }

    tracksProps[name] = {
      show: true,
      color: color,
      categoryColors: Object.fromEntries(
        categories.map(c => [c.name.toLowerCase(), c.color])
      ),
      name: name,
    }

    console.log(categories, df, 'getting closer')

    return new ClinicalDataTrack(
      type,
      name,
      categories.map(c => c.name)
    )
  })

  // load some values

  for (const [ti, track] of tracks.entries()) {
    const multi = df.columns[ti + 1]!.toLowerCase().includes('multi=t')

    for (const row of range(df.shape[0])) {
      const v: SeriesData = df.col(ti + 1).values[row]!

      const sample: string = df.col(0).values[row]!.toString()

      switch (track.type) {
        case 'number':
        case 'log2':
          // interpret cell value as number and set to a specific
          // value such as age
          //track.set(sample, track.name, Math.log2(v as number))
          const n = Number(v)

          if (!isNaN(n)) {
            track.add(sample, track.name, v as number)
          }
          break
        case 'dist':
          {
            const event = v.toString()
            const tokens = event.split(LABEL_SEP_REGEX)

            // if there is a mismatch in the length of the split values
            // and the categories, assume value is NA and create fake
            // entry of all zeros
            while (tokens.length < track.categories.length) {
              tokens.push('0')
            }

            const counts: number[] = tokens.map(x => Number(x))

            if (multi && counts.length > 1) {
              // ignore multiple labels and label them multi
              track.add(sample, MULTI_MUTATION, 1)
            } else {
              for (const [ei, category] of track.categories.entries()) {
                track.add(sample, category, counts[ei])
              }
            }
          }
          break
        case 'category':
          const event = v.toString()

          track.add(sample, event, 1)

          break
        default:
          //break
          console.warn(
            `Unknown clinical data track type: ${track.type} for track ${track.name}`
          )
          break
      }
    }
  }

  // assign colors to track events that we can update later
  // for (const [ti, track] of tracks.entries()) {
  //   const categories = track.categories

  //   // switch (track.type) {
  //   //   case "number":
  //   //   case "log2number":
  //   //   case "lognumber":
  //   //     // default to medium sea green

  //   //     // categories.forEach(category => {
  //   //     //   if (!colorMaps[ti].has(category)) {
  //   //     //     // default to mediumseagreen
  //   //     //     colorMaps[ti].set(category, "#3cb371")
  //   //     //   }
  //   //     // })

  //   //     // break

  //   //if (track.type === 'dist')
  //   // for labels or dist, use multiple colors

  //   // for (const [ci, category] of categories.entries()) {
  //   //   if (!(category in tracksProps[ti]!.colorMap)) {
  //   //     // default to mediumseagreen
  //   //     tracksProps[ti]!.colorMap[category] =
  //   //       COLOR_PALETTE[ci % COLOR_PALETTE.length]!
  //   //   }
  //   // }
  // }

  console.log('Made clinical tracks:', tracks)

  return [tracks, tracksProps]
}
