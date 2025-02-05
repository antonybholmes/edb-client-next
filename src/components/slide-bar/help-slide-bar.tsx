import { useState } from 'react'

import type { IDivProps } from '@interfaces/div-props'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { SlideBar, SlideBarContent } from './slide-bar'

interface IHelpFrameProps {
  helpUrl: string
}

function HelpIFrame({ helpUrl }: IHelpFrameProps) {
  // const iframeRef = useRef<HTMLIFrameElement>(null)
  // const [height, setHeight] = useState('0px')
  // // useEffect(() => {
  // //   iframeRef.current!.style.height = iframeRef.current!.contentWindow!.document.body.scrollHeight + 'px';

  // //   // set the width of the iframe as the
  // //   // width of the iframe content
  // //   //iframeRef.current!.style.width  = iframeRef.current!.contentWindow!.document.body.scrollWidth + 'px';
  // // },[])

  // console.log(height, helpUrl)

  // return (
  //   <div
  //     className="border"
  //   >
  //     <iframe
  //       ref={iframeRef}
  //       src={helpUrl}
  //       className="w-full h-64 bg-red-500 "
  //       scrolling="auto"

  //       // onLoad={() => {
  //       //   console.log("onload")
  //       //   setHeight(
  //       //     iframeRef.current!.contentWindow!.document.body.scrollHeight + 'px'
  //       //   )

  //       // iframeRef.current!.style.height =
  //       //   iframeRef.current!.contentWindow!.document.body.scrollHeight + 'px'
  //       //}}
  //     />
  //   </div>

  const { data } = useQuery({
    queryKey: ['help'],
    queryFn: async () => {
      const res = await axios.get(helpUrl)
      return res.data
    },
  })

  if (!data) {
    return <span>Loading...</span>
  }

  return (
    <div className="relative grow overflow-x-hidden overflow-y-auto custom-scrollbar mr-1">
      <div
        className="absolute w-full p-1"
        dangerouslySetInnerHTML={{ __html: data }}
      />
    </div>
  )
}

interface IProps extends IDivProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  helpUrl: string
  position?: number
  limits?: [number, number]
}

export function HelpSlideBar({
  open = false,
  onOpenChange = () => {},
  helpUrl = '',
  position = 80,
  limits = [5, 85],
  className,
  children,
}: IProps) {
  const [isOpen, setIsOpen] = useState(true)

  //const _value = value ?? tabs[0].name // getTabValue(value, tabs)

  function _onOpenChange(state: boolean) {
    setIsOpen(state)
    onOpenChange?.(state)
  }

  const _open = open !== undefined ? open : isOpen

  return (
    <SlideBar
      open={_open}
      onOpenChange={_onOpenChange}
      side="Right"
      position={position}
      limits={limits}
      //className={className}
      title="Help"
      mainContent={children}
      sideContent={<HelpIFrame helpUrl={helpUrl} />}
    >
      <SlideBarContent className={className} />
    </SlideBar>
  )
}
