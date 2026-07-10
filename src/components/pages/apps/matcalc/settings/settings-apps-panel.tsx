import {
  DialogCard,
  DialogCardContent,
  DialogCardHeader,
} from '@/components/dialogs/card/dialog-card'
import { BaseCol } from '@/components/layout/base-col'
import { NumericalPropRow } from '@/dialogs/numerical-prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { TextPropRow } from '@/dialogs/text-prop-row'
import { TextareaPropRow } from '@/dialogs/textarea-prop-row'
import { capitalCase } from '@/lib/text/capital-case'
import { isStringArray, splitOnCapitalLetters } from '@/lib/text/text'
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
    <BaseCol className="gap-y-3">
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
          <DialogCard key={appName}>
            <DialogCardHeader title={appName}></DialogCardHeader>
            <DialogCardContent>
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
                      w="lg"
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
                      w="lg"
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
                      w="lg"
                    />
                  )
                } else {
                  return <span key={settingName}>{settingName}</span>
                }
              })}
            </DialogCardContent>
          </DialogCard>
        )
      })}
    </BaseCol>
  )
}
