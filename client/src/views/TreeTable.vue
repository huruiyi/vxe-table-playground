<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button, Space, TypographyText } from 'antdv-next'
import type { VxeTableInstance } from 'vxe-table'
import { fetchDeptTree, fetchDeptChildren, type DeptRow } from '@/api/dept'

// ---------- 表一:扁平数据 transform 自动转树 + 树内编辑 ----------
const flatTableRef = ref<VxeTableInstance<DeptRow>>()
const flatLoading = ref(false)
const flatData = ref<DeptRow[]>([])

async function loadFlat() {
  flatLoading.value = true
  try {
    flatData.value = await fetchDeptTree(true)
  } finally {
    flatLoading.value = false
  }
}

function expandAll() {
  flatTableRef.value?.setAllTreeExpand(true)
}

function collapseAll() {
  flatTableRef.value?.clearTreeExpand()
}

// ---------- 表二:懒加载 ----------
const lazyLoading = ref(false)
const lazyData = ref<DeptRow[]>([])

async function loadLazyRoot() {
  lazyLoading.value = true
  try {
    lazyData.value = await fetchDeptChildren(0)
  } finally {
    lazyLoading.value = false
  }
}

function loadChildren({ row }: { row: DeptRow }) {
  return fetchDeptChildren(row.id)
}

onMounted(() => {
  loadFlat()
  loadLazyRoot()
})
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card" style="margin-bottom: 16px">
      <div class="demo-toolbar">
        <TypographyText strong>扁平数据自动转树(可编辑)</TypographyText>
        <Space>
          <Button @click="expandAll">展开全部</Button>
          <Button @click="collapseAll">收起全部</Button>
          <Button @click="loadFlat">刷新</Button>
        </Space>
      </div>
      <div class="table-wrap">
      <vxe-table
        ref="flatTableRef"
        :data="flatData"
        :loading="flatLoading"
        :tree-config="{ transform: true, rowField: 'id', parentField: 'parent_id', expandAll: true }"
        :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
        height="auto"
        align="center"
        header-align="center"
      >
        <!-- 树形列保持左对齐,层级缩进居中会错乱 -->
        <vxe-column field="name" title="部门名称" tree-node min-width="240" align="left" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column field="manager" title="负责人" width="140" :edit-render="{ name: 'VxeInput' }" />
        <vxe-column field="emp_count" title="人数" width="120" />
        <vxe-column field="id" title="ID" width="90" />
        <vxe-column field="parent_id" title="上级 ID" width="100" />
      </vxe-table>
      </div>
    </div>

    <div class="page-card fill-card">
      <div class="demo-toolbar">
        <TypographyText strong>懒加载(展开时请求子节点)</TypographyText>
      </div>
      <div class="table-wrap">
      <vxe-table
        :data="lazyData"
        :loading="lazyLoading"
        :tree-config="{ lazy: true, childrenField: 'children', hasChildField: 'hasChild', loadMethod: loadChildren }"
        height="auto"
        align="center"
        header-align="center"
      >
        <vxe-column field="name" title="部门名称" tree-node min-width="240" align="left" />
        <vxe-column field="manager" title="负责人" width="140" />
        <vxe-column field="emp_count" title="人数" width="120" />
        <vxe-column field="id" title="ID" width="90" />
      </vxe-table>
      </div>
    </div>
  </div>
</template>
