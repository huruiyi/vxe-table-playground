import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const demoRoutes: RouteRecordRaw[] = [
  {
    path: '/overview',
    name: 'Overview',
    meta: { title: '功能总览' },
    component: () => import('@/views/Overview.vue')
  },
  {
    path: '/basic',
    name: 'Basic',
    meta: { title: '基础表格' },
    component: () => import('@/views/BasicTable.vue')
  },
  {
    path: '/query',
    name: 'Query',
    meta: { title: '查询 + 服务端分页' },
    component: () => import('@/views/QueryTable.vue')
  },
  {
    path: '/crud',
    name: 'Crud',
    meta: { title: '完整 CRUD' },
    component: () => import('@/views/CrudTable.vue')
  },
  {
    path: '/edit',
    name: 'Edit',
    meta: { title: '可编辑表格' },
    component: () => import('@/views/EditTable.vue')
  },
  {
    path: '/tree',
    name: 'Tree',
    meta: { title: '树形表格' },
    component: () => import('@/views/TreeTable.vue')
  },
  {
    path: '/virtual',
    name: 'Virtual',
    meta: { title: '大数据虚拟滚动' },
    component: () => import('@/views/VirtualTable.vue')
  },
  {
    path: '/toolbar',
    name: 'Toolbar',
    meta: { title: '工具栏与导入导出' },
    component: () => import('@/views/ToolbarTable.vue')
  },
  {
    path: '/drag',
    name: 'Drag',
    meta: { title: '拖拽排序' },
    component: () => import('@/views/DragTable.vue')
  },
  {
    path: '/expand',
    name: 'Expand',
    meta: { title: '展开行' },
    component: () => import('@/views/ExpandTable.vue')
  },
  {
    path: '/menu',
    name: 'ContextMenu',
    meta: { title: '右键菜单与键盘' },
    component: () => import('@/views/MenuTable.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    meta: { title: '合计与合并' },
    component: () => import('@/views/StatsTable.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/overview' },
    ...demoRoutes
  ]
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  document.title = title ? `${title} - vxe-table 演示` : 'vxe-table 演示'
})

export default router
