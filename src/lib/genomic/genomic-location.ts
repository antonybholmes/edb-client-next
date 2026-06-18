import { formatChr } from './dna'

export type Strand = '+' | '-' | '.'

//export const NULL_LOCATION: Location = new Location("chr-", -1, -1)
export const LOC_REGEX = /((?:chr)?(?:[0-9]+|X|Y|M|MT)):(\d+)-(\d+)/i

export const STANDARDIZED_LOC_REGEX = /(chr.+)-(\d+)-(\d+)/

/**
 * This is useful for api calls that return locations
 * but as JSON rather than objects. Largely interchangable
 * with the GenomicLocation object.
 */
export interface IGenomicLocation {
  chr: string
  start: number
  end: number
  strand: Strand
}

export function newGenomicLocation(
  chr: string | number,
  start: number,
  end: number,
  strand: Strand = '.'
): IGenomicLocation {
  start = Math.max(1, Math.round(Math.min(start, end)))
  end = Math.round(Math.max(start, end))
  return {
    chr: formatChr(chr),
    start,
    end,
    strand,
  }
}

/**
 * Test if object is a genomic location
 * @param o
 * @returns
 */
export function isGenomicLocation(o: any): boolean {
  return (
    typeof o === 'object' &&
    o !== null &&
    typeof o.chr === 'string' &&
    typeof o.start === 'number' &&
    typeof o.end === 'number' &&
    typeof o.strand === 'string'
  )
}

export function parseGenomicLocation(
  location: string,
  padding5p: number = 0,
  padding3p: number = 0
): IGenomicLocation {
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

  return newGenomicLocation(chr, start - padding5p, end + padding3p)
}

export const NO_LOCATION = newGenomicLocation('chr0', 0, 0)
