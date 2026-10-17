type SeriesDataByKind = {
	number: number
	string: string
	date: Date
	boolean: boolean
}

export type IndexId = SeriesDataByKind['number' | 'string']
export type SeriesData = SeriesDataByKind[keyof SeriesDataByKind]
export type SeriesDataArray = {
	[Kind in keyof SeriesDataByKind]: SeriesDataByKind[Kind][]
}[keyof SeriesDataByKind]
