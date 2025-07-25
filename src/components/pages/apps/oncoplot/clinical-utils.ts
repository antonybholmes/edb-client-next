import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import {
  COLOR_PALETTE,
  EventCountMap,
  MULTI_MUTATION,
  type IClinicalTrackProps,
} from './oncoplot-utils'

import { COLOR_REGEX } from '@lib/color/color'
import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { range } from '@lib/math/range'

const NUMERICAL_DIST_REGEX = /^\d+([\/\|]\d+)*$/

type ClinicalDataType = 'number' | 'lognumber' | 'log2number' | 'dist'

export class ClinicalDataTrack {
  _name: string
  _type: ClinicalDataType
  _samples: Map<string, EventCountMap> = new Map<string, EventCountMap>()

  private _categories: string[]

  constructor(name: string, categories: string[], type: ClinicalDataType) {
    this._name = name
    this._categories = categories
    this._type = type
  }

  get name(): string {
    return this._name
  }

  /**
   * Get all events for a track
   */
  get events(): [string, number][] {
    return [
      ...new Set(
        [...this._samples.entries()].map(entry => entry[1].events).flat()
      ),
    ].sort()
  }

  get eventsInUse(): [string, number][] {
    return this.events.filter(event => event[1] > 0)
  }

  /**
   * The ordered categories to plot
   */
  get categories(): string[] {
    //console.log(this._name, this._categories.length > 0, this.events)
    return this._categories.length > 0
      ? this._categories
      : [...new Set(this.events.map(event => event[0]))].sort()
  }

  /**
   * Return the ordered categories that are in use
   */
  get categoriesInUse(): string[] {
    const events = new Set(this.eventsInUse.map(event => event[0]))

    return this.categories.filter(category => events.has(category))
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

  set(sample: string, event: string, count: number = 1) {
    this.getEvents(sample)?.set(event, count)
  }

  get maxEvent(): [string, number] {
    // scan all samples and find highest n
    return [...this._samples.entries()]
      .map(entry => entry[1].maxEvent)
      .sort((a, b) => b[1]! - a[1]!)[0]!
  }

  getClinicalData(sample: string): [string, number][] {
    const countMap = this.getEvents(sample)

    switch (this._type) {
      case 'number':
        return [['counts', countMap.sum]]
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
): [ClinicalDataTrack[], IClinicalTrackProps[]] {
  if (!df) {
    return [[], []]
  }

  // assume first col is sample and all others are the tracks of interest

  const tracksProps: IClinicalTrackProps[] = []

  const tracks: ClinicalDataTrack[] = df.colNames.slice(1).map(header => {
    const matcher = header.match(/^([^\(\)]+)(?:\((.+)\))?/)

    let name: string = ''
    // default medium seagreen
    let color: string = ''
    let params: string[] = []
    const events: string[] = []
    let type: ClinicalDataType = 'dist'
    const multi = header.toLowerCase().includes('multi=t')

    const colorMap = new Map<string, string>()

    if (matcher) {
      // remove whitespace from name
      name = matcher[1]!.trim()

      //events = [name]

      // medium seagreen
      color = '#3cb371'

      if (matcher[2]) {
        //events = []

        params = matcher[2].split(',')

        const tokens = params[0]!.split(':')

        if (tokens.length > 1 && COLOR_REGEX.test(tokens[1]!)) {
          color = tokens[1]!
        }

        // change type if necessary
        switch (tokens[0]) {
          case 'number':
            type = 'number'
            break
          case 'lognumber':
          case 'log2number':
            type = 'log2number'
            break
          default:
            break
        }
      }

      // Add track name with color if specified, this can be used
      // to set the color of number tracks, but will not affect
      // dist or labelled tracks unless the title of the track
      // is the same as a value in the track data, in which case
      // the color of the track will be used, rather than the event
      colorMap.set(name, color)

      if (type === 'dist') {
        if (params.length > 0 && !multi) {
          params[0]!.split(/[\/\|]/).forEach(id => {
            const tokens = id.split(':')
            const event: string = tokens[0]!

            if (tokens.length > 1 && COLOR_REGEX.test(tokens[1]!)) {
              colorMap.set(event, tokens[1]!)
            }

            events.push(event)
          })
        }
      }

      //console.log(name, type, properties, events)
    }

    tracksProps.push({ show: true, colorMap })

    return new ClinicalDataTrack(name, events, type)
  })

  // load some values

  tracks.forEach((track, ti) => {
    const multi = df.colNames[ti + 1]!.toLowerCase().includes('multi=t')

    const categories = new Set([...track.categories])

    range(df.shape[0]).forEach(row => {
      const v: SeriesData = df.col(ti + 1).values[row]!

      const sample: string = df.col(0).values[row]!.toString()

      switch (track.type) {
        case 'number':

        case 'lognumber':
        case 'log2number':
          // interpret cell value as number and set to a specific
          // value such as age
          //track.set(sample, track.name, Math.log2(v as number))
          const n = Number(v)

          if (!isNaN(n)) {
            track.set(sample, track.name, v as number)
          }
          break
        default:
          const s = v.toString()
          const tokens = s.split(/[\/\|]/)

          if (NUMERICAL_DIST_REGEX.test(s)) {
            // if there is a mismatch in the length of the split values
            // and the categories, assume value is NA and create fake
            // entry of all zeros
            while (tokens.length < track.categories.length) {
              tokens.push('0')
            }

            const values: number[] = tokens.map(x => Number(x))

            if (multi && values.length > 1) {
              // ignore multiple labels and label them multi
              track.set(sample, MULTI_MUTATION, 1)
            } else {
              track.categories.forEach((event, ei) => {
                track.set(sample, event, values[ei])
              })
            }
          } else {
            // see if token is the name of an event, in which
            // case increment event by one
            tokens.forEach(event => {
              // if some categories have already been defined for
              // this dist in the header, only match events to
              // these specific ones, if no categories have been
              // set then use all of them
              if (categories.size === 0 || categories.has(event)) {
                track.set(sample, event, 1)
              }
            })
          }

          break
      }
    })
  })

  // assign colors to track events that we can update later
  tracks.forEach((track, ti) => {
    const categories = track.categories

    // switch (track.type) {
    //   case "number":
    //   case "log2number":
    //   case "lognumber":
    //     // default to medium sea green

    //     // categories.forEach(category => {
    //     //   if (!colorMaps[ti].has(category)) {
    //     //     // default to mediumseagreen
    //     //     colorMaps[ti].set(category, "#3cb371")
    //     //   }
    //     // })

    //     // break

    if (track.type === 'dist')
      // for labels or dist, use multiple colors

      categories.forEach((category, ci) => {
        if (!tracksProps[ti]!.colorMap.has(category)) {
          // default to mediumseagreen
          tracksProps[ti]!.colorMap.set(
            category,
            COLOR_PALETTE[ci % COLOR_PALETTE.length]!
          )
        }
      })
  })

  return [tracks, tracksProps]
}
