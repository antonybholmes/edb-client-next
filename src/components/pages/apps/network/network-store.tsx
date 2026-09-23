import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'
import { forceLink, forceManyBody, forceSimulation } from 'd3-force'

import { IDim } from '@/interfaces/dim'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { useCallback } from 'react'
import { create } from 'zustand'
import { useNetworkSettings } from './network-settings-store'

export interface IGroup extends IDBEntity {
  color: string
}

interface INode extends IDBEntity {
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
  scoreCol: string
): { network: INetwork; groups: IGroup[] } {
  //const labelCol = findCol(dfNodes, 'label')
  //const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //const groupCol = findCol(dfNodes, 'collection')

  const labels = dfNodes.col(labelCol).strs
  const names = dfNodes.col(nameCol).strs
  const sizes = dfNodes.col(sizeCol).nums
  const groups = dfNodes.col(groupCol).strs

  const nodes: INode[] = labels.map((label, i) => ({
    id: makeUuid(),
    label,
    name: names[i].trim(),
    size: sizes[i],
    group: groups[i].trim(),
  }))

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
    color: TAB10_PALETTE[index % TAB10_PALETTE.length],
  }))

  return { network: { nodes, edges }, groups: uniqueGroups }
}

export interface INetworkStore {
  network: INetwork | undefined
  groups: IGroup[]
  nodeMap: Record<string, INode>
  coordinateMap: Record<string, IPos>
  size: IDim
  setNetwork: (settings: INetwork, groups: IGroup[]) => void
  setGroups: (groups: IGroup[]) => void
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => void
}

export const useNetworkStore = create<INetworkStore>()((set) => ({
  network: undefined,
  groups: [],
  nodeMap: {},
  coordinateMap: {},
  size: { w: 0, h: 0 },
  setNetwork: (network: INetwork, groups: IGroup[]) => {
    console.log('setting network', network)
    set({
      network,
      nodeMap: Object.fromEntries(network.nodes.map((node) => [node.id, node])),
      coordinateMap: Object.fromEntries(
        network.nodes.map((node) => [node.id, { x: 0, y: 0 }])
      ),
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

export function useNetwork(): {
  network: INetwork | undefined
  groups: IGroup[]
  coordinates: Record<string, IPos>
  size: IDim
  setNetwork: (network: INetwork, groups: IGroup[]) => void
  setGroups: (groups: IGroup[]) => void
} {
  const network = useNetworkStore((state) => state.network)
  const groups = useNetworkStore((state) => state.groups)

  const coordinates = useNetworkStore((state) => state.coordinateMap)
  const size = useNetworkStore((state) => state.size)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const setGroups = useNetworkStore((state) => state.setGroups)

  return {
    network,
    groups,
    coordinates,
    size,
    setNetwork,
    setGroups,
  }
}

export function useNetworkSim(): {
  run: (network: INetwork, onFinished?: () => void) => void
} {
  const { settings } = useNetworkSettings()
  const updateCoordinates = useNetworkStore((state) => state.updateCoordinates)

  const run = useCallback(
    (network: INetwork, onFinished?: () => void) => {
      // 2. Clone the structure out into D3-friendly array mutations
      const nodes = network.nodes.map((node) => ({ ...node }))
      const edges = network.edges.map((edge) => ({ ...edge }))

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
      //   const nextNodeMap: Record<string, IPos> = {}

      //   nodes.forEach((node) => {
      //     nextNodeMap[node.id] = { x: node.x ?? 0, y: node.y ?? 0 }
      //   })

      //   // Atomically batch update the store
      //   updateCoordinates(nextNodeMap)
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

          const coordinates = Object.fromEntries(
            nodes.map((node) => [
              node.id,
              { x: (node.x ?? 0) - minX, y: (node.y ?? 0) - minY },
            ])
          )

          const finalWidth = Math.max(
            ...Object.values(coordinates).map((c) => c.x)
          )
          const finalHeight = Math.max(
            ...Object.values(coordinates).map((c) => c.y)
          )

          updateCoordinates(coordinates, { w: finalWidth, h: finalHeight })

          console.log({ minX, maxX, minY, maxY })
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
