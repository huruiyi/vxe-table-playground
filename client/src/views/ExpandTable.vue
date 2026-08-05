<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button, Space, Descriptions, DescriptionsItem, Tag } from 'antdv-next'
import ToolbarSwitch from '@/components/ToolbarSwitch.vue'
import type { VxeTableInstance, VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const tableRef = ref<VxeTableInstance<UserRow>>()
const loading = ref(false)
const tableData = ref<UserRow[]>([])

const accordion = ref(false)

const expandConfig = computed<VxeTablePropTypes.ExpandConfig<UserRow>>(() => ({
  accordion: accordion.value,
  showIcon: true
}))

function expandAll() {
  tableRef.value?.setAllRowExpand(true)
}

function collapseAll() {
  tableRef.value?.clearRowExpand()
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
        <Space>
          <Button @click="expandAll" :disabled="accordion">展开全部</Button>
          <Button @click="collapseAll">收起全部</Button>
        </Space>
        <ToolbarSwitch v-model="accordion" label="手风琴模式" />
      </div>
      <div class="table-wrap">
      <vxe-table
        ref="tableRef"
        :size="appStore.tableSize"
        :data="tableData"
        :loading="loading"
        :expand-config="expandConfig"
        height="auto"
        align="center"
        header-align="center"
      >
        <vxe-column type="expand" width="60">
          <template #content="{ row }">
            <div style="padding: 12px 24px">
              <Descriptions :title="`${row.name} 的详细信息`" bordered size="small" :column="3">
                <DescriptionsItem label="ID">{{ row.id }}</DescriptionsItem>
                <DescriptionsItem label="昵称">{{ row.nickname }}</DescriptionsItem>
                <DescriptionsItem label="性别">{{ row.sex === 1 ? '男' : '女' }}</DescriptionsItem>
                <DescriptionsItem label="年龄">{{ row.age }}</DescriptionsItem>
                <DescriptionsItem label="岗位">
                  <Tag color="blue">{{ row.role }}</Tag>
                </DescriptionsItem>
                <DescriptionsItem label="部门 ID">{{ row.dept_id }}</DescriptionsItem>
                <DescriptionsItem label="电话">{{ row.phone }}</DescriptionsItem>
                <DescriptionsItem label="邮箱">{{ row.email }}</DescriptionsItem>
                <DescriptionsItem label="地址">{{ row.address }}</DescriptionsItem>
                <DescriptionsItem label="薪资">¥{{ Number(row.salary).toLocaleString() }}</DescriptionsItem>
                <DescriptionsItem label="入职日期">{{ row.join_date }}</DescriptionsItem>
                <DescriptionsItem label="状态">
                  <Tag :color="row.status === 1 ? 'success' : 'error'">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                  </Tag>
                </DescriptionsItem>
                <DescriptionsItem label="创建时间">{{ row.created_at }}</DescriptionsItem>
                <DescriptionsItem label="更新时间" :span="2">{{ row.updated_at }}</DescriptionsItem>
              </Descriptions>
            </div>
          </template>
        </vxe-column>
        <vxe-column type="seq" title="序号" width="70" />
        <vxe-column field="name" title="姓名" width="120" />
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
