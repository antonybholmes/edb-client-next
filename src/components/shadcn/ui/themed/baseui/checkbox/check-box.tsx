import { MaterialCheckbox } from './material-check-box'
import { ICheckboxProps, RoundCheckbox } from './round-check-box'

export function Checkbox({
  variant = 'material',
  ...props
}: ICheckboxProps & { variant?: 'round' | 'material' }) {
  switch (variant) {
    case 'material':
      return <MaterialCheckbox {...props} />
    default:
      return <RoundCheckbox {...props} />
  }
}
