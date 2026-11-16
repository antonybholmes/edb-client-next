import { MaterialSwitch } from './material-switch'
import { ISwitchProps, RoundSwitch } from './round-switch'
import { SmallSwitch } from './small-switch'
import { SquareSwitch } from './square-switch'

export function Switch({
  variant = 'material',
  ...props
}: ISwitchProps & { variant?: 'round' | 'square' | 'small' | 'material' }) {
  switch (variant) {
    case 'small':
      return <SmallSwitch {...props} />
    case 'square':
      return <SquareSwitch {...props} />
    case 'material':
      return <MaterialSwitch {...props} />
    default:
      return <RoundSwitch {...props} />
  }
}
