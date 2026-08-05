import request from './request'

export interface UserRow {
  id: number
  name: string
  nickname: string
  sex: 0 | 1
  age: number
  role: string
  dept_id: number
  email: string
  phone: string
  address: string
  salary: string | number
  join_date: string | null
  status: 0 | 1
  created_at: string
  updated_at: string
}

export interface UserQueryParams {
  page?: number
  pageSize?: number
  name?: string
  role?: string
  sex?: number | string
  status?: number | string
  sortField?: string
  sortOrder?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export function fetchUsers(params: UserQueryParams): Promise<PageResult<UserRow>> {
  return request.get('/users', { params })
}

export function createUser(data: Partial<UserRow>): Promise<{ id: number }> {
  return request.post('/users', data)
}

export function updateUser(id: number, data: Partial<UserRow>): Promise<{ id: number }> {
  return request.put(`/users/${id}`, data)
}

export function deleteUser(id: number): Promise<null> {
  return request.delete(`/users/${id}`)
}

export interface BatchSaveBody {
  insertRecords: Partial<UserRow>[]
  updateRecords: Partial<UserRow>[]
  removeRecords: Partial<UserRow>[]
}

export function batchSaveUsers(body: BatchSaveBody): Promise<{ inserted: number; updated: number; removed: number }> {
  return request.post('/users/batch-save', body)
}
