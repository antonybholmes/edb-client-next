import {
  FontAlignToggles,
  FontFamilySelect,
  FontIncDec,
  FontSizeSelect,
  FontStyleToggles,
} from '@/components/plot/font/font-ui'
import { IFontProps, ITextProps } from '@/components/plot/svg-props'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { produce } from 'immer'

interface IProps {
  textProps: ITextProps
  showAlign?: boolean
  showColor?: boolean
  update?: (textProps: ITextProps) => void
}

export function FontToolbarGroup({
  textProps,
  showAlign = true,
  showColor = true,
  update,
}: IProps) {
  return (
    <ToolbarTabGroup title="Font" className="gap-x-2">
      <ToolbarCol>
        <ToolbarRow>
          <FontFamilySelect
            value={textProps.font.fontFamily}
            onChange={(v) =>
              update?.(
                produce(textProps, (draft) => {
                  draft.font.fontFamily = v as IFontProps['fontFamily']
                })
              )
            }
          />
          <FontSizeSelect
            value={textProps.font.fontSize}
            onChange={(v) =>
              update?.(
                produce(textProps, (draft) => {
                  draft.font.fontSize = v as IFontProps['fontSize']
                })
              )
            }
          />
          <FontIncDec
            className="hidden group-data-[ribbon=classic]:flex"
            value={textProps.font.fontSize}
            onChange={(v) =>
              update?.(
                produce(textProps, (draft) => {
                  draft.font.fontSize = v as IFontProps['fontSize']
                })
              )
            }
          />
        </ToolbarRow>
        <ToolbarRow>
          <FontStyleToggles
            font={textProps.font}
            showColor={showColor}
            update={(font) =>
              update?.(
                produce(textProps, (draft) => {
                  draft.font = font
                })
              )
            }
          />
          {showAlign && (
            <FontAlignToggles
              value={textProps.font.textAnchor}
              onChange={(v) =>
                update?.(
                  produce(textProps, (draft) => {
                    draft.font.textAnchor = v as IFontProps['textAnchor']
                  })
                )
              }
            />
          )}
        </ToolbarRow>
      </ToolbarCol>
    </ToolbarTabGroup>
  )
}
