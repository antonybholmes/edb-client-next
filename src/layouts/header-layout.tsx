import { SettingsDialog } from '@dialog/settings/settings-dialog'

import { Button } from '@themed/button'

import { useSettingsTabs } from '@/components/dialog/settings/setting-tabs-store'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { TEXT_SETTINGS } from '@/consts'
import { Header, type IHeaderChildrenProps } from '@components/header/header'
import { HelpWidget } from '@help/help'
import { type ILayoutProps } from '@interfaces/layout-props'
import { cn } from '@lib/shadcn-utils'
import { ToolbarFooter } from '@toolbar/toolbar-footer'
import { Toaster as SonnerToaster } from 'sonner'

export function SettingsButton() {
  const { visible, setSettingsVisible } = useSettingsTabs()
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
    <Button
      id="header-settings-button"
      variant="flat"
      size="header"
      rounded="none"
      pad="none"
      title={TEXT_SETTINGS}
      checked={visible}
      onClick={() => setSettingsVisible(true)}
      // onMouseOver={() => {
      //   setHover(true)
      // }}
      // onMouseOut={() => {
      //   setHover(false)
      // }}
      className="opacity-70 hover:opacity-100 data-[selected=true]:opacity-100 trans-color"
    >
      <SettingsIcon />
    </Button>
  )
}

export interface IHeaderLayoutProps extends IHeaderChildrenProps, ILayoutProps {
  showHeader?: boolean
  headerClassName?: string
}

export function HeaderLayout({
  showHeader = true,

  leftHeaderChildren,
  headerCenterChildren,
  headerRightChildren,
  headerTrayChildren,
  headerClassName,
  className,
  children,
}: IHeaderLayoutProps) {
  const { visible, setSettingsVisible } = useSettingsTabs()

  return (
    <>
      {/* <Toaster /> */}
      <SonnerToaster position="top-right" />

      {visible && (
        <SettingsDialog
          //open={tabStat.visible}
          onOpenChange={setSettingsVisible}
          onResponse={() => setSettingsVisible(false)}
        />
      )}

      {showHeader && (
        <Header
          leftHeaderChildren={leftHeaderChildren}
          headerRightChildren={headerRightChildren}
          headerTrayChildren={
            <>
              <SettingsButton />

              {headerTrayChildren}
            </>
          }
          className={headerClassName}
        >
          {headerCenterChildren}
        </Header>
      )}
      <main
        className={cn('flex flex-col grow relative', className)}
        id="main-layout"
      >
        {children}
      </main>

      <HelpWidget />

      <ToolbarFooter />

      {/* <Alerts /> */}
    </>
  )
}
