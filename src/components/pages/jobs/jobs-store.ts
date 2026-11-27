export interface IJobFile {
  id: string
  type: string
  filename: string
  objectKey: string
  createdAt: string
  updatedAt: string
}

export interface IJob {
  id: string
  type: string
  bucket?: string
  files?: IJobFile[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface IPreSignedUrl {
  url: string
  expiresAt: string
}
