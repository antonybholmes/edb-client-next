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

import { TEXT_DELETE } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { gsap } from 'gsap'
import { Ellipsis, File, Folder, FolderOpen } from 'lucide-react'
import { CenterCol } from './layout/center-col'
import { VCenterRow } from './layout/v-center-row'
import { Checkbox } from './shadcn/ui/themed/v2/check-box'
import { getTabName, type ITab, type OpenState } from './tabs/tab-provider'

const DURATION_S = 0.2

const CollapseTreeContext = createContext<{
  isOpen: OpenState
  value?: ITab | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange: (tab: ITab, state: boolean) => void
}>({
  isOpen: false,
  onValueChange: () => {},
  onCheckedChange: () => {},
})

interface ICollapseTreeProviderProps extends IChildrenProps {
  value?: ITab | undefined
  isOpen?: OpenState
  onValueChange: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
}

export const CollapseTreeProvider = ({
  value,
  isOpen = 'auto',
  onValueChange,
  onCheckedChange,
  children,
}: ICollapseTreeProviderProps) => {
  const [_value, setValue] = useState<ITab | undefined>(value)

  useEffect(() => {
    // sync internal value to external if it changes
    setValue(value)
  }, [value])

  function _onValueChange(tab: ITab) {
    setValue(tab)
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
  value?: ITab | undefined
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
  className,
}: { tab: ITab; level: number } & IClassProps) {
  // showRoot is true for children since children always have a root
  // showRoot is only really used for the true root to determine if the
  // root should be shown or not or just the children in a list

  const {
    isOpen: globalIsOpen,
    value: selectedTab,
    onValueChange,
    onCheckedChange,
  } = useContext(CollapseTreeContext)

  const hasChildren = Array.isArray(tab.children) && tab.children.length > 0

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const open = tab.isOpen ?? globalIsOpen ?? 'auto'

    if (open === 'auto') {
      setIsOpen(hasChildren)
    } else {
      setIsOpen(open)
    }
  }, [tab.isOpen, globalIsOpen, hasChildren])

  //const isGroup = tab.isGroup ?? (tab.children !== undefined && hasChildren)

  const [hover, setHover] = useState<boolean>(false)
  const [focus, setFocus] = useState<boolean>(false)
  //const [buttonHover, setButtonHover] = useState(false) //level === 0 || (tab.isOpen??true))
  //const [buttonFocus, setButtonFocus] = useState(false)
  const [menuHover, setMenuHover] = useState<boolean>(false)
  //const [secondaryFocus, setSecondaryFocus] = useState(false) //level === 0 || (tab.isOpen??true))
  const arrowIconRef = useRef<SVGSVGElement>(null)
  const contentRef = useRef<HTMLUListElement>(null)
  //const openIconRef = useRef<SVGSVGElement>(null)
  //const closeIconRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLLIElement>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  const tabId = tab.id //getTabId(tab)
  const valueId = selectedTab?.id //getTabId(selectedTab)

  const isSelected = tabId === valueId
  const dataMenu = menuOpen ? 'open' : 'closed'

  // determine which parts are highlighted
  const mode =
    (isSelected && !menuHover) || menuOpen || hover
      ? 'selected'
      : menuHover
        ? 'menu-selected'
        : 'default'

  //console.log({ isSelected, menuHover, hover, menuOpen, mode })

  //const closable = tab.closable ?? true

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

    // if (openIconRef.current) {
    //   tl.to(
    //     openIconRef.current,
    //     {
    //       scale: isOpen ? 1 : 0.9,
    //       opacity: isOpen ? 1 : 0,
    //       duration: DURATION_S,
    //       ease: 'power3.out',
    //     },
    //     0
    //   )
    // }

    // if (closeIconRef.current) {
    //   tl.to(
    //     closeIconRef.current,
    //     {
    //       scale: isOpen ? 0.9 : 1,
    //       opacity: isOpen ? 0 : 1,
    //       duration: 0.3,
    //       ease: 'power3.out',
    //     },
    //     0
    //   )
    // }
  }, [isOpen])

  const openIcon: ReactNode = useMemo(() => {
    let icon: ReactNode = null
    if (isOpen && tab.openIcon) {
      icon = tab.openIcon
    } else if (tab.icon) {
      icon = tab.icon
    } else if (hasChildren || tab.type === 'folder') {
      if (isOpen) {
        icon = <FolderOpen strokeWidth={1.5} size={20} />
      } else {
        icon = <Folder strokeWidth={1.5} size={20} />
      }
    } else {
      return <File size={20} strokeWidth={1.5} />
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
      <CollapseTreeNode key={ti} tab={t} level={level + 1} />
    ))
  }

  return (
    <li className={cn(LIST_CLS, className)} id={tab.id} ref={containerRef}>
      <VCenterRow
        className={OUTER_CONTAINER_CLS}
        data-root={level === 0}
        data-focus={focus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // Invert openings
            if (tab.children) {
              setIsOpen(!isOpen)
            }

            tab.onClick?.()

            onValueChange(tab)
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
                onValueChange(tab)
              }}
            />
          )}

          <button
            className={NODE_BUTTON_CLS}
            onClick={() => {
              tab.onClick?.()
              onValueChange(tab)
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
                onClick={() => tab.onDelete?.()}
                aria-label="Set theme to light"
              >
                <TrashIcon w="w-4" />

                <span>{TEXT_DELETE}</span>
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
