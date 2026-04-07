'use client'

import { useEffect, useState } from 'react'

import { API_HUBS_URL } from '@/lib/edb/edb'

import { BaseCol } from '@/layout/base-col'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { SlidersIcon } from '@/icons/sliders-icon'

import { HubsPropsPanel } from './hubs-props-panel'

import { useHubs, type IDataset } from './hubs-store'

import { type ITab } from '@/components/tabs/tab-provider'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { IndexArrowIcon } from '@/components/icons/index-arrow-icon'
import { BLANK_TARGET } from '@/components/link/base-link'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TIME_5_MINUTES_MS } from '@/consts'
import { useSearch } from '@/hooks/search'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectList,
} from '@/themed/v2/select'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import MODULE_INFO from './module.json'

const BASE_URL = 'http://genome.ucsc.edu/cgi-bin/hgTracks' //https://genome.ucsc.edu/goldenPath/help/examples/hubDirectory/hub.txt

export function HubsPage() {
  //const _id = useStableId('hubs-page')

  //const [rightTab, setRightTab] = useState('Search')

  //const [hubs, setHubs] = useState<IHub[]>([])

  const { settings, updateSettings } = useHubs()

  const { query, setQuery, resetQuery } = useSearch()

  const [showSideBar, setShowSideBar] = useState(true)

  const [technologyMap, setTechnologyMap] = useState(
    new Map<string, Map<string, IDataset[]>>()
  )

  const [searchTechnologyMap, setSearchTechnologyMap] = useState(
    new Map<string, Map<string, IDataset[]>>()
  )

  //const { toast } = useToast()

  const { fetchAccessToken } = useEdbAuth()

  const { data: hubData } = useQuery({
    queryKey: ['hubs', settings.assembly],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      return httpFetch.getJson<{ data: IDataset[] }>(
        `${API_HUBS_URL}/assemblies/${settings.assembly}/datasets`,
        {
          headers: bearerHeaders(accessToken),
        }
      )
    },
  })

  useEffect(() => {
    async function loadHubs() {
      //setHubs(hubs)

      const technologyMap = new Map<string, Map<string, IDataset[]>>()

      for (const hub of hubData!.data) {
        if (!technologyMap.has(hub.institution)) {
          technologyMap.set(hub.institution, new Map<string, IDataset[]>())
        }

        if (!technologyMap.get(hub.institution)!.has(hub.technology)) {
          technologyMap.get(hub.institution)!.set(hub.technology, [])
        }

        technologyMap.get(hub.institution)!.get(hub.technology)!.push(hub)
      }

      setTechnologyMap(technologyMap)
    }

    if (hubData) {
      loadHubs()
    }
  }, [hubData])

  useEffect(() => {
    if (query) {
      const ls = query.toString().toLowerCase()

      const searchPlatformMap = new Map<string, Map<string, IDataset[]>>()

      for (const institution of technologyMap.keys()) {
        for (const technology of technologyMap.get(institution)!.keys()) {
          for (const hub of technologyMap.get(institution)!.get(technology)!) {
            if (
              hub.name.toLowerCase().includes(ls) ||
              hub.description.toLowerCase().includes(ls) ||
              hub.institution.toLowerCase().includes(ls) ||
              hub.genome.toLowerCase().includes(ls) ||
              hub.technology.toLowerCase().includes(ls) ||
              hub.samples.some((sample) =>
                sample.name.toLowerCase().includes(ls)
              )
            ) {
              if (!searchPlatformMap.has(institution)) {
                searchPlatformMap.set(
                  institution,
                  new Map<string, IDataset[]>()
                )
              }

              if (!searchPlatformMap.get(institution)!.has(technology)) {
                searchPlatformMap.get(institution)!.set(technology, [])
              }

              searchPlatformMap.get(institution)!.get(technology)!.push(hub)
            }
          }
        }
      }

      setSearchTechnologyMap(searchPlatformMap)
    } else {
      setSearchTechnologyMap(technologyMap)
    }
  }, [query, technologyMap])

  const rightTabs: ITab[] = [
    {
      id: 'Options',
      icon: <SlidersIcon />,
      content: <HubsPropsPanel />,
    },
  ]

  function HubsPanel() {
    return (
      <ScrollAccordion
        multiple={true}
        value={institutions}
        variant="settings"
        className="p-4 gap-y-4"
      >
        {institutions.map((institution) => {
          return (
            <AccordionItem
              key={institution}
              value={institution}
              className="bg-background rounded-card border border-border/50"
            >
              <AccordionTrigger variant="none" className="p-4">
                {institution}
              </AccordionTrigger>
              <AccordionContent variant="sidebar">
                {[...searchTechnologyMap.get(institution)!.keys()]
                  .sort()
                  .map((platform) => {
                    return (
                      <BaseCol
                        className="gap-y-2 border-t border-border/50 p-4"
                        key={platform}
                      >
                        <h2 className=" text-lg">{platform}</h2>
                        <ul className="flex flex-col gap-y-2">
                          {searchTechnologyMap
                            .get(institution)!
                            .get(platform)!
                            .map((hub) => {
                              const params = new URLSearchParams()
                              params.append('db', settings.assembly)
                              params.append('hubUrl', hub.url)
                              if (settings.hideTracks) {
                                params.append('hideTracks', '1')
                              }

                              params.append(
                                'guidelines',
                                settings.showGuidelines ? 'on' : 'off'
                              )

                              return (
                                <li
                                  key={hub.id}
                                  className="flex flex-row items-center gap-x-2 text-sm"
                                >
                                  <BaseCol className="grow">
                                    <h3 className="font-semibold">
                                      {hub.name}
                                    </h3>
                                    <p>{hub.description}</p>
                                    {/* <p className="text-xs mt-1 truncate text-gray-400">
                                          {hub.samples
                                            .map(sample => sample.name)
                                            .sort()
                                            .join(', ')}{' '}
                                        </p> */}
                                  </BaseCol>
                                  <a
                                    href={`${BASE_URL}?${params.toString()}`}
                                    target={BLANK_TARGET}
                                    className="bg-theme text-white group px-4 py-2 rounded-full flex flex-row items-center gap-x-1 text-xs"
                                  >
                                    <span>View</span>
                                    <IndexArrowIcon />
                                  </a>
                                </li>
                              )
                            })}
                        </ul>
                      </BaseCol>
                    )
                  })}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </ScrollAccordion>
    )
  }

  const institutions = [...searchTechnologyMap.keys()].sort()

  return (
    <ShortcutLayout signinRequired={false}>
      <HeaderPortal>
        <ModuleInfoButton info={MODULE_INFO} />

        <Autocomplete
          //variant="header"
          h="header"
          value={query.toString()}
          onTextChange={(v) => (v.length > 0 ? setQuery([v]) : resetQuery())}
          className="w-4/5 lg:w-1/2 text-xs font-medium"
        >
          {institutions.map((institution) => {
            return (
              <AutocompleteLi key={institution}>{institution}</AutocompleteLi>
            )
          })}
        </Autocomplete>

        <SelectList
          variant="header"
          className="text-sm"
          w="xs"
          value={settings.assembly}
          onValueChange={(v) => {
            const newStore = produce(settings, (draft) => {
              draft.assembly = (v as string) ?? 'hg19'
            })

            updateSettings(newStore)
          }}
        >
          <SelectGroup>
            <SelectLabel>Genome Assembly</SelectLabel>
            <SelectItem value="hg19">hg19</SelectItem>
            <SelectItem value="grch38">grch38</SelectItem>
            <SelectItem value="mm10">mm10</SelectItem>
          </SelectGroup>
        </SelectList>
      </HeaderPortal>

      <TabSlideBar
        id="hubs"
        side="right"
        tabs={rightTabs}
        //value={rightTab}
        //onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
        open={showSideBar}
        showCloseButton={false}
        onOpenChange={setShowSideBar}
      >
        <HubsPanel />
      </TabSlideBar>
    </ShortcutLayout>
  )
}

export function HubsQueryPage() {
  return (
    <CoreProviders>
      {/* <SearchProvider> */}
      <HubsPage />
      {/* </SearchProvider> */}
    </CoreProviders>
  )
}
