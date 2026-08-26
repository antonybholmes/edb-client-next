import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TEXT_DOWNLOAD_AS_PNG, TEXT_DOWNLOAD_AS_SVG } from '@/consts'
import { FileImageIcon } from '@/icons/file-image-icon'
import { SaveIcon } from '@/icons/save-icon'
import { useSVG } from '@/providers/svg-provider'
import { ToolbarOptionalDropdownButton } from './toolbar-optional-dropdown-button'

export function ToolbarSaveSvg({ name }: { name: string }) {
  const { saveAsPng, save } = useSVG()

  return (
    <ToolbarOptionalDropdownButton
      onMainClick={() => saveAsPng(name)}
      icon={<SaveIcon className="-scale-100 fill-foreground" />}
      aria-label="Save as PNG"
    >
      <DropdownMenuItem onClick={() => saveAsPng(name)}>
        <FileImageIcon fill="" />
        <span>{TEXT_DOWNLOAD_AS_PNG}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => save(name)}>
        {TEXT_DOWNLOAD_AS_SVG}
      </DropdownMenuItem>
    </ToolbarOptionalDropdownButton>
  )
}
