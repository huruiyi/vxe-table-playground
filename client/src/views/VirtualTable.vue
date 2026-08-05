<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RadioGroup, Switch, Tag } from 'antdv-next'
import type { VxeTablePropTypes } from 'vxe-table'
import { fetchBigData, type BigRow } from '@/api/bigdata'

const loading = ref(false)
const tableData = ref<BigRow[]>([])
const loadTime = ref(0)

const rowCount = ref(10000)
const rowOptions = [
  { label: '1 万行', value: 10000 },
  { label: '5 万行', value: 50000 },
  { label: '10 万行', value: 100000 }
]

const wideMode = ref(false)
const extraCols = 100

const dynamicColumns = ref<{ field: string; title: string; width: number }[]>([])

// gt: 0 表示始终开启虚拟滚动
const scrollY: VxeTablePropTypes.ScrollY = { enabled: true, gt: 0 }
const scrollX: VxeTablePropTypes.ScrollX = { enabled: true, gt: 0 }

const roleColors: Record<string, string> = {
  前端: 'blue',
  后端: 'green',
  测试: 'orange',
  产品: 'purple',
  设计: 'magenta'
}

async function loadData() {
  loading.value = true
  const start = performance.now()
  try {
    const cols = wideMode.value ? extraCols : 0
    const { list } = await fetchBigData(rowCount.value, cols)
    tableData.value = list
    dynamicColumns.value = wideMode.value
      ? Array.from({ length: extraCols }, (_, c) => ({
          field: `col${c}`,
          title: `扩展列 ${c + 1}`,
          width: 100
        }))
      : []
    loadTime.value = Math.round(performance.now() - start)
  } finally {
    loading.value = false
  }
}

// 用 watch 而不是控件的 @change:antd 的 change 事件先于 v-model 写值触发,
// 直接在 @change 里调 loadData 会拿到旧值(宽表模式请求不到扩展列数据)
watch([rowCount, wideMode], loadData)

onMounted(loadData)
</script>

<template>
  <div class="page-fill">
    <div class="page-card fill-card">
      <div class="demo-toolbar">
        <RadioGroup v-model:value="rowCount" :options="rowOptions" option-type="button" />
        <label class="wide-switch">
          <Switch v-model:checked="wideMode" size="small" />
          100 列宽表
        </label>
        <div class="toolbar-metrics">
          <span class="metric">
            数据行数<b>{{ tableData.length.toLocaleString() }}</b>
          </span>
          <span class="metric">
            加载耗时<b>{{ loadTime }} ms</b>
          </span>
        </div>
      </div>
      <div class="table-wrap">
        <vxe-table
          :data="tableData"
          :loading="loading"
          :scroll-y="scrollY"
          :scroll-x="scrollX"
          :row-config="{ isHover: true }"
          height="auto"
          stripe
          show-overflow
          align="center"
          header-align="center"
        >
          <vxe-column type="seq" title="序号" width="70" fixed="left" />
          <vxe-column field="name" title="姓名" width="110" fixed="left" />
          <vxe-column field="role" title="岗位" width="90">
            <template #default="{ row }">
              <Tag :color="roleColors[row.role]" :bordered="false">{{ row.role }}</Tag>
            </template>
          </vxe-column>
          <vxe-column
            field="sex"
            title="性别"
            width="70"
            :formatter="({ cellValue }) => (cellValue === 1 ? '男' : '女')"
          />
          <vxe-column field="age" title="年龄" width="70" />
          <vxe-column
            field="salary"
            title="薪资"
            width="110"
            align="right"
            :formatter="({ cellValue }) => `¥${Number(cellValue).toLocaleString()}`"
          />
          <vxe-column field="rate" title="完成率" width="140">
            <template #default="{ row }">
              <span class="rate-cell">
                <span class="rate-bar">
                  <span class="rate-bar--inner" :style="{ width: `${Math.round(row.rate * 100)}%` }" />
                </span>
                <span class="rate-text">{{ Math.round(row.rate * 100) }}%</span>
              </span>
            </template>
          </vxe-column>
          <vxe-column field="address" title="地址" min-width="160" />
          <vxe-column
            v-for="col in dynamicColumns"
            :key="col.field"
            :field="col.field"
            :title="col.title"
            :width="col.width"
          />
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wide-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
}

/* 指标信息:靠右、弱化,不抢表格视觉焦点(用 vxe 主题变量,暗色模式自动适配) */
.toolbar-metrics {
  margin-left: auto;
  display: flex;
  gap: 24px;
  color: var(--vxe-ui-font-lighten-color);
  font-size: 13px;
}

.metric b {
  margin-left: 6px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--vxe-ui-font-color);
}

/* 完成率:迷你进度条 + 百分比 */
.rate-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.rate-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--vxe-ui-base-hover-background-color);
  overflow: hidden;
}

.rate-bar--inner {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--vxe-ui-font-primary-color);
}

.rate-text {
  width: 38px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--vxe-ui-font-lighten-color);
  font-size: 12px;
}
</style>
