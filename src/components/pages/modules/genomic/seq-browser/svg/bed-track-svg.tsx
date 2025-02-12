import { type IElementProps } from '@interfaces/element-props'

import { type Axis } from '@/components/plot/axis'
import { API_BEDS_REGIONS_URL } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { type IGenomicLocation } from '@/lib/genomic/genomic'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { LocationContext, type IBedTrack } from '../tracks-provider'
import { CoreBedTrackSvg } from './core-bed-track-svg'

export interface IBedFeature {
  loc: IGenomicLocation
  score: number
  name: string
  tags: string
}

interface IProps extends IElementProps {
  tracks: IBedTrack[]
  xax: Axis
  titleHeight: number
}

export function BedTrackSvg({ tracks, xax, titleHeight }: IProps) {
  const { location } = useContext(LocationContext)

  const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)

  const { data } = useQuery({
    queryKey: ['BED', tracks, location],
    queryFn: async () => {
      const accessToken = await getAccessTokenAutoRefresh()

      const res = await httpFetch.postJson(API_BEDS_REGIONS_URL, {
        body: {
          location: location.loc,
          beds: tracks.map(t => t.bedId),
        },

        headers: bearerHeaders(accessToken),
      })

      return res.data
    },
  })

  const bedFeatures: IBedFeature[][] = data ? data : []

  const allFeatures = bedFeatures.map(features => features.map(f => f.loc))

  if (allFeatures.length === 0) {
    return null
  }

  return (
    <CoreBedTrackSvg
      tracks={tracks}
      allFeatures={allFeatures}
      xax={xax}
      titleHeight={titleHeight}
    />
  )
}
