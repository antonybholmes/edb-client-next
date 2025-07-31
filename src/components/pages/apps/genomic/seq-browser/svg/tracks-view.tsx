import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { BaseSvg } from '@/components/base-svg'
import { Axis } from '@/components/plot/axis'
import { TEXT_ZOOM } from '@/consts'
import { logger } from '@/lib/logger'
import type { IPos } from '@interfaces/pos'
import type { ISVGProps } from '@interfaces/svg-props'
import { API_GENOME_OVERLAP_URL, API_SEQS_BINS_URL } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { GenomicLocation } from '@lib/genomic/genomic'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { sum } from '@lib/math/sum'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import type { IGeneDbInfo } from '../../annotate/annotate-page'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  LocationContext,
  TracksContext,
  type IBedTrack,
  type IGeneTrack,
  type ILocalBedTrack,
  type ILocTrackBins,
  type ISignalTrack,
} from '../tracks-provider'
import { getBedTrackHeight } from './base-bed-track-svg'
import {
  getGeneTrackHeight,
  type IGenomicFeatureSearch,
} from './genes-track-svg'
import { getYMax } from './seq-track-svg'
import { TracksColumnSvg } from './tracks-column-svg'

const SELECTION_RECT_GAP = 3
const SELECTION_RECT_W_OFFSET = SELECTION_RECT_GAP * 2
const MIN_ZOOM_SIZE_BP = 1000

/**
 * The track types that represent signals, which can either be the
 * db format, or bigwigs
 */
export const SEQ_TRACK_TYPES = new Set(['Seq', 'Remote BigWig', 'Local BigWig'])
export const BED_TRACK_TYPES = new Set([
  'BED',
  'Local BED',
  'Local BigBed',
  'Remote BigBed',
])

export type GenesMap = { [key: string]: IGeneDbInfo }

interface IProps extends ISVGProps {
  genesMap: GenesMap
}

export function TracksView({ ref, genesMap, className, style }: IProps) {
  const { state, locations, binSizes, setLocations } = useContext(TracksContext)
  const { settings } = useSeqBrowserSettings()

  const selectionGroupRef = useRef<SVGGElement>(null)
  //const selectionLineRef1 = useRef<SVGLineElement>(null)
  const selectionLineRef2 = useRef<SVGGElement>(null)
  const selectionRef = useRef<SVGRectElement>(null)
  const zoomTextRef = useRef<SVGTextElement>(null)
  const zoomArrowRef1 = useRef<SVGPathElement>(null)
  const zoomArrowRef2 = useRef<SVGPathElement>(null)

  const [globalY, setGlobalY] = useState(1)

  const column = useRef<{ x: number; col: number }>({ x: 0, col: 0 })

  const columnWidth = settings.plot.width + settings.plot.gap //settings.margin.left+settings.margin.right+settings.plot.width

  const innerRef = useRef<SVGSVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!)

  const { csrfToken, fetchAccessToken } = useEdbAuth()

  const axes = useMemo(() => {
    return locations.map((location) => {
      let xax = new Axis().setLength(settings.plot.width)

      if (settings.reverse) {
        xax = xax
          .setDomain([location.end, location.start])
          .setTicks([location.end, location.start])
      } else {
        xax = xax
          .setDomain([location.start, location.end])
          .setTicks([location.start, location.end])
      }

      return xax
    })
  }, [locations, settings.plot.width, settings.reverse])

  const isCtrlPressed = useRef(false)
  const isMouseDown = useRef(false)

  const dragStartPositionRef = useRef<IPos | null>(null)
  const dragPositionRef = useRef<IPos | null>(null)

  //const [dragStartPosition, setDragStartPosition] = useState<IPos | null>(null)
  //const [dragPosition, setDragPosition] = useState<IPos | null>(null)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      isCtrlPressed.current = true
    } else if (e.key === 'Escape') {
      cleanSelection()
    } else {
      // do nothing
    }
  }

  function updateGlobalY(y: number) {
    setGlobalY(Math.max(1, y))
  }

  function handleKeyUp() {
    //handleDrag()
    //isCtrlPressed.current = false
    //cleanSelection()
    isCtrlPressed.current = false
  }

  const handleMouseDown = (
    e: MouseEvent | React.MouseEvent<HTMLDivElement>
  ) => {
    isMouseDown.current = true

    if (isCtrlPressed.current && innerRef.current) {
      const startX =
        (innerRef.current.getBoundingClientRect().left + settings.margin.left) *
        settings.zoom

      const col = Math.floor((e.clientX - startX) / settings.zoom / columnWidth)
      column.current = { x: col * columnWidth, col }

      //offset within a column
      const offset =
        (column.current.x +
          settings.margin.left +
          innerRef.current.getBoundingClientRect().left) *
        settings.zoom

      dragStartPositionRef.current = {
        x: Math.max(
          0,
          Math.min(settings.plot.width, (e.clientX - offset) / settings.zoom)
        ),
        y: 0,
      }

      if (
        selectionRef.current &&
        selectionGroupRef.current &&
        selectionLineRef2.current
      ) {
        const x =
          column.current.x +
          settings.margin.left +
          dragStartPositionRef.current.x

        selectionGroupRef.current.setAttribute(
          'transform',
          `translate(${x}, 0)`
        )

        selectionRef.current.setAttribute('width', '0')

        selectionLineRef2.current.setAttribute('transform', `translate(0, 0)`)

        selectionGroupRef.current.setAttribute('opacity', '1')
      }
    }

    // Add the mousemove event listener when mouse is pressed down
    //document.addEventListener('mousemove', handleMouseMove)
  }

  const handleMouseMove = (
    e: MouseEvent | React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      !dragStartPositionRef.current ||
      !isMouseDown.current ||
      !innerRef.current
    ) {
      return
    }

    const offset =
      (column.current.x +
        settings.margin.left +
        innerRef.current.getBoundingClientRect().left) *
      settings.zoom

    dragPositionRef.current = {
      x: Math.max(
        0,
        Math.min(settings.plot.width, (e.clientX - offset) / settings.zoom)
      ),
      y: 0,
    }

    //setDragPosition(dragPositionRef.current)

    if (dragStartPositionRef.current) {
      const x =
        column.current.x +
        settings.margin.left +
        Math.min(dragStartPositionRef.current.x, dragPositionRef.current.x)

      selectionGroupRef.current!.setAttribute('transform', `translate(${x}, 0)`)

      const w = Math.abs(
        dragStartPositionRef.current.x - dragPositionRef.current.x
      )

      selectionRef.current!.setAttribute(
        'width',
        Math.max(0, w - SELECTION_RECT_W_OFFSET).toString()
      )

      selectionLineRef2.current!.setAttribute('transform', `translate(${w}, 0)`)

      //selectionGroupRef.current.setAttribute('opacity', '1')

      zoomTextRef.current!.setAttribute('opacity', w > 100 ? '1' : '0')
      zoomTextRef.current!.setAttribute('transform', `translate(${w / 2}, 0)`)

      zoomArrowRef1.current!.setAttribute('opacity', w > 100 ? '1' : '0')

      zoomArrowRef2.current!.setAttribute('opacity', w > 100 ? '1' : '0')
      zoomArrowRef2.current!.setAttribute('transform', `translate(${w - 8}, 0)`)
    }
  }

  // Mouse up event handler
  const handleMouseUp = () => {
    handleDrag()

    isMouseDown.current = false

    // Remove the mousemove event listener when mouse is released
    //document.removeEventListener('mousemove', handleMouseMove)
  }

  const handleDrag = () => {
    if (dragPositionRef.current && dragStartPositionRef.current) {
      const rangeX1 = axes[column.current.col]!.rangeToDomain(
        dragStartPositionRef.current.x
      )
      const rangeX2 = axes[column.current.col]!.rangeToDomain(
        dragPositionRef.current.x
      )

      const minX = Math.round(Math.min(rangeX1, rangeX2))
      const maxX = Math.round(Math.max(rangeX1, rangeX2))

      // user must select a region of at least 1kb before selection system
      // works, otherwise too sensitive
      if (maxX - minX > MIN_ZOOM_SIZE_BP) {
        // setLocations([
        //   new GenomicLocation(locations[column.current.col]!.chr, minX, maxX),
        //   ...locations.filter((_, index) => index !== column.current.col),
        // ])

        setLocations(
          produce(locations, (draft) => {
            draft[column.current.col] = new GenomicLocation(
              locations[column.current.col]!.chr,
              minX,
              maxX
            )
          })
        )
      }

      //clean()
    }

    cleanSelection()
  }

  const cleanSelection = () => {
    dragPositionRef.current = null
    dragStartPositionRef.current = null
    //setDragStartPosition(null)
    //setDragPosition(null)

    if (selectionGroupRef.current) {
      selectionGroupRef.current.setAttribute('opacity', '0')
    }

    if (zoomTextRef.current) {
      zoomTextRef.current.setAttribute('opacity', '0')
    }

    if (zoomArrowRef1.current) {
      zoomArrowRef1.current.setAttribute('opacity', '0')
    }

    if (zoomArrowRef2.current) {
      zoomArrowRef2.current.setAttribute('opacity', '0')
    }

    // if (selectionRef.current) {
    //   selectionRef.current.setAttribute('x', '0')

    //   selectionRef.current.setAttribute('width', '0')
    // }
  }

  useEffect(() => {
    // Add event listener for 'keydown' event globally
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('keydown', handleKeyDown)
    //document.addEventListener('mousedown', handleMouseDown)
    //document.addEventListener('mouseup', handleMouseUp)
    //document.addEventListener('mousemove', handleMouseMove)

    // Cleanup event listener when the component is unmounted
    return () => {
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('keydown', handleKeyDown)
      //document.removeEventListener('mousedown', handleMouseDown)
      //document.removeEventListener('mouseup', handleMouseUp)
      //document.removeEventListener('mousemove', handleMouseMove)
      //setDragStartPosition(null)
      //setDragPosition(null)
      cleanSelection()
      isMouseDown.current = false
      isCtrlPressed.current = false
    }
  }, [])

  const genesQuery = useQuery({
    queryKey: [
      'genes',
      locations,
      settings.genome,
      settings.genes.canonical,
      settings.genes.types,
    ],
    queryFn: async () => {
      //console.log(API_GENES_OVERLAP_URL)

      const url = new URL(`${API_GENOME_OVERLAP_URL}/${settings.genome}`)

      const params: Record<string, string> = {
        canonical: settings.genes.canonical.only ? 'true' : 'false',
      }

      if (settings.genes.types === 'protein-coding') {
        params.type = 'protein_coding'
      }

      url.search = new URLSearchParams(params).toString()

      logger.debug('genes query', url.toString())

      const res = await httpFetch.postJson<{ data: IGenomicFeatureSearch[] }>(
        url.toString(),
        {
          body: { locations: locations.map((l) => l.loc) },
        }
      )

      return res.data
    },
  })

  // we need this here to calculate the height of the track rather than
  // having the query inside the svg component
  const locationFeatures: IGenomicFeatureSearch[] = genesQuery.data
    ? genesQuery.data
    : []

  const tracks = useMemo(
    () =>
      state.order
        .map((gid) => state.groups[gid]!)
        .map((tg) => tg.order.map((id) => tg.tracks[id]!))
        .flat()
        .filter((t) => SEQ_TRACK_TYPES.has(t.trackType)) as ISignalTrack[],
    [state.order]
  )

  const seqTracks = useMemo(
    () => tracks.filter((t) => t.trackType === 'Seq') as ISignalTrack[],
    [tracks]
  )

  // force updates when seqs, location or bin size change
  const binsQuery = useQuery({
    queryKey: ['bins', seqTracks, locations, binSizes, csrfToken],
    queryFn: async () => {
      // if (locations.length === 0 || seqs.length === 0) {
      //   return []
      // }

      const accessToken = await fetchAccessToken()

      const res = await httpFetch.postJson<{ data: ILocTrackBins[] }>(
        API_SEQS_BINS_URL,
        {
          body: {
            locations: locations.map((l) => l.loc),
            binSizes,
            //scale: displayOptions.seq.applyScaling ? displayOptions.seq.scale : 0,
            tracks: seqTracks.map((t) => t.publicId),
          },

          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  const allLocTrackBins: ILocTrackBins[] = binsQuery.data ? binsQuery.data : []

  // use either the auto global or user fixed global
  useEffect(() => {
    async function updateY() {
      updateGlobalY(
        settings.seqs.globalY.auto &&
          allLocTrackBins.length > 0 &&
          tracks.length > 0
          ? await getYMax(
              tracks,
              allLocTrackBins,
              binSizes,
              settings.seqs.scale.mode
            )
          : settings.seqs.globalY.ymax
      )
    }

    updateY()
  }, [allLocTrackBins, settings.seqs.globalY, settings.seqs.scale, tracks])

  const svg = useMemo(() => {
    const tracks = state.order
      .map((gid) => state.groups[gid]!)
      .map((tg) => tg.order.map((id) => tg.tracks[id]!))

    if (tracks.length === 0) {
      return null
    }

    const titleHeightUsingPosition =
      settings.titles.position === 'top' ? settings.titles.height : 0

    // determine how much space in the svg is required by each
    // track
    const trackHeights: number[] = []
    const geneYMaps: Map<string, number>[] = []

    for (const ts of tracks) {
      switch (ts[0]!.trackType) {
        case 'Seq':
        case 'Local BigWig':
        case 'Remote BigWig':
          trackHeights.push(
            ts[0]!.displayOptions.height +
              titleHeightUsingPosition +
              settings.titles.height +
              settings.axes.x.height +
              // Add some extra height when labels on right to account for x-axis labels
              (settings.titles.position === 'right'
                ? settings.titles.height
                : 0)
          )
          break
        case 'Scale':
        case 'Location':
          trackHeights.push(ts[0]!.displayOptions.height)
          break
        case 'Ruler':
        case 'Cytobands':
          trackHeights.push(
            ts[0]!.displayOptions.height + settings.titles.height
          )
          break
        case 'Gene':
          let maxHeight = 0

          for (const [li, featureSearch] of locationFeatures.entries()) {
            const xax = axes[li]!

            const geneYMap = getGeneTrackHeight(
              ts[0]! as IGeneTrack,
              featureSearch.features,
              settings,
              xax
            )

            maxHeight = Math.max(maxHeight, geneYMap.get('height') ?? 0)

            geneYMaps.push(geneYMap)
          }

          trackHeights.push(
            maxHeight + titleHeightUsingPosition + settings.genes.offset
          )
          break
        case 'BED':
        case 'Local BED':
        case 'Remote BigBed':
        case 'Local BigBed':
          trackHeights.push(
            getBedTrackHeight(ts as (IBedTrack | ILocalBedTrack)[], settings) +
              titleHeightUsingPosition
          )
          break
        default:
          trackHeights.push(0)
          break
      }
    }

    //const trackY = cumsum([0, ...trackHeights])
    const innerHeight = sum(trackHeights)

    const width =
      columnWidth * locations.length +
      settings.margin.left +
      settings.margin.right

    const height = innerHeight + settings.margin.top + settings.margin.bottom

    //console.log('tracks-view', globalY)

    return (
      <BaseSvg
        ref={innerRef}
        scale={settings.zoom}
        width={width}
        height={height}
        style={style}
      >
        <g
          transform={`translate(${settings.margin.left}, ${
            settings.margin.top
          })`}
        >
          {locations.map((location, li) => {
            // if (settings.reverse) {
            //   xax
            //     .setDomain([location.end, location.start])
            //     .setTicks([location.end, location.start])
            // }

            return (
              <g
                id={`loc-col-${location.loc}`}
                transform={`translate(${li * columnWidth}, ${
                  settings.margin.top
                })`}
                key={li}
              >
                <LocationContext.Provider
                  value={{
                    location,
                    xax: axes[li]!,
                    globalY,
                    locTrackBins: allLocTrackBins[li],
                    binSize: binSizes[li]!,
                    geneYMap: geneYMaps[li] || new Map(),
                    setLocation: (location) => {
                      // for individual tracks, we can update their location
                      // using, for example, the ruler to propogate its
                      // changes back to here, where they can be subsequently
                      // used to update the global locations
                      const newLocations = produce(locations, (draft) => {
                        draft[li] = location
                      })

                      setLocations(newLocations)
                    },
                  }}
                >
                  <TracksColumnSvg
                    genesMap={genesMap}
                    // locTrackBins={
                    //   allLocTrackBins.length > li ? allLocTrackBins[li]! : null
                    // }
                    features={
                      locationFeatures.length > li
                        ? locationFeatures[li]!.features
                        : []
                    }
                  />
                </LocationContext.Provider>
              </g>
            )
          })}
        </g>

        <g opacity="0" ref={selectionGroupRef}>
          <rect
            ref={selectionRef}
            x={SELECTION_RECT_GAP}
            width={0}
            y={12}
            rx={4}
            ry={4}
            height={height - 12}
            fill="mediumslateblue"
            fillOpacity="0.1"
            //stroke="mediumslateblue"
            //strokeWidth="1"
            //strokeDasharray="5,5"
          />

          <g id="zoom-text">
            <path
              ref={zoomArrowRef1}
              d="M 6,-6 L 0,0 L 6,6"
              stroke="mediumslateblue"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              transform={`translate(8, ${12 + (height - 12) / 2})`}
              opacity={0}
            />
            <text
              ref={zoomTextRef}
              x="0"
              y={12 + (height - 12) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="mediumslateblue"
              opacity={0}
            >
              {TEXT_ZOOM}
            </text>

            <g transform={`translate(0, ${12 + (height - 12) / 2})`}>
              <path
                ref={zoomArrowRef2}
                d="M -6,-6 L 0,0 L -6,6"
                stroke="mediumslateblue"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                opacity={0}
              />
            </g>
          </g>

          <g id="selection-line-1">
            <path
              d="M -5,1 L 5,1 L 5,5 L 0,10 L -5,5 Z"
              stroke="mediumslateblue"
              fill="mediumslateblue"
              fillOpacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <line
              x1="0"
              y1="12"
              x2="0"
              y2={height - 1}
              stroke="mediumslateblue"
              strokeWidth="1"
            />
          </g>

          <g id="selection-line-2" ref={selectionLineRef2}>
            <path
              d="M -5,1 L 5,1 L 5,5 L 0,10 L -5,5 Z"
              stroke="mediumslateblue"
              fill="mediumslateblue"
              fillOpacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="0"
              y1="12"
              x2="0"
              y2={height - 1}
              stroke="mediumslateblue"
              strokeWidth="1"
            />
          </g>
        </g>
      </BaseSvg>
    )
  }, [
    locations,
    axes,
    state,
    locationFeatures,
    settings,
    globalY,
    binSizes,
    allLocTrackBins,
  ])

  return (
    <div
      className={className}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {svg}
    </div>
  )
}
