import type { ITextProps } from '@/components/plot/svg-props'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { UndefStr } from '@/lib/text/text'
import { CaseSensitive } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { MenuSeparator } from '../../shadcn/ui/themed/v2/dropdown-menu'
import { FontUI } from './font-ui'

// const FONT_SIZE_NAMES = [
//   // { label: 'Extra Small', value: 'xsmall' },
//   { label: 'Small', value: 12 },
//   { label: 'Medium', value: 14 },
//   { label: 'Large', value: 16 },
// ]

export function BaseFontPopover({
  title,
  icon = <CaseSensitive size={18} />,
  className,
  children,
}: { title?: UndefStr; icon?: ReactNode } & IChildrenProps) {
  return (
    <Popover>
      {/* <PopoverTrigger
        render={<ToolbarIconButton title={title}>{icon}</ToolbarIconButton>}
      /> */}

      <PopoverTrigger
        className="opacity-70 data-popup-open:opacity-100 hover:opacity-100 focus-visible:opacity-100 trans-opacity"
        title={title}
        aria-label={title}
      >
        {icon}
      </PopoverTrigger>

      <PopoverContent
        //alignOffset={4}
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        className={className}
        //variant="content"
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface IFontPopoverProps {
  fonts: {
    title?: UndefStr
    textProps: ITextProps
    update: (textProps: ITextProps) => void
    showEnabled?: boolean
    showAlign?: boolean
    showRotation?: boolean
    ext?: ReactNode
  }[]

  icon?: ReactNode
}

export function FontPopover({ fonts = [], icon }: IFontPopoverProps) {
  if (!fonts || fonts.length === 0) {
    return null
  }

  const font = fonts[0]!

  // create a pleasing icon if one is not set
  if (!icon) {
    icon = <CaseSensitive size={18} stroke={font.textProps.font.fill.value} />
  }

  return (
    <BaseFontPopover
      title={fonts[0]!.title}
      icon={icon}
      className="flex flex-col gap-y-1"
    >
      {fonts.map((f, i) => (
        <Fragment key={i}>
          {i > 0 && <MenuSeparator />}
          {/* <BaseCol key={i}> */}
          {/* <PopoverTitle className="font-bold p-1">{f.name}</PopoverTitle> */}
          <FontUI
            title={f.title}
            textProps={f.textProps}
            update={f.update}
            showEnabled={f.showEnabled ?? true}
            showAlign={f.showAlign ?? true}
            showRotation={f.showRotation ?? false}
          />
          {f.ext && f.ext}
        </Fragment>
      ))}
    </BaseFontPopover>
  )
}
