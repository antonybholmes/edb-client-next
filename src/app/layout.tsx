//import { Geist, Geist_Mono } from "next/font/google";

import { CoreProviders } from '@/providers/core-providers'
import { Geist } from 'next/font/google'
import { ReactNode } from 'react'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
})

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
// })

// export const metadata: Metadata = {
//   title: APP_NAME,
//   description: SITE_DESCRIPTION,
// }

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geist.className} antialiased margin-0 h-full min-h-screen flex flex-col bg-body text-base font-normal`}
      >
        {/* <CsrfProvider>{children}</CsrfProvider> */}
        <CoreProviders>{children}</CoreProviders>
      </body>
    </html>
  )
}
