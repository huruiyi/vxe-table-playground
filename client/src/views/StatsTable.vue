<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Switch } from 'antdv-next'
import type { VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const loading = ref(false)
const tableData = ref<UserRow[]>([])

const enableMerge = ref(true)
const enableHighlight = ref(true)

// 表尾:合计行 + 平均行
const footerMethod: VxeTablePropTypes.FooterMethod<UserRow> = ({ columns, data }) => {
  const sum = (field: keyof UserRow) => data.reduce((acc, row) => acc + Number(row[field] || 0), 0)
  return [
    columns.map((column, index) => {
      if (index === 0) return '合计'
      if (column.field === 'salary') return `¥${sum('salary').toLocaleString()}`
      if (column.field === 'name') return `${data.length} 人`
      return ''
    }),
    columns.map((column, index) => {
      if (index === 0) return '平均'
      if (!data.length) return ''
      if (column.field === 'salary') return `¥${Math.round(sum('salary') / data.length).toLocaleString()}`
      if (column.field === 'age') return (sum('age') / data.length).toFixed(1)
      return ''
    })
  ]
}

// 按岗位分组:同岗位的"岗位"列纵向合并(数据已按 role 排序)
const spanMethod: VxeTablePropTypes.SpanMethod<UserRow> = ({ row, rowIndex, column, visibleData }) => {
  if (!enableMerge.value || column.field !== 'role') return
  const prevRow = visibleData[rowIndex - 1]
  if (prevRow && prevRow.role === row.role) {
    return { rowspan: 0, colspan: 0 }
  }
  let count = 1
  while (visibleData[rowIndex + count] && visibleData[rowIndex + count].role === row.role) {
    count++
  }
  return { rowspan: count, colspan: 1 }
}

// 条件样式:高薪单元格高亮、禁用行灰化
const cellStyle: VxeTablePropTypes.CellStyle<UserRow> = ({ row, column }) => {
  if (enableHighlight.value && column.field === 'salary' && Number(row.salary) > 40000) {
    return { backgroundColor: '#fff7e6', color: '#d46b08', fontWeight: 'bold' }
  }
}

const rowStyle: VxeTablePropTypes.RowStyle<UserRow> = ({ row }) => {
  if (enableHighlight.value && row.status === 0) {
    return { color: '#bbb', textDecoration: 'line-through' }
  }
}

async function loadData() {
  loading.value = true
  try {
    // 按岗位排序取 50 条,保证同岗位相邻以便合并
    const { list } = await fetchUsers({ page: 1, pageSize: 50, sortField: 'id', sortOrder: 'asc' })
    list.sort((a, b) => a.role.localeCompare(b.role) || a.id - b.id)
    tableData.value = list
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card">
      <div class="demo-toolbar">
        <span>岗位列合并 <Switch v-model:checked="enableMerge" size="small" /></span>
        <span>条件样式 <Switch v-model:checked="enableHighlight" size="small" /></span>
      </div>
      <div class="table-wrap">
      <vxe-table
        :size="appStore.tableSize"
        :data="tableData"
        :loading="loading"
        :span-method="spanMethod"
        :footer-method="footerMethod"
        :cell-style="cellStyle"
        :row-style="rowStyle"
        show-footer
        height="auto"
        align="center"
        header-align="center"
      >
        <vxe-column type="seq" title="序号" width="80" />
        <vxe-column field="role" title="岗位" width="110" />
        <vxe-column field="name" title="姓名" width="120" />
        <vxe-column
          field="sex"
          title="性别"
          width="90"
          :formatter="({ cellValue }) => (cellValue === 1 ? '男' : '女')"
        />
        <vxe-column field="age" title="年龄" width="90" />
        <vxe-column
          field="salary"
          title="薪资"
          width="150"
          :formatter="({ cellValue }) => `¥${Number(cellValue).toLocaleString()}`"
        />
        <vxe-column field="address" title="地址" min-width="160" />
        <vxe-column
          field="status"
          title="状态"
          width="90"
          :formatter="({ cellValue }) => (cellValue === 1 ? '启用' : '禁用')"
        />
      </vxe-table>
      </div>
    </div>
  </div>
</template>
