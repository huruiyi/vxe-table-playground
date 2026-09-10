# vxe-table-playground

本项目目前的核心目的是**演示 vxe-table v4 的功能**:一个功能总览页 + 11 个可交互示例页,覆盖分页、排序、筛选、CRUD、可编辑、树形、10 万行虚拟滚动、导入导出、拖拽、右键菜单、合计合并等场景。前后端完整可跑——接口是真实的服务端分页/排序/事务,不是纯前端 mock。

**技术栈**:Vite 8 · Vue 3.5 · TypeScript · Vue Router 5 · Pinia 4 · antdv-next 1.4 · vxe-table 4.20 / vxe-pc-ui 4.16 · Express 5 · Prisma 6 / Prisma 7(两套后端) · MySQL

## 快速开始

### 前置要求

- Node.js ≥ 20
- 本地可用的 MySQL(本项目开发使用的账号:用户 `root`,密码 `fairy-vip`,按你本机情况修改即可)

### 配置与启动

后端刻意保留了两套实现:**`server-prisma6/`(Prisma 6)** 与 **`server-prisma7/`(Prisma 7)**,目录名即版本号。两套的业务代码完全一致,只有 Prisma Client 的引入与实例化方式不同(见下文「两套后端」)。**任选一套启动即可**,默认都监听 3000 端口,因此不要同时启动两套。

```bash
# 1. 安装依赖(根目录 + 前端 + 选定的后端)
npm install
npm --prefix client install
npm --prefix server-prisma7 install     # 或 server-prisma6

# 2. 配置数据库连接
# 各后端目录下已有 .env,把 DATABASE_URL 改成你的 MySQL 连接串即可

# 3. 生成 Prisma Client(Prisma 7 必须显式执行,不再随 db push 自动生成)
npm --prefix server-prisma7 run generate

# 4. 建库建表
npm --prefix server-prisma7 run db:push

# 5. 启动(两个终端分别执行)
npm --prefix server-prisma7 run dev     # 后端
npm --prefix client run dev             # 前端
```

两个后端的 `.env` 使用**同一个连接串**(库名任意,不存在会自动创建),切换后端时无需改库、也无需重新灌数据:

```ini
PORT=3000
DATABASE_URL="mysql://root:fairy-vip@localhost:3306/vxe-table-playground"
```

- 前端:http://localhost:5173(vite proxy 将 `/api` 转发到后端 3000 端口),打开后默认进入 `/overview` 功能总览
- 后端:http://localhost:3000(健康检查 `GET /api/health` 返回 `{"code":0,"msg":"ok","data":"up"}`)

无需手动执行 SQL:选定的后端 `generate` + `db:push` 会自动建库建表(schema 见 [server-prisma6/prisma/schema.prisma](server-prisma6/prisma/schema.prisma) 与 [server-prisma7/prisma/schema.prisma](server-prisma7/prisma/schema.prisma),两者完全一致);表为空时后端启动会自动写入基础种子数据(200 个用户 + 一棵三层部门树)。需要大数据量压测时用 `npm --prefix server-prisma7 run db:seed` 单独灌入 10 万行(虚拟滚动页需要),用 `db:studio` 可打开 Prisma Studio 查看数据。

> 各 Prisma 相关命令(`generate` / `db:push` / `db:seed` / `dev` / `db:studio` 等)的详细作用、配置文件说明与执行顺序,见下文「[后端命令总览](#后端命令总览)」及后续各节。

## 两套后端(Prisma 6 / Prisma 7)

同一份业务代码,分别用两个 Prisma 大版本实现,便于对比升级前后的差异:

| 对比项 | `server-prisma6/` | `server-prisma7/` |
|---|---|---|
| Prisma 版本 | `prisma` / `@prisma/client` `^6.19.3` | `^7.10.0` + `@prisma/adapter-mariadb` |
| 生成器 | `prisma-client-js`(默认输出到 `node_modules`) | `prisma-client`(输出 TS 源码到 `src/generated/prisma`) |
| `datasource.url` | 写在 `schema.prisma` 的 `env("DATABASE_URL")` | 写在 `prisma.config.ts` 的 `datasource.url`(schema 里不再有 url) |
| 客户端导入 | `require('@prisma/client')` | `require('./generated/prisma/client')` |
| 实例化 | `new PrismaClient()` | `new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })` |
| `.env` 加载 | CLI 自动加载 | CLI 不再自动加载,`prisma.config.ts` 中显式 `import 'dotenv/config'` |
| 运行时 | Node(`node --watch src/index.js`) | `tsx watch src/index.js`(需执行生成的 `.ts`) |
| 额外配置文件 | 无 | `prisma.config.ts` |

两套的 `src/routes/**`、`src/utils/**`、`prisma/seed.js`、`prisma/schema.prisma` 内容一致,**唯一差异在 `src/prisma.js`**(客户端引入与实例化)。接口路径、响应格式、监听端口(3000)都相同,前端无需任何改动,换一套启动即可对比。

> `server-prisma6/prisma/seed.js` 同样支持 `SEED_USER_COUNT` / `SEED_BATCH_SIZE` 环境变量控制灌入行数与批量大小(默认 100000 / 5000)。

### Prisma 7 行为变更汇总(相对 6.x)

| 变更 | 旧版本(6.x) | Prisma 7 |
|---|---|---|
| `datasource.url` | 写在 `schema.prisma` | 必须写在 `prisma.config.ts` |
| `.env` 自动加载 | CLI 自动加载 | 不再自动加载,需 `import 'dotenv/config'` |
| 生成器 | `prisma-client-js`(输出到 node_modules) | `prisma-client`(自定义 `output`,输出 TS) |
| 客户端实例化 | `new PrismaClient({ datasourceUrl })` | 需传驱动适配器 `new PrismaClient({ adapter })` |
| `migrate dev` / `db push` 自动 generate | 自动 | 不再自动,需显式 `prisma generate` |
| `--skip-generate` / `--skip-seed` | 存在 | 已移除 |
| `db execute --schema` / `--url` | 存在 | 已移除,连接串走 config |

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
├── client/                     # 前端 Vite + Vue 3
│   └── src/
│       ├── api/                # axios 封装与接口(统一解包 {code,msg,data})
│       ├── data/               # 总览页的演示元信息(标题/描述/特性标签)
│       ├── layouts/            # 侧边栏 + 头部布局
│       ├── plugins/            # vxe-table / vxe-pc-ui 注册与 xlsx 导出插件
│       ├── router/             # 路由表(总览页 + 11 个演示页)
│       ├── views/              # 总览页 + 11 个演示页,一页一个场景
│       ├── stores/             # Pinia(全局尺寸/主题、查询条件)
│       └── styles/             # 填充布局与暗色主题变量
├── server-prisma6/             # 后端 Express + Prisma 6
│   ├── package.json            # dev/start 用 node --watch
│   ├── prisma/
│   │   ├── schema.prisma       # datasource url 写在 schema 内
│   │   └── seed.js
│   └── src/
│       ├── prisma.js           # new PrismaClient() + 启动时基础种子
│       ├── routes/             # users / departments / bigdata
│       └── utils/              # 统一响应、序列化(驼峰→snake_case)
├── server-prisma7/             # 后端 Express + Prisma 7
│   ├── package.json            # dev/start 用 tsx
│   ├── prisma.config.ts        # CLI 配置(seed 命令入口、datasource.url)
│   ├── prisma/
│   │   ├── schema.prisma       # prisma-client 生成器,输出 TS 到 src/generated
│   │   └── seed.js
│   └── src/
│       ├── prisma.js           # 驱动适配器 + 生成的客户端
│       ├── routes/             # 同上
│       └── utils/
└── package.json                # concurrently 一键启动前后端
```

## 后端接口

`server-prisma6` 与 `server-prisma7` 的接口完全一致,默认端口同为 `3000`。统一返回 `{ code, msg, data }`,`code=0` 为成功。

| 接口 | 说明 |
|---|---|
| `GET /api/health` | 健康检查 |
| `GET /api/users` | 分页 + 排序(字段白名单)+ 筛选 |
| `GET /api/users/:id` | 单条查询 |
| `POST / PUT / DELETE /api/users(/:id)` | 单条增删改 |
| `POST /api/users/batch-save` | `{insertRecords, updateRecords, removeRecords}` 单事务批量保存,对接 vxe-grid proxy save |
| `GET /api/departments/tree?flat=1` | 部门树 / 扁平结构 |
| `GET /api/departments/children?parentId=` | 懒加载子部门(附 `hasChild` 标记) |
| `GET /api/bigdata?size=100000&cols=100` | 内存生成大数据(不落库),用于虚拟滚动压测;`size` 上限 20 万、`cols` 上限 200 |

## 后端命令总览

后端是 **Express 5 + Prisma + MySQL** 的接口服务,负责为前端 vxe-table 演示提供真实的分页 / 排序 / 筛选 / CRUD / 事务接口。

下文命令均以 **`server-prisma7/`(Prisma 7)** 为例,可在**项目根目录**用 `npm --prefix server-prisma7 ...` 执行(等价于进入 `server-prisma7/` 目录后再 `npm ...`)。换用 **`server-prisma6/`(Prisma 6)** 时,把命令里的 `server-prisma7` 换成 `server-prisma6` 即可,两套差异见「[两套后端](#两套后端prisma-6--prisma-7)」。

| 命令 | 实际执行 | 作用 |
|---|---|---|
| `npm --prefix server-prisma7 install` | `npm install`(server-prisma7 目录) | 安装后端全部依赖 |
| `npm --prefix server-prisma7 run generate` | `prisma generate` | 生成 Prisma Client |
| `npm --prefix server-prisma7 run db:push` | `prisma db push` | 同步数据库表结构(建库/建表/改表) |
| `npm --prefix server-prisma7 run db:seed` | `prisma db seed` | 执行种子脚本,写入示例数据 |
| `npm --prefix server-prisma7 run dev` | `tsx watch src/index.js` | 启动开发服务(热重载) |
| `npm --prefix server-prisma7 run start` | `tsx src/index.js` | 启动生产服务(不热重载) |
| `npm --prefix server-prisma7 run db:studio` | `prisma studio` | 打开 Prisma Studio 图形化查看数据 |

> 说明:`npm run` 的作用是把 `package.json` 中 `scripts` 里的命令原样交给 npm 执行。例如 `npm --prefix server-prisma7 run generate` 等价于在 `server-prisma7/` 下运行 `npx prisma generate`。

### 直接运行的 Prisma CLI 命令

除上面已封装成 npm 脚本的命令外,还有大量 Prisma CLI 命令可直接运行。在 `server-prisma7/` 目录下用 `npx prisma <命令>` 调用;在项目根目录下用 `npm --prefix server-prisma7 exec prisma <命令>`(注意是 `exec`)。

| 命令(在 server-prisma7 目录运行) | 作用 |
|---|---|
| `npx prisma validate` | 校验 `schema.prisma` 与 `prisma.config.ts` 是否合法 |
| `npx prisma format` | 格式化 `schema.prisma` |
| `npx prisma migrate dev --name <名>` | 开发环境根据 schema 变更创建并应用新迁移 |
| `npx prisma migrate deploy` | 生产环境应用已有迁移文件 |
| `npx prisma migrate reset` | 重置数据库并重放所有迁移(破坏性) |
| `npx prisma migrate status` | 查看迁移状态(已应用/待应用) |
| `npx prisma migrate resolve` | 手动标记某个迁移为已应用/已回滚 |
| `npx prisma db pull` | 从数据库反向生成 `schema.prisma`(内省) |
| `npx prisma db execute --file x.sql` | 对数据库执行原始 SQL 文件 |
| `npx prisma db diff` | 对比两个 schema / 数据库的 SQL 差异 |
| `npx prisma init` | 初始化一个新的 Prisma 项目 |
| `npx prisma studio` | 打开 Prisma Studio 图形界面 |

> 本项目默认使用 `db push`(不生成迁移文件)做快速同步;若想用版本化的迁移方案,见下文「迁移(migrate)」一节。

## 后端配置说明

在动手跑命令前,先理解几个关键文件。

### 1. `server-prisma7/.env` —— 环境变量

后端通过 [dotenv](https://github.com/motdotla/dotenv) 读取 `.env`。**必须**包含数据库连接串:

```ini
PORT=3000
DATABASE_URL="mysql://root:fairy-vip@localhost:3306/vxe-table-playground"
```

- `DATABASE_URL` 是唯一必需项,格式为 `mysql://用户名:密码@主机:端口/库名`,库名不存在时会由 `db:push` 自动创建;不配 `PORT` 时默认 `3000`。
- 本仓库是演示项目,`.env` **直接提交入库**(内含演示用账号),克隆后按你本机 MySQL 的实际情况修改即可。
- `server-prisma6/.env` 与 `server-prisma7/.env` 内容完全一致,指向同一个库,两套后端可共用一份数据、随时切换。

### 2. `server-prisma7/prisma.config.ts` —— Prisma CLI 配置(Prisma 7 标配)

Prisma 7 以后,CLI 相关配置统一放到这个文件:

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',        // schema 文件路径
  migrations: {
    seed: 'tsx prisma/seed.js',          // `prisma db seed` 实际执行的命令
  },
  datasource: {
    url: env('DATABASE_URL'),            // CLI 建库/迁移所用的连接串
  },
})
```

> **注意(Prisma 7 行为变更)**:`datasource` 里的 `url` 已经**不能写在 `schema.prisma` 中**,必须迁移到 `prisma.config.ts`;且 CLI **不再自动加载 `.env`**。因此这里显式 `import 'dotenv/config'`,否则 `db:push` / `db:seed` 会报 “Environment variable not found: DATABASE_URL”。

> Prisma 6 版本没有这个文件,`url = env("DATABASE_URL")` 直接写在 `schema.prisma` 的 `datasource db` 里。

### 3. `server-prisma7/prisma/schema.prisma` —— 数据模型

定义 `User`、`Department` 等模型与字段,以及生成器配置:

```prisma
generator client {
  provider            = "prisma-client"   // 新生成器,输出 TS 源码
  output              = "../src/generated/prisma"
  moduleFormat        = "cjs"             // 让生成的代码用 require (CommonJS)
  importFileExtension = "ts"              // 让 tsx 能解析内部 .ts 引用
}

datasource db {
  provider = "mysql"
}
```

> Prisma 6 版本用的是默认生成器 `provider = "prisma-client-js"`,不写 `output`(默认生成到 `node_modules`),并把 `url = env("DATABASE_URL")` 写在 `datasource db` 内。

## 后端命令详解

### 1. `npm --prefix server-prisma7 install`

```bash
npm --prefix server-prisma7 install
```

在 `server-prisma7/` 下执行 `npm install`,读取 `server-prisma7/package.json`,安装所有依赖。

本后端的关键依赖:

| 依赖 | 作用 |
|---|---|
| `express` | Web 框架,提供路由与中间件 |
| `@prisma/client` | Prisma Client 运行时(内部包含查询编译器、驱动适配支撑) |
| `@prisma/adapter-mariadb` | MySQL/MariaDB 驱动适配器,Prisma 7 实例化客户端时必须提供 |
| `dotenv` | 从 `.env` 读取环境变量 |
| `cors` | 允许前端跨域调用 |
| `prisma`(dev) | Prisma CLI,用于 generate / db push / db seed / studio |
| `tsx`(dev) | TypeScript 运行器,用于运行生成的 TS 客户端与脚本 |

> 首次克隆仓库后必做此命令;之后如果 `package.json` 变化用 `npm install` 同步即可。

### 2. `npm --prefix server-prisma7 run generate`

```bash
npm --prefix server-prisma7 run generate
```

等价于执行 `prisma generate`。它做三件事:

1. 读取 `prisma.config.ts` 与 `prisma/schema.prisma`;
2. 根据模型生成 Prisma Client 代码;
3. 输出到 `server-prisma7/src/generated/prisma/`(由 schema 中 `output` 指定)。

**生成的产物包括**:`client.ts`(含 `PrismaClient` 实例与类型)、`models.ts`、`enums.ts`、`browser.ts` 以及 `internal/` 运行时等。

**要点**:

- 生成结果**不提交到 git**(已在 `.gitignore` 中忽略 `server-prisma7/src/generated/`),所以每次拿到新代码或修改了 `schema.prisma` 后都要重新执行一次 `generate`。
- 项目中的 `src/prisma.js` / `prisma/seed.js` 从这里导入客户端:
  - `src/prisma.js`: `require('./generated/prisma/client')`
  - `prisma/seed.js`: `require('../src/generated/prisma/client')`
- **Prisma 7 不再在 `db push` / `migrate dev` 时自动生成客户端**,因此 `generate` 需要显式执行。
- Prisma 6 用的是 `prisma-client-js`,客户端生成到 `node_modules`,通常在 `npm install` 时即由 `@prisma/client` 的 postinstall 完成;也可手动执行 `npm --prefix server-prisma6 run generate`。

### 3. `npm --prefix server-prisma7 run db:push`

```bash
npm --prefix server-prisma7 run db:push
```

等价于执行 `prisma db push`。它负责**把 schema 同步到数据库**:

- 使用 `prisma.config.ts` 里 `datasource.url` 连接目标 MySQL;
- 对比 `schema.prisma` 与当前数据库,自动创建缺失的表、字段、索引、约束(**非破坏性**,已有数据一般保留);
- 若目标库不存在会自动创建。

**要点**:

- 与 `prisma migrate dev` 不同,`db push` 是**直接同步结构**,不生成迁移文件,适合演示/快速开发。正式项目建议使用 `migrate`。
- 重新运行是幂等的:数据库已是最新时提示 “The database is already in sync with the Prisma schema.”。
- **Prisma 7 中 `db push` 不再自动执行 `generate`**,改完 schema 后请先后运行 `generate` 再 `db:push`。

### 4. `npm --prefix server-prisma7 run db:seed`

```bash
npm --prefix server-prisma7 run db:seed
```

等价于执行 `prisma db seed`,它会运行 `prisma.config.ts` 里 `migrations.seed` 指定的命令:

```
tsx prisma/seed.js
```

即用 `tsx` 运行 `server-prisma7/prisma/seed.js`。该脚本:

1. 用 `@prisma/adapter-mariadb` 创建适配器并实例化 `PrismaClient`;
2. 写入部门树与大批量用户(默认 **10 万行**,可用 `SEED_USER_COUNT` 调整总行数、`SEED_BATCH_SIZE` 调整每批条数,默认 5000);
3. 完成后断开连接。

> 种子脚本独立于后端启动流程。后端 `dev`/`start` 启动时只会写入**少量默认数据(200 个用户 + 部门树)**,`db:seed` 则是用于把“大数据量演示”数据一次性灌入(虚拟滚动页需要)。

### 5. `npm --prefix server-prisma7 run dev`

```bash
npm --prefix server-prisma7 run dev
```

等价于执行 `tsx watch src/index.js`,启动后端开发服务器:

- **热重载**:`watch` 模式下修改 `src/` 下文件会自动重启;
- **启动流程**(见 `src/index.js` 的 `initDb()`):
  1. 通过适配器连接 MySQL;
  2. 执行连通性检查(`SELECT 1`);
  3. 表为空时自动写入基础种子数据(200 个用户 + 一棵部门树);
  4. 然后监听端口(默认 `3000`,可用 `.env` 里的 `PORT` 覆盖)。

**健康检查**:`GET http://localhost:3000/api/health` 应返回 `{"code":0,"msg":"ok","data":"up"}`。

> **为什么用 `tsx`**:Prisma 7 的 `prisma-client` 生成器输出的是 **TypeScript** 源码(source 文件是 `.ts`)。纯 Node 无法直接 `require` `.ts`,因此用 `tsx` 做运行时脚本执行/热重载。

### 6. `npm --prefix server-prisma7 run start`

```bash
npm --prefix server-prisma7 run start
```

等价于 `tsx src/index.js`,启动**非热重载**的生产运行方式,其余同 `dev`。

### 7. `npm --prefix server-prisma7 run db:studio`

```bash
npm --prefix server-prisma7 run db:studio
```

等价于执行 `prisma studio`,启动 Prisma Studio —— 一个基于浏览器、只读/可编辑可视化的数据库工具,便于检查种子数据是否写入正确。按 `Ctrl+C` 退出。

## Prisma CLI 命令参考(validate / migrate 等)

以下命令均在 `server-prisma7/` 目录运行;若在项目根目录,请改用 `npm --prefix server-prisma7 exec prisma <命令>`。

### 校验与格式化

#### `prisma validate`

```bash
npx prisma validate
```

- 校验 `prisma/schema.prisma` 的语法与 `prisma.config.ts` 的配置是否合法;
- 用于 CI 或提交前快速检查,无需连接数据库;
- `DATABASE_URL` 经 `dotenv` 加载后,还会校验数据源连接串格式。

#### `prisma format`

```bash
npx prisma format
```

- 重新排版 `schema.prisma`(缩进、字段顺序、统一风格),不改变语义;常用于多人协作统一格式。

### 迁移(migrate)——版本化 schema 变更

`migrate` 会把每次 schema 变更生成一个**迁移文件**(记录 DDL 的 SQL),便于团队/环境间逐步应用与回滚。本项目默认用 `db push` 快速同步;若要正式化管理,可切换到 `migrate`。

> 使用 `migrate` 前需在 `prisma.config.ts` 里配置 `migrations.path`;未显式配置时默认路径为 `prisma/migrations`。

#### `prisma migrate dev --name <名称>`

```bash
npx prisma migrate dev --name add_users
```

- 对比 `schema.prisma` 与迁移历史,为本次变更**创建一个新的迁移文件**并应用到开发库;
- `--name` 给迁移起名,便于识别;
- **Prisma 7 变更**:`migrate dev` **不再自动执行 `prisma generate`**,也**不再自动运行种子**。创建迁移后需手动:
  ```bash
  npm --prefix server-prisma7 run generate
  npm --prefix server-prisma7 run db:seed   # 如需灌入数据
  ```
- 相关 flag 变化:`--skip-generate`、`--skip-seed` 已被移除。

#### `prisma migrate deploy`

```bash
npx prisma migrate deploy
```

- 把**已有的迁移文件**按顺序应用到目标数据库(常用于生产 / CI);
- **非破坏性、可安全重复执行**,不会重置数据、也不会新建迁移。

#### `prisma migrate reset`

```bash
npx prisma migrate reset
```

- **破坏性**:删除并重建数据库(或清空),然后重放所有迁移,并执行种子(若配置);
- 用于把库恢复到“全新”状态,仅限开发 / 测试环境;
- **Prisma 7 变更**:重置后不再自动跑种子,需手动 `npx prisma db seed`。

#### `prisma migrate status`

```bash
npx prisma migrate status
```

- 列出已应用与待应用的迁移,检查数据库与迁移历史是否一致。

#### `prisma migrate resolve`

```bash
npx prisma migrate resolve --applied 20240909120000_add_users
```

- 把某个迁移手动标记为“已应用”`--applied` 或“已回滚”`--rolled-back`;
- 适用于已被外部手工执行、Prisma 未记录的迁移,或修复迁移历史错乱。

### 数据库同步与内省

#### `prisma db pull`

```bash
npx prisma db pull
```

- **内省**:读取现有数据库中的表结构,反向生成 `schema.prisma`(会**覆盖**当前 schema 文件);
- 适合“数据库已存在、想要生成模型”的场景。

#### `prisma db execute`

```bash
npx prisma db execute --file ./script.sql
```

- 对数据库执行一段原始 SQL(文件或内联语句);
- **Prisma 7 变更**:`--schema`、`--url` 已移除,连接串统一从 `prisma.config.ts` 的 `datasource.url` 读取。

#### `prisma db diff`

```bash
npx prisma db diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

- 对比两个数据库 / schema 之间的差异并输出 SQL(不直接执行);
- **Prisma 7 变更**:`--from-url` / `--to-url` / `--from-schema-datasource` / `--to-schema-datasource` 已改为 `--from-config-datasource` / `--to-config-datasource`;`--shadow-database-url` 需配置在 `prisma.config.ts`。

### 其它

#### `prisma init`

```bash
npx prisma init
```

- 在一个新项目里初始化 Prisma:生成 `schema.prisma`、`.env` 等;本仓库已初始化,无需重复。

#### `prisma studio`

```bash
npx prisma studio
```

- 启动基于浏览器的 Prisma Studio,可视化查看 / 编辑数据(等价于 `npm --prefix server-prisma7 run db:studio`)。

#### `prisma --version`

```bash
npx prisma --version
```

- 打印 Prisma CLI、客户端、查询引擎、schema 引擎等版本,用于确认升级结果。

## 后端初始化与日常流程

首次初始化(或克隆仓库后):

```bash
# 1. 安装依赖
npm --prefix server-prisma7 install

# 2. 配置数据库连接
#    在 server-prisma7/ 下修改 .env,写入 DATABASE_URL(见上文)

# 3. 生成客户端(改了 schema 后同样需要重复执行)
npm --prefix server-prisma7 run generate

# 4. 建库建表
npm --prefix server-prisma7 run db:push

# 5. (可选)导入大数据量种子数据
npm --prefix server-prisma7 run db:seed

# 6. 启动开发服务
npm --prefix server-prisma7 run dev
```

日常改动流程:

1. 修改 `prisma/schema.prisma` → 执行 `generate` + `db:push`;
2. 修改 `src/` 下业务代码 → `dev` 自动热重载;
3. 想重置/查看数据 → `db:seed` / `db:studio`;
4. 想换成 Prisma 6 版本对比 → 把上述命令里的 `server-prisma7` 换成 `server-prisma6` 即可。

## 实现要点(踩坑记录)

- **服务端排序/筛选必须显式开启代理监听**:`proxy-config` 里要设 `sort: true` / `filter: true`,否则 vxe-grid 不监听 `sort-change`,点表头只改图标不发请求(默认值是 false)。
- **列宽自适应**:除勾选/序号列用固定 `width`,其余列用 `minWidth`,剩余宽度由 vxe 按比例分配;配合 `showOverflow: 'tooltip'` 防止内容撑行。
- **antd 控件 `@change` 里拿不到新值**:change 事件先于 `v-model` 写值触发,需要重新加载数据时用 `watch` 监听 ref 而不是在 `@change` 里调用。
- **暗色主题三方联动**:antd 用 `theme.darkAlgorithm`,vxe 用 `VxeUI.setTheme('dark')`(会在 html 上打 `data-vxe-ui-theme` 属性),自定义样式挂这个属性写 CSS 变量即可跟随切换。
- **Prisma 7 与 6 的差异集中在客户端接线**:`datasource.url` 从 `schema.prisma` 迁到 `prisma.config.ts`、CLI 不再自动加载 `.env`(需 `import 'dotenv/config'`)、`db push` / `migrate dev` 不再自动 `generate`、实例化必须传驱动适配器 `new PrismaClient({ adapter })`、生成的客户端是 TS 源码所以要用 `tsx` 运行。想快速看清差异,直接对比 `server-prisma6/src/prisma.js` 与 `server-prisma7/src/prisma.js` 即可。

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
