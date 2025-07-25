import { TEXT_SAVE_IMAGE } from '@/consts'
import { FileImageIcon } from '@icons/file-image-icon'
import { SaveIcon } from '@icons/save-icon'
import { downloadSvg, downloadSvgAsPng } from '@lib/image-utils'
import { DropdownMenuItem } from '@themed/dropdown-menu'
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
      tooltip={TEXT_SAVE_IMAGE}
      aria-label="Save as PNG"
    >
      <DropdownMenuItem onClick={() => downloadSvgAsPng(svgRef)}>
        <FileImageIcon fill="" />
        <span>Download as PNG</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadSvg(svgRef)}>
        Download as SVG
      </DropdownMenuItem>
    </ToolbarOptionalDropdownButton>
  )
}
