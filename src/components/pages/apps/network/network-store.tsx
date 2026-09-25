import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'
import { forceLink, forceManyBody, forceSimulation } from 'd3-force'

import { autoTickInterval } from '@/components/plot/axes/axis'
import { IDim } from '@/interfaces/dim'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { ILimit, ZERO_LIMIT } from '@/lib/math/limit'
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

interface INodeData {
  name: string
  value: string | number
}

export interface INode {
  id: string
  /**
   * Secondary id e.g. group::name
   */
  id2: string

  groupId: string

  /**
   * The label of the node, used for display purposes.
   */
  //label: string
  size: number
  size2?: number
  //group: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  data?: Record<string, string | number>
}

interface IEdge {
  id: string
  strength: number
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
  strengthCol: string,
  settings: INetworkSettings,
  userData: IUserDataSettings
) {
  const labels = dfNodes.col(labelCol).strs
  const names = dfNodes.col(nameCol).strs
  let sizes = dfNodes.col(sizeCol).nums
  let sizes2 = []

  try {
    sizes2 = dfNodes.col(colorCol).nums
  } catch (error) {
    //console.error('Error reading color column:', error)
  }

  const groups = dfNodes.col(groupCol).strs

  const minNonZeroP = min(sizes.filter((p) => p > 0))

  // 2. Set a floor slightly smaller than that (e.g., one order of magnitude lower)
  const pFloor = minNonZeroP * 0.1

  sizes = sizes.map((size) =>
    settings.data.applyMinusLog10ToMetric1
      ? -Math.log10(size === 0 ? pFloor : size)
      : size
  )

  // const sizeLim: ILimit = {
  //   min: min(sizes),
  //   max: max(sizes),
  // }

  //  sizes = sizes.map((size) => size / sizeLim.max)

  const minNonZeroP2 = min(sizes2.filter((p) => p > 0))
  const pFloor2 = minNonZeroP2 * 0.1

  sizes2 = sizes2.map((size) =>
    settings.data.applyMinusLog10ToMetric2
      ? -Math.log10(size === 0 ? pFloor2 : size)
      : size
  )

  // const sizeLim2: ILimit = {
  //   min: min(sizes2),
  //   max: max(sizes2),
  // }

  //sizes2 = sizes2.map((size) => size / sizeLim2.max)

  const colNames = dfNodes.columns

  const nodes: INode[] = labels.map((label, i) => {
    const node = {
      id: makeUuid(),
      id2: groups[i].trim() + '::' + names[i].trim(),
      label,
      name: names[i].trim(),
      size: sizes[i],
      size2: sizes2?.[i] ?? 0,
      groupId: '',
      data: {},
    }

    for (const colName of colNames) {
      const value = dfNodes.get(i, colName)
      node.data[colName] = value as string | number
    }

    return node
  })

  const nodeMap = new Map<string, INode>()

  const used = new Set<string>()

  for (const node of nodes) {
    const id2 = fixName(node.id2) //.group + '::' + node.name)

    nodeMap.set(id2, node)
    used.add(id2)
  }

  const sources = dfEdges.col(sourceCol).strs
  const targets = dfEdges.col(targetCol).strs
  const strengths = dfEdges.col(strengthCol).nums

  const edges: IEdge[] = sources.map((source, si) => {
    return {
      id: makeUuid(),
      source: nodeMap.get(fixName(source))?.id ?? '',
      target: nodeMap.get(fixName(targets[si]))?.id ?? '',
      strength: strengths[si] ?? 0,
    }
  })

  const uniqueGroups = [...new Set(groups)].sort().map((g, index) => ({
    id: makeUuid(),
    name: g,
    show: true,
    color:
      userData.groups.colors[g.toLowerCase()] ??
      TAB10_PALETTE[index % TAB10_PALETTE.length],
  }))

  const groupToIdMap = new Map(
    uniqueGroups.map((g) => [g.name.toLowerCase(), g.id])
  )

  for (let [ni, node] of nodes.entries()) {
    node.groupId = groupToIdMap.get(groups[ni].toLowerCase()) ?? ''
  }

  const idNodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]))

  return {
    network: {
      id: makeUuid(),
      name: 'Network',
      nodes,
      nodeMap: idNodeMap,
      edges,
    },
    nodeDataTypes: colNames,
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

    label: {
      field: string
      fields: string[]
    }
  }
  edges: {
    strengthLim: ILimit
    stepSize: number
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
    nodeDataTypes: string[],
    labelField: string,
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => void
  setNodeLabelField: (field: string) => void
  setGroups: (groups: IGroup[]) => void
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => void
}

export const useNetworkStore = create<INetworkStore>()((set, get) => ({
  network: undefined,
  nodes: {
    metricLim1: { ...ZERO_LIMIT },
    stepSize: 0,
    metricLim2: { ...ZERO_LIMIT },
    label: {
      fields: [],
      field: '',
    },
  },
  edges: {
    strengthLim: { ...ZERO_LIMIT },
    stepSize: 0,
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
    nodeLabelFields: string[],
    labelField: string,
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => {
    // set metric limits for the primary metric (size) of the nodes
    // set max to a min of 1 so that we dont get divide by zero errors
    // for the primary metric (size) of the nodes

    const metricLim1: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size)),
      max: Math.max(1, ...network.nodes.map((node) => node.size)),
    }

    // get step size using log10 to find a suitable magnitude for the step
    const { interval: stepSize } = autoTickInterval({
      min: 0,
      max: metricLim1.max,
    })

    // max must be a multiple of step size for size
    metricLim1.min = Math.floor(metricLim1.min / stepSize) * stepSize
    metricLim1.max = Math.ceil(metricLim1.max / stepSize) * stepSize

    // set max to a min of 1 so that we dont get divide by zero errors
    const metricLim2: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size2)),
      max: Math.max(1, ...network.nodes.map((node) => node.size2)),
    }

    const { interval: stepSize2 } = autoTickInterval({
      min: 0,
      max: metricLim2.max,
    })

    // max must be a multiple of step size
    metricLim2.min = Math.floor(metricLim2.min / stepSize2) * stepSize2
    metricLim2.max = Math.ceil(metricLim2.max / stepSize2) * stepSize2

    const strengthLim: ILimit = {
      min: Math.min(...network.edges.map((edge) => edge.strength)),
      max: Math.max(1, ...network.edges.map((edge) => edge.strength)),
    }

    const { interval: stepSizeStrength } = autoTickInterval({
      min: 0,
      max: strengthLim.max,
    })

    strengthLim.min =
      Math.floor(strengthLim.min / stepSizeStrength) * stepSizeStrength
    strengthLim.max =
      Math.ceil(strengthLim.max / stepSizeStrength) * stepSizeStrength

    set({
      network,
      nodes: {
        metricLim1,
        metricLim2,
        stepSize,
        label: {
          field: labelField,
          fields: [...new Set(nodeLabelFields)].sort(),
        },
      },
      edges: {
        strengthLim,
        stepSize: stepSizeStrength,
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
  setNodeLabelField: (field: string) => {
    set({
      nodes: {
        ...get().nodes,
        label: {
          ...get().nodes.label,
          field,
        },
      },
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
  const nodes = useNetworkStore(useShallow((state) => state.nodes))
  const edges = useNetworkStore(useShallow((state) => state.edges))

  const groups = useNetworkStore(useShallow((state) => state.groups))
  const headings = useNetworkStore(useShallow((state) => state.headings))
  const coordinates = useNetworkStore(
    useShallow((state) => state.coordinateMap)
  )

  const size = useNetworkStore((state) => state.size)

  const setNodeLabelField = useNetworkStore((state) => state.setNodeLabelField)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const setGroups = useNetworkStore((state) => state.setGroups)

  return {
    network,
    nodes,
    edges,
    groups,
    coordinates,
    size,
    headings,
    setNetwork,
    setGroups,
    setNodeLabelField,
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
