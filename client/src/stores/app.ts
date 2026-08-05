import { defineStore } from 'pinia'
import { VxeUI } from '@/plugins/vxe'
import { findFont, stackOf } from '@/data/fonts'
import { isFontAvailable } from '@/utils/font'

export type TableSize = 'mini' | 'small' | 'medium'

const STORAGE = {
  font: 'demo-font',
  size: 'demo-table-size',
  dark: 'demo-dark'
} as const

const SIZES: TableSize[] = ['mini', 'small', 'medium']

function storedSize(): TableSize {
  const v = localStorage.getItem(STORAGE.size) as TableSize | null
  return v && SIZES.includes(v) ? v : 'medium'
}

export const useAppStore = defineStore('app', {
  state: () => ({
    collapsed: false,
    dark: localStorage.getItem(STORAGE.dark) === '1',
    tableSize: storedSize(),
    fontKey: localStorage.getItem(STORAGE.font) || 'system',
    // 选中的字体本机是否可用;false 时顶栏提示"未安装",避免"切了没反应"无从排查
    fontAvailable: true
  }),
  getters: {
    fontStack: (state) => stackOf(findFont(state.fontKey))
  },
  actions: {
    /** 把持久化的偏好推给 vxe / DOM,应用启动时调一次 */
    init() {
      this.setTableSize(this.tableSize)
      this.setDark(this.dark)
      this.setFont(this.fontKey)
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    setDark(dark: boolean) {
      this.dark = dark
      localStorage.setItem(STORAGE.dark, dark ? '1' : '0')
      VxeUI.setTheme(dark ? 'dark' : 'light')
    },
    toggleDark() {
      this.setDark(!this.dark)
    },
    setTableSize(size: TableSize) {
      this.tableSize = size
      localStorage.setItem(STORAGE.size, size)
      VxeUI.setConfig({ size })
    },
    setFont(key: string) {
      const opt = findFont(key)
      this.fontKey = opt.key
      localStorage.setItem(STORAGE.font, opt.key)
      document.documentElement.style.setProperty('--demo-font-family', stackOf(opt))

      this.fontAvailable = !opt.families?.length || opt.families.some(isFontAvailable)
    }
  }
})
