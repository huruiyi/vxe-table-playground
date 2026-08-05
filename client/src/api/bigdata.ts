import request from './request'

export interface BigRow {
  id: number
  name: string
  role: string
  sex: number
  age: number
  salary: number
  rate: number
  address: string
  [key: string]: unknown
}

export function fetchBigData(size: number, cols = 0): Promise<{ list: BigRow[]; total: number }> {
  return request.get('/bigdata', { params: { size, cols } })
}
