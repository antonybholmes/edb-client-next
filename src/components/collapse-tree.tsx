import { BaseCol } from '@/components/layout/base-col'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import type { IClassProps } from '@interfaces/class-props'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { FileIcon } from './icons/file-icon'
import { FolderClosedIcon } from './icons/folder-closed-icon'
import { FolderOpenIcon } from './icons/folder-open-icon'
import { TrashIcon } from './icons/trash-icon'
import { CheckboxSmall } from './shadcn/ui/themed/check-box-small'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './shadcn/ui/themed/dropdown-menu'

import { TEXT_DELETE } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { VCenterRow } from './layout/v-center-row'
import { getTabName, type ITab } from './tab-provider'

const SettingsContext = createContext<{
  value: ITab | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange: (tab: ITab, state: boolean) => void
}>({
  value: undefined,
  onValueChange: () => {},
  onCheckedChange: () => {},
})

interface ISettingsProviderProps extends IChildrenProps {
  value: ITab | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
}

export const SettingsProvider = ({
  value = undefined,
  onValueChange,
  onCheckedChange,
  children,
}: ISettingsProviderProps) => {
  const [_value, setValue] = useState<ITab | undefined>(undefined)

  useEffect(() => {
    // sync internal value to external if it changes
    setValue(value)
  }, [value])

  //console.log("context", value, _value)

  function _onValueChange(tab: ITab) {
    setValue(tab)
    onValueChange?.(tab)
  }

  function _onCheckedChange(tab: ITab, state: boolean) {
    onCheckedChange?.(tab, state)
  }

  return (
    <SettingsContext.Provider
      value={{
        value: _value,
        onValueChange: _onValueChange,
        onCheckedChange: _onCheckedChange,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

const CONTAINER_CLS = `relative h-9 rounded-theme 
  overflow-hidden cursor-pointer outline-none
  data-[root=true]:text-sm data-[root=true]:font-semibold 
  data-[root=false]:data-[selected=true]:font-semibold`

const CONTAINER2_CLS = `grow gap-x-1 h-full data-[selected=false]:data-[hover=true]:data-[secondary-hover=false]:bg-muted
  data-[selected=true]:data-[secondary-hover=false]:bg-theme/30
  data-[selected=false]:data-[menu=open]:bg-muted
  data-[selected=true]:data-[menu=open]:bg-theme/30
  data-[selected=false]:focus-visible:bg-muted`

const EXPAND_CLS = cn(
  'flex flex-row items-center justify-center outline-none',
  'ring-0 aspect-square relative shrink-0 grow-0',
  'data-[hover=true]:stroke-foreground stroke-foreground/50 trans-color'
)

const ICON_CLS =
  'flex flex-row items-center justify-start outline-none ring-0 aspect-square w-6 h-6 shrink-0 grow-0'

const MENU_BUTTON_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'w-9 h-9 aspect-square shrink-0 grow-0 flex flex-row items-center justify-center outline-none group',
  'data-[selected=false]:data-[hover=true]:bg-accent/50',
  'data-[selected=true]:bg-theme/30'
)

interface ICollapseTreeProps extends IElementProps {
  tab: ITab | undefined
  value?: ITab | undefined
  onValueChange?: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
  asChild?: boolean
  showRoot?: boolean
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
    <SettingsProvider
      value={value}
      onValueChange={(t) => {
        onValueChange?.(t)
      }}
      onCheckedChange={(tab: ITab, state: boolean) => {
        onCheckedChange?.(tab, state)
      }}
    >
      <CollapseTreeNode
        tab={tab}
        className={cn('w-full', [!asChild, 'absolute'], className)}
        level={0}
        showRoot={showRoot}
      />
    </SettingsProvider>
  )
}

interface ICollapseTreeNodeProps extends IClassProps {
  tab: ITab
  level: number
  showRoot?: boolean
}

function CollapseTreeNode({
  tab,
  level,
  showRoot = true,
  className,
}: ICollapseTreeNodeProps) {
  const {
    value,
    onValueChange: onValueChanged,
    onCheckedChange,
  } = useContext(SettingsContext)

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
  const closable = tab.closable ?? true

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

  let icon: ReactNode = tab.icon

  if (!icon) {
    if (tab.children) {
      if (isOpen) {
        icon = <FolderOpenIcon />
      } else {
        icon = <FolderClosedIcon />
      }
    } else {
      icon = <FileIcon />
    }
  }

  let ret: ReactNode = null

  // if there are children, show those
  if (tab.children) {
    ret = (
      <BaseCol
        data-open={isOpen}
        className="data-[open=false]:h-0 data-[open=true]:h-auto"
      >
        {tab.children.map((t, ti) => (
          <CollapseTreeNode tab={t} level={level + 1} key={ti} />
        ))}
      </BaseCol>
    )
  }

  if (showRoot) {
    ret = (
      <BaseCol className={cn('w-full text-xs', className)}>
        {tab.id !== '' && (
          <VCenterRow
            className={CONTAINER_CLS}
            data-root={level === 0}
            data-selected={selected}
            data-focus={focus}
            //data-secondary-focus={secondaryFocus}
            data-hover={hover}
            data-menu={dataMenu}
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

                onValueChanged(tab)
              }
            }}
            tabIndex={0}
          >
            <VCenterRow
              className={CONTAINER2_CLS}
              style={{
                paddingLeft: `${(level + 1) * 0.5}rem`,
                //paddingRight: `${tab.onDelete ? 2 : 0}rem`,
              }}
              data-root={level === 0}
              data-selected={selected}
              data-focus={focus}
              //data-secondary-focus={secondaryFocus}
              data-hover={hover}
              data-menu={dataMenu}
              data-secondary-hover={menuHover}
              onClick={() => {
                tab.onClick?.()
                onValueChanged(tab)
              }}
            >
              <button
                data-open={isOpen}
                className={cn(EXPAND_CLS)}
                onClick={() => {
                  if (closable && tab.children && tab.children.length > 0) {
                    setIsOpen(!isOpen)
                  }
                }}
                data-root={level === 0}
                data-selected={selected}
                data-focus={focus}
                data-hover={hover}
                aria-label={tab.id}
              >
                {tab.children && tab.children.length > 0 && (
                  <ChevronRightIcon
                    data-open={isOpen}
                    className="trans-transform data-[open=true]:rotate-90 origin-center"
                    aria-label="Open arrow"
                  />
                )}
              </button>

              {tab.checked !== undefined && (
                <CheckboxSmall
                  checked={tab.checked}
                  onCheckedChange={(state) => {
                    onCheckedChange?.(tab, state)
                    //tab.onClick?.()
                    onValueChanged(tab)
                  }}
                />
              )}

              {icon && <span className={ICON_CLS}>{icon}</span>}

              <span className="grow truncate">{getTabName(tab)}</span>
            </VCenterRow>
            {tab.onDelete && (
              // <button
              //   className={cn(
              //     "w-8 h-8 shrink-0 rounded-theme flex flex-row items-center justify-center fill-foreground",
              //     [hover, "opacity-100", "opacity-0"],
              //     [secondaryButtonHover, "bg-muted"],
              //   )}
              //   onMouseEnter={() => setSecondaryButtonHover(true)}
              //   onMouseLeave={() => setSecondaryButtonHover(false)}
              //   title={`Delete ${tab.name}`}
              //   onClick={() => tab.onDelete!()}
              // >
              //   <TrashIcon w="w-3.5" />
              // </button>

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
                  data-focus={focus}
                  data-hover={hover}
                  data-secondary-hover={menuHover}
                  data-menu={dataMenu}
                  data-selected={selected}
                >
                  <span
                    className="text-sm invisible group-focus:visible data-[focus=true]:visible data-[hover=true]:visible data-[menu=open]:visible"
                    data-focus={focus}
                    data-hover={hover}
                    //data-button-focus={buttonFocus}
                    data-menu={dataMenu}
                  >
                    ...
                  </span>
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
                    onClick={() => tab.onDelete!()}
                    aria-label="Set theme to light"
                  >
                    <TrashIcon fill="" w="w-4" />

                    <span>{TEXT_DELETE}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </VCenterRow>
        )}

        {ret && ret}
      </BaseCol>
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
