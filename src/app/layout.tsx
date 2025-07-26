import type { Metadata } from 'next'
//import { Geist, Geist_Mono } from "next/font/google";
import { APP_NAME, SITE_DESCRIPTION } from '@/consts'
import { Geist } from 'next/font/google'
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

export const metadata: Metadata = {
  title: APP_NAME,
  description: SITE_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} antialiased margin-0 min-h-screen flex flex-col bg-body text-base font-normal`}
      >
        {children}
      </body>
    </html>
  )
}
