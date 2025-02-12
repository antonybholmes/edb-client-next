import { cn } from '@lib/class-names'

export const ROUNDED_LG_CLS = 'rounded-lg'
export const ROUNDED_MD_CLS = 'rounded-theme'
export const ROUNDED_CLS = 'rounded'
export const ROUNDED_FULL_CLS = 'rounded-full'

export const BASE_FOCUS_RING_CLS = 'outline-none'

export const FOCUS_RING_CLS =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-0'
export const FOCUS_INSET_RING_CLS = cn(FOCUS_RING_CLS, 'ring-inset')

// focus-within:ring-2

export const INPUT_BORDER_CLS = 'border border-border'
//export const INPUT_DARK_BORDER_CLS = "dark:border-gray-700/80"

export const INPUT_BG_CLS = 'input'

export const TRANS_TIME_CLS = 'trans-300'
// export const TRANSFORM_CLS = cn(TRANS_TIME_CLS, "transition-transform")
export const TRANS_COLOR_CLS = cn(TRANS_TIME_CLS, 'transition-color')
export const TRANS_OPACITY_CLS = cn(TRANS_TIME_CLS, 'transition-opacity')

export const DRAG_OUTLINE_CLS =
  'trans-color rounded-theme border-2 border-dashed border-transparent data-[drag=true]:bg-theme/5 data-[drag=true]:border-theme/20'

export const BUTTON_H_CLS = 'h-8'
export const BUTTON_W_CLS = 'w-8'
export const SM_BUTTON_H_CLS = 'h-6'
export const MD_BUTTON_W_CLS = 'w-7'
export const MD_BUTTON_H_CLS = 'h-7'
export const LG_BUTTON_W_CLS = 'w-9'
export const LG_BUTTON_H_CLS = 'h-9'
export const XL_BUTTON_H_CLS = 'h-10'
export const XXL_BUTTON_H_CLS = 'h-11'
export const BASE_ICON_BUTTON_CLS = 'shrink-0 grow-0 aspect-square'

export const ICON_BUTTON_CLS = cn(
  BASE_ICON_BUTTON_CLS,
  BUTTON_W_CLS,
  BUTTON_H_CLS
)

export const DROPDOWN_BUTTON_CLS = cn(BASE_ICON_BUTTON_CLS, 'w-5', BUTTON_H_CLS)

export const TOOLBAR_DROPDOWN_BUTTON_CLS = cn(
  BASE_ICON_BUTTON_CLS,
  'w-5',
  LG_BUTTON_H_CLS
)

export const LARGE_ICON_BUTTON_CLS = cn(BASE_ICON_BUTTON_CLS, LG_BUTTON_W_CLS)

export const V_CENTERED_ROW_CLS = 'flex flex-row items-center'

export const CENTERED_ROW_CLS = 'flex flex-row items-center justify-center'

export const COL_BUTTON_CLS = 'flex flex-col'

export const XS_ICON_BUTTON_CLS = cn(
  CENTERED_ROW_CLS,
  'shrink-0 aspect-square w-5 h-5'
)

export const SM_ICON_BUTTON_CLS = cn(
  CENTERED_ROW_CLS,
  'shrink-0 grow-0 aspect-square w-6 h-6'
)

export const SMALL_BUTTON_CLS = cn(SM_BUTTON_H_CLS, 'px-2')

export const PRIMARY_BUTTON_W_CLS = 'min-w-24'
export const DEFAULT_BUTTON_SIZE_CLS = cn(BUTTON_H_CLS, 'px-3')
export const LARGE_BUTTON_SIZE_CLS = cn(LG_BUTTON_H_CLS, 'min-w-20 px-4')

export const HEADER_ICON_SIZE_CLS = cn(
  'shrink-0',
  LG_BUTTON_W_CLS,
  LG_BUTTON_H_CLS
)

export const GROUP_FOCUS_RING_CLS =
  'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-inset'
//export const FOCUS_BORDER_CLS = "focus-visible:border-ring"

export const BUTTON_PADDING = 'gap-x-2 px-3'
export const PILL_BUTTON_CLS = `rounded-full overflow-hidden`

export const BASE_COMPONENT_CLS =
  'group disabled:pointer-events-none disabled:opacity-50'

export const BASE_BUTTON_CLS = cn(
  //FOCUS_RING_CLS,
  FOCUS_INSET_RING_CLS,
  BASE_COMPONENT_CLS,
  V_CENTERED_ROW_CLS,
  'text-nowrap'
)

//export const ICON_BUTTON_CLS = cn("justify-center", ICON_BUTTON_SIZE_CLS)

export const TOOLBAR_BUTTON_ICON_CLS = 'text-foreground'

//export const BUTTON_LINK_CLS = "flex flex-row items-center"

export const BASE_PRIMARY_BUTTON_CLS = 'text-primary-foreground'

export const CORE_PRIMARY_BUTTON_CLS = cn(
  TRANS_COLOR_CLS,
  FOCUS_RING_CLS,
  'text-primary-foreground bg-primary hover:bg-primary-alt data-[selected=true]:bg-primary'
)

// export const PRIMARY_TEXT_CLS = 'text-primary'
// export const PRIMARY_LINK_CLS = cn(PRIMARY_TEXT_CLS, 'hover:text-primary')

export const BASE_PRIMARY_COLOR_BUTTON_CLS =
  'text-primary-foreground bg-theme hover:bg-theme-alt data-[selected=true]:bg-theme'

export const CORE_PRIMARY_COLOR_BUTTON_CLS = cn(
  TRANS_COLOR_CLS,
  BASE_PRIMARY_COLOR_BUTTON_CLS,
  FOCUS_RING_CLS
)

export const SECONDARY_BUTTON_CLS =
  'bg-accent/50 hover:bg-accent/75 trans-color'

export const BASE_TOOLBAR_BUTTON_CLS = cn(
  BUTTON_H_CLS,
  CENTERED_ROW_CLS,
  FOCUS_INSET_RING_CLS,
  'hover:bg-accent'
)

export const TOOLBAR_ICON_BUTTON_CLS = cn(
  BASE_TOOLBAR_BUTTON_CLS,
  BUTTON_W_CLS,
  ROUNDED_LG_CLS,
  'justify-center'
)

export const TOOLBAR_BUTTON_CLS = cn(
  BASE_TOOLBAR_BUTTON_CLS,
  BUTTON_PADDING,
  ROUNDED_LG_CLS,
  'justify-center'
)

export const MENU_BUTTON_CLS = cn(
  BASE_TOOLBAR_BUTTON_CLS,
  ROUNDED_LG_CLS,
  BUTTON_PADDING,
  'w-full text-left whitespace-nowrap'
)

export const TOOLBAR_H_CLS = 'h-16'

export const H2_CLS = 'font-semibold'
export const H3_CLS = 'font-semibold text-sm'

export const FILE_MENU_ITEM_HEADING_CLS = 'text-lg font-medium'
export const FILE_MENU_ITEM_DESC_CLS = 'text-foreground/50 font-normal'

export const TAB_ANIMATION_DURATION_S = 0.4
export const STAGGER_ANIMATION_DURATION_S = 0.1

export const DESTRUCTIVE_CLS =
  'bg-destructive text-destructive-foreground hover:bg-destructive-alt'
