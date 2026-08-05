<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Space, Switch, Tag, Progress } from 'antdv-next'
import type { VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'

const loading = ref(false)
const tableData = ref<UserRow[]>([])

const showBorder = ref(true)
const showStripe = ref(true)
const showEmpty = ref(false)
const enableMerge = ref(false)

// 静态单元格合并示例:第 1、2 行的"姓名"列合并
const mergeCells = ref<VxeTablePropTypes.MergeCells>([
  { row: 0, col: 2, rowspan: 2, colspan: 1 },
  { row: 3, col: 3, rowspan: 1, colspan: 2 }
])

function sexLabel(sex: number) {
  return sex === 1 ? '男' : '女'
}

function roleColor(role: string) {
  const map: Record<string, string> = {
    前端: 'blue',
    后端: 'green',
    测试: 'orange',
    产品: 'purple',
    设计: 'magenta'
  }
  return map[role] || 'default'
}

function salaryPercent(salary: string | number) {
  return Math.min(100, Math.round((Number(salary) / 50000) * 100))
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
        <Space :size="16">
          <span>边框 <Switch v-model:checked="showBorder" size="small" /></span>
          <span>斑马纹 <Switch v-model:checked="showStripe" size="small" /></span>
          <span>单元格合并 <Switch v-model:checked="enableMerge" size="small" /></span>
          <span>空数据 <Switch v-model:checked="showEmpty" size="small" /></span>
        </Space>
      </div>
      <div class="table-wrap">
      <vxe-table
        :data="showEmpty ? [] : tableData"
        :loading="loading"
        :border="showBorder"
        :stripe="showStripe"
        :merge-cells="enableMerge ? mergeCells : []"
        height="auto"
        align="center"
        header-align="center"
        show-overflow
      >
        <vxe-column type="seq" title="序号" width="70" fixed="left" />
        <vxe-column type="checkbox" width="50" fixed="left" />
        <vxe-column field="name" title="姓名" width="110" fixed="left">
          <template #default="{ row }">
            <b>{{ row.name }}</b>
          </template>
        </vxe-column>
        <vxe-colgroup title="基本信息">
          <vxe-column field="sex" title="性别" width="80">
            <template #default="{ row }">{{ sexLabel(row.sex) }}</template>
          </vxe-column>
          <vxe-column field="age" title="年龄" width="80" />
          <vxe-column field="role" title="岗位" width="100">
            <template #default="{ row }">
              <Tag :color="roleColor(row.role)">{{ row.role }}</Tag>
            </template>
          </vxe-column>
        </vxe-colgroup>
        <vxe-colgroup title="联系方式">
          <vxe-column field="phone" title="电话" width="140" />
          <vxe-column field="email" title="邮箱" min-width="180" />
          <vxe-column field="address" title="地址" min-width="160" />
        </vxe-colgroup>
        <vxe-column field="salary" title="薪资" width="200" fixed="right">
          <template #default="{ row }">
            <Progress
              :percent="salaryPercent(row.salary)"
              size="small"
              :format="() => `¥${Number(row.salary).toLocaleString()}`"
            />
          </template>
        </vxe-column>
        <vxe-column field="status" title="状态" width="90" fixed="right">
          <template #default="{ row }">
            <Tag :color="row.status === 1 ? 'success' : 'error'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </Tag>
          </template>
        </vxe-column>
      </vxe-table>
      </div>
    </div>
  </div>
</template>
