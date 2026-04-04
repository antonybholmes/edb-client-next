type GexConfig = {
  title: string
  defaultInstitution: string
}

type MatcalcConfig = {
  apps: {
    gex: GexConfig
  }
}

type SeqBrowserConfig = {
  defaultInstitution: string
}

type MutationsConfig = {
  defaultInstitution: string
}

type Config = {
  matcalc: MatcalcConfig
  seqbrowser: SeqBrowserConfig
  wgs: MutationsConfig
}

export const appsConfig: Config = {
  matcalc: {
    apps: {
      gex: {
        title: 'Gene Expression',
        defaultInstitution: 'Columbia',
      },
    },
  },
  seqbrowser: {
    defaultInstitution: 'Columbia',
  },
  wgs: {
    defaultInstitution: 'Columbia',
  },
}
