import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { cellStr } from '@lib/dataframe/cell'

import { range } from '@lib/math/range'
import { zip } from '../utils'
import { formatChr } from './dna'

/**
 * This is useful for api calls that return locations
 * but as JSON rather than objects. Largely interchangable
 * with the GenomicLocation object.
 */
export interface IGenomicLocation {
  chr: string
  start: number
  end: number
  strand: string
}

export class GenomicLocation {
  private _chr: string
  private _start: number
  private _end: number
  private _strand: string

  constructor(
    chr: string | number,
    start: number,
    end: number,
    strand: string = '.'
  ) {
    this._chr = formatChr(chr)
    // start must be 1 since locations use 1 based counting
    // this should deal with people giving stupid coordinates
    // such as starts greater than ends and negative numbers.
    // A location will always resolve so chrX:1-1 at worst.
    this._start = Math.max(1, Math.round(Math.min(start, end)))
    // end must be greater equal to start
    this._end = Math.max(this._start, Math.round(Math.max(start, end)))
    this._strand = strand
  }

  get chr(): string {
    return this._chr
  }

  get start(): number {
    return this._start
  }

  get end(): number {
    return this._end
  }

  get strand(): string {
    return this._strand
  }

  /**
   * Returns a string representation of the location
   * in the form chr:start-end
   */
  get loc(): string {
    return `${this.chr}:${this.start}-${this.end}`
  }

  get length(): number {
    return this.end - this.start + 1
  }

  get formatted(): string {
    return `${this.chr}:${this.start.toLocaleString()}-${this.end.toLocaleString()}`
  }

  toString(): string {
    return this.loc
  }

  toJson() {
    return { chr: this._chr, start: this._start, end: this._end }
  }
}

export const NO_LOCATION = new GenomicLocation('chr0', 0, 0)

export interface ILocationFile {
  fid: string
  locations: GenomicLocation[]
}

/**
 * Turns a genomic location into a string of the form chrx:y-z.
 *
 * @param loc
 * @returns
 */
export function locStr(loc: GenomicLocation | IGenomicLocation): string {
  return `${loc.chr}:${loc.start}-${loc.end}`
}

export function isLocation(location: string): boolean {
  return /(chr.+):(\d+)-(\d+)/.test(location)
}

export function isChr(location: string): boolean {
  return /chr.+/.test(location)
}

// export class Location {
//   _chr: string
//   _start: number
//   _end: number
//   _length: number

//   constructor(chr: string, start: number, end: number) {
//     this._chr = chr
//     this._start = Math.max(1, start)
//     this._end = Math.max(start, end)
//     this._length = this._end - this._start + 1
//   }

//   get chr() {
//     return this._chr
//   }

//   get start() {
//     return this._start
//   }

//   get end() {
//     return this._end
//   }

//   get length() {
//     return this._length
//   }

//   toString() {
//     return locationString(this._chr, this._start, this._end)
//   }

//   equals(l: Location): boolean {
//     return this.chr === l.chr && this.start === l.start && this.end === l.end
//   }
// }

//export const NULL_LOCATION: Location = new Location("chr-", -1, -1)
export const LOC_REGEX = /(chr.+):(\d+)-(\d+)/

const STANDARDIZED_LOC_REGEX = /(chr.+)-(\d+)-(\d+)/

export function parseLocation(
  location: string,
  padding5p: number = 0,
  padding3p: number = 0
): GenomicLocation {
  const matcher = location
    .replaceAll(',', '')
    .replaceAll(':', '-')
    .match(STANDARDIZED_LOC_REGEX)

  if (!matcher) {
    throw new Error('invalid location')
  }

  const chr = matcher[1]!
  const start = parseInt(matcher[2]!)
  const end = parseInt(matcher[3]!)

  return new GenomicLocation(chr, start - padding5p, end + padding3p)
}

export function toLocation(
  location: IGenomicLocation,
  padding5p: number = 0,
  padding3p: number = 0
): GenomicLocation {
  return new GenomicLocation(
    location.chr,
    location.start - padding5p,
    location.end + padding3p
  )
}

export function overlapFraction(
  location1: GenomicLocation | IGenomicLocation | undefined,
  location2: GenomicLocation | IGenomicLocation | undefined
): number {
  if (!location1 || !location2) {
    return 0
  }

  if (location1.chr !== location2.chr) {
    return 0
  }

  const maxStart = Math.max(location1.start, location2.start)
  const minEnd = Math.min(location1.end, location2.end)

  if (minEnd < maxStart) {
    return 0
  }

  return (minEnd - maxStart + 1) / (location2.end - location2.start + 1)
}

/**
 * Parse a genomic location.
 *
 * @param loc a string of the form chr:100-1000
 * @returns a location object if the string is parsable, null otherwise
 */
// export function parseLoc(loc: string): GenomicLocation | null {
//   const tokens = loc.trim().replace(':', '-').split('-')

//   if (tokens.length < 3 || !isChr(tokens[0]!)) {
//     return null
//   }

//   const start = parseInt(tokens[1]!.replaceAll(/,/g, ''), 10)

//   if (isNaN(start)) {
//     return null
//   }

//   const end = parseInt(tokens[2]!.replaceAll(/,/g, ''), 10)

//   if (isNaN(end)) {
//     return null
//   }

//   return new GenomicLocation(tokens[0]!, start, end)
// }

export function parseLocations(lines: string[]): GenomicLocation[] {
  const ret: GenomicLocation[] = []
  let location: GenomicLocation

  lines.forEach((line: string) => {
    const tokens = line.trim().split('\t')

    const l: string = tokens[0]!

    if (isLocation(l)) {
      location = parseLocation(l)!
    } else if (isChr(l)) {
      location = new GenomicLocation(
        l,
        parseInt(tokens[1]!.replaceAll(/,/g, '')),
        parseInt(tokens[2]!.replaceAll(/,/g, ''))
      )
    } else {
      return
    }

    ret.push(location)
  })

  return ret
}

export function convertDFToLocationFile(df: BaseDataFrame): ILocationFile {
  const ret: { fid: string; locations: GenomicLocation[] } = {
    fid: df.name,
    locations: [],
  }

  const isBed = !df.get(0, 0).toString().match(LOC_REGEX)

  if (isBed) {
    // 3 col format
    ret.locations = zip(
      df.col(0).values,
      df.col(1).values,
      df.col(2).values
    ).map(
      (v) => new GenomicLocation(v[0] as string, v[1] as number, v[2] as number)
    )
  } else {
    // first col is treated as location
    ret.locations = df.col(0).values.map((v) => parseLocation(v as string))
  }

  // keep them sorted
  ret.locations = sortLocations(ret.locations)

  //const uid = getUid(fid, location)

  // range(colStart, tokens.length).forEach(col => {
  // 	extData.get(uid)?.set(col, tokens[ext_col_indexes[col]])
  // })

  return ret
}

/**
 * Assume each column is a list of locations from a separate analysis and
 * convert into location files so we can overlap them etc.
 *
 * @param df
 * @returns
 */
export function convertDataFrameToLocationFiles(
  df: BaseDataFrame
): ILocationFile[] {
  let location: GenomicLocation

  const ret: { fid: string; locations: GenomicLocation[] }[] = df.colNames.map(
    (col) => ({
      fid: col,
      locations: [],
    })
  )

  for (const coli of range(df.shape[1])) {
    for (const v of df.col(coli).values) {
      const c1 = cellStr(v)
      if (isLocation(c1)) {
        location = parseLocation(c1)!

        ret[coli]!.locations.push(location)
      }
    }

    // Ensure sorted
    ret[coli]!.locations = sortLocations(ret[coli]!.locations)
  }

  return ret
}

/**
 * Returns true if loc1 is within loc2.
 *
 * @param loc1
 * @param loc2
 */
export function locWithin(
  loc1: GenomicLocation | IGenomicLocation,
  loc2: GenomicLocation | IGenomicLocation
) {
  if (loc1.chr !== loc2.chr) {
    return false
  }

  return loc1.end >= loc2.start && loc1.start <= loc2.end
}

/**
 * Returns the overlap portion of two coordinates or null if they
 * do not overlap.
 *
 * @param loc1
 * @param loc2
 * @returns
 */
export function overlaps(
  loc1: GenomicLocation | IGenomicLocation | undefined,
  loc2: GenomicLocation | IGenomicLocation | undefined
): GenomicLocation | null {
  if (loc1 === undefined || loc2 === undefined) {
    return null
  }

  if (loc1.chr != loc2.chr) {
    return null
  }

  const max_start = Math.max(loc1.start, loc2.start)
  const min_end = Math.min(loc1.end, loc2.end)

  if (min_end < max_start) {
    return null
  }

  return new GenomicLocation(loc1.chr, max_start, min_end)
}

export function joinLocations(
  loc1: GenomicLocation | IGenomicLocation,
  loc2: GenomicLocation | IGenomicLocation
): GenomicLocation {
  return new GenomicLocation(
    loc1.chr,
    Math.min(loc1.start, loc2.start),
    Math.max(loc1.end, loc2.end)
  )
}

export function locWidth(loc: GenomicLocation | IGenomicLocation) {
  return loc.end - loc.start + 1
}

export class LocationBinMap {
  private _binSize: number
  private _binMap: Map<string, Map<number, GenomicLocation[]>>

  constructor(locations: GenomicLocation[], binSize: number = 1000) {
    this._binSize = binSize
    this._binMap = new Map<string, Map<number, GenomicLocation[]>>()

    locations.forEach((location) => {
      const s = Math.floor(location.start / binSize)
      const e = Math.floor(location.end / binSize)

      if (!this._binMap.has(location.chr)) {
        this._binMap.set(location.chr, new Map<number, GenomicLocation[]>())
      }

      range(s, e + 1).forEach((b) => {
        //console.log(location, s, e)
        if (!this._binMap.get(location.chr)?.has(b)) {
          this._binMap.get(location.chr)?.set(b, [])
        }

        this._binMap.get(location.chr)?.get(b)?.push(location)
      })
    })
  }

  /**
   * Returns genomic locations overlapping the search location
   *
   * @param location location to search for
   * @returns
   */
  search(location: GenomicLocation | IGenomicLocation): GenomicLocation[] {
    const ret: GenomicLocation[] = []

    if (this._binMap.has(location.chr)) {
      const s = Math.floor(location.start / this._binSize)
      const e = Math.floor(location.end / this._binSize)

      range(s, e + 1).forEach(() => {
        if (this._binMap.get(location.chr)?.has(s)) {
          this._binMap
            .get(location.chr)
            ?.get(s)
            ?.forEach((l) => {
              if (overlaps(location, l)) {
                ret.push(l)
              }
            })
        }
      })
    }

    return ret
  }
}

export function sortLocations<T extends GenomicLocation | IGenomicLocation>(
  locations: T[]
): T[] {
  return locations.sort((a, b) => {
    const chrSort = a.chr.localeCompare(b.chr)

    if (chrSort !== 0) {
      return chrSort
    }

    const d = a.start - b.start

    if (d !== 0) {
      return d
    }

    return a.end - b.end
  })
}
