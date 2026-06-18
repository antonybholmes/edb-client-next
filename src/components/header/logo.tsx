import { cn } from '@/lib/shadcn-utils'
import { CENTERED_ROW_CLS, FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS } from '@/theme'
import { BaseImage } from '../base-image'
import { BaseLink } from '../link/base-link'

import { config } from '@/config'

const LOGO_CLS = cn(FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS, CENTERED_ROW_CLS)

export function Logo() {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <BaseLink href="/" className={LOGO_CLS} aria-label="Home">
      <div className="flex h-6 w-6 flex-row items-center justify-center rounded-full bg-theme fill-white">
        <BaseImage
          src="/favicon.svg"
          width={512}
          height={512}
          alt={config.name}
          className="w-6"
        />
      </div>
    </BaseLink>
  )
}
