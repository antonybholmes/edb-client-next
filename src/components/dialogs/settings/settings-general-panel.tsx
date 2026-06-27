import { SettingsAccordionPanel } from './settings-accordion-panel'
import { SettingsDarkModePanel } from './settings-dark-mode-panel'
import { AppsToolbarPanel } from './settings-modules-panel'
import { SettingsToolbarPanel } from './settings-toolbar-panel'

const TABS = [
  {
    id: 'Dark Mode',
    description:
      'Dark mode is a popular feature for reducing eye strain and improving readability in low-light environments.',
    component: SettingsDarkModePanel,
  },
  {
    id: 'Toolbars',
    description: 'Customize toolbar settings.',
    component: SettingsToolbarPanel,
  },
  {
    id: 'Apps',
    description: 'Manage and configure apps.',
    component: AppsToolbarPanel,
  },
]

export function SettingsGeneralPanel() {
  return <SettingsAccordionPanel tabs={TABS} />
}
