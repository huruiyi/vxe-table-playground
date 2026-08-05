<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Button, Space, RadioGroup, Tag, message } from 'antdv-next'
import type { VxeTableInstance, VxeTablePropTypes } from 'vxe-table'
import { fetchUsers, batchSaveUsers, type UserRow } from '@/api/user'

const tableRef = ref<VxeTableInstance<UserRow>>()
const loading = ref(false)
const tableData = ref<UserRow[]>([])

const roleOptions = ['前端', '后端', '测试', '产品', '设计'].map((v) => ({ label: v, value: v }))
const sexOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]

// cell(单元格点击) / row(整行) 两种编辑模式切换
const editMode = ref<'cell' | 'row'>('cell')
const modeOptions = [
  { label: '单元格模式 (cell)', value: 'cell' },
  { label: '行模式 (row)', value: 'row' }
]

const editConfig = computed<VxeTablePropTypes.EditConfig<UserRow>>(() => ({
  trigger: 'click',
  mode: editMode.value,
  showStatus: true,
  autoClear: true
}))

// 校验规则
const editRules = reactive<VxeTablePropTypes.EditRules<UserRow>>({
  name: [
    { required: true, message: '姓名必填' },
    { min: 2, max: 20, message: '长度 2 - 20 个字符' }
  ],
  age: [
    {
      validator({ cellValue }) {
        if (cellValue != null && (Number(cellValue) < 16 || Number(cellValue) > 70)) {
          return new Error('年龄应在 16 - 70 之间')
        }
      }
    }
  ],
  role: [{ required: true, message: '岗位必选' }]
})

async function loadData() {
  loading.value = true
  try {
    const { list } = await fetchUsers({ page: 1, pageSize: 20 })
    tableData.value = list
  } finally {
    loading.value = false
  }
}

// 新增一行(插入到顶部并激活编辑)
async function handleInsert() {
  const table = tableRef.value
  if (!table) return
  const record = { sex: 1, age: 25, status: 1, salary: 10000 }
  const { row } = await table.insertAt(record, null)
  await table.setEditRow(row)
}

// 删除勾选行(标记为待删除,保存时提交)
async function handleRemoveChecked() {
  const table = tableRef.value
  if (!table) return
  const rows = table.getCheckboxRecords()
  if (!rows.length) {
    message.warning('请先勾选要删除的行')
    return
  }
  await table.remove(rows)
}

// 还原所有更改
async function handleRevert() {
  await tableRef.value?.revertData()
  message.info('已还原所有更改')
}

// 校验 + 获取增删改集 + 提交
async function handleSave() {
  const table = tableRef.value
  if (!table) return
  const errMap = await table.validate(true)
  if (errMap) {
    message.error('校验不通过,请检查红色标记的单元格')
    return
  }
  const { insertRecords, updateRecords, removeRecords } = table.getRecordset()
  if (!insertRecords.length && !updateRecords.length && !removeRecords.length) {
    message.info('没有需要保存的更改')
    return
  }
  const ret = await batchSaveUsers({ insertRecords, updateRecords, removeRecords })
  message.success(`保存成功:新增 ${ret.inserted} 条,更新 ${ret.updated} 条,删除 ${ret.removed} 条`)
  await loadData()
}

const pendingText = ref('')

function refreshPending() {
  const table = tableRef.value
  if (!table) return
  const { insertRecords, updateRecords, removeRecords } = table.getRecordset()
  pendingText.value = `待新增 ${insertRecords.length} / 待更新 ${updateRecords.length} / 待删除 ${removeRecords.length}`
}

onMounted(loadData)
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card">
      <div class="demo-toolbar">
        <RadioGroup v-model:value="editMode" :options="modeOptions" option-type="button" />
        <Space>
          <Button @click="handleInsert">新增一行</Button>
          <Button danger @click="handleRemoveChecked">删除勾选</Button>
          <Button @click="handleRevert">还原更改</Button>
          <Button type="primary" @click="handleSave">校验并保存</Button>
        </Space>
        <Tag v-if="pendingText" color="processing">{{ pendingText }}</Tag>
      </div>
      <div class="table-wrap">
      <vxe-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        :edit-config="editConfig"
        :edit-rules="editRules"
        height="auto"
        align="center"
        header-align="center"
        keep-source
        @edit-closed="refreshPending"
        @checkbox-change="refreshPending"
        @checkbox-all="refreshPending"
      >
        <vxe-column type="checkbox" width="50" />
        <vxe-column type="seq" title="序号" width="70" />
        <vxe-column field="name" title="姓名" width="130" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column
          field="sex"
          title="性别"
          width="100"
          :edit-render="{ name: 'VxeSelect', options: sexOptions }"
          :formatter="({ cellValue }) => (cellValue === 1 ? '男' : cellValue === 0 ? '女' : '')"
        />
        <vxe-column
          field="age"
          title="年龄"
          width="110"
          :edit-render="{ name: 'VxeNumberInput', props: { min: 0, max: 120 } }"
        />
        <vxe-column
          field="role"
          title="岗位"
          width="120"
          :edit-render="{ name: 'VxeSelect', options: roleOptions }"
        />
        <vxe-column field="email" title="邮箱" min-width="180" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column
          field="salary"
          title="薪资"
          width="150"
          :edit-render="{ name: 'VxeNumberInput', props: { type: 'float', digits: 2 } }"
        />
        <vxe-column
          field="join_date"
          title="入职日期"
          width="150"
          :edit-render="{ name: 'VxeDatePicker' }"
        />
      </vxe-table>
      </div>
    </div>
  </div>
</template>
