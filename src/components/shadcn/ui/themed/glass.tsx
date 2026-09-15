import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

export const BASE_GLASS_CLS = 'backdrop-blur-lg'
// export const GLASS_CLS = cn(
//   'shadow-glass dark:shadow-dark-glass',
//   BASE_GLASS_CLS
// )

export const GLASS_CLS = cn('bg-muted/10 dark:bg-gray-800/50', BASE_GLASS_CLS)

export function Glass({ ref, className, children, ...props }: IDivProps) {
  return (
    // <div ref={ref} className={cn(GLASS_CLS, className)} {...props}>
    //   {children}
    // </div>

    <div className={cn('glass-container', className)} {...props}>
      {/* Layer 4: The Distortion Filter */}
      <div className="glass-filter"></div>

      {/* Layer 3: The Semi-Transparent Background */}
      <div className="glass-overlay"></div>

      {/* Layer 2: The "Light" Highlight */}
      <div className="glass-specular"></div>

      {/* Layer 1: Your Content */}
      <div className="glass-content">
        {/* Your player, text, etc. goes here */}
        {children}
      </div>
    </div>
  )
}

export function GlassSvg() {
  return (
    <svg style={{ display: 'none' }}>
      <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale="70"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  )
}
