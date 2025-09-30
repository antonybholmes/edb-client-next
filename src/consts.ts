import type { IFieldMap } from '@interfaces/field-map'
import config from '../config.json'
import versionConfig from '../version.json'

//export const SITE = "https://edb.rdf-lab.org"
export const SITE_NAME = 'Experiments'
export const APP_NAME = SITE_NAME
// id for internally indentifying app and for use in prefixes etc
export const APP_ID = 'edb'
export const SITE_DOMAIN = 'edb.rdf-lab.org'

export const HEADER_SEP = '-'

export const SITE_DESCRIPTION = 'Data science tools for scientists'
export const EMAIL = 'hello@antonyholmes.dev'
export const RECORDS_PER_PAGE = 12
export const SEARCH_RECORDS_PER_PAGE = config.SEARCH_RECORDS_PER_PAGE
export const AUTHOR_LATEST_POSTS = config.AUTHOR_LATEST_POSTS
export const VERSION = versionConfig.version
export const UPDATED = versionConfig.updated
export const GITHUB_URL = config.GITHUB_URL
export const ANIMATION_DURATION_S = 0.3
export const ANIMATION_DURATION_MS = 250

export const DEFAULT_SECTION = config.DEFAULT_SECTION

export const GENES_BASE_URL = config.GENES_BASE_URL

export const TAG_SLUG = config.TAG_SLUG
export const PAGE_1_SLUG = config.PAGE_1_SLUG

export const YEAR = new Date().getFullYear()

export const SECTIONS = config.SECTIONS
export const TEXT_SHOW_MORE = 'Show More'
export const TEXT_FILE = 'File'
export const TEXT_OPEN_FILE = 'Open Files from Device'
export const TEXT_RUN = 'Run'

export const STATUS_CODE_OK = 200

export const STATUS_SUCCESS = 'success'
export const STATUS_FAIL = 'fail'

export const COLOR_THEME = 'theme'

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
export const TEXT_DISPLAY = 'Display'
export const TEXT_DOWNLOAD_AS_TXT = 'Download as TXT'
export const TEXT_DOWNLOAD_AS_CSV = 'Download as CSV'
export const TEXT_SHOW = 'Show'
export const TEXT_TITLE = 'Title'
export const TEXT_BORDER = 'Border'
export const TEXT_SIGN_IN = 'Sign In'
export const TEXT_NEXT = 'Next'
export const TEXT_SIGN_OUT = 'Sign Out'
export const TEXT_SIGNED_OUT = 'Signed Out'
export const TEXT_SELECT_ALL = 'Select All'
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

export const SVG_CRISP_EDGES = 'crispEdges'

export interface IDialogParams {
  id: string
  params?: IFieldMap
}

export const NO_DIALOG: IDialogParams = { id: '' }

export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy'

export const SITE_URL = 'https://edb.rdf-lab.org'

export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:4321/docs'
