<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Form, FormItem, Input, Select, Button, Space } from 'antdv-next'
import type { VxeGridInstance, VxeGridProps } from 'vxe-table'
import { fetchUsers, type UserRow } from '@/api/user'
import { useDemoStore } from '@/stores/demo'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const demoStore = useDemoStore()
const gridRef = ref<VxeGridInstance<UserRow>>()

const roleOptions = ['前端', '后端', '测试', '产品', '设计'].map((v) => ({ label: v, value: v }))
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const gridOptions = reactive<VxeGridProps<UserRow>>({
  height: 'auto',
  align: 'center',
  headerAlign: 'center',
  loading: false,
  columns: [
    { type: 'seq', title: '序号', width: 70 },
    { field: 'name', title: '姓名', width: 110, sortable: true },
    {
      field: 'sex',
      title: '性别',
      width: 100,
      filters: [
        { label: '男', value: 1 },
        { label: '女', value: 0 }
      ],
      formatter: ({ cellValue }) => (cellValue === 1 ? '男' : '女')
    },
    { field: 'age', title: '年龄', width: 90, sortable: true },
    { field: 'role', title: '岗位', width: 100 },
    { field: 'phone', title: '电话', width: 140 },
    { field: 'email', title: '邮箱', minWidth: 180 },
    {
      field: 'salary',
      title: '薪资',
      width: 120,
      sortable: true,
      formatter: ({ cellValue }) => `¥${Number(cellValue).toLocaleString()}`
    },
    { field: 'join_date', title: '入职日期', width: 120, sortable: true },
    {
      field: 'status',
      title: '状态',
      width: 90,
      formatter: ({ cellValue }) => (cellValue === 1 ? '启用' : '禁用')
    }
  ],
  // 服务端排序 & 筛选
  sortConfig: { remote: true, trigger: 'cell' },
  filterConfig: { remote: true },
  pagerConfig: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100]
  },
  proxyConfig: {
    // 响应结构映射:后端返回 {list,total}(request.ts 已解包 data)
    response: { result: 'list', total: 'total' },
    autoLoad: true,
    // 必须显式开启,代理才会监听排序/筛选变化并重新发起查询(默认 false)
    sort: true,
    filter: true,
    ajax: {
      query: ({ page, sorts, filters }) => {
        const sort = sorts[0]
        const filterSex = filters.find((f) => f.field === 'sex')
        return fetchUsers({
          page: page.currentPage,
          pageSize: page.pageSize,
          name: demoStore.queryForm.name || undefined,
          role: demoStore.queryForm.role || undefined,
          status: demoStore.queryForm.status,
          // 列头筛选优先,否则用表单里的性别条件
          sex: filterSex ? (filterSex.values[0] as number) : demoStore.queryForm.sex,
          sortField: sort?.field,
          sortOrder: sort?.order
        })
      }
    }
  }
})

function handleSearch() {
  gridRef.value?.commitProxy('query')
}

function handleReset() {
  demoStore.resetQueryForm()
  gridRef.value?.clearFilter()
  gridRef.value?.clearSort()
  gridRef.value?.commitProxy('query')
}
</script>

<template>
  <div class="page-fill">
    <div class="page-card">
      <Form layout="inline" style="margin-bottom: 4px">
        <FormItem label="姓名">
          <Input
            v-model:value="demoStore.queryForm.name"
            placeholder="模糊搜索"
            allow-clear
            style="width: 160px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem label="岗位">
          <Select
            v-model:value="demoStore.queryForm.role"
            :options="roleOptions"
            placeholder="全部"
            allow-clear
            style="width: 120px"
          />
        </FormItem>
        <FormItem label="状态">
          <Select
            v-model:value="demoStore.queryForm.status"
            :options="statusOptions"
            placeholder="全部"
            allow-clear
            style="width: 120px"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">查询</Button>
            <Button @click="handleReset">重置</Button>
          </Space>
        </FormItem>
      </Form>
    </div>
    <div class="page-card fill-card">
      <vxe-grid ref="gridRef" v-bind="gridOptions" :size="appStore.tableSize" />
    </div>
  </div>
</template>
