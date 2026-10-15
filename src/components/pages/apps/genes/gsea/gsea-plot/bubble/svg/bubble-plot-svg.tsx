import { useGseaBubbleSettings } from '../gsea-bubble-settings'

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
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { SvgG } from '@/components/plot/svg-g'
import { useCrosshair } from '@/providers/crosshair-provider'
import gsap from 'gsap'
import { IGseaBubble, IGseaTableResult } from '../../gsea-store'
import { IBubblePoint } from '../gsea-bubble-provider'

const GROUP_TEXT_ALIGN = {
  0: 'start',
  90: 'middle',
  180: 'end',
  270: 'middle',
}

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

  const groupElems: ReactNode[] = []

  // only add group colors if there is more than 1 group
  if (settings.groups.show && plotInfo.plot.groups.length > 1) {
    let y = settings.axes.y.rowHeight / 2

    for (const gr of plotInfo.plot.groups.filter((g) => g.show)) {
      const y2 = y + gr.genesets.length * settings.axes.y.rowHeight
      const h = y2 - y

      groupElems.push(
        <SvgG
          key={gr.id}
          pos={{
            x: 0,
            y: y,
          }}
        >
          <SvgRect
            shapeRendering={SVG_CRISP_EDGES}
            width={settings.groups.width}
            height={h}
            stroke="none"
            fill={gr.color}
          />
          <SvgG
            pos={{
              x: 15,
              y: h / 2,
            }}
          >
            <SvgText
              textAnchor={
                GROUP_TEXT_ALIGN[settings.groups.font.rotation] || 'start'
              }
              font={settings.groups.font}
              fill={settings.groups.colored ? gr.color : undefined}
            >
              {gr.name}
            </SvgText>
          </SvgG>
        </SvgG>
      )

      y += h + settings.axes.y.rowHeight
    }
  }

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

      <SvgG id="groups" pos={{ x: 5, y: 0 }}>
        {groupElems}
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
    (plot: IGseaBubble, geneset: IGseaTableResult, row: number, p: IPos) => {
      const { relativeP, screenP } = svgPointToScreen(svgRef.current, p)

      showCrosshair({
        pos: relativeP,
        screenPos: screenP,
        content: (
          <>
            <p className="font-semibold">{`${geneset.name}`}</p>
            <p>{`${plot.nes.label}: ${geneset.nes.toFixed(2)}`}</p>
            <p>{`-log10(${plot.log10q.label}): ${geneset.log10q.toFixed(2)}`}</p>
            <p>{`${plot.size.label}: ${geneset.size}`}</p>
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
      onPointerLeave={() => {
        setHover(false)
        handleVariantLeave()
      }}
      onPointerEnter={() => {
        setHover(true)
        handleVariantEnter(plotInfo.plot, point.geneset, xi, {
          x: x1 + plotPos.x,
          y: y1 + plotPos.y,
        })
      }}
    />
  )
}
