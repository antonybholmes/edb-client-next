import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import type { IClassProps } from '@interfaces/class-props'
import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@themed/dropdown-menu'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { TrashIcon } from './icons/trash-icon'

import { TEXT_DELETE } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { EllipsisIcon } from './icons/ellipsis-icon'
import { VCenterRow } from './layout/v-center-row'
import { Checkbox } from './shadcn/ui/themed/check-box'
import { getTabName, type ITab } from './tabs/tab-provider'

const CollapseTreeContext = createContext<{
  tab: ITab
  value?: ITab | undefined
  level: number
  showRoot: boolean
  onValueChange: (tab: ITab) => void
  onCheckedChange: (tab: ITab, state: boolean) => void
}>({
  tab: { id: '', name: '' },
  level: -1,
  showRoot: false,
  onValueChange: () => {},
  onCheckedChange: () => {},
})

interface ICollapseTreeProviderProps extends IChildrenProps {
  tab: ITab
  level: number
  value?: ITab | undefined
  showRoot?: boolean
  onValueChange: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
}

export const CollapseTreeProvider = ({
  tab,
  value,
  level,
  showRoot = true,
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
        tab,
        value: _value,
        level,
        showRoot,
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
  'relative h-8.5 rounded-theme overflow-hidden cursor-pointer text-xs',
  'data-[root=true]:font-medium',
  'data-[root=false]:data-[checked=true]:font-medium'
)

const INNER_CONTAINER_CLS = `grow gap-x-1 h-full rounded-l-theme
  data-[checked=true]:data-[secondary-hover=false]:bg-muted
  data-[checked=true]:data-[menu=open]:bg-muted
  data-[checked=false]:focus-visible:bg-muted
  data-[checked=false]:data-[menu=open]:bg-muted/50
  data-[checked=false]:data-[hover=true]:data-[secondary-hover=false]:bg-muted/50`

const EXPAND_CLS = `flex flex-row items-center justify-center outline-hidden
  ring-0 aspect-square relative shrink-0 grow-0 
  data-[hover=true]:stroke-foreground stroke-foreground/50 trans-color
  invisible data-[has-children=true]:visible`

// const ICON_CLS =
//   'flex flex-row items-center justify-start outline-hidden ring-0 aspect-square w-5 h-5 shrink-0 grow-0'

const MENU_BUTTON_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'w-8.5 h-8.5 aspect-square shrink-0 grow-0 flex flex-row',
  'items-center justify-center outline-hidden group rounded-r-theme',
  'data-[checked=false]:data-[hover=true]:bg-muted/50',
  'data-[checked=false]:data-[menu=open]:bg-muted/50',
  'data-[checked=true]:bg-muted'
)

const LIST_CLS = 'flex flex-col'

interface ICollapseTreeProps extends IDivProps {
  tab: ITab
  value?: ITab | undefined
  onValueChange?: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
  asChild?: boolean
  showRoot?: boolean | undefined
}

export function CollapseTree({
  tab,
  value,
  onValueChange,
  onCheckedChange,
  asChild = false,
  showRoot = true,
  className,
}: ICollapseTreeProps) {
  if (!tab) {
    return null
  }

  return (
    <CollapseTreeProvider
      tab={tab}
      value={value}
      level={0}
      showRoot={showRoot}
      onValueChange={(t) => {
        onValueChange?.(t)
      }}
      onCheckedChange={(tab: ITab, state: boolean) => {
        onCheckedChange?.(tab, state)
      }}
    >
      <ul className={LIST_CLS}>
        <CollapseTreeNode
          className={cn('w-full', { absolute: !asChild }, className)}
        />
      </ul>
    </CollapseTreeProvider>
  )
}

function CollapseTreeNode({ className }: IClassProps) {
  // showRoot is true for children since children always have a root
  // showRoot is only really used for the true root to determine if the
  // root should be shown or not or just the children in a list

  const { tab, value, level, showRoot, onValueChange, onCheckedChange } =
    useContext(CollapseTreeContext)

  const [isOpen, setIsOpen] = useState<boolean>(
    (tab.children !== undefined && tab.children.length > 0) ||
      (tab.isOpen !== undefined && tab.isOpen)
  )
  const [hover, setHover] = useState<boolean>(false)
  const [focus, setFocus] = useState<boolean>(false)
  //const [buttonHover, setButtonHover] = useState(false) //level === 0 || (tab.isOpen??true))
  //const [buttonFocus, setButtonFocus] = useState(false)
  const [menuHover, setMenuHover] = useState<boolean>(false)
  //const [secondaryFocus, setSecondaryFocus] = useState(false) //level === 0 || (tab.isOpen??true))
  //const contentRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  const tabId = tab.id //getTabId(tab)
  const valueId = value?.id //getTabId(value)

  const selected = tabId === valueId
  const dataMenu = menuOpen ? 'open' : 'closed'
  //const closable = tab.closable ?? true

  // useEffect(() => {
  //   if (!contentRef || !contentRef.current) {
  //     return
  //   }

  //   const content = contentRef.current

  //   gsap.timeline().to(content, {
  //     height: isOpen ? 'auto' : 0,
  //     duration: 0,
  //     ease: 'power2.out',
  //   })
  // }, [isOpen])

  //console.log(tab.name, tab.id, value?.id)

  const icon: ReactNode = tab.icon

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

  let ret: ReactNode = null

  // assume we don't show the root, in which case we just return the children
  // as a list
  if (tab.children !== undefined && tab.children.length > 0) {
    ret = tab.children.map((t, ti) => (
      <CollapseTreeProvider
        tab={t}
        value={value}
        level={level + 1}
        onValueChange={onValueChange}
        onCheckedChange={onCheckedChange}
        key={ti}
      >
        <CollapseTreeNode key={ti} />
      </CollapseTreeProvider>
    ))
  }

  if (showRoot) {
    ret = (
      <li className={cn(LIST_CLS, className)} id={tab.id}>
        {tab.id !== '' && (
          <VCenterRow
            className={OUTER_CONTAINER_CLS}
            data-root={level === 0}
            data-checked={selected}
            data-focus={focus}
            data-hover={hover}
            data-menu={dataMenu}
            //data-group={tab.isGroup}
            data-secondary-hover={menuHover}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onMouseEnter={() => {
              setHover(true)
            }}
            onMouseLeave={() => setHover(false)}
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
                paddingLeft: `${level * 0.5}rem`,
                //paddingRight: `${tab.onDelete ? 2 : 0}rem`,
              }}
              data-root={level === 0}
              data-checked={selected}
              data-focus={focus}
              //data-secondary-focus={secondaryFocus}
              data-hover={hover}
              data-menu={dataMenu}
              data-secondary-hover={menuHover}
              onClick={() => {
                tab.onClick?.()
                onValueChange(tab)
              }}
            >
              <button
                //data-open={isOpen}
                data-has-children={
                  tab.showChildren === 'always' ||
                  (tab.children !== undefined && tab.children.length > 0)
                }
                className={EXPAND_CLS}
                onClick={() => {
                  setIsOpen(!isOpen)
                }}
                data-root={level === 0}
                data-checked={selected}
                data-focus={focus}
                data-hover={hover}
                aria-label={tab.id}
              >
                <ChevronRightIcon
                  data-open={
                    isOpen &&
                    tab.children !== undefined &&
                    tab.children.length > 0
                  }
                  className="trans-transform data-[open=true]:rotate-90 origin-center"
                  aria-label="Open Folder"
                />
              </button>

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

              {icon && icon}

              <span className="grow truncate">{getTabName(tab)}</span>
            </VCenterRow>
            {tab.onDelete && (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  className={MENU_BUTTON_CLS}
                  onMouseEnter={() => setMenuHover(true)}
                  onMouseLeave={() => setMenuHover(false)}
                  // onFocus={() => {
                  //   setSecondaryFocus(true)
                  // }}
                  // onBlur={() => {
                  //   setSecondaryFocus(false)
                  // }}
                  name={`Delete ${tab.name}`}
                  aria-label={`Delete ${tab.name}`}
                  data-focus={focus}
                  data-hover={hover}
                  data-secondary-hover={menuHover}
                  data-menu={dataMenu}
                  data-checked={selected}
                >
                  <EllipsisIcon
                    w="w-4 h-4"
                    className="invisible group-focus:visible data-[focus=true]:visible data-[hover=true]:visible data-[menu=open]:visible"
                    data-focus={focus}
                    data-hover={hover}
                    //data-button-focus={buttonFocus}
                    data-menu={dataMenu}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  // onEscapeKeyDown={() => {
                  //   setMenuOpen(false)
                  // }}
                  // onInteractOutside={() => {
                  //   setMenuOpen(false)
                  // }}
                  // onPointerDownOutside={() => {
                  //   setMenuOpen(false)
                  // }}
                  align="start"
                  //className="fill-foreground"
                >
                  <DropdownMenuItem
                    onClick={() => tab.onDelete?.()}
                    aria-label="Set theme to light"
                  >
                    <TrashIcon stroke="" w="w-4" />

                    <span>{TEXT_DELETE}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </VCenterRow>
        )}

        {ret && <ul className={LIST_CLS}>{ret}</ul>}
      </li>
    )
  }

  return ret
}

export function makeFoldersRootNode(name: string = 'Folders'): ITab {
  return {
    id: 'root',
    name,
    //icon: <FolderIcon />,
    isOpen: true,
    closable: true,
  }
}
