import { Accordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { getTabName, ITab, renderTab } from '@/components/tabs/tab-provider'
import { getAccordionId, SettingsAccordionItem } from './settings-dialog'

export function SettingsAccordionPanel({ tabs }: { tabs: ITab[] }) {
  return (
    <Accordion
      defaultValue={tabs.map((g) => getAccordionId(getTabName(g)))}
      multiple={true}
      variant="settings"
    >
      {tabs
        .filter((g) => !!g.component)
        .map((g, gi) => {
          return (
            <SettingsAccordionItem
              title={getTabName(g)}
              description={g.description}
              key={gi}
              showBorder={gi > 0}
            >
              {renderTab(g)}
            </SettingsAccordionItem>
          )
        })}
    </Accordion>
  )
}
