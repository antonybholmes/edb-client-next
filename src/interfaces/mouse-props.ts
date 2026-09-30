export interface IMouseProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  onPointerEnter?: (e: React.MouseEvent<HTMLElement>) => void
  onPointerLeave?: (e: React.MouseEvent<HTMLElement>) => void
  onPointerDown?: (e: React.MouseEvent<HTMLElement>) => void
  onPointerUp?: (e: React.MouseEvent<HTMLElement>) => void
}
