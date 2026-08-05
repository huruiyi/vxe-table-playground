<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'antdv-next'
import ToolbarSwitch from '@/components/ToolbarSwitch.vue'
import type { VxeTableEvents, VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const loading = ref(false)
const tableData = ref<UserRow[]>([])

const rowDragEnabled = ref(true)
const colDragEnabled = ref(true)

const rowDragConfig = ref<VxeTablePropTypes.RowDragConfig<UserRow>>({
  showIcon: true,
  showGuidesStatus: true,
  showDragTip: true,
  animation: true,
  trigger: 'default'
})

const columnDragConfig = ref<VxeTablePropTypes.ColumnDragConfig<UserRow>>({
  showIcon: true,
  showGuidesStatus: true,
  showDragTip: true,
  animation: true,
  trigger: 'default'
})

const rowDragend: VxeTableEvents.RowDragend<UserRow> = ({ oldRow, newRow, dragPos }) => {
  message.success(`「${oldRow.name}」已拖到「${newRow.name}」${dragPos === 'top' ? '上方' : '下方'}`)
}

const columnDragend: VxeTableEvents.ColumnDragend<UserRow> = ({ oldColumn, newColumn }) => {
  message.success(`列「${oldColumn.title}」已与「${newColumn.title}」换位`)
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
      <div class="demo-toolbar">
        <ToolbarSwitch v-model="rowDragEnabled" label="行拖拽" />
        <ToolbarSwitch v-model="colDragEnabled" label="列拖拽" />
      </div>
      <div class="table-wrap">
      <vxe-table
        :size="appStore.tableSize"
        :data="tableData"
        :loading="loading"
        :row-drag-config="rowDragEnabled ? rowDragConfig : { showIcon: false }"
        :column-drag-config="colDragEnabled ? columnDragConfig : undefined"
        height="auto"
        align="center"
        header-align="center"
        @row-dragend="rowDragend"
        @column-dragend="columnDragend"
      >
        <vxe-column type="seq" title="序号" width="90" :drag-sort="rowDragEnabled" />
        <vxe-column field="name" title="姓名" width="120" />
        <vxe-column
          field="sex"
          title="性别"
          width="90"
          :formatter="({ cellValue }) => (cellValue === 1 ? '男' : '女')"
        />
        <vxe-column field="age" title="年龄" width="90" />
        <vxe-column field="role" title="岗位" width="110" />
        <vxe-column field="phone" title="电话" width="150" />
        <vxe-column field="email" title="邮箱" min-width="180" />
        <vxe-column
          field="salary"
          title="薪资"
          width="130"
          :formatter="({ cellValue }) => `¥${Number(cellValue).toLocaleString()}`"
        />
      </vxe-table>
      </div>
    </div>
  </div>
</template>
