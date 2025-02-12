import { DefaultMap } from '@lib/default-map'
import { NA } from '@lib/text/text'

import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { makeCell, makeCells } from '@lib/dataframe/cell'
import { DataFrame } from '@lib/dataframe/dataframe'

import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { range } from '@lib/math/range'
import {
  GenomicLocation,
  convertDFToLocationFile as convertDataFrameToLocationFile,
  convertDataFrameToLocationFiles,
  joinLocations,
  locStr,
  overlapFraction,
  overlaps,
  parseLocation,
  sortLocations,
  type ILocationFile,
} from '../genomic'

export const BIN_SIZE = 1000

export type OVERLAP_MODE = 'mcr' | 'max'

function makeGenomicUniqueId(
  sid: string,
  loc: GenomicLocation | null | undefined
) {
  return `${sid}=${loc ? locStr(loc) : 'none'}`
}

function parseGenomicUid(uid: string): string[] {
  return uid.split('=')
}

function getTestUids(
  uid1: string,
  loc1: GenomicLocation,
  binToUidsMap: Map<number, Set<string>>
): Set<string> {
  const testLocations = new Set<string>()

  const binStart = Math.floor(loc1.start / BIN_SIZE)
  const binEnd = Math.floor(loc1.end / BIN_SIZE)

  for (const bin of range(binStart, binEnd + 1)) {
    for (const uid of binToUidsMap.get(bin) ?? []) {
      //const [sid2, l2] = parseUid(uid)
      if (uid !== uid1) {
        // only test samples from other file
        testLocations.add(uid)
      }
    }
  }

  return testLocations
}

/**
 * Calculates the min/max common region between a set of sample locations
 *
 * @param sampleIdMap
 * @param uidToLocMap
 * @param binToUidsMap
 * @param list
 * @param param4
 */
function _minMaxRegions(
  uids: string[],
  uidToLocMap: Map<string, GenomicLocation>,
  binToUidsMap: Map<number, Set<string>>
): Map<string, Map<string, string>> {
  // lets see what overlaps

  const locationCoreMap = new DefaultMap<string, Map<string, string>>(
    () => new Map<string, string>()
  )

  // debug for testing to end remove as it truncates list
  // locations = locations[1:(len(locations) / 4)]

  //console.warn(`Processing ${uids.length}...`)

  let loc1: GenomicLocation
  let loc2: GenomicLocation

  // keep track of all locations that have been allocated at least once
  const allocated = new Set<string>()

  //test all locations in first sample
  for (const uid1 of uids) {
    // of the form id=chrN:start-end, an lid

    if (allocated.has(uid1)) {
      continue
    }

    // get its location
    loc1 = uidToLocMap.get(uid1)!

    const used = new Set<string>()

    const groupedLocations = [uid1]

    let stop = false

    while (!stop) {
      // assume we are going to stop
      stop = true

      const testUids = getTestUids(uid1, loc1, binToUidsMap)

      for (const uid2 of testUids) {
        if (used.has(uid2)) {
          continue
        }

        loc2 = uidToLocMap.get(uid2)!

        const overlap = overlaps(loc1, loc2)

        if (overlap !== null) {
          // they overlap so make the test location the resulting maximal overlap
          loc1 = joinLocations(loc1, loc2)

          groupedLocations.push(uid2)

          used.add(uid2)

          // we found something that overlaps, so increase size of test region
          // and repeat using this larger region until we can add no more
          stop = false
          //break
        }
      }
    }
    // now we have a list of all locations that overlap each other so find the min and max
    //overlapLocation = `${loc1.chr}:${Math.min(...groupedLocations.map(uid => uidToLocMap.get(uid)!.start))}-${Math.max(...groupedLocations.map(uid => uidToLocMap.get(uid)!.end))}`

    for (const uid of groupedLocations) {
      // sid is a sample id
      const [sid] = parseGenomicUid(uid)

      locationCoreMap.get(loc1.loc)?.set(sid!, uid)

      allocated.add(uid)
    }
  }

  // after iterating over everything, group locations by group

  return locationCoreMap
}

/**
 * Calculates the minimal common region between a set of sample locations
 *
 * @param sampleIdMap
 * @param uidToLocMap
 * @param binToUidsMap
 * @param list
 * @param param4
 */
function _mcr(
  uids: string[],
  uidToLocMap: Map<string, GenomicLocation>,
  binToUidsMap: Map<number, Set<string>>
): Map<string, Map<string, string>> {
  // lets see what overlaps

  const locationCoreMap = new DefaultMap<string, Map<string, string>>(
    () => new Map<string, string>()
  )

  // debug for testing to end remove as it truncates list
  // locations = locations[1:(len(locations) / 4)]

  //console.warn(`Processing ${uids.length}...`)

  let loc1: GenomicLocation
  let loc2: GenomicLocation

  //let overlapLocation: string

  // keep track of all locations that have been allocated at least once
  const allocated = new Set<string>()

  //test all locations in first sample
  for (const uid1 of uids) {
    // of the form id=chrN:start-end, an lid

    // The seed of an mcr must be a location that has not already been
    // assigned to some other mcr
    if (allocated.has(uid1)) {
      continue
    }

    const [sid1] = parseGenomicUid(uid1)

    // get its location
    loc1 = uidToLocMap.get(uid1)!

    //group1 = location_group_map[uid1]

    const testUids = getTestUids(uid1, loc1, binToUidsMap)

    const used = new Set<string>()

    // Form the largest group of overlapping peaks
    let exhausted = false

    while (!exhausted) {
      const groupedLocations = [uid1]

      // reset for each group search. We keep testing
      // locations to account for overlapping multiple
      // distinct peaks which can generate multiple locations
      // when we find the mcrs
      loc1 = uidToLocMap.get(uid1)!

      for (const uid2 of testUids) {
        if (used.has(uid2)) {
          continue
        }

        loc2 = uidToLocMap.get(uid2)!

        const overlap = overlaps(loc1, loc2)

        if (overlap !== null) {
          // they overlap so make the test location be the overlap
          loc1 = overlap
          groupedLocations.push(uid2)
        }
      }

      // now we have a list of all locations that overlap each other

      // if we have a group of entries, merge them, otherwise if the
      // location is by itself, only add it if it has not been allocated
      // to another group. This prevents duplicate entries of the whole
      // region by itself plusunknown overlapping regions
      if (groupedLocations.length > 1) {
        //overlapLocation = loc1.loc // f'{chr1}:{start1}-{end1}'

        for (const uid of groupedLocations) {
          // sid is a sample id
          const [sid] = parseGenomicUid(uid)

          if (sid) {
            // .add(location)
            locationCoreMap.get(loc1.loc)?.set(sid, uid)

            used.add(uid)
            allocated.add(uid)
          }
        }
      } else {
        if (!allocated.has(uid1)) {
          // add single locations, only if they have not been
          // allocated elsewhere
          locationCoreMap.get(loc1.loc)?.set(sid1!, uid1)
          allocated.add(uid1)
        }

        // no more to add so quit looping
        exhausted = true
        break
      }
    }
  }

  // after iterating over everything, group locations by group

  return locationCoreMap
}

export function overlappingPeaks(
  fids: ILocationFile[],
  mode: OVERLAP_MODE = 'mcr'
): [Map<string, Map<string, string>>, Map<string, GenomicLocation>] {
  const sampleIdMap = new Map<string, string>()
  const uidToLocMap = new Map<string, GenomicLocation>()
  const binToUidsMap = new Map<number, Set<string>>()
  const uids: string[] = []

  console.log(fids)

  for (const entry of fids) {
    const { fid, locations } = entry

    for (const location of sortLocations(locations)) {
      const uid = makeGenomicUniqueId(fid, location)

      uids.push(uid)

      // mapping from location id to sample id
      sampleIdMap.set(uid, fid)

      uidToLocMap.set(uid, location)

      const binStart = Math.floor(location.start / BIN_SIZE)
      const binEnd = Math.floor(location.end / BIN_SIZE)

      for (const bin of range(binStart, binEnd + 1)) {
        if (!binToUidsMap.has(bin)) {
          binToUidsMap.set(bin, new Set<string>())
        }

        binToUidsMap.get(bin)?.add(uid)
      }
    }
  }

  const locationCoreMap =
    mode === 'max'
      ? _minMaxRegions(uids, uidToLocMap, binToUidsMap)
      : _mcr(uids, uidToLocMap, binToUidsMap) //[fid[0] for fid in fids])

  return [locationCoreMap, uidToLocMap]
}

export function createOverlapTableFromDataframes(
  dataFrames: BaseDataFrame[],
  mode: OVERLAP_MODE = 'mcr'
): DataFrame | null {
  return createOverlapTable(
    dataFrames.map((df) => convertDataFrameToLocationFile(df)),
    mode
  )
}

export function createOverlapTableFromDataframe(
  df: BaseDataFrame,
  mode: OVERLAP_MODE = 'mcr'
): DataFrame | null {
  return createOverlapTable(convertDataFrameToLocationFiles(df), mode)
}

export function createOverlapTable(
  locationFiles: ILocationFile[],
  mode: OVERLAP_MODE = 'mcr'
): DataFrame | null {
  if (locationFiles.length === 0) {
    return null
  }

  const [locationCoreMap, locationMap] = overlappingPeaks(locationFiles, mode)

  const fids = locationFiles.map((file) => file.fid)

  const header: string[] = ['Genomic Location', 'Width']

  //for sid in sids:
  //	header.extend([f'{sid} {c}' for c in ext_cols])

  header.push('# Overlapping Peaks')

  header.push(...fids.map((fid) => `Sample ${fid}`))
  header.push(...fids.map((fid) => `Peak ${fid}`))
  header.push(...fids.map((fid) => `Overlap % ${fid}`))

  header.push('Region')

  const data: SeriesData[][] = []

  const coreLocations = [...locationCoreMap.keys()].sort()

  for (const coreLocation of coreLocations) {
    const overlapLocation = parseLocation(coreLocation)!

    // size of the overlap in bp
    const overlap = overlapLocation.end - overlapLocation.start + 1

    const numOverlappingPeaks = locationCoreMap.get(coreLocation)!.size

    const row: SeriesData[] = makeCells(coreLocation, overlap)

    // for sid in sids:
    // 	if sid in locationCoreMap[coreLocation]:
    // 		# for location in locationCoreMap[coreLocation][id]:
    // 		uid = locationCoreMap[coreLocation][sid]
    // 		row.extend([str(ext_data[uid][col]) for col in ext_cols])
    // 	else:
    // 		row.extend([text.NA] * len(ext_cols))

    // 	# row.extend([str(ext_data[lid][col]) for col in ext_cols])

    // # add count/number of cols we appear in
    row.push(makeCell(numOverlappingPeaks))

    //place ids in table
    for (const fid of fids) {
      row.push(locationCoreMap.get(coreLocation)?.get(fid) || NA)
    }

    const locs: GenomicLocation[] = []

    for (const fid of fids) {
      const uid = locationCoreMap.get(coreLocation)?.get(fid) || NA
      const loc1 = locationMap.get(uid)

      if (loc1) {
        locs.push(loc1)
        row.push(loc1.toString())
      } else {
        row.push(NA)
      }
    }

    // % overlap

    for (const fid of fids) {
      const uid = locationCoreMap.get(coreLocation)?.get(fid) || NA
      const loc1 = locationMap.get(uid)

      if (loc1) {
        const of = overlapFraction(overlapLocation, loc1)

        row.push(Math.min(100, Math.max(0, of * 100)).toFixed(2))
      } else {
        row.push(0)
      }
    }

    //find the spanning region of the two peaks
    // i.e. min start, max end
    const start = Math.min(...locs.map((loc) => loc.start)) //[loc.start for loc in locs])
    const end = Math.max(...locs.map((loc) => loc.end))

    const region = new GenomicLocation(locs[0]!.chr, start, end)

    row.push(region.loc)
    data.push(row)
  }

  return new DataFrame({ name: 'Overlap', data, columns: header })
}

// export function createOverlapFile(files: BaseDataFrame[]): string {
//   const df = createOverlapTable(files)

//   return df.values
//     .map(row => row.map(cell => cellStr(cell)).join('\t'))
//     .join('\n')
// }
