import { BaseCol } from '@/components/layout/base-col'
import { ModuleButtonLink } from '@components/header/module-button-link'

import { HEADER_LINKS } from '@/menus'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import type { MouseEventHandler } from 'react'

interface IProps extends IElementProps {
  tab?: string
  onClick: MouseEventHandler<HTMLAnchorElement>
}

export function HeaderLinks({ onClick, className }: IProps) {
  // // let ref
  // // const tMenuLinkF
  // // const tMenuLinkR
  // const isFirstRun = useRef(0)

  // useEffect(() => {
  //   //if (isFirstRun.current < 2) {
  //   // @ts-ignore
  //   gsap.timeline().from(
  //     '.menu-link',
  //     {
  //       duration: 1,
  //       opacity: 0.5,
  //       stagger: 0.06,
  //       ease: 'power2.out',
  //     },
  //     0
  //   )
  //   // .from(
  //   //   '.menu-link',
  //   //   {
  //   //     duration: 0.4,
  //   //     x: '-0.5rem',
  //   //     stagger: 0.06,
  //   //     ease: 'power2.out',
  //   //   },
  //   //   0.1
  //   // )
  //   // }
  //   //++isFirstRun.current
  // }, [])

  // useEffect(() => {
  //   if (isFirstRun.current < 2) {
  //     if (showMenu) {
  //       // @ts-ignore
  //       tMenuLinkR.current.pause()
  //       // @ts-ignore
  //       tMenuLinkF.current.restart()
  //     } else {
  //       // @ts-ignore
  //       tMenuLinkF.current.pause()
  //       // @ts-ignore
  //       tMenuLinkR.current.restart()
  //     }
  //   }

  //   ++isFirstRun.current
  // }, [showMenu])

  return (
    <ul
      className={cn(
        'mt-2 flex flex-col gap-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar',
        className
      )}
    >
      {HEADER_LINKS.map((section, sectionIndex) => {
        return (
          <li key={sectionIndex}>
            <h2 className="text-xs font-bold">{section.name}</h2>
            <ul className="mt-1 grid grid-cols-2 gap-2">
              {section.modules
                .filter(
                  module =>
                    module.mode !== 'dev' ||
                    process.env.NODE_ENV !== 'production'
                )
                .map((module, moduleIndex) => {
                  let abbr = ''

                  if (module.abbr) {
                    abbr = module.abbr
                  } else {
                    abbr = `${module.name[0]!.toUpperCase()}${module.name[1]!.toLowerCase()}`
                  }

                  return (
                    <li key={moduleIndex}>
                      <ModuleButtonLink
                        href={module.slug}
                        onClick={onClick}
                        aria-label={module.name}
                        //target="_blank"
                      >
                        {/* <GearIcon className="mt-1"/> */}

                        <div
                          className="flex h-7 w-7 shrink-0 flex-row items-center justify-center rounded-full text-sm text-white/95"
                          style={{
                            backgroundColor: module.color ?? 'lightslategray',
                          }}
                        >
                          <span className="font-bold">
                            {abbr[0]!.toUpperCase()}
                          </span>
                          <span>{abbr[1]!.toLowerCase()}</span>
                        </div>

                        <BaseCol>
                          <h3 className="text-sm font-semibold">
                            {module.name}
                          </h3>
                          <p className="text-xs opacity-50">
                            {module.description}
                          </p>
                        </BaseCol>
                      </ModuleButtonLink>
                    </li>
                  )
                })}
            </ul>
          </li>
        )
      })}
    </ul>
  )
}
