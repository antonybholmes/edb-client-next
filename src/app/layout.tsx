//import { Geist, Geist_Mono } from "next/font/google";

import { BaseCol } from '@/components/layout/base-col'
import { Auth0Provider } from '@auth0/nextjs-auth0/client'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import './globals.css'
// const geist = Geist({
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

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
        className={`${inter.className} antialiased margin-0 h-full min-h-screen flex flex-col bg-body text-base font-normal`}
      >
        {/* <CsrfProvider>{children}</CsrfProvider> */}
        {/* <CoreProviders>{children}</CoreProviders> */}
        <BaseCol className="root grow">
          <Auth0Provider>{children}</Auth0Provider>
        </BaseCol>
      </body>
    </html>
  )
}
