import type { IChildrenProps } from '@/interfaces/children-props'
import type { IClassProps } from '@/interfaces/class-props'
import { File, FolderOpen, SquareMinus, SquarePlus } from 'lucide-react'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { ChevronRightIcon } from './icons/chevron-right-icon'
import { VCenterRow } from './layout/v-center-row'
import type { ITab } from './tabs/tab-provider'

const FileTreeContext = createContext<{
  expanded: boolean
  onValueChange?: ((tab: ITab) => void) | undefined
  iconRenderer?: IconRenderer
}>({
  expanded: true,
  onValueChange: () => {},
  iconRenderer: treeFileIconRenderer,
})

interface IFileTreeProviderProps extends IChildrenProps {
  expanded?: boolean
  onValueChange?: ((tab: ITab) => void) | undefined
  iconRenderer?: IconRenderer
}

export const FileTreeProvider = ({
  expanded = true,
  onValueChange,
  iconRenderer = treeFileIconRenderer,
  children,
}: IFileTreeProviderProps) => {
  return (
    <FileTreeContext.Provider value={{ expanded, onValueChange, iconRenderer }}>
      {children}
    </FileTreeContext.Provider>
  )
}

type IconRenderer = (
  isFolder: boolean,
  hasChildren: boolean,
  expanded: boolean
) => ReactNode

export function treePlusMinusIconRenderer(
  isFolder: boolean,
  hasChildren: boolean,
  expanded: boolean,
  folderIcon: ReactNode,
  fileIcon: ReactNode
): ReactNode {
  if (isFolder) {
    if (expanded && hasChildren) {
      return (
        <>
          <SquareMinus className="w-3.5" />
          {folderIcon}
        </>
      )
    } else {
      return (
        <>
          <SquarePlus className="w-3.5" />
          {folderIcon}
        </>
      )
    }
  } else {
    return fileIcon
  }
}

export function treeFileIconRenderer(
  isFolder: boolean,
  hasChildren: boolean,
  expanded: boolean
): ReactNode {
  return treePlusMinusIconRenderer(
    isFolder,
    hasChildren,
    expanded,
    <FolderOpen className="w-4" />,
    <File className="w-4 ml-2" />
  )
}

export function treeArrowIconRenderer(
  isFolder: boolean,
  hasChildren: boolean,
  expanded: boolean
): ReactNode {
  if (isFolder) {
    if (expanded && hasChildren) {
      return <ChevronRightIcon className="w-4 rotate-90" />
    } else {
      return <ChevronRightIcon className="w-4" />
    }
  } else {
    return <File className="w-3.5" />
  }
}

// Recursive Tree Node component
const TreeNode = ({ node, depth = 0 }: { node: ITab; depth?: number }) => {
  const { expanded, onValueChange, iconRenderer } = useContext(FileTreeContext)

  const [_expanded, setExpanded] = useState(expanded)

  const hasChildren = node.children && node.children.length > 0 ? true : false

  const isFolder = hasChildren || node.type === 'folder'

  function toggle() {
    if (isFolder) {
      setExpanded(!_expanded)
    }
  }

  return (
    <li>
      <VCenterRow className="gap-x-1 hover:bg-muted/60 rounded-md px-2">
        <button
          onClick={() => {
            toggle()
          }}
          style={{
            marginLeft: depth * 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          className="flex flex-row items-center gap-x-1"
          aria-label={
            isFolder
              ? _expanded
                ? `Collapse ${node.name}`
                : `Expand ${node.name}`
              : node.name
          }
        >
          {iconRenderer!(isFolder, hasChildren, _expanded)}
        </button>
        <button
          onClick={() => {
            onValueChange?.(node)
          }}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
          }}
          className="grow text-left h-6 truncate"
        >
          {node.name}
        </button>
      </VCenterRow>
      {isFolder && _expanded && node.children && (
        <ul>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

interface IProps extends IClassProps {
  tab: ITab
  onValueChange?: ((tab: ITab) => void) | undefined
  expanded?: boolean
  iconRenderer?: IconRenderer
}

// Main Tree Component
export function FileTree({
  tab,
  onValueChange = undefined,
  expanded = true,
  iconRenderer = treeFileIconRenderer,
  className,
}: IProps) {
  return (
    <FileTreeProvider
      onValueChange={onValueChange}
      expanded={expanded}
      iconRenderer={iconRenderer}
    >
      <ul className={className}>
        <TreeNode key={0} node={tab} />
      </ul>
    </FileTreeProvider>
  )
}
