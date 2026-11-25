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
  files?: IJobFile[]
  status: string
  createdAt: string
  updatedAt: string
}
