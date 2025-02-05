export interface IMouseProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void
  onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void
  onMouseUp?: (e: React.MouseEvent<HTMLElement>) => void
}
