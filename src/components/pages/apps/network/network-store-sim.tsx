import { IPos } from '@/interfaces/pos'
import { forceLink, forceManyBody, forceSimulation } from 'd3-force'

import { useCallback } from 'react'
import { useNetworkSettings } from './network-settings'
import { IEdge, INetwork, INode, useNetworkStore } from './network-store'

export function useNetworkSim(): {
  run: (network: INetwork, onFinished?: () => void) => void
} {
  const { settings } = useNetworkSettings()
  const updateCoordinates = useNetworkStore((state) => state.updateCoordinates)

  const run = useCallback(
    (network: INetwork, onFinished?: () => void) => {
      // 2. Clone the structure out into D3-friendly array mutations
      // const nodes = network.nodes.map((node, ni) => {
      //   const angle = ni * 0.5 // Spread out the placements linearly
      //   const distance = SCATTER_RADIUS * Math.sqrt(ni + 1) // Expand outwards proportionally

      //   return {
      //     ...node,
      //     x: size.w / 2 + distance * Math.cos(angle),
      //     y: size.h / 2 + distance * Math.sin(angle),
      //   }
      // })

      const nodes = network.nodes.map((node) => ({
        ...node,
      }))

      const edges = network.edges.map((edge) => ({ ...edge }))

      // let frame = 0

      // const leftWall = -size.w / 2
      // const rightWall = size.w / 2
      // const topWall = -size.h / 2
      // const bottomWall = size.h / 2

      // 1. Initialize the Link Force first so we can conditionally configure it
      const linkForce = forceLink<INode, IEdge>(edges)
        .id((d: INode) => d.id)
        .distance(settings.layout.linkDistance)

      // Conditionally apply custom strength or let D3 use its default internal formula
      if (settings.layout.useStrength) {
        linkForce.strength((d: IEdge) => d.strength)
      }

      // 3. Initialize the D3 Force Engine
      const simulation = forceSimulation(nodes)
        .force(
          'charge',
          forceManyBody().strength(settings.layout.chargeStrength)
        )
        // .force(
        //   'center',
        //   forceCenter(settings.plot.size.w / 2, settings.plot.size.h / 2)
        // )
        .force('link', linkForce)
      // .force('boundary-elastic', () => {
      //   const strength = 0.2

      //   for (let node of nodes) {
      //     // Apply boundary elastic force logic here

      //     if (node.x < leftWall) {
      //       node.vx += strength * (leftWall - node.x)
      //     }
      //     if (node.x > rightWall) {
      //       node.vx -= strength * (rightWall - node.x)
      //     }
      //     if (node.y < topWall) {
      //       node.vy += strength * (topWall - node.y)
      //     }
      //     if (node.y > bottomWall) {
      //       node.vy -= strength * (bottomWall - node.y)
      //     }
      //   }
      // })

      // 4. Stream layout coordinates straight back into the store on every frame tick
      // simulation.on('tick', () => {
      //   frame++

      //   if (frame % FRAME_SKIP !== 0) {
      //     return
      //   }

      //   const nextNodeMap = new Map<string, IPos>()

      //   nodes.forEach((node) => {
      //     nextNodeMap.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 })
      //   })

      //   // Atomically batch update the store
      //   updateCoordinates(nextNodeMap, { w: size.w, h: size.h })
      // })

      simulation.on('end', () => {
        if (nodes.length > 0) {
          if (nodes.length === 0) return

          // Extract all final positions
          const xVals = nodes.map((n: any) => n.x)
          const yVals = nodes.map((n: any) => n.y)

          const minX = Math.min(...xVals)
          const maxX = Math.max(...xVals)
          const minY = Math.min(...yVals)
          const maxY = Math.max(...yVals)
          const width = maxX - minX
          const height = maxY - minY

          // keep coordinates centered around 0,
          // the plotter will move them to center of canvas
          const coordinates: Record<string, IPos> = Object.fromEntries(
            nodes.map((node) => [
              node.id,
              {
                x: node.x,
                y: node.y,
              },
            ])
          )

          //

          updateCoordinates(coordinates, { w: width, h: height })
        }

        onFinished?.()
      })

      // 5. Hard lifecycle boundary: If the hook unmounts or options change, kill the simulation loop immediately
      return () => {
        simulation.stop()
      }
    },
    [settings, updateCoordinates]
  )

  return {
    run,
  }
}
