import type { App } from 'vue'
import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import zhCN from 'vxe-pc-ui/lib/language/zh-CN'
import VxeUIPluginExportXLSX from '@vxe-ui/plugin-export-xlsx'
import ExcelJS from 'exceljs'

export function setupVxe(app: App) {
  VxeUI.use(VxeUIPluginExportXLSX, { ExcelJS })
  VxeUI.setI18n('zh-CN', zhCN)
  VxeUI.setLanguage('zh-CN')
  VxeUI.setConfig({
    size: 'medium',
    table: {
      border: true,
      stripe: true,
      round: true,
      showOverflow: true,
      columnConfig: { resizable: true }
    },
    grid: {
      toolbarConfig: { refresh: true, zoom: true, custom: true }
    }
  })
  app.use(VxeUI)
  app.use(VxeUITable)
}

export { VxeUI }
