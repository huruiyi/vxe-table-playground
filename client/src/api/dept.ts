import request from './request'

export interface DeptRow {
  id: number
  parent_id: number
  name: string
  manager: string
  emp_count: number
  hasChild?: boolean
  children?: DeptRow[]
}

// flat=true 返回扁平数组(配合 tree-config.transform)
export function fetchDeptTree(flat = false): Promise<DeptRow[]> {
  return request.get('/departments/tree', { params: flat ? { flat: 1 } : {} })
}

export function fetchDeptChildren(parentId: number): Promise<DeptRow[]> {
  return request.get('/departments/children', { params: { parentId } })
}
