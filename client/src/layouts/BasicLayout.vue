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
    <LayoutSider v-model:collapsed="appStore.collapsed" collapsible :trigger="null" theme="dark">
      <div class="logo">
        <span v-if="!appStore.collapsed">vxe-table 演示</span>
        <span v-else>vxe</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        :items="menuItems"
        :selected-keys="selectedKeys"
        @click="onMenuClick"
      />
    </LayoutSider>
    <Layout>
      <LayoutHeader class="layout-header">
        <Space :size="16">
          <component
            :is="appStore.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            class="trigger"
            @click="appStore.toggleCollapsed()"
          />
          <TypographyText strong style="font-size: 16px">{{ pageTitle }}</TypographyText>
        </Space>
        <Space :size="16">
          <span>
            表格尺寸:
            <Segmented :value="appStore.tableSize" :options="sizeOptions" @change="onSizeChange" />
          </span>
          <span>
            暗色:
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
.logo {
  height: 48px;
  margin: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: transparent;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
}

.layout-content {
  padding: 16px;
  overflow: auto;
}
</style>
