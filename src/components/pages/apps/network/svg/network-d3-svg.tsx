import { useCallback, useEffect, useMemo, useState } from 'react'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgZoomCanvas } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { IS_DEV_MODE } from '@/consts'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { truncate } from '@/lib/text/text'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings'
import {
  INode,
  IRenderEdge,
  IRenderNode,
  labelsInNodeIds,
  useNetwork,
} from '../network-store'

import { max } from '@/lib/math/math'
import { useNetworkD3Sim } from '../network-store-d3-sim'
import { useUserData } from '../network-user-data-store'
import { LegendSvg } from './legend-svg'

export function NetworkD3SvgContent() {
  const { ref } = useSVG()
  const { settings } = useNetworkSettings()
  const {
    settings: userData,
    updateSettings: updateUserData,
    userLabelSet,
  } = useUserData()

  const {
    network,
    groups,
    renderEdgeMap,
    nodeEdgeMap,
    nodeLabelMap,
    nodeColorMap,
    renderNodeMap,
  } = useNetwork()

  const { tree, formatText, formatCircle, formatEdge } = useNetworkD3Sim()

  const { showCrosshair, hideCrosshair } = useCrosshair()

  const [currentNode, setCurrentNode] = useState<INode | null>(null)

  useEffect(() => {
    if (!ref.current || renderNodeMap.size === 0) {
      return
    }

    const svg = d3.select(ref.current)

    // get the main container for network nodes
    const g = svg.select('#network').select('#nodes')

    if (g.empty()) {
      return
    }

    g.selectAll<SVGCircleElement, IRenderNode>('circle').call((g) =>
      formatCircle(g)
    )
  }, [renderNodeMap, nodeColorMap, settings])

  // update node labels
  useEffect(() => {
    if (!ref.current || nodeLabelMap.size === 0) {
      return
    }

    const svg = d3.select(ref.current)
    const g = svg.select('#network').select('#nodes')

    if (g.empty()) {
      return
    }

    // g.selectAll<SVGTextElement, IRenderNode>('text').text(
    //   (d) => nodeLabelMap.get(d.id) ?? ''
    // )

    g.selectAll<SVGTextElement, IRenderNode>('text').call((g) => formatText(g))
  }, [renderNodeMap, nodeLabelMap, userLabelSet, settings])

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const svg = d3.select(ref.current)

    const g = svg.select('#network').select('#edges')

    if (g.empty()) {
      return
    }

    g.selectAll<SVGLineElement, IRenderEdge>('line')
      // .attr('stroke', (d) => {
      //   return highlightedEdges.has(d.id)
      //     ? 'var(--color-app-theme)'
      //     : settings.plot.edges.line.value
      // })
      // .attr('stroke-opacity', (d) => {
      //   return renderEdgeMap.get(d.id)?.view === 'translucent' &&
      //     !highlightedEdges.has(d.id)
      //     ? settings.plot.nodes.view.hidden.opacity
      //     : settings.plot.edges.line.opacity
      // })
      // .attr('stroke-width', (d) =>
      //   Math.min(
      //     settings.plot.edges.minWidth,
      //     d.strength *
      //       settings.plot.edges.scale *
      //       (highlightedEdges.has(d.id) ? 3 : 1)
      //   )
      // )
      // .attr('visibility', (d) => {
      //   const hide = renderEdgeMap.get(d.id)?.view === 'hidden'
      //   return hide ? 'hidden' : 'visible'
      // })
      .call((g) => formatEdge(g, currentNode))
  }, [currentNode, renderEdgeMap, nodeEdgeMap, settings])

  // const tree = useMemo(
  //   () =>
  //     quadtree<IRenderNode>(
  //       renderNodes,
  //       (c) => c.x,
  //       (c) => c.y
  //     ),
  //   [renderNodeMap]
  // )

  const onPointerMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || !settings.plot.crosshair.show || !tree) {
        return
      }

      let svgP = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      // must be relative to plot area within svg excluding margins
      //svgP.x -= settings.plot.margin.left
      //svgP.y -= settings.plot.margin.top

      // need to apply zoom
      //svgP.x *= zoom
      //svgP.y *= zoom

      const node = tree.find(
        svgP.x,
        svgP.y,
        settings.plot.crosshair.search.radius
      )

      // since we have lots of mouse events, only react when the current node changes
      if (!node) {
        if (currentNode) {
          gsap.timeline().to(
            `#node-circle-${currentNode.id}`,
            {
              scale: 1,
              transformOrigin: 'center',
              duration: 0.3,
              ease: 'power2.out',
            },
            0
          )

          setCurrentNode(null)
        }

        hideCrosshair()
        return
      }

      if (node.id === currentNode?.id) {
        return
      }

      setCurrentNode(node)

      gsap.timeline().to(
        `#node-circle-${node.id}`,
        {
          scale: 1.2,
          transformOrigin: 'center',
          duration: 0.3,
          ease: 'power2.out',
        },
        0
      )

      const plotNodePos = { x: node.x, y: node.y }

      const canvasNodePos = {
        x: plotNodePos.x,
        y: plotNodePos.y,
      }

      const { relativeP, screenP } = svgPointToScreen(
        ref.current,
        canvasNodePos
      )

      showCrosshair({
        pos: relativeP,
        screenPos: screenP,
        showLines: false,
        content: (
          <>
            {IS_DEV_MODE && <strong>{node.id}</strong>}
            {Object.entries(node.data)
              .sort(([key1], [key2]) => key1.localeCompare(key2))
              .map(([key, value], i) => (
                <span key={i}>
                  {key}:{' '}
                  <strong>{truncate(value.toString(), { length: 32 })}</strong>
                </span>
              ))}
          </>
        ),
      })
    },
    [
      tree,
      currentNode,
      settings,
      truncate,
      showCrosshair,
      hideCrosshair,
      screenToSvgPoint,
      svgPointToScreen,
      setCurrentNode,
    ]
  )

  const onPointerDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!currentNode) {
        return
      }

      const inUserData = labelsInNodeIds(currentNode, userLabelSet)

      if (inUserData) {
        updateUserData(
          produce(userData, (draft) => {
            draft.labels.ids = userData.labels.ids.filter(
              (id) => id !== currentNode.id2
            )
          })
        )
      } else {
        updateUserData(
          produce(userData, (draft) => {
            draft.labels.ids = [...userData.labels.ids, currentNode.id2]
          })
        )
      }

      e.stopPropagation()
    },
    [userLabelSet, updateUserData, userData, currentNode]
  )

  //   const svg = (
  //     <>
  //       <SvgMargin margin={settings.plot.margin}>
  //         {settings.plot.border.show && (
  //           <SvgRect
  //             x={0}
  //             y={0}
  //             width={settings.plot.size.w}
  //             height={settings.plot.size.h}
  //             sp={settings.plot.border}
  //           />
  //         )}

  //         {settings.plot.edges.line.show &&
  //           renderEdges.map((edge, idx) => {
  //             const sourcePos = canvasCoordinates.get(edge.source) || ZERO_POS
  //             const targetPos = canvasCoordinates.get(edge.target) || ZERO_POS

  //             const opacity =
  //               edge.view === 'translucent'
  //                 ? settings.plot.nodes.view.hidden.opacity
  //                 : 1

  //             return (
  //               <SvgLine
  //                 key={idx}
  //                 x1={sourcePos.x}
  //                 y1={sourcePos.y}
  //                 x2={targetPos.x}
  //                 y2={targetPos.y}
  //                 s={settings.plot.edges.line}

  //                 strokeWidth={edge.strength * settings.plot.edges.scale}
  //                 opacity={opacity}
  //               />
  //             )
  //           })}

  //         {renderNodeMap.map((node) => {
  //           return (
  //             <NodeCircle
  //               key={node.id}
  //               node={node}
  //               radius={radiusMap.get(node.id) ?? 0}
  //               size2={sizeMap2.get(node.id) ?? 0}
  //               colorMap={colorMap}

  //               labelSet={userLabelSet}
  //               coordinates={canvasCoordinates}
  //             />
  //           )
  //         })}

  //         <SvgMouseRect
  //           size={settings.plot.size}
  //           onPointerMove={onPointerMove}
  //           onPointerLeave={hideCrosshair}
  //           onDoubleClick={onPointerDoubleClick}
  //         />
  //       </SvgMargin>
  //       <LegendSvg />
  //     </>
  //   )

  //   return { svg, width, height }
  // }, [settings, network?.id, coordinates, groups, userData, renderNodeMap])

  // if (!svg) {
  //   return null
  // }

  const { size } = useMemo(() => {
    if (!network) {
      return { size: { w: 0, h: 0 } }
    }
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot

    let rightMargin = settings.plot.margin.right

    if (settings.plot.legend.show && settings.plot.legend.autoMargin) {
      const maxChars = max(groups.map((g) => g.name.length))

      rightMargin +=
        (maxChars * settings.plot.nodes.labels.text.font.fontSize) / 2
    }

    const size = {
      w: settings.plot.size.w + settings.plot.margin.left + rightMargin,

      h:
        settings.plot.size.h +
        settings.plot.margin.top +
        settings.plot.margin.bottom,
    }

    return { size }
  }, [settings, network?.id])

  return (
    <SvgZoomCanvas
      size={size}
      onPointerMove={onPointerMove}
      onPointerLeave={hideCrosshair}
      onDoubleClick={onPointerDoubleClick}
    >
      <SvgG id="network" />
      <SvgMargin margin={settings.plot.margin}>
        {settings.plot.border.show && (
          <SvgRect
            x={0}
            y={0}
            width={settings.plot.size.w}
            height={settings.plot.size.h}
            sp={settings.plot.border}
          />
        )}
      </SvgMargin>
      {settings.plot.legend.show && <LegendSvg />}
    </SvgZoomCanvas>
  )
}

export function NetworkD3Svg() {
  return (
    <CrosshairProvider>
      <NetworkD3SvgContent />
    </CrosshairProvider>
  )
}
