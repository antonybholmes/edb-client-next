import { type IDivProps } from '@/interfaces/div-props'

import { API_BEDS_REGIONS_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { locStr } from '@/lib/genomic/genomic'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'

import { useContext, useEffect, useState } from 'react'

import { BedReader } from '../readers/bed/bed-reader'

import { IGenomicLocation } from '@/lib/genomic/genomic-location'

import { queryClient } from '@/qcp'
import {
  EMPTY_BED_READER,
  type BaseBedReader,
} from '../readers/bed/base-bed-reader'
import { LocationContext, type IPeakTrack } from '../tracks-provider'
import { BaseBedTrackSvg } from './base-bed-track-svg'

export interface IBedRegion {
  loc: IGenomicLocation
  score: number
  name: string
  tags: string[]
}

export interface ISampleBedFeatures {
  sample: string
  regions: IBedRegion[]
}

interface IProps extends IDivProps {
  tracks: IPeakTrack[]
  titleHeight: number
}

export function BedTrackSvg({ tracks, titleHeight }: IProps) {
  const { xax, location } = useContext(LocationContext)

  const { fetchAccessToken } = useEdbAuth()

  const [coreTracks, setCoreTracks] = useState<
    {
      track: IPeakTrack
      positions: IGenomicLocation[]
    }[]
  >([])

  // const { data } = useQuery({
  //   queryKey: ['BED', tracks, location],
  //   queryFn: async () => {
  //     const accessToken = await fetchAccessToken()

  //     const res = await httpFetch.postJson<{ data: IBedFeature[][] }>(
  //       API_BEDS_REGIONS_URL,
  //       {
  //         body: {
  //           location: location.loc,
  //           beds: tracks.map(t => t.publicId),
  //         },

  //         headers: bearerHeaders(accessToken),
  //       }
  //     )

  //     return res.data
  //   },
  // })

  useEffect(() => {
    async function getFeatures() {
      let coreTracks: {
        track: IPeakTrack
        positions: IGenomicLocation[]
      }[] = []

      // rather than ignoring the tracks with no reader, we will
      // default to an empty reader to reduce UI errors
      let reader: BaseBedReader = EMPTY_BED_READER

      for (const t of tracks) {
        switch (t.type) {
          // case 'Remote BigBed':
          //   reader = new BigBedReader(
          //     new BigBed({
          //       filehandle: new RemoteFile(t.url),
          //     })
          //   )
          //   break
          case 'RemoteBigBed':
          case 'LocalBigBed':
          case 'LocalBED':
            reader = t.reader
            break
          default:
            // we have the tracks to display in this block and all
            // the tracks we downloaded for this location, therefore
            // we need to filter the locTrackBins to get the track with
            // the publicId matching the track we want to display

            try {
              const accessToken = await fetchAccessToken()

              const res = await queryClient.fetchQuery({
                queryKey: ['BED', t.id, locStr(location)],
                queryFn: async () => {
                  const res = await httpFetch.postJson<{
                    data: ISampleBedFeatures[]
                  }>(API_BEDS_REGIONS_URL, {
                    body: {
                      location: locStr(location),
                      samples: [t.id],
                    },

                    headers: bearerHeaders(accessToken),
                  })

                  return res.data
                },
              })

              reader = new BedReader(res[0]!)
            } catch (error) {
              console.error('Error fetching BED features:', error)
            }

            break
        }

        coreTracks.push({
          track: t,
          positions: await reader!.getFeatures(location),
        })
      }

      setCoreTracks(coreTracks)
    }

    if (tracks.length > 0) {
      getFeatures()
    }
  }, [tracks, xax.domain[0], xax.domain[1]])

  //const bedFeatures: IBedFeature[][] = data ? data : []

  //const allFeatures = bedFeatures.map(features => features.map(f => f.loc))

  //if (allFeatures.length === 0) {
  //  return null
  //}

  if (coreTracks.length === 0) {
    return null
  }

  return (
    <BaseBedTrackSvg
      tracks={coreTracks}
      //allFeatures={allFeatures}
      xax={xax}
      titleHeight={titleHeight}
    />
  )
}
