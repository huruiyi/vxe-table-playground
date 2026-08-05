import type { Component } from 'vue'
import {
  TableOutlined, SearchOutlined, FormOutlined, EditOutlined,
  ApartmentOutlined, ThunderboltOutlined, ToolOutlined,
  DragOutlined, ExpandAltOutlined, MenuOutlined, BarChartOutlined
} from '@antdv-next/icons'

export interface DemoIntro {
  path: string
  title: string
  icon: Component
  desc: string
  features: string[]
}

// 各演示页的说明(原先每页顶部的 Alert 文案),集中在功能总览页展示
export const demoIntros: DemoIntro[] = [
  {
    path: '/basic',
    title: '基础表格',
    icon: TableOutlined,
    desc: '边框/斑马纹、固定表头 + 左右固定列、序号列、多级表头、单元格合并、插槽渲染(Tag/进度条)、空数据态,表格尺寸由右上角全局切换。',
    features: ['固定列', '多级表头', '单元格合并', '插槽渲染']
  },
  {
    path: '/query',
    title: '查询 + 服务端分页',
    icon: SearchOutlined,
    desc: 'vxe-grid proxy-config 对接后端接口 —— 服务端分页、点击列头远程排序(姓名/年龄/薪资/入职日期)、性别列头远程筛选,查询条件存 Pinia,切换路由后保留。',
    features: ['proxy-config', '远程排序', '远程筛选', '分页']
  },
  {
    path: '/crud',
    title: '完整 CRUD',
    icon: FormOutlined,
    desc: 'vxe-grid 列表 + antdv-next Modal/Form 弹窗新增编辑、Popconfirm 单条删除、复选框批量删除(走 batch-save 事务接口)、message 反馈。',
    features: ['弹窗表单', '批量删除', '事务保存']
  },
  {
    path: '/edit',
    title: '可编辑表格',
    icon: EditOutlined,
    desc: 'edit-config 的 cell / row 两种编辑模式、edit-render 内置编辑器(输入框/下拉/数字/日期)、edit-rules 校验、insertAt 新增、remove 标记删除、revertData 还原、getRecordset 取增删改集一键提交。',
    features: ['cell/row 模式', '内置编辑器', '校验', 'getRecordset']
  },
  {
    path: '/tree',
    title: '树形表格',
    icon: ApartmentOutlined,
    desc: '扁平数据(带 parent_id)经 tree-config.transform 自动转树,支持展开/收起全部与树内单元格编辑;另演示懒加载 —— 初始只加载根节点,展开时按 parentId 请求子节点。',
    features: ['transform 转树', '懒加载', '树内编辑']
  },
  {
    path: '/virtual',
    title: '大数据虚拟滚动',
    icon: ThunderboltOutlined,
    desc: '纵向虚拟滚动(scroll-y)渲染 10 万行不卡顿;开启「100 列宽表」后同时演示横向虚拟滚动(scroll-x),并展示接口请求 + 渲染总耗时。',
    features: ['10 万行', 'scroll-y', 'scroll-x', '性能指标']
  },
  {
    path: '/toolbar',
    title: '工具栏与导入导出',
    icon: ToolOutlined,
    desc: 'toolbar-config 内置按钮(刷新/缩放全屏/打印/导出/导入/列设置);列设置支持显隐、拖拽排序、固定,并通过 storage 持久化到 localStorage;导出支持 XLSX/CSV/HTML/XML/TXT(xlsx 由 @vxe-ui/plugin-export-xlsx + exceljs 提供),可选当前页/选中/全量。',
    features: ['XLSX 导出', '导入', '打印', '列设置持久化']
  },
  {
    path: '/drag',
    title: '拖拽排序',
    icon: DragOutlined,
    desc: 'row-drag-config 行拖拽(序号列 drag-sort 显示拖拽手柄,可整行排序)、column-drag-config 列头拖拽换位;开启辅助线与拖拽提示,拖拽结束触发事件提示。',
    features: ['行拖拽', '列拖拽', '辅助线']
  },
  {
    path: '/expand',
    title: '展开行',
    icon: ExpandAltOutlined,
    desc: 'type=expand 展开行 —— 展开后用 antdv-next Descriptions 渲染整行详情;expand-config 支持手风琴模式(一次只展开一行)、展开/收起全部。',
    features: ['展开详情', '手风琴模式']
  },
  {
    path: '/menu',
    title: '右键菜单与键盘',
    icon: MenuOutlined,
    desc: 'menu-config 右键菜单(表头:隐藏列/重置列;单元格:复制/编辑/删除行/刷新)+ keyboard-config 键盘导航 —— 点选单元格后方向键移动、Tab 切换、回车/F2 进入编辑、Esc 取消、Del 清空内容。',
    features: ['右键菜单', '键盘导航', '单元格选中']
  },
  {
    path: '/stats',
    title: '合计与合并',
    icon: BarChartOutlined,
    desc: 'footer-method 表尾两行(合计/平均)、span-method 同岗位动态行合并、cell-style/row-style 条件样式 —— 薪资 > ¥40,000 高亮,禁用状态整行灰化删除线。',
    features: ['表尾合计', '动态行合并', '条件样式']
  }
]
