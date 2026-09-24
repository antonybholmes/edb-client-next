import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'
import { forceLink, forceManyBody, forceSimulation } from 'd3-force'

import { IDim } from '@/interfaces/dim'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { ILimit } from '@/lib/math/limit'
import { min } from '@/lib/math/math'
import { useCallback } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { INetworkSettings, useNetworkSettings } from './network-settings-store'
import { IUserDataSettings } from './network-user-data-store'

export interface IGroup extends IDBEntity {
  color: string
  show: boolean
}

export interface INode extends IDBEntity {
  /**
   * Secondary id e.g. group::name
   */
  id2: string
  /**
   * The label of the node, used for display purposes.
   */
  label: string
  size: number
  size2?: number
  group: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface IEdge {
  id: string
  score: number
  source: string
  target: string
}

interface INetwork extends IDBEntity {
  nodes: INode[]
  nodeMap: Record<string, INode>
  edges: IEdge[]
}

const FRAME_SKIP = 5

// export function dataframesToNetwork(dfs: BaseDataFrame[]): INetwork {
//   const dfNodes = dfs.filter((df) => df.name.toLowerCase().includes('node'))[0]
//   const dfEdges = dfs.filter((df) => df.name.toLowerCase().includes('edge'))[0]

//   const labelCol = findCol(dfNodes, 'label')
//   const sizeCol = findCol(dfNodes, 'size', { exact: true })
//   const groupCol = findCol(dfNodes, 'collection')

//   const labels = dfNodes.col(labelCol).strs
//   const sizes = dfNodes.col(sizeCol).nums
//   const groups = dfNodes.col(groupCol).strs

//   const nodes: INode[] = labels.map((label, i) => ({
//     id: makeUuid(),
//     name: label,
//     size: sizes[i] ?? 1,
//     group: groups[i] ?? '',
//   }))

//   const nodeMap = {}

//   for (const node of nodes) {
//     nodeMap[node.id] = node

//     nodeMap[node.group + '::' + node.name] = node
//   }

//   const sourceCol = findCol(dfEdges, /(source|from)/i)
//   const targetCol = findCol(dfEdges, /(target|to)/i)
//   const scoreCol = findCol(dfEdges, 'similarity', { exact: true })

//   const sources = dfEdges.col(sourceCol).strs
//   const targets = dfEdges.col(targetCol).strs
//   const scores = dfEdges.col(scoreCol).nums

//   const edges: IEdge[] = sources.map((source, si) => ({
//     id: makeUuid(),
//     source: nodeMap[source].id ?? '',
//     target: nodeMap[targets[si]]?.id ?? '',
//     score: scores[si] ?? 0,
//   }))

//   return { nodes, edges }
// }

function fixName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_')
}

export function dataframesToNetwork(
  dfNodes: BaseDataFrame,
  dfEdges: BaseDataFrame,
  labelCol: string,
  nameCol: string,
  groupCol: string,
  sizeCol: string,
  colorCol: string,
  sourceCol: string,
  targetCol: string,
  scoreCol: string,
  settings: INetworkSettings,
  userData: IUserDataSettings
) {
  //const labelCol = findCol(dfNodes, 'label')
  //const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //const groupCol = findCol(dfNodes, 'collection')

  const labels = dfNodes.col(labelCol).strs
  const names = dfNodes.col(nameCol).strs
  const sizes = dfNodes.col(sizeCol).nums
  const sizes2 = dfNodes.col(colorCol).nums
  const groups = dfNodes.col(groupCol).strs

  const minNonZeroP = min(sizes.filter((p) => p > 0))

  // 2. Set a floor slightly smaller than that (e.g., one order of magnitude lower)
  const pFloor = minNonZeroP * 0.1

  const minNonZeroP2 = min(sizes2.filter((p) => p > 0))
  const pFloor2 = minNonZeroP2 * 0.1

  const nodes: INode[] = labels.map((label, i) => {
    // 3. Apply the transformation safely
    const size = settings.data.applyMinusLog10ToSize
      ? -Math.log10(sizes[i] === 0 ? pFloor : sizes[i])
      : sizes[i]

    const size2 = settings.data.applyMinusLog10ToSize2
      ? -Math.log10(sizes2[i] === 0 ? pFloor2 : sizes2[i])
      : sizes2[i]

    console.log('size', sizes[i], size, settings.data.applyMinusLog10ToSize)

    return {
      id: makeUuid(),
      id2: groups[i].trim() + '::' + names[i].trim(),
      label,
      name: names[i].trim(),
      size,
      size2,
      group: groups[i].trim(),
    }
  })

  const nodeMap = new Map<string, INode>()

  const used = new Set<string>()

  for (const node of nodes) {
    const id2 = fixName(node.group + '::' + node.name)

    nodeMap.set(id2, node)
    used.add(id2)
  }

  //const sourceCol = findCol(dfEdges, /(source|from)/i)
  //const targetCol = findCol(dfEdges, /(target|to)/i)
  //const scoreCol = findCol(dfEdges, 'similarity', { exact: true })

  const sources = dfEdges.col(sourceCol).strs
  const targets = dfEdges.col(targetCol).strs
  const scores = dfEdges.col(scoreCol).nums

  const edges: IEdge[] = sources.map((source, si) => {
    //console.log(source, targets[si], scores[si])
    return {
      id: makeUuid(),
      source: nodeMap.get(fixName(source))?.id ?? '',
      target: nodeMap.get(fixName(targets[si]))?.id ?? '',
      score: scores[si] ?? 0,
    }
  })

  const groupSet = new Set(nodes.map((node) => node.group))

  const uniqueGroups = [...groupSet].sort().map((g, index) => ({
    id: makeUuid(),
    name: g,
    show: true,
    color:
      userData.groups.colors[g.toLowerCase()] ??
      TAB10_PALETTE[index % TAB10_PALETTE.length],
  }))

  const idNodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]))

  return {
    network: {
      id: makeUuid(),
      name: 'Network',
      nodes,
      nodeMap: idNodeMap,
      edges,
    },
    groups: uniqueGroups,
  }
}

export interface INetworkStore {
  network: INetwork | undefined
  nodes: {
    /**
     * The limit for the primary metric (size) of the nodes.
     */
    metricLim1: ILimit
    stepSize: number
    /**
     * The limit for the secondary metric (size2) of the nodes.
     */
    metricLim2: ILimit
  }
  headings: {
    score: string
    metric1: string
    metric2: string
  }
  groups: IGroup[]

  coordinateMap: Record<string, IPos>
  size: IDim

  setNetwork: (
    settings: INetwork,
    groups: IGroup[],
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => void
  setGroups: (groups: IGroup[]) => void
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => void
}

export const useNetworkStore = create<INetworkStore>()((set) => ({
  network: undefined,
  nodes: {
    metricLim1: { min: 0, max: 0 },
    stepSize: 0,
    metricLim2: { min: 0, max: 0 },
  },
  headings: {
    score: 'Score',
    metric1: 'Size',
    metric2: 'Size2',
  },
  groups: [],

  coordinateMap: {},
  size: { w: 0, h: 0 },

  setNetwork: (
    network: INetwork,
    groups: IGroup[],
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => {
    const sizeLim: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size)),
      max: Math.max(...network.nodes.map((node) => node.size)),
    }

    // get step size using log10 to find a suitable magnitude for the step
    const stepSize = Math.pow(10, Math.floor(Math.log10(sizeLim.max)))

    // max must be a multiple of step size for size
    sizeLim.min = Math.floor(sizeLim.min / stepSize) * stepSize
    sizeLim.max = Math.ceil(sizeLim.max / stepSize) * stepSize

    const sizeLim2: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size2)),
      max: Math.max(...network.nodes.map((node) => node.size2)),
    }

    const stepSize2 = Math.pow(10, Math.floor(Math.log10(sizeLim2.max)))

    // max must be a multiple of step size
    sizeLim2.min = Math.floor(sizeLim2.min / stepSize2) * stepSize2
    sizeLim2.max = Math.ceil(sizeLim2.max / stepSize2) * stepSize2

    set({
      network,
      nodes: {
        metricLim1: sizeLim,
        stepSize,
        metricLim2: sizeLim2,
      },
      headings: {
        score: scoreName,
        metric1: sizeName,
        metric2: size2Name,
      },
      coordinateMap: {},
      groups,
    })
  },
  setGroups: (groups: IGroup[]) => {
    set({
      groups,
    })
  },
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => {
    set({
      coordinateMap,
      size,
    })
  },
}))

export function useNetwork() {
  const network = useNetworkStore(useShallow((state) => state.network))
  const metricLim1 = useNetworkStore(
    useShallow((state) => state.nodes.metricLim1)
  )
  const metricLim2 = useNetworkStore(
    useShallow((state) => state.nodes.metricLim2)
  )
  const stepSize = useNetworkStore((state) => state.nodes.stepSize)
  const groups = useNetworkStore(useShallow((state) => state.groups))
  const headings = useNetworkStore(useShallow((state) => state.headings))
  const coordinates = useNetworkStore(
    useShallow((state) => state.coordinateMap)
  )

  const size = useNetworkStore((state) => state.size)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const setGroups = useNetworkStore((state) => state.setGroups)

  return {
    network,
    metricLim1,
    stepSize,
    metricLim2,
    groups,
    coordinates,
    size,
    headings,
    setNetwork,
    setGroups,
  }
}

// export function useNetworkSim(): {
//   run: (network: INetwork, onFinished?: () => void) => void
// } {
//   const { settings } = useNetworkSettings()
//   const updateCoordinates = useNetworkStore((state) => state.updateCoordinates)

//   const run = useCallback(
//     (network: INetwork, onFinished?: () => void) => {
//       const size = settings.plot.size

//       // 2. Clone the structure out into D3-friendly array mutations
//       const nodes = network.nodes.map((node) => ({
//         ...node,
//         x: size.w / 2,
//         y: size.h / 2,
//       }))
//       const edges = network.edges.map((edge) => ({ ...edge }))

//       let frame = 0

//       // 3. Initialize the D3 Force Engine
//       const simulation = forceSimulation(nodes)
//         .force('charge', forceManyBody().strength(settings.chargeStrength))
//         // .force(
//         //   'center',
//         //   forceCenter(settings.plot.size.w / 2, settings.plot.size.h / 2)
//         // )
//         .force(
//           'link',
//           forceLink(edges)
//             .id((d: any) => d.id)
//             .distance(settings.linkDistance)
//         )

//         // 3. The Custom Canvas Walls Box Constraint
//         .force('canvas-walls', () => {
//           for (let node of nodes as any[]) {
//             // Keep X coordinates within bounds (0 + radius to width - radius)
//             if (node.x < 0) {
//               node.x = 0
//             }

//             if (node.x > size.w) {
//               node.x = size.w
//             }

//             // Keep Y coordinates within bounds (0 + radius to height - radius)
//             if (node.y < 0) {
//               node.y = 0
//             }

//             if (node.y > size.h) {
//               node.y = size.h
//             }
//           }
//         })

//       // 4. Stream layout coordinates straight back into the store on every frame tick
//       simulation.on('tick', () => {
//         frame++

//         if (frame % FRAME_SKIP !== 0) {
//           return
//         }

//         const nextNodeMap: Record<string, IPos> = {}

//         nodes.forEach((node) => {
//           nextNodeMap[node.id] = { x: node.x ?? 0, y: node.y ?? 0 }
//         })

//         // Atomically batch update the store
//         updateCoordinates(nextNodeMap, { w: size.w, h: size.h })
//       })

//       simulation.on('end', () => {

//         onFinished?.()
//       })

//       // 5. Hard lifecycle boundary: If the hook unmounts or options change, kill the simulation loop immediately
//       return () => {
//         simulation.stop()
//       }
//     },
//     [settings, updateCoordinates]
//   )

//   return {
//     run,
//   }
// }

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

      const size = settings.plot.size

      const nodes = network.nodes.map((node) => ({
        ...node,
      }))

      const edges = network.edges.map((edge) => ({ ...edge }))

      // let frame = 0

      // const leftWall = -size.w / 2
      // const rightWall = size.w / 2
      // const topWall = -size.h / 2
      // const bottomWall = size.h / 2

      // 3. Initialize the D3 Force Engine
      const simulation = forceSimulation(nodes)
        .force('charge', forceManyBody().strength(settings.chargeStrength))
        // .force(
        //   'center',
        //   forceCenter(settings.plot.size.w / 2, settings.plot.size.h / 2)
        // )
        .force(
          'link',
          forceLink(edges)
            .id((d: { id: string }) => d.id)
            .distance(settings.linkDistance)
        )
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

          console.log('dim,', { minX, maxX, minY, maxY, width, height })
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
