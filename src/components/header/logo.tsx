import { SITE_NAME } from '@/consts'
import { CENTERED_ROW_CLS, FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import Link from 'next/link'

const LOGO_CLS = cn(FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS, CENTERED_ROW_CLS)

export function Logo() {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Link href="/" className={LOGO_CLS} aria-label="Home">
      <div className="flex h-6 w-6 flex-row items-center justify-center rounded-full bg-theme fill-white">
        <img
          src="/favicon.svg"
          width={512}
          height={512}
          alt={SITE_NAME}
          className="w-6"
        />
      </div>
    </Link>
  )
}
