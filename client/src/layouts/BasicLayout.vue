<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Layout, LayoutSider, LayoutHeader, LayoutContent,
  Menu, Space, Switch, Segmented, TypographyText
} from 'antdv-next'
import {
  HomeOutlined, TableOutlined, SearchOutlined, FormOutlined, EditOutlined,
  ApartmentOutlined, ThunderboltOutlined, ToolOutlined,
  DragOutlined, ExpandAltOutlined, MenuOutlined, BarChartOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined
} from '@antdv-next/icons'
import { useAppStore, type TableSize } from '@/stores/app'
import { demoRoutes } from '@/router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const iconMap: Record<string, any> = {
  '/overview': HomeOutlined,
  '/basic': TableOutlined,
  '/query': SearchOutlined,
  '/crud': FormOutlined,
  '/edit': EditOutlined,
  '/tree': ApartmentOutlined,
  '/virtual': ThunderboltOutlined,
  '/toolbar': ToolOutlined,
  '/drag': DragOutlined,
  '/expand': ExpandAltOutlined,
  '/menu': MenuOutlined,
  '/stats': BarChartOutlined
}

const menuItems = computed(() =>
  demoRoutes.map((r) => ({
    key: r.path,
    label: (r.meta?.title as string) || r.path,
    icon: iconMap[r.path] ? () => h(iconMap[r.path]) : undefined
  }))
)

const selectedKeys = computed(() => [route.path])

function onMenuClick({ key }: { key: string | number }) {
  router.push(String(key))
}

const sizeOptions = [
  { label: '迷你', value: 'mini' },
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' }
]

function onSizeChange(val: string | number) {
  appStore.setTableSize(val as TableSize)
}

const pageTitle = computed(() => (route.meta?.title as string) || '')
</script>

<template>
  <Layout style="height: 100%">
    <LayoutSider
      v-model:collapsed="appStore.collapsed"
      collapsible
      :trigger="null"
      theme="light"
      :width="220"
      class="layout-sider"
    >
      <div class="logo">
        <span class="logo-mark">V</span>
        <span v-if="!appStore.collapsed" class="logo-text">vxe-table 演示</span>
      </div>
      <div class="menu-scroll">
        <Menu
          theme="light"
          mode="inline"
          :items="menuItems"
          :selected-keys="selectedKeys"
          @click="onMenuClick"
        />
      </div>
    </LayoutSider>
    <Layout>
      <LayoutHeader class="layout-header">
        <Space :size="12">
          <component
            :is="appStore.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            class="trigger"
            @click="appStore.toggleCollapsed()"
          />
          <TypographyText strong class="page-title">{{ pageTitle }}</TypographyText>
        </Space>
        <Space :size="20">
          <span class="header-field">
            <span class="header-label">表格尺寸</span>
            <Segmented :value="appStore.tableSize" :options="sizeOptions" @change="onSizeChange" />
          </span>
          <span class="header-field">
            <span class="header-label">暗色</span>
            <Switch :checked="appStore.dark" @change="appStore.toggleDark()" />
          </span>
        </Space>
      </LayoutHeader>
      <LayoutContent class="layout-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<style scoped>
/* ── 侧边栏(亮色) ── */
.layout-sider {
  background: var(--demo-sider-bg);
  border-inline-end: 1px solid var(--demo-border);
  display: flex;
  flex-direction: column;
}

.layout-sider :deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.logo {
  height: 60px;
  flex: none;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--demo-border);
  overflow: hidden;
}

.logo-mark {
  flex: none;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #4c8dff, #1552d8);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(22, 119, 255, 0.35);
}

.logo-text {
  color: var(--demo-text-1);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-scroll :deep(.ant-menu) {
  background: transparent;
  border-inline-end: none;
}

.menu-scroll :deep(.ant-menu-item) {
  height: 42px;
  line-height: 42px;
  margin-inline: 8px;
  width: calc(100% - 16px);
  border-radius: 10px;
}

.menu-scroll :deep(.ant-menu-item-selected) {
  font-weight: 600;
}

/* ── 顶栏 ── */
.layout-header {
  height: 60px;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--demo-header-bg);
  border-bottom: 1px solid var(--demo-border);
}

.page-title {
  font-size: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: var(--demo-text-2);
  transition: background-color 0.2s, color 0.2s;
}

.trigger:hover {
  background: var(--demo-primary-soft);
  color: var(--demo-primary);
}

.header-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.header-label {
  color: var(--demo-text-2);
  font-size: 13px;
}

/* ── 内容区 ── */
.layout-content {
  padding: 16px;
  overflow: auto;
  background: var(--demo-bg-layout);
}
</style>
