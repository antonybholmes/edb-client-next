import { GenomicLocation, type IGenomicLocation } from './genomic'
import { GenomicFeatureIndex } from './genomic-index'

export function indexBed(
  name: string,
  lines: string[]
): GenomicFeatureIndex<IGenomicLocation> | null {
  const tokens = lines
    .filter(line => !line.startsWith('track'))
    .map(row => row.split('\t'))

  if (tokens[0]!.length < 3) {
    return null
  }

  let v = Number(tokens[0]![1]!)

  if (Number.isNaN(v)) {
    return null
  }

  v = Number(tokens[0]![2]!)

  if (Number.isNaN(v)) {
    return null
  }

  const bed = tokens.map(
    row => new GenomicLocation(row[0]!, Number(row[1]!), Number(row[2]!))
  )

  return new GenomicFeatureIndex(name, bed)
}
