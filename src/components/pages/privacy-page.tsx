'use client'

import { BaseCol } from '@/layout/base-col'
import { ContentDiv } from '@/layout/content-div'
import { CoreProviders } from '@/providers/core-providers'

import { HeaderLayout } from '@/layouts/header-layout'

export function PrivacyPage() {
  return (
    <HeaderLayout title="Privacy">
      <ContentDiv className="mt-8 text-sm">
        <></>
        <BaseCol className="gap-y-4">
          <h1 className="text-2xl font-semibold">Privacy</h1>
          <p>
            Your privacy is important. This privacy statement explains the
            personal data we process, how we processes it, and for what
            purposes.
          </p>
          <p>
            These services are built to collect as little info about users as
            possible. We try to ensure that apps run as single page applications
            entirely within your web browser with minimal external calls to
            third party services. Your data remains local on your device unless
            otherwise specified. It may be necessary to upload some of your data
            to our web services for processing when this cannot be done locally.
          </p>
          <p>
            We do not use cookies for tracking purposes. We may use cookies to
            establish a login session if you make use of restricted services
            that require authentication, but this is only for the purposes of
            establishing your identity. We do not track your activity once you
            are signed in. Cookies and local storage may be used to save your
            preferences within apps. This data is in the JSON format and can be
            freely inspected using your web browser&apos;s developer tools.
            Session data cookies are encrypted and are not designed for you to
            inspect. They contain basic information for the purposes of
            establishing and maintaining your identity and keeping you signed
            in.
          </p>
          <p>
            Opening an Excel (xlsx) file through the web apps requires that the
            file be processed in the cloud to extract data from a spreadsheet.
            This is done over a secure connection and your data is discarded
            once it has been processed and sent back to you. If you wish data to
            remain local, you can convert the Excel file to a tab delimited text
            file yourself as these are loaded directly into the browser using
            client only APIs.
          </p>
        </BaseCol>
        <></>
      </ContentDiv>
    </HeaderLayout>
  )
}

export function PrivacyQueryPage() {
  return (
    <CoreProviders>
      <PrivacyPage />
    </CoreProviders>
  )
}
