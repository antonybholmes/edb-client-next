import { type IDivProps } from '@interfaces/div-props'

import { queryClient } from '@/query'
import { BigBed } from '@gmod/bbi'
import { API_BEDS_REGIONS_URL } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { type IGenomicLocation } from '@lib/genomic/genomic'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { RemoteFile } from 'generic-filehandle2'
import { useContext, useEffect, useState } from 'react'

import { BedReader } from '../readers/bed/bed-reader'
import { BigBedReader } from '../readers/bed/bigbed-reader'

import {
  EMPTY_BED_READER,
  type BaseBedReader,
} from '../readers/bed/base-bed-reader'
import {
  LocationContext,
  type AllBedTrackTypes,
  type IBedTrack,
  type ILocalBedTrack,
  type ILocalBigBedTrack,
  type IRemoteBigBedTrack,
} from '../tracks-provider'
import { BaseBedTrackSvg } from './base-bed-track-svg'

export interface IBedFeature {
  loc: IGenomicLocation
  score: number
  name: string
  tags: string
}

interface IProps extends IDivProps {
  tracks: AllBedTrackTypes[]
  titleHeight: number
}

export function BedTrackSvg({ tracks, titleHeight }: IProps) {
  const { xax, location } = useContext(LocationContext)

  const { fetchAccessToken } = useEdbAuth()

  const [coreTracks, setCoreTracks] = useState<
    {
      track: IBedTrack | ILocalBedTrack | IRemoteBigBedTrack | ILocalBigBedTrack
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
        track: AllBedTrackTypes
        positions: IGenomicLocation[]
      }[] = []

      // rather than ignoring the tracks with no reader, we will
      // default to an empty reader to reduce UI errors
      let reader: BaseBedReader = EMPTY_BED_READER

      for (const t of tracks) {
        switch (t.trackType) {
          case 'Remote BigBed':
          case 'Local BigBed':
          case 'Local BED':
            reader =
              t.trackType === 'Remote BigBed'
                ? new BigBedReader(
                    new BigBed({
                      filehandle: new RemoteFile(t.url),
                    })
                  )
                : t.reader
            break
          default:
            // we have the tracks to display in this block and all
            // the tracks we downloaded for this location, therefore
            // we need to filter the locTrackBins to get the track with
            // the publicId matching the track we want to display

            try {
              const res = await queryClient.fetchQuery({
                queryKey: ['BED', t, location],
                queryFn: async () => {
                  const accessToken = await fetchAccessToken()

                  const res = await httpFetch.postJson<{
                    data: IBedFeature[][]
                  }>(API_BEDS_REGIONS_URL, {
                    body: {
                      location: location.loc,
                      beds: [t.publicId],
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
