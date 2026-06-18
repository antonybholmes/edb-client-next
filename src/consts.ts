import type { IFieldMap } from '@/interfaces/field-map'

// id for internally indentifying app and for use in prefixes etc

// easy way for components to detect if in dev mode or not.
export const IS_DEV_MODE = process.env.NODE_ENV === 'development'

export const HEADER_SEP = '-'

export const ANIMATION_DURATION_S = 0.3
export const ANIMATION_DURATION_MS = 250

export const TIME_5_MINUTES_MS = 5 * 60 * 1000
export const TIME_10_MINUTES_MS = 10 * 60 * 1000

export const YEAR = new Date().getFullYear()

export const STATUS_CODE_OK = 200
export const STATUS_SUCCESS = 'success'
export const STATUS_FAIL = 'fail'

export const COLOR_THEME = 'theme'

export const TEXT_SHOW_MORE = 'Show More'
export const TEXT_FILE = 'File'
export const TEXT_OPEN_FILE = 'Open Files from Device'
export const TEXT_RUN = 'Run'

export const TRUE = 'true'
export const FALSE = 'false'
export const TEXT_HOME = 'Home'
export const TEXT_OK = 'Ok'
export const TEXT_CANCEL = 'Cancel'
export const TEXT_CLOSE = 'Close'
export const TEXT_CLEAR = 'Clear'
export const TEXT_CONTINUE = 'Continue'
export const TEXT_CONFIRM = 'Confirm'
export const TEXT_OPTIONS = 'Options'
export const TEXT_SETTINGS = 'Settings'
export const TEXT_HISTORY = 'History'
export const TEXT_SAVE = 'Save'
export const TEXT_SAVE_AS = 'Save As'
export const TEXT_EXPORT = 'Export'
export const TEXT_RESET = 'Reset'
export const TEXT_UPDATE = 'Update'
export const TEXT_OPEN = 'Open'
export const TEXT_NEW = 'New'
export const TEXT_NAME = 'Name'
export const TEXT_DRAG_HERE = 'Drop File(s) Here to Open'
export const TEXT_DELETE = 'Delete'
export const TEXT_REMOVE = 'Remove'
export const TEXT_EDIT = 'Edit'
export const TEXT_COPY = 'Copy'
export const TEXT_MOVE = 'Move'
export const TEXT_DISPLAY = 'Display'
export const TEXT_DOWNLOAD = 'Download'
export const TEXT_DOWNLOAD_AS_TXT = 'Download as TXT'
export const TEXT_DOWNLOAD_AS_CSV = 'Download as CSV'
export const TEXT_DOWNLOAD_AS_SVG = 'Download as SVG'
export const TEXT_DOWNLOAD_AS_PNG = 'Download as PNG'
export const TEXT_SHOW = 'Show'
export const TEXT_TITLE = 'Title'
export const TEXT_BORDER = 'Border'
export const TEXT_COLOR = 'Color'
export const TEXT_SIZE = 'Size'
export const TEXT_WIDTH = 'Width'
export const TEXT_HEIGHT = 'Height'
export const TEXT_OPACITY = 'Opacity'
export const TEXT_NEXT = 'Next'
export const TEXT_PREVIOUS = 'Previous'
export const TEXT_BACK = 'Back'
export const TEXT_SIGN_UP = 'Sign Up'
export const TEXT_EMAIL = 'Email'

export const TEXT_SIGN_IN = 'Sign In'
export const TEXT_SIGNED_IN = 'Signed In'
export const TEXT_WELCOME = 'Welcome'
export const TEXT_WELCOME_BACK = 'Welcome Back'
export const TEXT_LOADING = 'Loading...'
export const TEXT_FORGOT_PASSWORD = 'Forgot Password?'
export const TEXT_PASSWORD = 'Password'
export const TEXT_USERNAME = 'Username'
export const TEXT_SIGN_OUT = 'Sign Out'
export const TEXT_SIGNED_OUT = 'Signed Out'
export const TEXT_SELECT_ALL = 'Select All'
export const TEXT_SELECT = 'Select'
export const TEXT_UNSELECT_ALL = 'Unselect All'
export const TEXT_SEARCH = 'Search'
export const TEXT_UNLABELLED = '<Unlabelled>'
export const TEXT_ADD = 'Add'
export const TEXT_HELP = 'Help'
export const TEXT_NA = 'NA'
export const TEXT_ZOOM = 'Zoom'
export const TEXT_SAVE_IMAGE = 'Save Image'
export const TEXT_SAVE_TABLE = 'Save Table'
export const TEXT_REMOVE_FROM_CART = 'Remove from Cart'
export const TEXT_SORT_BY = 'Sort By'

export const SVG_CRISP_EDGES = 'crispEdges'

export const BIG0 = BigInt(0)
export const BIG1 = BigInt(1)

export type SortOrder = 'asc' | 'desc'

export interface IDialogParams {
  id: string
  params?: IFieldMap
}

export const NO_DIALOG: IDialogParams = { id: '' }

export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy'

export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:4321/docs'
