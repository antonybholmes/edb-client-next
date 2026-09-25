import { useGseaBubbleSettings } from '../gsea-bubble-settings-store'

import { AxisBottomSvg } from '../../../../../../../plot/axes/svg-axis'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRange } from '@/components/plot/axes/axis'
import { SvgRect } from '@/components/plot/svg-rect'
import { SVG_CRISP_EDGES } from '@/consts'
import { IPos } from '@/interfaces/pos'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { useSVG } from '@/providers/svg-provider'
import { useTooltip } from '@/providers/tooltip-provider'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SvgG } from '@/components/plot/svg-g'
import { useCrosshair } from '@/providers/crosshair-provider'
import gsap from 'gsap'
import { IGseaBubble } from '../../gsea-store'
import { IBubblePoint } from '../gsea-bubble-provider'

export interface IPlotInfo {
  plot: IGseaBubble
  points: IBubblePoint[]
  //xlim: ILim
  pos: IPos
}

export function BubblePlotSvg({
  plotInfo,
  innerPlotWidth,
  innerPlotHeight,
  pos,
}: {
  plotInfo: IPlotInfo
  innerPlotWidth: number
  innerPlotHeight: number
  pos: IPos
}) {
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: xax } = useAxis({
    plotId: plotInfo.plot.id,
    groupId: 'nes',
    axisId: 'x',
  })

  if (!xax) {
    return null
  }

  const xPoints = axisDomainToRange(
    xax,
    plotInfo.points.map((p) => p.x)
  )

  return (
    <SvgMargin margin={settings.plot.margin}>
      {plotInfo.points.map((point, xi) => {
        const x1 = xPoints[xi]
        const y1 = point.y * settings.axes.y.rowHeight

        return (
          <Node
            x1={x1}
            y1={y1}
            point={point}
            xi={xi}
            plotInfo={plotInfo}
            key={xi}
            plotPos={{
              x: pos.x + settings.plot.margin.left,
              y: pos.y + settings.plot.margin.top,
            }}
          />
        )
      })}

      <SvgG
        pos={{
          x: -settings.padding,
          y: 0,
        }}
      >
        {plotInfo.points.map((p, xi) => {
          const y1 = p.y * settings.axes.y.rowHeight

          return (
            <SvgText
              key={xi}
              y={y1}
              textAnchor="end"
              font={edbSettings.plots.axes.y.ticks.major.style.labels}
            >
              {p.label}
            </SvgText>
          )
        })}
      </SvgG>

      {settings.border.show && (
        <SvgRect
          shapeRendering={SVG_CRISP_EDGES}
          width={innerPlotWidth}
          height={innerPlotHeight}
          stroke={settings.border.value}
          strokeWidth={settings.border.width}
          fill="none"
        />
      )}

      {settings.title.show && plotInfo.plot.name && (
        <SvgG
          pos={{
            x: innerPlotWidth / 2,
            y: -settings.padding * 1.5,
          }}
        >
          <SvgText textAnchor="middle" fontWeight="bold">
            {plotInfo.plot.name}
          </SvgText>
        </SvgG>
      )}

      {edbSettings.plots.axes.x.style.show && (
        <AxisBottomSvg
          ax={xax}

          pos={{
            x: 0,
            y: innerPlotHeight,
          }}

          //title={info.plot.nes.label}
        />
      )}
    </SvgMargin>
  )
}

function Node({
  x1,
  y1,
  point,
  xi,
  plotInfo,
  plotPos,
}: {
  x1: number
  y1: number
  point: IBubblePoint
  xi: number
  plotInfo: IPlotInfo
  plotPos: IPos
}) {
  const ref = useRef<SVGCircleElement>(null)
  const { ref: svgRef } = useSVG()

  const { settings } = useGseaBubbleSettings()

  const { showTooltip, hideTooltip } = useTooltip()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    gsap.timeline().to(ref.current, {
      scale: hover ? 1.2 : 1,
      transformOrigin: 'center',
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [hover])

  const handleVariantEnter = useCallback(
    (plot: IGseaBubble, row: number, p: IPos) => {
      const { relativeP } = svgPointToScreen(svgRef.current, p)

      showCrosshair({
        pos: relativeP,
        content: (
          <>
            <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
            <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
            <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
            <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
          </>
        ),
      })

      //   showTooltip({
      //     pos: newP,
      //     content: (
      //       <>
      //         <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
      //         <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
      //         <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
      //         <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
      //       </>
      //     ),
      //   })
    },
    [svgRef, showCrosshair, hideCrosshair]
  )

  const handleVariantLeave = useCallback(() => {
    hideCrosshair()
  }, [hideCrosshair])

  return (
    <SvgCircle
      ref={ref}
      cx={x1}
      cy={y1}
      r={point.r}
      fill={point.color}
      fp={settings.bubbles.fill}
      sp={settings.bubbles.stroke}
      key={xi}
      onMouseLeave={() => {
        setHover(false)
        handleVariantLeave()
      }}
      onMouseEnter={() => {
        setHover(true)
        handleVariantEnter(plotInfo.plot, xi, {
          x: x1 + plotPos.x,
          y: y1 + plotPos.y,
        })
      }}
    />
  )
}
