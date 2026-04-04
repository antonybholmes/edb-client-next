import { YAxis, type Axis } from '@/components/plot/axis'
import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { SVG_CRISP_EDGES } from '@/consts'
import type { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import type { ReactNode } from 'react'
import type { ClinicalDataTrack } from './clinical-utils'
import {
  NO_ALTERATION_COLOR,
  type IClinicalTrackProps,
  type IOncoplotDisplayProps,
} from './oncoplot-utils'

function numberTrackSvg(
  samples: string[],
  track: ClinicalDataTrack,
  trackProps: IClinicalTrackProps,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  const yax: Axis = new YAxis()
    .setDomain([0, track.maxEvent.value])
    .setLength(displayProps.clinical.height)

  const color = trackProps.color ?? NO_ALTERATION_COLOR //displayProps.legend.mutations.noAlterationColor

  return (
    <>
      <g
        transform={`translate(${-displayProps.axisOffset}, ${
          0.5 * displayProps.clinical.height
        })`}
      >
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {track.name}
        </text>
      </g>
      <g id="sample">
        {samples.map((sample, si) => {
          const height = yax.domainToRange(
            track.getEvents(sample).maxEvent.value
          )!
          const y = displayProps.clinical.height - height
          const x = si * (blockSize.w + spacing.x)

          return (
            <rect
              key={si}
              x={x}
              y={y}
              width={blockSize.w}
              height={height}
              //stroke={color}
              fill={color}
              stroke={displayProps.clinical.border.color}
              strokeOpacity={displayProps.clinical.border.opacity}
              strokeWidth={
                displayProps.clinical.border.show
                  ? displayProps.clinical.border.strokeWidth
                  : 0
              }
              shapeRendering={SVG_CRISP_EDGES}
            />
          )
        })}
      </g>
    </>
  )
}

function categoryTrackSvg(
  samples: string[],
  track: ClinicalDataTrack,
  trackProps: IClinicalTrackProps,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  return (
    <>
      <g
        transform={`translate(${-displayProps.axisOffset}, ${
          0.5 * displayProps.clinical.height
        })`}
      >
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {track.name}
        </text>
      </g>
      <g id="sample">
        {samples.map((sample, si) => {
          const category = track.category(sample)

          const color =
            trackProps.categoryColors[category] ?? NO_ALTERATION_COLOR //displayProps.legend.mutations.noAlterationColor

          if (color) {
            return (
              <rect
                key={si}
                x={si * (blockSize.w + spacing.x)}
                width={blockSize.w}
                height={displayProps.clinical.height}
                //stroke={color}
                fill={color}
                stroke={displayProps.clinical.border.color}
                strokeOpacity={displayProps.clinical.border.opacity}
                strokeWidth={
                  displayProps.clinical.border.show
                    ? displayProps.clinical.border.strokeWidth
                    : 0
                }
                shapeRendering={SVG_CRISP_EDGES}
              />
            )
          } else {
            const x = si * (blockSize.w + spacing.x)
            const y = 0.5 * displayProps.clinical.height

            return (
              <line
                key={si}
                x1={x + 0.5}
                x2={x + blockSize.w - 1}
                y1={y}
                y2={y}
                //stroke={color}
                stroke={NO_ALTERATION_COLOR} //displayProps.legend.mutations.noAlterationColor
                shapeRendering={SVG_CRISP_EDGES}
              />
            )
          }
        })}
      </g>
    </>
  )
}

function distTrackSvg(
  samples: string[],
  track: ClinicalDataTrack,
  trackProps: IClinicalTrackProps,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  const categories = track.categories

  return (
    <>
      <g
        transform={`translate(${-displayProps.axisOffset}, ${
          0.5 * displayProps.clinical.height
        })`}
      >
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {track.name}
        </text>
      </g>
      <g id="sample">
        {samples.map((sample, si) => {
          const dist = track.getEvents(sample).normCountDist(categories)

          const yax: Axis = new YAxis()
            .setDomain([0, 1])
            .setLength(displayProps.clinical.height)

          const coords = [0]

          categories.map((_, ci) => {
            coords.push(coords[coords.length - 1]! + dist[ci]!.value!)
          })

          const x = si * (blockSize.w + spacing.x)

          return categories.map((c, ci) => {
            const h =
              yax.domainToRange(coords[ci]!) -
              yax.domainToRange(coords[ci + 1]!)

            // only render if there was a count associated with the event
            if (h > 0) {
              const color =
                trackProps.categoryColors[c.toLowerCase()] ??
                NO_ALTERATION_COLOR //displayProps.legend.mutations.noAlterationColor

              return (
                <rect
                  key={ci}
                  x={x}
                  y={yax.domainToRange(coords[ci + 1]!)}
                  width={blockSize.w}
                  height={h}
                  //stroke={color}
                  fill={color}
                  stroke={displayProps.clinical.border.color}
                  strokeOpacity={displayProps.clinical.border.opacity}
                  strokeWidth={
                    displayProps.clinical.border.show
                      ? displayProps.clinical.border.strokeWidth
                      : 0
                  }
                  shapeRendering={SVG_CRISP_EDGES}
                />
              )
            } else {
              return null
            }
          })
        })}
      </g>
    </>
  )
}

export function clinicalTracksSvg(
  samples: string[],
  clinicalTracks: ClinicalDataTrack[],
  clinicalTrackProps: Record<string, IClinicalTrackProps>,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  return (
    <g>
      {clinicalTracks
        .filter(track => displayProps.legend.clinical.tracks[track.name]!.show)
        .map((track, ti) => {
          let node: ReactNode = null

          switch (track.type) {
            case 'number':
            case 'log2':
              node = numberTrackSvg(
                samples,
                track,
                clinicalTrackProps[track.name]!,
                blockSize,
                spacing,
                displayProps
              )
              break
            case 'dist':
              node = distTrackSvg(
                samples,
                track,
                clinicalTrackProps[track.name]!,
                blockSize,
                spacing,
                displayProps
              )
              break
            default:
              node = categoryTrackSvg(
                samples,
                track,
                clinicalTrackProps[track.name]!,
                blockSize,
                spacing,
                displayProps
              )
              break
          }

          return (
            <g
              key={ti}
              transform={`translate(0, ${
                ti * (displayProps.clinical.height + displayProps.clinical.gap)
              })`}
            >
              {node}
            </g>
          )
        })}

      {/* {displayProps.clinicalTracks.border.show && (
        <>
          {range(samples.length + 1).map(si => {
            const x = si * (displayProps.blockSize.w + spacing.x)

            return (
              <line
                key={`${si}`}
                x1={x}
                y1={0}
                x2={x}
                y2={h}
                stroke={displayProps.clinicalTracks.border.color}
                strokeOpacity={displayProps.clinicalTracks.border.opacity}
                shapeRendering={SVG_CRISP_EDGES}
              />
            )
          })}
        </>
      )} */}
    </g>
  )
}

export function hClinicalLegendSvg(
  track: ClinicalDataTrack,
  trackProps: IClinicalTrackProps,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  console.log('clinicalLegendSvg', track, trackProps, track.categories)

  return (
    <g id={`legend-clinical-${track.name}`}>
      <g
        transform={`translate(${-displayProps.axisOffset}, ${
          0.5 * displayProps.grid.cell.h
        })`}
      >
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {track.name}
        </text>
      </g>

      {track.categoriesInUse.map((c, ci) => {
        const fill: string = trackProps.categoryColors[c] ?? NO_ALTERATION_COLOR // displayProps.legend.mutations.noAlterationColor

        return (
          <g
            key={ci}
            transform={`translate(${ci * displayProps.legend.width}, 0)`}
          >
            <rect
              width={blockSize.w}
              height={blockSize.h}
              fill={fill}
              shapeRendering={SVG_CRISP_EDGES}
            />

            <text
              x={blockSize.w + 5}
              y={0.5 * blockSize.h}
              fill={COLOR_BLACK}
              dominantBaseline="central"
              fontSize="smaller"
              //textAnchor="end"
            >
              {c}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export function vClinicalLegendSvg(
  track: ClinicalDataTrack,
  trackProps: IClinicalTrackProps,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  return (
    <g id={`legend-clinical-${track.name}`}>
      <g transform={`translate(0, 0)`}>
        <text
          dominantBaseline="central"
          fontSize="smaller"
          //textAnchor="end"
          fontWeight="bold"
        >
          {track.name}
        </text>
      </g>
      <g transform={`translate(0, ${displayProps.legend.title.height})`}>
        {track.categoriesInUse.map((c, ci) => {
          const fill: string =
            trackProps.categoryColors[c.toLowerCase()] ?? NO_ALTERATION_COLOR // displayProps.legend.mutations.noAlterationColor

          return (
            // <g
            //   key={ci}
            //   transform={`translate(${ci * displayProps.legend.width}, 0)`}
            // >
            //   <rect
            //     width={blockSize.w}
            //     height={blockSize.h}
            //     fill={fill}
            //     shapeRendering={SVG_CRISP_EDGES}
            //   />

            //   <text
            //     x={blockSize.w + 5}
            //     y={0.5 * blockSize.h}
            //     fill={COLOR_BLACK}
            //     dominantBaseline="central"
            //     fontSize="smaller"
            //     //textAnchor="end"
            //   >
            //     {c} a
            //   </text>
            // </g>

            <g
              key={ci}
              transform={`translate(0, ${ci * (blockSize.h + displayProps.plotGap)})`}
            >
              <rect
                width={blockSize.w}
                height={blockSize.h}
                fill={fill}
                shapeRendering={SVG_CRISP_EDGES}
              />

              <text
                x={blockSize.w + 5}
                y={0.5 * blockSize.h}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                fontSize="smaller"
                //textAnchor="end"
              >
                {c}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}

export function clinicalLegendSvgs(
  tracks: ClinicalDataTrack[],
  clinicalTrackProps: Record<string, IClinicalTrackProps>,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
): ReactNode {
  // only show legends for dist and category tracks since
  // these have labels associated with them
  return (
    <>
      {tracks
        .filter(
          track =>
            (track.type === 'dist' || track.type === 'category') &&
            displayProps.legend.clinical.tracks[track.name]!.show
        )
        .map((track, ti) => {
          return (
            <g
              key={track.name}
              transform={`translate(${ti * (displayProps.legend.width + displayProps.legend.gap)}, 0)`}
            >
              {vClinicalLegendSvg(
                track,
                clinicalTrackProps[track.name]!,
                blockSize,
                displayProps
              )}
            </g>
          )
        })}
    </>
  )
}
