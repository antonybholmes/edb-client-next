import { useSettingsTabs } from '@/dialogs/settings/setting-tabs-store'

import { DialogsRoot } from '@/components/dialogs/dialogs'
import { Header, type IHeaderChildrenProps } from '@/components/header/header'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { BaseCol } from '@/components/layout/base-col'
import { TEXT_SETTINGS } from '@/consts'
import { HelpWidget } from '@/help/help'
import { type ILayoutProps } from '@/interfaces/layout-props'
import { EDBSignIn, type SignInMode } from '@/lib/edb/signin/edb-signin'
import { cn } from '@/lib/shadcn-utils'

import { Footer } from '@/components/toolbar/footer'
import { Toaster as SonnerToaster } from 'sonner'
import { DevLayout } from './dev-layout'
import { HeaderIconButton } from './header-icon-button'

export function SettingsButton() {
  const { visible, openSettings } = useSettingsTabs()
  // const [hover, setHover] = useState(false)

  // const iconRef = useRef<SVGSVGElement>(null)

  // useEffect(() => {
  //   gsap.timeline().to(iconRef.current, {
  //     scale: hover || visible ? 1.1 : 1,

  //     duration: 0.3,
  //     ease: 'power3.out',
  //   })

  // }, [hover, visible])

  return (
    <HeaderIconButton
      id="header-settings-button"
      title={TEXT_SETTINGS}
      checked={visible}
      onClick={() => openSettings()}
      // onMouseOver={() => {
      //   setHover(true)
      // }}
      // onMouseOut={() => {
      //   setHover(false)
      // }}
      //className="opacity-70 hover:opacity-100 data-[selected=true]:opacity-100 trans-color"
    >
      <SettingsIcon isAnimated={true} />
    </HeaderIconButton>
  )
}

export interface IHeaderLayoutProps extends IHeaderChildrenProps, ILayoutProps {
  showHeader?: boolean
  signInMode?: SignInMode
  headerClassName?: string
  signinRequired?: boolean
  showAccountButton?: boolean
}

export function HeaderLayout({
  showHeader = true,
  signInMode = 'auth0',
  signinRequired = true,
  showAccountButton = true,
  leftHeaderChildren,
  headerCenterChildren,
  headerRightChildren,
  headerClassName,
  className,
  children,
}: IHeaderLayoutProps) {
  //const { visible, setSettingsVisible } = useSettingsTabs()

  return (
    <>
      {/* <HeaderSlotPortal slot="right">
        {(signinRequired || showAccountButton) && (
          <EDBSignIn signInMode={signInMode} />
        )}
        <SettingsButton />
      </HeaderSlotPortal> */}

      {/* <Toaster /> */}
      <SonnerToaster position="top-right" />
 

      {/* Show standardized dialogs at the root of the app to avoid nesting issues 
      with portals and z-index */}
      <DialogsRoot />

      <DevLayout>
        <BaseCol className="grow h-full">
          {showHeader && (
            <Header
              leftHeaderChildren={leftHeaderChildren}
              headerRightChildren={
                <>
                  {(signinRequired || showAccountButton) && (
                    <EDBSignIn signInMode={signInMode} />
                  )}
                  <SettingsButton />

                  {headerRightChildren}
                </>
              }
              className={headerClassName}
            >
              {headerCenterChildren}
            </Header>
          )}
          <main
            className={cn('flex flex-col relative grow', className)}
            id="main-layout"
          >
            {children}
          </main>

          <Footer />
        </BaseCol>
      </DevLayout>

      <HelpWidget />

      {/* <Alerts /> */}
    </>
  )
}
