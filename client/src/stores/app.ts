import { defineStore } from 'pinia'
import { VxeUI } from '@/plugins/vxe'

export type TableSize = 'mini' | 'small' | 'medium'

export const useAppStore = defineStore('app', {
  state: () => ({
    collapsed: false,
    dark: false,
    tableSize: 'medium' as TableSize
  }),
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    toggleDark() {
      this.dark = !this.dark
      VxeUI.setTheme(this.dark ? 'dark' : 'light')
    },
    setTableSize(size: TableSize) {
      this.tableSize = size
      VxeUI.setConfig({ size })
    }
  }
})
