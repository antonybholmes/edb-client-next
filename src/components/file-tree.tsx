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
  selectedId?: string
  setSelectedId?: (id: string) => void
}>({
  expanded: true,
  onValueChange: () => {},
  iconRenderer: treeFileIconRenderer,
})

function useFileTreeContext() {
  const ctx = useContext(FileTreeContext)

  if (!ctx) {
    throw new Error('useFileTreeContext must be used within a FileTreeProvider')
  }

  return ctx
}

interface IFileTreeProviderProps extends IChildrenProps {
  expanded?: boolean
  onValueChange?: ((tab: ITab) => void) | undefined
  iconRenderer?: IconRenderer
  selectedId?: string
}

export const FileTreeProvider = ({
  expanded = true,
  onValueChange,
  iconRenderer = treeFileIconRenderer,
  selectedId = '',
  children,
}: IFileTreeProviderProps) => {
  const [_selectedId, setSelectedId] = useState(selectedId)
  return (
    <FileTreeContext.Provider
      value={{
        expanded,
        onValueChange,
        iconRenderer,
        selectedId: _selectedId,
        setSelectedId,
      }}
    >
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
const TreeNode = ({
  node,
  depth = 0,
  root = '',
}: {
  node: ITab
  depth?: number
  root?: string
}) => {
  const { expanded, onValueChange, iconRenderer, selectedId, setSelectedId } =
    useFileTreeContext()

  const [_expanded, setExpanded] = useState(expanded)

  const hasChildren = node.children && node.children.length > 0 ? true : false

  const isFolder = hasChildren || node.type === 'folder'

  const icon = node.icon || iconRenderer!(isFolder, hasChildren, _expanded)

  function toggle() {
    if (isFolder) {
      setExpanded(!_expanded)
    }
  }

  // Some nodes can have same id since we allow reuse of default files etc.
  // Therefore we need to use the path as the unique identifier for selection
  const currentPath = root + '/' + node.id

  return (
    <li id={currentPath}>
      <VCenterRow
        data-selected={selectedId === currentPath}
        className="gap-x-1 hover:bg-muted/60 data-[selected=true]:bg-muted/60 rounded-md px-2"
      >
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
          {icon}
        </button>
        <button
          onClick={() => {
            setSelectedId?.(currentPath)
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
            <TreeNode
              key={index}
              node={child}
              depth={depth + 1}
              root={currentPath}
            />
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
  onValueChange,
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
