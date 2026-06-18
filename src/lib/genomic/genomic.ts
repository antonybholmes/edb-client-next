import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { cellStr } from '@/lib/dataframe/cell'

import { range } from '@/lib/math/range'
import { makeUuid } from '../id'
import { zip } from '../utils'
import { formatChr } from './dna'
import {
  LOC_REGEX,
  newGenomicLocation,
  parseGenomicLocation,
  STANDARDIZED_LOC_REGEX,
  type IGenomicLocation,
  type Strand,
} from './genomic-location'

/**
 * Genomic location class representing a region on a genome.
 * This is for creating singleton locations and should be
 * used where possible. IGeomicLocation is for JSON
 * representations of locations.
 */
export class GenLoc {
  private _id: string
  private _chr: string
  private _start: number
  private _end: number
  private _strand: Strand

  constructor(
    chr: string | number,
    start: number,
    end: number,
    strand: Strand = '.'
  ) {
    this._chr = formatChr(chr)
    // start must be 1 since locations use 1 based counting
    // this should deal with people giving stupid coordinates
    // such as starts greater than ends and negative numbers.
    // A location will always resolve so chrX:1-1 at worst.
    this._start = Math.max(1, Math.round(Math.min(start, end)))
    // end must be greater equal to start
    this._end = Math.round(Math.max(this._start, end))
    this._strand = strand
    // create a unique id for this location which consists of
    // location and a uuid to ensure uniqueness
    this._id = `${this._chr}|${this._start}|${this._end}|${this._strand}|${makeUuid()}`
  }

  /**
   * Unique identifier for the location. This is primarily used
   * to distinguish between locations that have the same coordinates
   * but are different instances, for example in a list of locations.
   */
  get id(): string {
    return this._id
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

  get strand(): Strand {
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
    return {
      chr: this._chr,
      start: this._start,
      end: this._end,
      strand: this._strand,
    }
  }

  /** Convert to IGenomicLocation */
  toGenomicLocation(): IGenomicLocation {
    return toGenomicLocation(this)
  }
}

export const NO_LOC = new GenLoc('chr0', 0, 0)

export interface ILocationFile {
  fid: string
  locations: IGenomicLocation[]
}

/**
 * Turns a JSON genomic location into a string of the form chrx:y-z
 * which is commonly used to represent genomic locations and can be
 * parsed as a location or used as an identifier.
 *
 * @param loc
 * @returns
 */
export function locStr(
  loc: IGenomicLocation | GenLoc | null | undefined
): string {
  if (!loc) {
    return ''
  }
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

export function parseGenLoc(
  location: string,
  padding5p: number = 0,
  padding3p: number = 0
): GenLoc {
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

  return new GenLoc(chr, start - padding5p, end + padding3p)
}

export function toGenLoc(
  location: IGenomicLocation,
  padding5p: number = 0,
  padding3p: number = 0
): GenLoc {
  return new GenLoc(
    location.chr,
    location.start - padding5p,
    location.end + padding3p
  )
}

export function toGenomicLocation(
  location: GenLoc,
  padding5p: number = 0,
  padding3p: number = 0
): IGenomicLocation {
  return {
    chr: location.chr,
    start: location.start - padding5p,
    end: location.end + padding3p,
    strand: location.strand,
  }
}

export function overlapFraction(
  location1: IGenomicLocation | GenLoc | undefined,
  location2: IGenomicLocation | GenLoc | undefined
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

export function parseGenLocs(lines: string[]): GenLoc[] {
  const ret: GenLoc[] = []
  let location: GenLoc

  lines.forEach((line: string) => {
    const tokens = line.trim().split('\t')

    const l: string = tokens[0]!

    if (isLocation(l)) {
      location = parseGenLoc(l)!
    } else if (isChr(l)) {
      location = new GenLoc(
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
  const ret: { fid: string; locations: IGenomicLocation[] } = {
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
    ).map(v => new GenLoc(v[0] as string, v[1] as number, v[2] as number))
  } else {
    // first col is treated as location
    ret.locations = df.col(0).values.map(v => parseGenomicLocation(v as string))
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
  let location: GenLoc

  const ret: { fid: string; locations: GenLoc[] }[] = df.columns.map(col => ({
    fid: col,
    locations: [],
  }))

  for (const coli of range(df.shape[1])) {
    for (const v of df.col(coli).values) {
      const c1 = cellStr(v)
      if (isLocation(c1)) {
        location = parseGenLoc(c1)!

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
  loc1: IGenomicLocation | GenLoc,
  loc2: IGenomicLocation | GenLoc
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
  loc1: IGenomicLocation | GenLoc | undefined,
  loc2: IGenomicLocation | GenLoc | undefined
): GenLoc | null {
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

  return new GenLoc(loc1.chr, max_start, min_end)
}

export function joinLocations(
  loc1: IGenomicLocation | GenLoc,
  loc2: IGenomicLocation | GenLoc
): IGenomicLocation {
  return newGenomicLocation(
    loc1.chr,
    Math.min(loc1.start, loc2.start),
    Math.max(loc1.end, loc2.end)
  )
}

export function locWidth(loc: IGenomicLocation | GenLoc) {
  return loc.end - loc.start + 1
}

export class LocationBinMap {
  private _binSize: number
  private _binMap: Map<string, Map<number, IGenomicLocation[]>>

  constructor(locations: IGenomicLocation[], binSize: number = 1000) {
    this._binSize = binSize
    this._binMap = new Map<string, Map<number, IGenomicLocation[]>>()

    locations.forEach(location => {
      const s = Math.floor(location.start / binSize)
      const e = Math.floor(location.end / binSize)

      if (!this._binMap.has(location.chr)) {
        this._binMap.set(location.chr, new Map<number, IGenomicLocation[]>())
      }

      range(s, e + 1).forEach(b => {
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
  search(location: IGenomicLocation | GenLoc): IGenomicLocation[] {
    const ret: IGenomicLocation[] = []

    if (this._binMap.has(location.chr)) {
      const s = Math.floor(location.start / this._binSize)
      const e = Math.floor(location.end / this._binSize)

      range(s, e + 1).forEach(() => {
        if (this._binMap.get(location.chr)?.has(s)) {
          this._binMap
            .get(location.chr)
            ?.get(s)
            ?.forEach(l => {
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

export function sortLocations<T extends IGenomicLocation | GenLoc>(
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
