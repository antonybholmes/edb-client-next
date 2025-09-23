import { NumericalPropRow } from '@dialog/numerical-prop-row'
import {
  getAccordionId,
  SettingsAccordionItem,
} from '@dialog/settings/settings-dialog'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { TextPropRow } from '@dialog/text-prop-row'
import { TextareaPropRow } from '@dialog/textarea-prop-row'
import { capitalCase } from '@lib/text/capital-case'
import { isStringArray, splitOnCapitalLetters } from '@lib/text/text'
import { Accordion } from '@themed/accordion'
import { produce } from 'immer'
import { useMatcalcSettings } from './matcalc-settings'

export function SettingsAppsPanel() {
  const { settings, updateSettings } = useMatcalcSettings()

  const appKeys = Object.keys(
    settings.apps
  ).sort() as (keyof typeof settings.apps)[]

  const friendlyAppNames = appKeys.map((k) =>
    capitalCase(splitOnCapitalLetters(k))
  )

  return (
    <>
      <Accordion
        defaultValue={friendlyAppNames.map((n) => getAccordionId(n))}
        type="multiple"
        variant="settings"
      >
        {friendlyAppNames.map((appName, appI) => {
          const appKey = appKeys[appI]!

          const appSettings = settings.apps[appKey]!

          const settingKeys = Object.keys(
            appSettings
          ).sort() as (keyof typeof appSettings)[]

          const friendlySettingsNames = settingKeys.map((k) =>
            capitalCase(splitOnCapitalLetters(k))
          )

          return (
            <SettingsAccordionItem title={appName} key={appName}>
              {friendlySettingsNames.map((settingName, settingI) => {
                const settingKey = settingKeys[settingI]!

                const setting = appSettings[settingKey]!

                if (typeof setting === 'string') {
                  return (
                    <TextPropRow
                      key={settingName}
                      title={settingName}
                      value={setting}
                      onTextChange={(v) => {
                        const newOptions = produce(settings, (draft) => {
                          // the compiler refuses to get the correct type so we have to
                          // force it to behave
                          draft.apps[appKey][settingKey] = v as never
                        })

                        updateSettings(newOptions)
                      }}
                      className="w-1/2"
                    />
                  )
                }
                if (typeof setting === 'number') {
                  return (
                    <NumericalPropRow
                      key={settingName}
                      title={settingName}
                      value={setting}
                      onNumChange={(v) => {
                        const newOptions = produce(settings, (draft) => {
                          // the compiler refuses to get the correct type so we have to
                          // force it to behave
                          draft.apps[appKey][settingKey] = v as never
                        })

                        updateSettings(newOptions)
                      }}
                    />
                  )
                } else if (typeof setting === 'boolean') {
                  return (
                    <SwitchPropRow
                      key={settingName}
                      title={settingName}
                      checked={setting}
                      onCheckedChange={(v) => {
                        const newOptions = produce(settings, (draft) => {
                          // the compiler refuses to get the correct type so we have to
                          // force it to behave
                          draft.apps[appKey][settingKey] = v as never
                        })

                        updateSettings(newOptions)
                      }}
                    />
                  )
                } else if (isStringArray(setting)) {
                  return (
                    <TextareaPropRow
                      key={settingName}
                      title={settingName}
                      lines={setting}
                      onLinesChange={(v) => {
                        const newOptions = produce(settings, (draft) => {
                          // the compiler refuses to get the correct type so we have to
                          // force it to behave
                          draft.apps[appKey][settingKey] = v as never
                        })

                        updateSettings(newOptions)
                      }}
                      className="w-1/2"
                    />
                  )
                } else {
                  return <span key={settingName}>{settingName}</span>
                }
              })}
            </SettingsAccordionItem>
          )
        })}
      </Accordion>
    </>
  )
}
