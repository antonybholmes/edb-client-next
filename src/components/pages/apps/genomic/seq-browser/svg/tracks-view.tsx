import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Axis } from '@/components/plot/axis'
import { SvgBase } from '@/components/plot/svg-base'
import { TEXT_ZOOM } from '@/consts'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { ISVGProps } from '@/interfaces/svg-props'

import { produce } from 'immer'

import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  LocationProvider,
  MouseEventProvider,
  type IPeakTrack,
} from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { getBedTrackHeight } from './base-bed-track-svg'
import { getGeneTrackHeight } from './genes-track-svg'

import { useDebounce } from '@/hooks/debounce'
import { fill } from '@/lib/fill'
import { locStr } from '@/lib/genomic/genomic'
import { newGenomicLocation } from '@/lib/genomic/genomic-location'
import { makeUuid } from '@/lib/id'
import { cumsum } from '@/lib/math/cumsum'
import { zeros } from '@/lib/math/zeros'
import { TracksColumnSvg } from './tracks-column-svg'

const SELECTION_RECT_GAP = 3
const SELECTION_RECT_W_OFFSET = SELECTION_RECT_GAP * 2
const MIN_ZOOM_SIZE_BP = 1000

export function TracksView({ ref, className, style }: ISVGProps) {
  const {
    groups,
    locations,
    locationFeatures,
    binSizes,
    seqSearchResults,
    setLocations,
  } = useTracks()
  const { settings } = useSeqBrowserSettings()

  const selectionGroupRef = useRef<SVGGElement>(null)
  //const selectionLineRef1 = useRef<SVGLineElement>(null)
  const selectionLineRef2 = useRef<SVGGElement>(null)
  const selectionRef = useRef<SVGRectElement>(null)
  const zoomTextRef = useRef<SVGTextElement>(null)
  const zoomArrowRef1 = useRef<SVGPathElement>(null)
  const zoomArrowRef2 = useRef<SVGPathElement>(null)

  //const [globalY, setGlobalY] = useState(1)

  const [mousePos, setMousePos] = useState<IPos>({ ...ZERO_POS })

  // try to reduce redraws
  const debouncedMousePos = useDebounce(mousePos, { delayMs: 10 })

  const column = useRef<{ x: number; col: number }>({ x: 0, col: 0 })

  const columnWidth = settings.plot.width + settings.plot.gap //settings.margin.left+settings.margin.right+settings.plot.width

  const innerRef = useRef<SVGSVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!)

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

        const newLocation = newGenomicLocation(
          locations[column.current.col]!.chr,
          minX,
          maxX
        )

        setLocations(
          produce(locations, (draft) => {
            draft[column.current.col] = {
              id: makeUuid(),
              search: locStr(newLocation),
              ...newLocation,
            }
          })
        )
      }
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

  //const allLocTrackBins: ILocTrackBins[] = binsQuery.data ? binsQuery.data : []

  const orderedTracks = groups.map((t) => t.tracks)

  const titleHeightUsingPosition =
    settings.titles.position === 'top' ? settings.titles.height : 0

  // determine how much space in the svg is required by each
  // track

  const { geneYMaps, innerHeight, locationHeights, trackYs } = useMemo(() => {
    if (
      orderedTracks.length === 0 ||
      !locationFeatures ||
      locationFeatures.length === 0
    ) {
      return { geneYMaps: [], innerHeight: 0 }
    }

    let innerHeight = 0
    const geneYMaps: Map<string, number>[] = []

    const locationsN = locationFeatures.length
    const locationHeights = zeros(locationsN)

    const trackHeights = fill(() => [] as number[], locationsN) //.map(() => [])

    let h = 0

    for (const track of orderedTracks) {
      switch (track[0]!.type) {
        case 'Seq':
        case 'BigWig':
        case 'RemoteBigWig':
        case 'LocalBigWig':
          h =
            track[0]!.displayOptions.height +
            titleHeightUsingPosition +
            settings.titles.height +
            settings.axes.x.height +
            // Add some extra height when labels on right to account for x-axis labels
            (settings.titles.position === 'right' ? settings.titles.height : 0)

          innerHeight += h
          for (let i = 0; i < locationsN; i++) {
            locationHeights[i]! += h
            trackHeights[i]!.push(h)
          }
          break
        case 'Scale':
        case 'Location':
          h = track[0]!.displayOptions.height
          innerHeight += h
          // increment all location heights by the height of the ruler, since it is present in all columns
          for (let i = 0; i < locationsN; i++) {
            locationHeights[i]! += h
            trackHeights[i]!.push(h)
          }

          break
        case 'Ruler':
        case 'Cytobands':
          h = settings.tracks.cytobands.height + settings.titles.height
          innerHeight += h

          // increment all location heights by the height of the ruler, since it is present in all columns
          for (let i = 0; i < locationsN; i++) {
            locationHeights[i]! += h
            trackHeights[i]!.push(h)
          }

          break
        case 'Gene':
          let maxHeight = 0

          for (const [li, location] of locationFeatures.entries()) {
            const xax = axes[li]!

            const geneYMap = getGeneTrackHeight(
              location.features,
              settings,
              xax
            )

            h = geneYMap.get('height') ?? 0

            // the max height of the gene track is determined by the location with the most genes,
            // since all locations must allocate enough space for their gene track even if they have few genes
            maxHeight = Math.max(maxHeight, h)

            // for each location we need to add the extra spacing required by the gene track, max height
            // does not need this because it will be added once max height is finalized
            h += titleHeightUsingPosition + settings.tracks.genes.offset

            geneYMaps.push(geneYMap)

            locationHeights[li]! += h
            trackHeights[li]!.push(h)
          }

          innerHeight +=
            maxHeight + titleHeightUsingPosition + settings.tracks.genes.offset
          break
        case 'BED':
        case 'BigBed':
        case 'RemoteBigBed':
        case 'LocalBigBed':
        case 'LocalBED':
          h =
            getBedTrackHeight(track as IPeakTrack[], settings) +
            titleHeightUsingPosition
          innerHeight += h
          for (let i = 0; i < locationsN; i++) {
            locationHeights[i]! += h
            trackHeights[i]!.push(h)
          }
          break
        default:
          // add nothing
          break
      }
    }

    const trackYs = trackHeights.map((h) => cumsum([0, ...h]))

    return { geneYMaps, innerHeight, locationHeights, trackYs }
  }, [
    orderedTracks,
    titleHeightUsingPosition,
    settings.titles.height,
    settings.axes.x.height,
    settings.tracks.genes.offset,
    locationFeatures,
    axes,
  ])

  const { width, height } = useMemo(() => {
    const width =
      columnWidth * locations.length +
      settings.margin.left +
      settings.margin.right

    const height = innerHeight + settings.margin.top + settings.margin.bottom

    return { width, height }
  }, [
    innerHeight,
    locations.length,
    settings.margin.left,
    settings.margin.right,
    settings.margin.top,
    settings.margin.bottom,
  ])

  const svg = (
    <SvgBase
      ref={innerRef}
      scale={settings.zoom}
      width={width}
      height={height}
      style={style}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left - settings.margin.left
        const y = e.clientY - rect.top - settings.margin.top

        setMousePos({ x, y })
      }}
    >
      <g
        transform={`translate(${settings.margin.left}, ${settings.margin.top})`}
      >
        {locations.map((location, li) => {
          const x = li * columnWidth
          return (
            <LocationProvider
              key={li}
              value={{
                location,
                xax: axes[li]!,
                pos: { x, y: settings.margin.top },
                seqSearchResult: seqSearchResults?.[li],
                binSize: binSizes[li]!,
                genes:
                  locationFeatures && locationFeatures.length > li
                    ? locationFeatures[li]!.features
                    : [],
                geneYMap: geneYMaps[li] || new Map(),
                height: locationHeights?.[li]! || 0,
                trackY: trackYs?.[li]! || [],
                setLocation: (location) => {
                  // for individual tracks, we can update their location
                  // using, for example, the ruler to propogate its
                  // changes back to here, where they can be subsequently
                  // used to update the global locations
                  const newLocations = produce(locations, (draft) => {
                    draft[li] = {
                      id: makeUuid(),
                      search: locStr(location),
                      ...location,
                    }
                  })

                  setLocations(newLocations)
                },
              }}
            >
              <MouseEventProvider value={{ pos: debouncedMousePos }}>
                <TracksColumnSvg />
              </MouseEventProvider>
            </LocationProvider>
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
    </SvgBase>
  )

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
