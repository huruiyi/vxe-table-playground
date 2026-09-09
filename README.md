# vxe-table-playground

本项目目前的核心目的是**演示 vxe-table v4 的功能**:一个功能总览页 + 11 个可交互示例页,覆盖分页、排序、筛选、CRUD、可编辑、树形、10 万行虚拟滚动、导入导出、拖拽、右键菜单、合计合并等场景。前后端完整可跑——接口是真实的服务端分页/排序/事务,不是纯前端 mock。

**技术栈**:Vite 8 · Vue 3.5 · TypeScript · Vue Router 5 · Pinia 4 · antdv-next 1.4 · vxe-table 4.20 / vxe-pc-ui 4.16 · Express 5 · Prisma 6 · MySQL

## 快速开始

### 前置要求

- Node.js ≥ 20
- 本地可用的 MySQL(本项目开发使用的账号:用户 `root`,密码 `fairy-vip`,按你本机情况修改即可)

### 配置与启动

```bash
# 1. 安装依赖(根目录 + 前后端)
npm install
npm --prefix server install
npm --prefix client install

# 2. 配置数据库连接
# 在 server/ 下新建 .env,把 DATABASE_URL 改成你的 MySQL 连接串

# 3. 一键启动前后端
npm run dev
```

`server/.env` 示例(库名任意,不存在会自动创建):

```ini
PORT=3000
DATABASE_URL="mysql://root:fairy-vip@localhost:3306/vxe_demo"
```

- 前端:http://localhost:5173(vite proxy 将 `/api` 转发到后端),打开后默认进入 `/overview` 功能总览
- 后端:http://localhost:3000

无需手动执行 SQL:后端启动脚本会先跑 `prisma db push` 自动建库建表(schema 见 [server/prisma/schema.prisma](server/prisma/schema.prisma)),表为空时自动写入种子数据(200 个用户 + 一棵部门树)。可用 `npm --prefix server run db:studio` 打开 Prisma Studio 查看数据。

## 演示页面

| 路由 | 内容 |
|---|---|
| `/overview` | 功能总览:卡片式导航,列出每个演示页的场景与涉及的 vxe-table 特性(`/` 默认重定向到这里) |
| `/basic` | 基础表格:边框/斑马纹、固定表头与左右固定列、多级表头、单元格合并、插槽渲染(Tag/进度条)、空数据态 |
| `/query` | vxe-grid `proxy-config` 对接后端:服务端分页、远程排序、列头远程筛选,查询条件存 Pinia |
| `/crud` | 完整增删改查:antdv-next Modal + Form 弹窗、Popconfirm 删除、批量删除(事务) |
| `/edit` | 可编辑表格:cell/row 模式、内置编辑器、校验规则、getRecordset 一键提交 batch-save |
| `/tree` | 树形表格:扁平数据 transform 转树、展开收起、懒加载子节点、树内编辑 |
| `/virtual` | 大数据虚拟滚动:1w/5w/10w 行 + 可选 100 列宽表(横向虚拟滚动),显示加载耗时 |
| `/toolbar` | 工具栏:刷新/缩放/打印/导出(XLSX/CSV/HTML/XML/TXT)/导入/列设置(localStorage 持久化)、列拖拽、整行勾选 |
| `/drag` | 拖拽排序:row-drag-config 行拖拽(拖拽手柄/辅助线/提示)、column-drag-config 列头换位 |
| `/expand` | 展开行:type=expand + Descriptions 详情、手风琴模式、展开/收起全部 |
| `/menu` | 右键菜单(表头/单元格,复制/编辑/删除/隐藏列)+ 键盘导航(方向键/Tab/回车编辑)、单元格选中 |
| `/stats` | 合计与合并:footer-method 表尾合计/平均两行、span-method 同岗位行合并、条件单元格/行样式 |

全局特性:表格尺寸切换(迷你/小/中)、暗色主题(antd darkAlgorithm + VxeUI setTheme 联动)、表格撑满视口的填充布局。

## 项目结构

```
├── client/                 # 前端 Vite + Vue 3
│   └── src/
│       ├── api/            # axios 封装与接口(统一解包 {code,msg,data})
│       ├── data/           # 总览页的演示元信息(标题/描述/特性标签)
│       ├── layouts/        # 侧边栏 + 头部布局
│       ├── plugins/        # vxe-table / vxe-pc-ui 注册与 xlsx 导出插件
│       ├── router/         # 路由表(总览页 + 11 个演示页)
│       ├── views/          # 总览页 + 11 个演示页,一页一个场景
│       ├── stores/         # Pinia(全局尺寸/主题、查询条件)
│       └── styles/         # 填充布局与暗色主题变量
├── server/                 # 后端 Express + Prisma
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/         # users / departments / bigdata
│       └── utils/          # 统一响应、序列化(驼峰→snake_case)
└── package.json            # concurrently 一键启动前后端
```

## 后端接口

统一返回 `{ code, msg, data }`,`code=0` 为成功。

| 接口 | 说明 |
|---|---|
| `GET /api/users` | 分页 + 排序(字段白名单)+ 筛选 |
| `POST / PUT / DELETE /api/users(/:id)` | 单条增删改 |
| `POST /api/users/batch-save` | `{insertRecords, updateRecords, removeRecords}` 单事务批量保存,对接 vxe-grid proxy save |
| `GET /api/departments/tree?flat=1` | 部门树 / 扁平结构 |
| `GET /api/departments/children?parentId=` | 懒加载子部门 |
| `GET /api/bigdata?size=100000&cols=100` | 内存生成大数据(不落库),用于虚拟滚动压测 |

## 实现要点(踩坑记录)

- **服务端排序/筛选必须显式开启代理监听**:`proxy-config` 里要设 `sort: true` / `filter: true`,否则 vxe-grid 不监听 `sort-change`,点表头只改图标不发请求(默认值是 false)。
- **列宽自适应**:除勾选/序号列用固定 `width`,其余列用 `minWidth`,剩余宽度由 vxe 按比例分配;配合 `showOverflow: 'tooltip'` 防止内容撑行。
- **antd 控件 `@change` 里拿不到新值**:change 事件先于 `v-model` 写值触发,需要重新加载数据时用 `watch` 监听 ref 而不是在 `@change` 里调用。
- **暗色主题三方联动**:antd 用 `theme.darkAlgorithm`,vxe 用 `VxeUI.setTheme('dark')`(会在 html 上打 `data-vxe-ui-theme` 属性),自定义样式挂这个属性写 CSS 变量即可跟随切换。

## 参考文档

| 技术 | 文档 |
|---|---|
| vxe-table v4(本项目主角) | https://vxetable.cn/#/start/useTable/install |
| antdv-next | https://www.antdv-next.cn/index-cn |
| Vue Router | https://router.vuejs.org/zh/ |
| Pinia | https://pinia.vuejs.org/zh/ |
| Vite + Vue + TS 脚手架 | https://vite.new/vue-ts |

## License

MIT
