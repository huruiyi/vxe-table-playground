import { defineStore } from 'pinia'

// 缓存 /query 页的查询条件,路由切换后保留
export interface QueryForm {
  name: string
  role: string | undefined
  sex: number | undefined
  status: number | undefined
}

export const useDemoStore = defineStore('demo', {
  state: () => ({
    queryForm: {
      name: '',
      role: undefined,
      sex: undefined,
      status: undefined
    } as QueryForm
  }),
  actions: {
    resetQueryForm() {
      this.queryForm = { name: '', role: undefined, sex: undefined, status: undefined }
    }
  }
})
