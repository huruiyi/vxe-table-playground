<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button, Space } from 'antdv-next'
import type { VxeGridInstance, VxeGridProps } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'

const gridRef = ref<VxeGridInstance<UserRow>>()

const gridOptions = reactive<VxeGridProps<UserRow>>({
  // id + custom-config.storage:列设置(显隐/排序/固定/列宽)持久化到 localStorage
  id: 'toolbar_demo_grid',
  height: 'auto',
  // 单行显示 + 超出省略,避免表头/单元格被撑成两行
  showOverflow: 'tooltip',
  showHeaderOverflow: 'tooltip',
  // 全表列头 + 单元格居中(表格级默认值,单列可用 align/header-align 覆盖)
  align: 'center',
  headerAlign: 'center',
  customConfig: {
    storage: true
  },
  columnConfig: {
    resizable: true,
    drag: true
  },
  columnDragConfig: {
    // 勾选列不显示拖拽手柄,其余列保留列拖拽排序
    visibleMethod: ({ column }) => column.type !== 'checkbox'
  },
  rowConfig: {
    keyField: 'id',
    isHover: true
  },
  checkboxConfig: {
    // 点击整行任意位置即可勾选,不必精确点中 checkbox
    trigger: 'row',
    // 勾选后整行高亮
    highlight: true,
    // 按住 shift 点击可范围勾选
    isShiftKey: true
  },
  columns: [
    // 只有勾选/序号列用固定 width,其余用 minWidth,剩余宽度由 vxe 按比例分配(自适应)
    { type: 'checkbox', width: 44 },
    { type: 'seq', title: '序号', width: 70 },
    { field: 'name', title: '姓名', minWidth: 110, sortable: true },
    { field: 'sex', title: '性别', minWidth: 80, formatter: ({ cellValue }) => (cellValue === 1 ? '男' : '女') },
    // 带排序图标的列要预留图标宽度,否则标题会换行
    { field: 'age', title: '年龄', minWidth: 100, sortable: true },
    { field: 'role', title: '岗位', minWidth: 100 },
    { field: 'phone', title: '电话', minWidth: 140 },
    { field: 'email', title: '邮箱', minWidth: 180 },
    {
      field: 'salary', title: '薪资', minWidth: 120, sortable: true,
      formatter: ({ cellValue }) => Number(cellValue).toLocaleString()
    },
    { field: 'join_date', title: '入职日期', minWidth: 120, sortable: true },
    { field: 'status', title: '状态', minWidth: 90, formatter: ({ cellValue }) => (cellValue === 1 ? '启用' : '禁用') }
  ],
  toolbarConfig: {
    refresh: true,
    zoom: true,
    print: true,
    export: true,
    import: true,
    custom: true,
    slots: { buttons: 'toolbar_buttons' }
  },
  exportConfig: {
    filename: 'vxe-用户数据',
    types: ['xlsx', 'csv', 'html', 'xml', 'txt'],
    modes: ['current', 'selected', 'all']
  },
  importConfig: {
    types: ['xlsx', 'csv', 'html', 'xml', 'txt']
  },
  printConfig: {},
  pagerConfig: { pageSize: 50, pageSizes: [20, 50, 100] },
  // remote:排序交给服务端,否则只会对当前这一页的数据排序
  sortConfig: { remote: true, trigger: 'cell' },
  proxyConfig: {
    // 必须显式开启,代理才会监听 sort-change 并携带 sorts 重新发起查询(默认 false)
    sort: true,
    response: { result: 'list', total: 'total' },
    ajax: {
      query: ({ page, sorts }) => {
        const sort = sorts[0]
        return fetchUsers({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortField: sort?.field,
          sortOrder: sort?.order
        })
      }
    }
  }
})

// 代码方式触发导出/打印(与工具栏按钮等价)
function exportCsv() {
  gridRef.value?.exportData({ type: 'csv', filename: 'vxe-用户数据' })
}

function openExportModal() {
  gridRef.value?.openExport()
}

function openImportModal() {
  gridRef.value?.openImport()
}

function doPrint() {
  gridRef.value?.print()
}

function resetCustom() {
  gridRef.value?.resetCustom()
}
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card">
      <vxe-grid ref="gridRef" v-bind="gridOptions">
        <template #toolbar_buttons>
          <Space>
            <Button size="small" @click="exportCsv">快捷导出 CSV</Button>
            <Button size="small" @click="openExportModal">高级导出</Button>
            <Button size="small" @click="openImportModal">导入</Button>
            <Button size="small" @click="doPrint">打印</Button>
            <Button size="small" @click="resetCustom">重置列设置</Button>
          </Space>
        </template>
      </vxe-grid>
    </div>
  </div>
</template>
