//import { Geist, Geist_Mono } from "next/font/google";

import { BaseCol } from '@/components/layout/base-col'
import { ThemeProvider } from '@/lib/edb/theme'
import { Auth0Provider } from '@auth0/nextjs-auth0/client'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import { ReactNode } from 'react'
import './globals.css'
const primaryFont = Geist({
  subsets: ['latin'],
  variable: '--font-primary',
})

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-primary',
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
      <head>
        {/* This script runs immediately before the page interactive phase */}
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }

                console.log('Theme initialized')
              } catch (e) {
                console.error('Theme initialization failed:', e);
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${primaryFont.className} antialiased margin-0 h-full min-h-screen flex flex-col bg-body text-base font-normal`}
      >
        {/* <CsrfProvider>{children}</CsrfProvider> */}
        {/* <CoreProviders>{children}</CoreProviders> */}

        {/* Added for base-ui to render dialogs */}
        <ThemeProvider>
          <BaseCol className="root isolate grow">
            <Auth0Provider>{children}</Auth0Provider>
          </BaseCol>
        </ThemeProvider>
      </body>
    </html>
  )
}
