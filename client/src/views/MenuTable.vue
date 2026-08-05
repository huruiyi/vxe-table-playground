<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'antdv-next'
import type { VxeTableEvents, VxeTableInstance, VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, deleteUser, type UserRow } from '@/api/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const tableRef = ref<VxeTableInstance<UserRow>>()
const loading = ref(false)
const tableData = ref<UserRow[]>([])

const menuConfig = reactive<VxeTablePropTypes.MenuConfig<UserRow>>({
  header: {
    options: [
      [
        { code: 'hideColumn', name: '隐藏该列' },
        { code: 'resetColumn', name: '重置所有列' }
      ]
    ]
  },
  body: {
    options: [
      [
        { code: 'copy', name: '复制单元格内容', prefixIcon: 'vxe-icon-copy' },
        { code: 'edit', name: '编辑该单元格', prefixIcon: 'vxe-icon-edit' }
      ],
      [
        { code: 'remove', name: '删除该行', prefixIcon: 'vxe-icon-delete', className: 'danger-menu' }
      ],
      [{ code: 'reload', name: '刷新数据', prefixIcon: 'vxe-icon-refresh' }]
    ]
  }
})

const menuClick: VxeTableEvents.MenuClick<UserRow> = async ({ menu, row, column }) => {
  const table = tableRef.value
  if (!table) return
  switch (menu.code) {
    case 'hideColumn':
      if (column) {
        table.hideColumn(column)
        message.info(`已隐藏列「${column.title}」,可右键表头重置`)
      }
      break
    case 'resetColumn':
      table.resetColumn()
      message.info('已重置所有列')
      break
    case 'copy':
      if (row && column) {
        const value = String(row[column.field as keyof UserRow] ?? '')
        await navigator.clipboard.writeText(value)
        message.success(`已复制:${value}`)
      }
      break
    case 'edit':
      if (row && column) {
        table.setEditCell(row, column)
      }
      break
    case 'remove':
      if (row) {
        await deleteUser(row.id)
        message.success(`已删除「${row.name}」`)
        await loadData()
      }
      break
    case 'reload':
      await loadData()
      message.success('已刷新')
      break
  }
}

async function loadData() {
  loading.value = true
  try {
    const { list } = await fetchUsers({ page: 1, pageSize: 20 })
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
      <vxe-table
        ref="tableRef"
        :size="appStore.tableSize"
        :data="tableData"
        :loading="loading"
        :menu-config="menuConfig"
        :mouse-config="{ selected: true }"
        :keyboard-config="{ isArrow: true, isTab: true, isEnter: true, isEdit: true, isEsc: true, isDel: true, isBack: true }"
        :edit-config="{ trigger: 'dblclick', mode: 'cell', showStatus: true }"
        height="auto"
        align="center"
        header-align="center"
        @menu-click="menuClick"
      >
        <vxe-column type="seq" title="序号" width="70" />
        <vxe-column field="name" title="姓名" width="120" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column
          field="sex"
          title="性别"
          width="90"
          :formatter="({ cellValue }) => (cellValue === 1 ? '男' : '女')"
        />
        <vxe-column field="age" title="年龄" width="90" :edit-render="{ name: 'VxeNumberInput' }" />
        <vxe-column field="role" title="岗位" width="110" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column field="phone" title="电话" width="150" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column field="email" title="邮箱" min-width="180" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column field="address" title="地址" min-width="160" :edit-render="{ name: 'VxeInput' }" />
      </vxe-table>
    </div>
  </div>
</template>
