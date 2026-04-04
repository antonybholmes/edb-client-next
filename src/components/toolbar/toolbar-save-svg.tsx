import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TEXT_DOWNLOAD_AS_PNG, TEXT_DOWNLOAD_AS_SVG } from '@/consts'
import { FileImageIcon } from '@/icons/file-image-icon'
import { SaveIcon } from '@/icons/save-icon'
import { downloadSvg, downloadSvgAsPng } from '@/lib/image-utils'
import type { RefObject } from 'react'
import { ToolbarOptionalDropdownButton } from './toolbar-optional-dropdown-button'

interface IProps {
  svgRef: RefObject<SVGElement | null>
}

export function ToolbarSaveSvg({ svgRef }: IProps) {
  return (
    <ToolbarOptionalDropdownButton
      onMainClick={() => downloadSvgAsPng(svgRef)}
      icon={<SaveIcon className="-scale-100 fill-foreground" />}
      aria-label="Save as PNG"
    >
      <DropdownMenuItem onClick={() => downloadSvgAsPng(svgRef)}>
        <FileImageIcon fill="" />
        <span>{TEXT_DOWNLOAD_AS_PNG}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadSvg(svgRef)}>
        {TEXT_DOWNLOAD_AS_SVG}
      </DropdownMenuItem>
    </ToolbarOptionalDropdownButton>
  )
}
