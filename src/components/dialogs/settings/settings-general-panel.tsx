import { BaseCol } from '@/components/layout/base-col'
import { getTabName, ITab, renderTab } from '@/components/tabs/tab-provider'
import {
  DialogCard,
  DialogCardContent,
  DialogCardHeader,
  DialogCardInfo,
} from '../card/dialog-card'
import { SettingsDarkModePanel } from './settings-dark-mode-panel'
import { AppsToolbarPanel } from './settings-modules-panel'
import { SettingsToolbarPanel } from './settings-toolbar-panel'

const TABS = [
  {
    id: 'Dark Mode',
    description:
      'Dark mode can help reduce eye strain and improve readability in low-light.',
    component: SettingsDarkModePanel,
  },
  {
    id: 'Toolbars',
    //description: 'Customize toolbar settings.',
    component: SettingsToolbarPanel,
  },
  {
    id: 'Apps',
    //description: 'Configure how apps behave.',
    component: AppsToolbarPanel,
  },
]

export function SettingsGeneralPanel() {
  return <SettingsCardsPanel tabs={TABS} />
}

export function SettingsCardsPanel({ tabs }: { tabs: ITab[] }) {
  return (
    <BaseCol className="gap-y-4">
      {tabs.map((tab) => {
        return (
          <DialogCard key={tab.id}>
            <DialogCardHeader title={getTabName(tab)}>
              {tab.description && (
                <DialogCardInfo>{tab.description}</DialogCardInfo>
              )}
            </DialogCardHeader>
            <DialogCardContent>{renderTab(tab)}</DialogCardContent>
          </DialogCard>
        )
      })}
    </BaseCol>
  )
}
