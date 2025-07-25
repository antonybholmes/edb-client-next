import { BUTTON_MD_H_CLS } from '@/theme'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/shadcn-utils'
import { createContext, useContext, useState } from 'react'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { VCenterRow } from '../layout/v-center-row'

export type ITopicMap = { [key: string]: ITopicMap }

export type ITopicTree = {
  title: string
  description: string

  weight: number
  path: string[]
  slug: string
  children: ITopicTree[]
}

const HelpNodeContext = createContext<{
  selected: string
  setSelected: (selected: string) => void

  currentNode: ITopicTree | null
}>({
  selected: '',
  setSelected: () => {},

  currentNode: null,
})

interface IHelpNodeProps extends IChildrenProps {
  selected: string
  setSelected: (selected: string) => void

  currentNode: ITopicTree
}

export const HelpNodeProvider = ({
  selected,
  setSelected,

  currentNode,
  children,
}: IHelpNodeProps) => {
  // useEffect(() => {
  //   // sync internal value to external if it changes
  //   setSelected(selected)
  // }, [selected])

  return (
    <HelpNodeContext.Provider value={{ selected, setSelected, currentNode }}>
      {children}
    </HelpNodeContext.Provider>
  )
}

export function HelpTreeNode({
  level,
  node,
  currentNode,
}: {
  level: number
  node: ITopicTree
  currentNode: ITopicTree
}) {
  const [selected, setSelected] = useState(currentNode.slug)

  return (
    <HelpNodeProvider
      selected={selected}
      setSelected={setSelected}
      currentNode={currentNode}
    >
      <_HelpTreeNode level={level} node={node} />
    </HelpNodeProvider>
  )
}

function _HelpTreeNode({ level, node }: { level: number; node: ITopicTree }) {
  const { selected, setSelected, currentNode } = useContext(HelpNodeContext)
  const hasChildren = node.children && node.children.length > 0

  // auto determine which nodes are open by comparing the path at each level
  // with the node path at the same level. If they mirror each other, keep
  // all the nodes open
  const [isOpen, setIsOpen] = useState(
    node.path[level] === currentNode!.path[level]
  )

  const name = node.title // .name.replace(/[\_\-]/g, ' ')

  const isSelected = selected === node.slug

  //const slug = getSlug(node.path.join('/'))

  const isValidSlug = true //validSlugs.has(slug)

  return (
    <li className="flex flex-col gap-y-0.5">
      <VCenterRow className={cn(BUTTON_MD_H_CLS, 'gap-x-1')}>
        <span
          className="data-[checked=true]:bg-theme w-1 h-5 rounded-full shrink-0"
          data-checked={isSelected}
        />

        <VCenterRow
          className={cn(
            'justify-between items-center grow shrink-0 rounded-theme h-full gap-x-2',
            [isSelected, 'bg-muted/70 font-bold', 'hover:bg-muted/50']
          )}
        >
          {isValidSlug && (
            <a
              href={`/help/${node.slug}`}
              className="flex flex-row items-center justify-start grow h-full"
              style={{
                paddingLeft: `${level * 0.5 + 0.5}rem`,
              }}
            >
              {name}
            </a>
          )}

          {hasChildren && (
            <button
              data-valid-slug={isValidSlug}
              className="flex flex-row items-center data-[valid-slug=false]:grow justify-between h-full gap-x-2 pr-2"
              onClick={() => {
                setIsOpen(!isOpen)

                setSelected(node.slug)
              }}
              style={{
                paddingLeft: `${level * 0.5 + 0.5}rem`,
              }}
            >
              {!isValidSlug && (
                <span className="flex flex-row items-center justify-start grow">
                  {name}
                </span>
              )}

              <VCenterRow className="justify-center w-4">
                <ChevronRightIcon
                  className="trans-transform"
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                />
              </VCenterRow>
            </button>
          )}
        </VCenterRow>
      </VCenterRow>
      {hasChildren && isOpen && (
        <ul className="flex flex-col gap-y-0.5">
          {node.children.map((child, index) => (
            <_HelpTreeNode key={index} node={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
