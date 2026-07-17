import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { IClassProps } from '@/interfaces/class-props'
import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { TrashIcon } from './icons/trash-icon'

import { TEXT_DELETE, TEXT_OK } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { gsap } from 'gsap'
import { Ellipsis, File, Folder, FolderOpen } from 'lucide-react'
import { useDialogs } from './dialogs/dialogs'
import { CenterCol } from './layout/center-col'
import { VCenterRow } from './layout/v-center-row'
import { Checkbox } from './shadcn/ui/themed/v2/check-box'
import { getTabName, type ITab, type OpenState } from './tabs/tab-provider'

const DURATION_S = 0.2

const CollapseTreeContext = createContext<{
  isOpen: OpenState
  value?: string | undefined
  //selectedId?: string | undefined
  //setSelectedId?: (id: string) => void
  setValue: (tab: string) => void
  onValueChange: (tab: ITab) => void
  onCheckedChange: (tab: ITab, state: boolean) => void
}>({
  isOpen: false,
  setValue: () => {},
  onValueChange: () => {},
  onCheckedChange: () => {},
})

function useCollapseTreeContext() {
  const ctx = useContext(CollapseTreeContext)

  if (!ctx) {
    throw new Error(
      'useCollapseTreeContext must be used within a CollapseTreeProvider'
    )
  }

  return ctx
}

interface ICollapseTreeProviderProps extends IChildrenProps {
  value?: string | undefined
  isOpen?: OpenState
  selectedId?: string | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
}

export const CollapseTreeProvider = ({
  value,
  isOpen = 'auto',
  //selectedId,
  onValueChange,
  onCheckedChange,
  children,
}: ICollapseTreeProviderProps) => {
  const [_value, setValue] = useState<string | undefined>(value)

  //const [_selectedId, setSelectedId] = useState<string | undefined>(selectedId)

  useEffect(() => {
    setValue(value)
  }, [value])

  function _onValueChange(tab: ITab) {
    setValue(tab.id)
    onValueChange?.(tab)
  }

  function _onCheckedChange(tab: ITab, state: boolean) {
    onCheckedChange?.(tab, state)
  }

  return (
    <CollapseTreeContext.Provider
      value={{
        isOpen: isOpen,
        value: _value,
        setValue,
        //selectedId: _selectedId,
        //setSelectedId: setSelectedId,
        onValueChange: _onValueChange,
        onCheckedChange: _onCheckedChange,
      }}
    >
      {children}
    </CollapseTreeContext.Provider>
  )
}

const OUTER_CONTAINER_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'flex flex-row items-center  shrink-0 rounded-theme',
  'relative h-8.5 overflow-hidden cursor-pointer text-xs',
  'group data-[root=true]:font-medium'
)

const INNER_CONTAINER_CLS = `grow gap-x-2 h-full 
  data-[root=false]:data-[selected=true]:font-medium
  data-[mode=selected]:bg-muted/50`

const NODE_BUTTON_CLS = `flex flex-row items-center 
  text-left justify-start gap-x-1.5 grow h-full relative`

// const EXPAND_CLS = `flex-row items-center justify-center outline-hidden
//   ring-0 aspect-square relative shrink-0 grow-0
//   group-hover:stroke-foreground stroke-foreground/50 trans-color
//   hidden data-[has-children=true]:flex`

// const ICON_CLS =
//   'flex flex-row items-center justify-start outline-hidden ring-0 aspect-square w-5 h-5 shrink-0 grow-0'

const MENU_BUTTON_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'w-8.5 h-8.5 aspect-square shrink-0 grow-0 flex flex-row',
  'items-center justify-center outline-hidden group',
  'data-[mode=selected]:bg-muted/50 data-[mode=menu-selected]:bg-muted/50',
  'hover:rounded-l-theme hover:bg-muted/50'
)

const LIST_CLS = 'flex flex-col gap-y-px overflow-hidden'

interface ICollapseTreeProps extends IDivProps {
  tab: ITab
  value?: string | undefined
  onValueChange?: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
  showRoot?: boolean | undefined
}

export function CollapseTree({
  tab,
  value,
  onValueChange,
  onCheckedChange,
  showRoot = true,
  className,
}: ICollapseTreeProps) {
  if (!tab) {
    return null
  }

  const children = showRoot ? [tab] : (tab.children ?? [])

  if (!children || children.length === 0) {
    return null
  }

  return (
    <CollapseTreeProvider
      value={value}
      onValueChange={(t) => {
        onValueChange?.(t)
      }}
      onCheckedChange={(tab: ITab, state: boolean) => {
        onCheckedChange?.(tab, state)
      }}
    >
      <ul className={LIST_CLS}>
        {children.map((child) => (
          <CollapseTreeNode
            key={child.id}
            tab={child}
            level={0}
            className={cn('w-full', className)}
          />
        ))}
      </ul>
    </CollapseTreeProvider>
  )
}

function CollapseTreeNode({
  tab,
  level,
  root = '',
  className,
}: { tab: ITab; level: number; root?: string } & IClassProps) {
  // showRoot is true for children since children always have a root
  // showRoot is only really used for the true root to determine if the
  // root should be shown or not or just the children in a list

  const {
    value,
    isOpen: globalIsOpen,

    setValue,
    onValueChange,
    onCheckedChange,
  } = useCollapseTreeContext()

  const { open: openDialog } = useDialogs()

  const hasChildren = Array.isArray(tab.children) && tab.children.length > 0

  const [isOpen, setIsOpen] = useState(false)

  const [hover, setHover] = useState<boolean>(false)
  const [focus, setFocus] = useState<boolean>(false)

  const [menuHover, setMenuHover] = useState<boolean>(false)

  const arrowIconRef = useRef<SVGSVGElement>(null)
  const contentRef = useRef<HTMLUListElement>(null)

  const containerRef = useRef<HTMLLIElement>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  //const tabId = tab.id
  //const valueId = selectedTab?.id
  const path = root + '/' + tab.id

  const isSelected = value === tab.id
  const dataMenu = menuOpen ? 'open' : 'closed'

  // determine which parts are highlighted
  const mode =
    (isSelected && !menuHover) || menuOpen || hover
      ? 'selected'
      : menuHover
        ? 'menu-selected'
        : 'default'

  useEffect(() => {
    const open = tab.isOpen ?? globalIsOpen ?? 'auto'

    if (open === 'auto') {
      setIsOpen(hasChildren)
    } else {
      setIsOpen(open)
    }
  }, [tab.isOpen, globalIsOpen, hasChildren])

  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    if (contentRef.current) {
      tl.to(contentRef.current, {
        height: isOpen ? 'auto' : 0,
        duration: DURATION_S,
        ease: 'power3.out',
      })
    }

    if (arrowIconRef.current) {
      tl.to(
        arrowIconRef.current,
        {
          rotate: isOpen ? 90 : 0,
          duration: DURATION_S,
          ease: 'power3.out',
        },
        0
      )
    }

    tl.play()
  }, [isOpen])

  const openIcon: ReactNode = useMemo(() => {
    let icon: ReactNode = null
    if (isOpen && tab.openIcon) {
      icon = tab.openIcon
    } else if (tab.icon) {
      icon = tab.icon
    } else if (hasChildren || tab.type === 'folder') {
      if (isOpen) {
        icon = <FolderOpen strokeWidth={1.5} size={18} />
      } else {
        icon = <Folder strokeWidth={1.5} size={18} />
      }
    } else {
      return <File size={18} strokeWidth={1.5} />
    }

    return <span>{icon}</span>
  }, [tab.icon, tab.openIcon, hasChildren, tab.type, isOpen])

  // if (!icon) {
  //   if (tab.children) {
  //     if (isOpen) {
  //       icon = <FolderOpenIcon />
  //     } else {
  //       icon = <FolderClosedIcon />
  //     }
  //   } else {
  //     icon = <FileIcon />
  //   }
  // }

  let childNodes: ReactNode = null

  // make a list of the children if open
  if (isOpen && hasChildren) {
    childNodes = tab.children!.map((t, ti) => (
      <CollapseTreeNode key={ti} tab={t} level={level + 1} root={path} />
    ))
  }

  return (
    <li
      className={cn(LIST_CLS, className)}
      id={path}
      data-selected-id={value}
      ref={containerRef}
    >
      <VCenterRow
        className={OUTER_CONTAINER_CLS}
        data-selected={isSelected}
        data-root={level === 0}
        data-focus={focus}
        onClick={() => {
          setFocus(true)
        }}
        onFocus={() => {
          setValue?.(path)
        }}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // Invert openings
            if (tab.children) {
              setIsOpen(!isOpen)
            }

            tab.onClick?.()

            onValueChange?.(tab)
          }
        }}
        tabIndex={0}
      >
        <VCenterRow
          className={INNER_CONTAINER_CLS}
          style={{
            paddingLeft: `${0.5 + level * 0.5}rem`,
          }}
          data-root={level === 0}
          data-mode={mode}
          data-focus={focus}
          data-selected={isSelected}
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => setHover(false)}
        >
          {/* Spacing for the expand icon if there are children */}
          <CenterCol className="w-4 h-full shrink-0 grow-0">
            {hasChildren && (
              <button
                className="grow flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpen(!isOpen)
                }}
                data-root={level === 0}
                data-selected={isSelected}
                data-focus={focus}
                aria-label={tab.id}
              >
                <ChevronRightIcon
                  ref={arrowIconRef}
                  data-open={
                    isOpen &&
                    (tab.type === 'folder' ||
                      (tab.children && tab.children.length > 0))
                  }
                  className="origin-center w-4"
                  aria-label="Open Folder"
                />
              </button>
            )}
          </CenterCol>

          {tab.checked !== undefined && (
            <Checkbox
              checked={tab.checked}
              onCheckedChange={(state) => {
                onCheckedChange?.(tab, state)
                //tab.onClick?.()
                onValueChange?.(tab)
              }}
            />
          )}

          <button
            className={NODE_BUTTON_CLS}
            onClick={() => {
              tab.onClick?.()
              onValueChange?.(tab)
            }}
          >
            {openIcon && openIcon}
            <span className="grow truncate">{getTabName(tab)}</span>
          </button>
        </VCenterRow>
        {tab.onDelete && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className={MENU_BUTTON_CLS}
              onMouseEnter={() => setMenuHover(true)}
              onMouseLeave={() => setMenuHover(false)}
              name={`Delete ${tab.name}`}
              aria-label={`Delete ${tab.name}`}
              data-focus={focus}
              //data-hover={hover}
              data-mode={mode}
            >
              <Ellipsis
                size={14}
                className="invisible group-focus:visible data-[focus=true]:visible group-hover:visible data-[menu=open]:visible"
                data-focus={focus}
                data-menu={dataMenu}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem
                onClick={() => {
                  openDialog({
                    type: 'warning',
                    payload: {
                      title: `Delete ${tab.name}`,
                      content: `Are you sure you want to delete the ${tab.name} ${
                        hasChildren ? 'folder and all its contents' : tab.type
                      }?`,
                      callback: (response) => {
                        if (response === TEXT_OK) {
                          tab.onDelete?.()
                        }
                      },
                    },
                  })
                }}
              >
                <TrashIcon />

                <span>
                  {TEXT_DELETE} {hasChildren ? 'folder' : tab.type}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </VCenterRow>

      {/* children are sublist */}
      {childNodes && (
        <ul ref={contentRef} className={LIST_CLS}>
          {childNodes}
        </ul>
      )}
    </li>
  )
}

export const ROOT_NODE: ITab = Object.freeze({
  id: 'root',
  name: 'Folders',
  icon: <Folder />,
  isOpen: true,
  closable: true,
})

export function makeFoldersRootNode(name: string = 'Folders'): ITab {
  return { ...ROOT_NODE, name }
}
