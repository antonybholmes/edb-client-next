import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'
import { forceLink, forceManyBody, forceSimulation } from 'd3-force'

import { IDim } from '@/interfaces/dim'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { useCallback } from 'react'
import { create } from 'zustand'
import { INetworkSettings, useNetworkSettings } from './network-settings-store'

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
  group: string
  x?: number
  y?: number
}

interface IEdge {
  id: string
  score: number
  source: string
  target: string
}

interface INetwork {
  nodes: INode[]
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
  sizeCol: string,
  groupCol: string,
  sourceCol: string,
  targetCol: string,
  scoreCol: string,
  settings: INetworkSettings
): { network: INetwork; groups: IGroup[]; scoreName: string } {
  //const labelCol = findCol(dfNodes, 'label')
  //const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //const groupCol = findCol(dfNodes, 'collection')

  const labels = dfNodes.col(labelCol).strs
  const names = dfNodes.col(nameCol).strs
  const sizes = dfNodes.col(sizeCol).nums
  const groups = dfNodes.col(groupCol).strs

  const nodes: INode[] = labels.map((label, i) => {
    return {
      id: makeUuid(),
      id2: groups[i].trim() + '::' + names[i].trim(),
      label,
      name: names[i].trim(),
      size: sizes[i],
      group: groups[i].trim(),
    }
  })

  const nodeMap = {}

  const used = new Set<string>()

  for (const node of nodes) {
    //nodeMap[node.id] = node

    const id2 = fixName(node.group + '::' + node.name)

    nodeMap[id2] = node
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
      source: nodeMap[fixName(source)]?.id ?? '',
      target: nodeMap[fixName(targets[si])]?.id ?? '',
      score: scores[si] ?? 0,
    }
  })

  const groupSet = new Set(nodes.map((node) => node.group))

  const uniqueGroups = [...groupSet].sort().map((g, index) => ({
    id: makeUuid(),
    name: g,
    show: true,
    color:
      settings.plot.groups.colors[g.toLowerCase()] ??
      TAB10_PALETTE[index % TAB10_PALETTE.length],
  }))

  return {
    network: { nodes, edges },
    groups: uniqueGroups,
    scoreName: scoreCol,
  }
}

export interface INetworkStore {
  network: INetwork | undefined
  groups: IGroup[]
  nodeMap: Map<string, INode>
  coordinateMap: Map<string, IPos>
  size: IDim
  scoreName: string
  setNetwork: (settings: INetwork, groups: IGroup[], scoreName: string) => void
  setGroups: (groups: IGroup[]) => void
  updateCoordinates: (coordinateMap: Map<string, IPos>, size: IDim) => void
}

export const useNetworkStore = create<INetworkStore>()((set) => ({
  network: undefined,
  groups: [],
  nodeMap: new Map(),
  coordinateMap: new Map(),
  size: { w: 0, h: 0 },
  scoreName: '',
  setNetwork: (network: INetwork, groups: IGroup[], scoreName: string) => {
    set({
      network,
      nodeMap: new Map(network.nodes.map((node) => [node.id, node])),
      // coordinateMap: Object.fromEntries(
      //   network.nodes.map((node) => [node.id, { x: 0, y: 0 }])
      // ),
      groups,
      scoreName,
    })
  },
  setGroups: (groups: IGroup[]) => {
    set({
      groups,
    })
  },
  updateCoordinates: (coordinateMap: Map<string, IPos>, size: IDim) => {
    set({
      coordinateMap,
      size,
    })
  },
}))

export function useNetwork(): {
  network: INetwork | undefined
  groups: IGroup[]
  coordinates: Map<string, IPos>
  size: IDim
  scoreName: string
  setNetwork: (network: INetwork, groups: IGroup[], scoreName: string) => void
  setGroups: (groups: IGroup[]) => void
} {
  const network = useNetworkStore((state) => state.network)
  const groups = useNetworkStore((state) => state.groups)
  const scoreName = useNetworkStore((state) => state.scoreName)
  const coordinates = useNetworkStore((state) => state.coordinateMap)

  const size = useNetworkStore((state) => state.size)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const setGroups = useNetworkStore((state) => state.setGroups)

  return {
    network,
    groups,
    coordinates,
    size,
    scoreName,
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

      let frame = 0

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
            .id((d: any) => d.id)
            .distance(settings.linkDistance)
        )

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
          const coordinates = new Map(
            nodes.map((node) => [
              node.id,
              {
                x: node.x, // - minX   -width / 2,
                y: node.y, // - minY  -height/ 2,
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
