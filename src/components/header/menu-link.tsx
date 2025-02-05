import { type ILink } from '@interfaces/link'
import { type IMouseProps } from '@interfaces/mouse-props'
import { cn } from '@lib/class-names'
import { useState } from 'react'
import { BaseLink } from '../link/base-link'

// const getIcon = (name: string) {
//   switch (name) {
//     case 'Blog':
//       return <BlogIcon className="w-4 fill-blue-400" />
//     case 'Portfolios':
//       return <StocksIcon className="w-4 fill-violet-400" />
//     case 'Credit Cards':
//       return <CreditCardIcon className="w-4 fill-emerald-400" />
//     default:
//       return <CalculatorIcon className="w-4 fill-pink-400" />
//   }
// }

interface IProps extends IMouseProps {
  link: ILink
  headerMode?: string
  selected: boolean
}

export function MenuLink({ link, selected, onClick }: IProps) {
  const [hover, setHover] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  function onMouseEnter() {
    setHover(true)
  }

  function onMouseLeave() {
    setHover(false)
  }

  function onFocus() {
    setHasFocus(true)
  }

  function onBlur() {
    setHasFocus(false)
  }

  return (
    <BaseLink
      href={link.url}
      aria-label={`Visit ${link.name}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
      className={cn(
        'flex flex-row items-center gap-x-2 overflow-hidden rounded-lg px-10 py-3 text-sm font-semibold',
        [selected, 'text-theme', 'text-foreground'],
        [hover || hasFocus, 'bg-muted']
      )}
    >
      {/* <HCenterRow
          className={cn(
            `h-8 min-w-8 items-center overflow-hidden rounded-theme border border-gray-200 bg-white transition-all duration-300`
          )}
        >
          {getIcon(link.name)}
        </HCenterRow> */}

      {link.name}
    </BaseLink>
  )
}
