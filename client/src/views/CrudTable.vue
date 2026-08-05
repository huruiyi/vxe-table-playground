<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  Modal, Form, FormItem, Input, InputNumber, Select, DatePicker, RadioGroup,
  Button, Space, Popconfirm, Tag, message
} from 'antdv-next'
import type { FormInstance } from 'antdv-next'
import dayjs, { Dayjs } from 'dayjs'
import type { VxeGridInstance, VxeGridProps } from 'vxe-table'
import { fetchUsers, createUser, updateUser, deleteUser, batchSaveUsers, type UserRow } from '@/api/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const gridRef = ref<VxeGridInstance<UserRow>>()
const roleOptions = ['前端', '后端', '测试', '产品', '设计'].map((v) => ({ label: v, value: v }))

const gridOptions = reactive<VxeGridProps<UserRow>>({
  height: 'auto',
  align: 'center',
  headerAlign: 'center',
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: '序号', width: 70 },
    { field: 'name', title: '姓名', width: 110, sortable: true },
    { field: 'sex', title: '性别', width: 80, formatter: ({ cellValue }) => (cellValue === 1 ? '男' : '女') },
    { field: 'age', title: '年龄', width: 80, sortable: true },
    { field: 'role', title: '岗位', width: 100 },
    { field: 'phone', title: '电话', width: 140 },
    { field: 'email', title: '邮箱', minWidth: 160 },
    {
      field: 'salary', title: '薪资', width: 120, sortable: true,
      formatter: ({ cellValue }) => `¥${Number(cellValue).toLocaleString()}`
    },
    { field: 'join_date', title: '入职日期', width: 120 },
    { field: 'status', title: '状态', width: 90, slots: { default: 'status_cell' } },
    { title: '操作', width: 150, fixed: 'right', slots: { default: 'action_cell' } }
  ],
  sortConfig: { remote: true, trigger: 'cell' },
  pagerConfig: { pageSize: 20, pageSizes: [10, 20, 50] },
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

// ---------- 新增/编辑弹窗 ----------
interface EditForm {
  id: number | null
  name: string
  sex: 0 | 1
  age: number
  role: string | undefined
  phone: string
  email: string
  salary: number
  joinDate: Dayjs | null
  status: 0 | 1
}

const modalOpen = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const formState = reactive<EditForm>({
  id: null,
  name: '',
  sex: 1,
  age: 25,
  role: undefined,
  phone: '',
  email: '',
  salary: 10000,
  joinDate: null,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  role: [{ required: true, message: '请选择岗位' }],
  email: [{ type: 'email' as const, message: '邮箱格式不正确' }]
}

function openCreate() {
  Object.assign(formState, {
    id: null, name: '', sex: 1, age: 25, role: undefined,
    phone: '', email: '', salary: 10000, joinDate: null, status: 1
  })
  modalOpen.value = true
}

function openEdit(row: UserRow) {
  Object.assign(formState, {
    id: row.id,
    name: row.name,
    sex: row.sex,
    age: row.age,
    role: row.role,
    phone: row.phone,
    email: row.email,
    salary: Number(row.salary),
    joinDate: row.join_date ? dayjs(row.join_date) : null,
    status: row.status
  })
  modalOpen.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const payload = {
      name: formState.name,
      sex: formState.sex,
      age: formState.age,
      role: formState.role,
      phone: formState.phone,
      email: formState.email,
      salary: formState.salary,
      joinDate: formState.joinDate ? formState.joinDate.format('YYYY-MM-DD') : '',
      status: formState.status
    }
    if (formState.id) {
      await updateUser(formState.id, payload as Partial<UserRow>)
      message.success('更新成功')
    } else {
      await createUser(payload as Partial<UserRow>)
      message.success('新增成功')
    }
    modalOpen.value = false
    gridRef.value?.commitProxy('query')
  } finally {
    saving.value = false
  }
}

// ---------- 删除 ----------
async function handleDelete(row: UserRow) {
  await deleteUser(row.id)
  message.success('删除成功')
  gridRef.value?.commitProxy('query')
}

async function handleBatchDelete() {
  const rows = gridRef.value?.getCheckboxRecords() || []
  if (!rows.length) {
    message.warning('请先勾选要删除的行')
    return
  }
  Modal.confirm({
    title: `确认删除选中的 ${rows.length} 条记录?`,
    onOk: async () => {
      await batchSaveUsers({ insertRecords: [], updateRecords: [], removeRecords: rows })
      message.success('批量删除成功')
      gridRef.value?.commitProxy('query')
    }
  })
}
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card">
      <div class="demo-toolbar">
        <Space>
          <Button type="primary" @click="openCreate">新增用户</Button>
          <Button danger @click="handleBatchDelete">批量删除</Button>
        </Space>
      </div>
      <div class="table-wrap">
      <vxe-grid ref="gridRef" v-bind="gridOptions" :size="appStore.tableSize">
        <template #status_cell="{ row }">
          <Tag :color="row.status === 1 ? 'success' : 'error'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template #action_cell="{ row }">
          <Space>
            <Button type="link" size="small" @click="openEdit(row)">编辑</Button>
            <Popconfirm title="确认删除该用户?" @confirm="handleDelete(row)">
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </vxe-grid>
      </div>
    </div>

    <Modal
      v-model:open="modalOpen"
      :title="formState.id ? '编辑用户' : '新增用户'"
      :confirm-loading="saving"
      @ok="handleSubmit"
    >
      <Form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 5 }" style="margin-top: 16px">
        <FormItem label="姓名" name="name">
          <Input v-model:value="formState.name" placeholder="请输入姓名" />
        </FormItem>
        <FormItem label="性别" name="sex">
          <RadioGroup
            v-model:value="formState.sex"
            :options="[
              { label: '男', value: 1 },
              { label: '女', value: 0 }
            ]"
          />
        </FormItem>
        <FormItem label="年龄" name="age">
          <InputNumber v-model:value="formState.age" :min="16" :max="70" style="width: 100%" />
        </FormItem>
        <FormItem label="岗位" name="role">
          <Select v-model:value="formState.role" :options="roleOptions" placeholder="请选择岗位" />
        </FormItem>
        <FormItem label="电话" name="phone">
          <Input v-model:value="formState.phone" placeholder="请输入电话" />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="formState.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="薪资" name="salary">
          <InputNumber v-model:value="formState.salary" :min="0" :step="1000" style="width: 100%" />
        </FormItem>
        <FormItem label="入职日期" name="joinDate">
          <DatePicker v-model:value="formState.joinDate" style="width: 100%" />
        </FormItem>
        <FormItem label="状态" name="status">
          <RadioGroup
            v-model:value="formState.status"
            :options="[
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
