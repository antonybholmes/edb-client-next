'use client'

import { BaseCol } from '@layout/base-col'
import { ContentDiv } from '@layout/content-div'

import { HeaderLayout } from '@layouts/header-layout'
import { CoreProviders } from '@providers/core-providers'

function PrivacyPage() {
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
            The Experiments services are built to collect as little info about
            users as possible. We try to ensure that apps run as single page
            applications entirely within your web browser with minimal external
            calls to third party services. Your data remains local on your
            device unless otherwise specified. It may be necessary to upload
            some of your data to our web services for processing that cannot be
            done locally, for example opening an Excel (xlsx) file requires that
            the file be processed in the cloud to extract the table contents.
            This is done over a secure connection and your data will be
            discarded once it has been processed andunknown results have been
            sent back to you. In the case of an Excel file, if you convert the
            Excel file to a tab delimited text file yourself and then load this
            into Experiments, the data will remain local.
          </p>
          <p>
            We do not use cookies for tracking purposes. We may use cookies to
            establish a session if you make use of restricted services, but this
            is only for the purposes of establishing your identity. We do not
            track your activity once you are signed in. Cookies and local
            storage may be used to save your preferences within apps. This data
            is in the JSON format and can be freely inspected using your web
            browser&apos;s tools. Session data is encrypted and is not designed
            for you to inspect. It contains basic information such as your user
            identifier for the purposes of establishing and maintaining your
            identity and keeping you signed in.
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
