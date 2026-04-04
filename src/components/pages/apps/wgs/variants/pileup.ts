import type { IGenomicLocation } from '@/lib/genomic/genomic'
import { range } from '@/lib/math/range'
import type { IVariantDataset, IVariantSample } from './dataset-store'
import type { IVariant, IVariantResults } from './variant-store'

const VARIANT_TYPE_SORT_MAP: Record<string, number> = { DEL: 0, SNV: 1, INS: 2 }
//const VARIANT_SORT_MAP: Record<string, number> = { DEL: 0, A: 1, C: 2, G: 3, T: 4, INS: 5 }
const SNV_SORT_MAP: Record<string, number> = {
  DEL: 0,
  A: 1,
  C: 2,
  G: 3,
  T: 4,
  INS: 5,
}

// const COO_SORT_MAP: Record<string, number> = {
//   ABC: 0,
//   GCB: 1,
//   UNCLASS: 3,
//   UNC: 3,
//   U: 3,
// }

// const LYMPHGEN_CLASS_SORT_MAP: Record<string, number> = {
//   MCD: 0,
//   N1: 1,
//   EZB: 2,
//   BN2: 3,
//   ST2: 4,
//   A53: 5,
//   Other: 6,
// }

export interface IPileup {
  pos: number
  variants: IVariant[]
}

export interface IPileupResults {
  location: IGenomicLocation
  datasets: string[]
  pileup: IPileup[]
}

export interface IPileupLocation {
  variants: IVariant[]
  start: number
  pos: number
  y: number
}

export function pileup(results: IVariantResults): IPileupResults {
  const start = results.location.start
  const end = results.location.end
  const l = end - start + 1

  // put together by position, type, tum

  const pileups = range(l).map(
    i =>
      ({
        start: start + i,
        pos: i,
        variants: [] as IVariant[],
        y: 0,
      }) as IPileupLocation
  )

  let y = -1

  //the relative position from target start
  let pos = -1
  let pileup: IPileupLocation

  for (const variant of results.variants) {
    // clone since we are going to modify the variant for display purposes and don't want to modify the original data
    const v = { ...variant }
    switch (v.type) {
      case 'DEL':
        y = -1
        for (let i = 0; i < v.end - v.start + 1; i++) {
          const p = v.start + i
          pos = p - start

          if (p < start || p > end) {
            continue
          }

          pileup = pileups[pos]!

          // since we are in position order,
          // find the next height slot for this
          // entry
          if (i == 0) {
            y = nextYSlot(pileup)
          } else {
            // update every position of deletion to have
            // new y of start so that deletion will remain
            // on its own row with no breaks
            pileups[pos]!.y = pileups[pos - 1]!.y
          }

          addToPileup(v, y, pileup)
        }
        break

      case 'INS':
        pos = v.start - start
        pileup = pileups[pos]!
        y = nextYSlot(pileup)
        addToPileup(v, y, pileup)
        break
      default:
        // deal with concatenated snps e.g. ACG>TGT
        //tum := []rune(mutation.Tum)
        y = -1
        for (let i = 0; i < v.tum.length; i++) {
          const c = v.tum[i]!
          // clone and change tumor
          const v2 = { ...v }
          v2.tum = c
          v2.type = 'SNV'
          let p = v2.start + i
          const pos = p - start

          if (p < start || p > end) {
            continue
          }

          const pileup = pileups[pos]!

          if (i == 0) {
            y = nextYSlot(pileup)
          } else {
            // update every position of deletion to have
            // new y of start so that deletion will remain
            // on its own row with no break
            pileups[pos]!.y = pileups[pos - 1]!.y
          }

          addToPileup(v2, y, pileup)
        }
        break
    }
  }

  // keep only positions with something in them
  const filtered: IPileupLocation[] = []

  for (const loc of pileups) {
    if (loc.variants.length > 0) {
      filtered.push(loc)
    }
  }

  return {
    location: results.location,
    datasets: results.datasets,
    pileup: filtered,
  }
}

/**
 * Return the next y slot for a pileup location and increment the pileup location y for the next call.
 *
 * @param pileup
 * @returns
 */
function nextYSlot(pileup: IPileupLocation): number {
  const y = pileup.y
  pileup.y += 1

  return y
}

/**
 * Adds a variant to the pileup location and sets the variant y to the provided y.
 * @param variant
 * @param y
 * @param pileup
 * @returns
 */
function addToPileup(
  variant: IVariant,
  y: number,
  pileup: IPileupLocation
): IPileupLocation {
  variant.y = y

  pileup.variants.push(variant)

  return pileup
}

export function sortByCOO(
  variantResults: IVariantResults,
  sampleMap: Record<string, IVariantSample>,
  sortOrderMap: Record<string, number>,
  prioritizeVariantTypeOrder: boolean
): IVariantResults {
  const sortedVariants = variantResults.variants.sort((a, b) => {
    let s = baseSortVariantsByPos(a, b, prioritizeVariantTypeOrder)

    if (s !== 0) {
      return s
    }

    // if not found, put at end
    const acoo = sortOrderMap[sampleMap[a.sample]?.coo ?? ''] ?? 100
    const bcoo = sortOrderMap[sampleMap[b.sample]?.coo ?? ''] ?? 100

    //console.log('aSample', sampleMap[a.sample]?.coo, acoo)

    s = acoo - bcoo

    if (s !== 0) {
      return s
    }

    // if all else equal, sort by snv type so that snvs are grouped together and del/ins are grouped together
    return sortSNV(a, b)
  })

  return {
    ...variantResults,
    variants: sortedVariants,
  }
}

export function sortByLymphgen(
  variantResults: IVariantResults,
  sampleMap: Record<string, IVariantSample>,
  sortOrderMap: Record<string, number>,
  prioritizeVariantTypeOrder: boolean
): IVariantResults {
  const sortedVariants = variantResults.variants.sort((a, b) => {
    let s = baseSortVariantsByPos(a, b, prioritizeVariantTypeOrder)

    if (s !== 0) {
      return s
    }

    let tokens: string[] = (sampleMap[a.sample]?.lymphgenClass ?? '').split('/')

    let acoo = 100
    let bcoo = 100

    for (const token of tokens) {
      if (token in sortOrderMap) {
        acoo = sortOrderMap[token]!
        break
      }
    }

    tokens = (sampleMap[b.sample]?.lymphgenClass ?? '').split('/')

    for (const token of tokens) {
      if (token in sortOrderMap) {
        bcoo = sortOrderMap[token]!
        break
      }
    }

    //console.log('aSample', sampleMap[a.sample]?.lymphgenClass, acoo)

    s = acoo - bcoo

    if (s !== 0) {
      return s
    }

    // if all else equal, sort by snv type so that snvs are grouped together and del/ins are grouped together
    return sortSNV(a, b)
  })

  return {
    ...variantResults,
    variants: sortedVariants,
  }
}

// export function sortBySNV(
//   variantResults: IVariantResults,
//   prioritizeVariantTypeOrder: boolean
// ): IVariantResults {
//   const sortedVariants = variantResults.variants.sort((a, b) => {
//     return sortVariants(a, b, prioritizeVariantTypeOrder)
//   })

//   return {
//     ...variantResults,
//     variants: sortedVariants,
//   }
// }

export function sortByVariantType(
  variantResults: IVariantResults,
  prioritizeVariantTypeOrder: boolean
): IVariantResults {
  const sortedVariants = variantResults.variants.sort((a, b) => {
    const s = baseSortVariantsByPos(a, b, prioritizeVariantTypeOrder)

    if (s !== 0) {
      return s
    }

    // if all else equal, sort by snv type so that snvs are grouped together and del/ins are grouped together
    return sortSNV(a, b)
  })

  return {
    ...variantResults,
    variants: sortedVariants,
  }
}

export function sortByDataset(
  variantResults: IVariantResults,
  datasetMap: Record<string, IVariantDataset>,
  sortOrderMap: Record<string, number>,
  prioritizeVariantTypeOrder: boolean
): IVariantResults {
  const sortedVariants = variantResults.variants.sort((a, b) => {
    let s = baseSortVariantsByPos(a, b, prioritizeVariantTypeOrder)

    if (s !== 0) {
      return s
    }

    // const adatasets = a.datasets.map(d => datasetMap[d]?.name ?? '').sort()
    // const bdatasets = b.datasets.map(d => datasetMap[d]?.name ?? '').sort()

    // const len = Math.min(adatasets.length, bdatasets.length)

    // for (let i = 0; i < len; i++) {
    //   const c = adatasets[i]!.localeCompare(bdatasets[i]!)
    //   if (c !== 0) {
    //     return c
    //   }
    // }

    console.log(sortOrderMap)

    const ad = Math.min(
      ...a.datasets.map(d => sortOrderMap[datasetMap[d]?.name ?? ''] ?? 100)
    )
    const bd = Math.min(
      ...b.datasets.map(d => sortOrderMap[datasetMap[d]?.name ?? ''] ?? 100)
    )

    s = ad - bd

    if (s !== 0) {
      return s
    }

    // if all else equal, sort by snv type so that snvs are grouped together and del/ins are grouped together
    return sortSNV(a, b)
  })

  return {
    ...variantResults,
    variants: sortedVariants,
  }
}

/**
 * All sorts begin with first sorting by variant type so that
 * DELS come before SNVS which come before INSs. Variants
 * are then sorted by position to make pileups.
 *
 * @param a     a variant to compare
 * @param b     another variant to compare
 * @returns     a number indicating the sort order of the two variants
 */
function baseSortVariantsByPos(
  a: IVariant,
  b: IVariant,
  prioritizeVariantTypeOrder: boolean
): number {
  if (prioritizeVariantTypeOrder) {
    // if variant type unknown, keep a and b in original order by returning -1

    const at = VARIANT_TYPE_SORT_MAP[a.type] ?? 100
    const bt = VARIANT_TYPE_SORT_MAP[b.type] ?? 100

    const s = at - bt

    if (s !== 0) {
      return s
    }
  }

  // either a base change or replace with DEL or INS a.type === 'SNV' ? a.tum[0]! : a.type
  // const atum = SNV_SORT_MAP[a.type === 'SNV' ? a.tum[0]! : a.type] ?? 100
  // const btum = SNV_SORT_MAP[b.type === 'SNV' ? b.tum[0]! : b.type] ?? 100

  // const s = atum - btum

  // if (s !== 0) {
  //   return s
  // }

  // default sort by position so that variants are grouped together in pileups
  return a.start - b.start
}

function sortSNV(a: IVariant, b: IVariant): number {
  // either a base change or replace with DEL or INS a.type === 'SNV' ? a.tum[0]! : a.type
  const atum = SNV_SORT_MAP[a.type === 'SNV' ? a.tum[0]! : a.type] ?? 100
  const btum = SNV_SORT_MAP[b.type === 'SNV' ? b.tum[0]! : b.type] ?? 100

  return atum - btum
}
