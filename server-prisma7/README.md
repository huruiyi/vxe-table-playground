# 后端说明(server)

后端是 **Express 5 + Prisma 7 + MySQL** 的接口服务,负责为前端 vxe-table 演示提供真实的分页 / 排序 / 筛选 / CRUD / 事务接口。

所有命令都通过 `npm --prefix server ...` 形式在**项目根目录**执行(等价于进入 `server/` 目录后再 `npm ...`)。

---

## 一、命令总览

| 命令 | 实际执行 | 作用 |
|---|---|---|
| `npm --prefix server install` | `npm install`(server 目录) | 安装后端全部依赖 |
| `npm --prefix server run generate` | `prisma generate` | 生成 Prisma Client |
| `npm --prefix server run db:push` | `prisma db push` | 同步数据库表结构(建库/建表/改表) |
| `npm --prefix server run db:seed` | `prisma db seed` | 执行种子脚本,写入示例数据 |
| `npm --prefix server run dev` | `tsx watch src/index.js` | 启动开发服务(热重载) |
| `npm --prefix server run start` | `tsx src/index.js` | 启动生产服务(不热重载) |
| `npm --prefix server run db:studio` | `prisma studio` | 打开 Prisma Studio 图形化查看数据 |

> 说明:`npm run` 的作用是把 `package.json` 中 `scripts` 里的命令原样交给 npm 执行。例如 `npm --prefix server run generate` 等价于在 `server/` 下运行 `npx prisma generate`。

### 直接运行的 Prisma CLI 命令

除上面已封装成 npm 脚本的命令外,还有大量 Prisma CLI 命令可直接运行。在 `server/` 目录下用 `npx prisma <命令>` 调用;在项目根目录下用 `npm --prefix server exec prisma <命令>`(注意是 `exec`)。

| 命令(在 server 目录运行) | 作用 |
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

---

## 二、配置说明

在动手跑命令前,先理解几个关键文件:

### 1. `server/.env` —— 环境变量

后端通过 [dotenv](https://github.com/motdotla/dotenv) 读取 `.env`。**必须**包含数据库连接串:

```ini
PORT=3000
DATABASE_URL="mysql://root:fairy-vip@localhost:3306/vxe_demo"
```

- `DATABASE_URL` 是唯一必需项,格式为 `mysql://用户名:密码@主机:端口/库名`,库名不存在时会由 `db:push` 自动创建。
- 此文件**已加入 `.gitignore`,不提交**。
- 模板见 `server/.env.example`(占位值,可复制为 `.env` 后填入真实配置)。

### 2. `server/prisma.config.ts` —— Prisma CLI 配置(Prisma 7 标配)

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

### 3. `server/prisma/schema.prisma` —— 数据模型

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

---

## 三、各命令详解

### 1. `npm --prefix server install`

```bash
npm --prefix server install
```

在 `server/` 下执行 `npm install`,读取 `server/package.json`,安装所有依赖。

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

### 2. `npm --prefix server run generate`

```bash
npm --prefix server run generate
```

等价于执行 `prisma generate`。它做三件事:

1. 读取 `prisma.config.ts` 与 `prisma/schema.prisma`;
2. 根据模型生成 Prisma Client 代码;
3. 输出到 `server/src/generated/prisma/`(由 schema 中 `output` 指定)。

**生成的产物包括**:`client.ts`(含 `PrismaClient` 实例与类型)、`models.ts`、`enums.ts`、`browser.ts` 以及 `internal/` 运行时等。

**要点**:

- 生成结果**不提交到 git**(已在 `.gitignore` 中忽略 `server/src/generated/`),所以每次拿到新代码或修改了 `schema.prisma` 后都要重新执行一次 `generate`。
- 项目中的 `src/prisma.js` / `prisma/seed.js` 从这里导入客户端:
  - `src/prisma.js`: `require('./generated/prisma/client')`
  - `prisma/seed.js`: `require('../src/generated/prisma/client')`
- **Prisma 7 不再在 `db push` / `migrate dev` 时自动生成客户端**,因此 `generate` 需要显式执行。

### 3. `npm --prefix server run db:push`

```bash
npm --prefix server run db:push
```

等价于执行 `prisma db push`。它负责**把 schema 同步到数据库**:

- 使用 `prisma.config.ts` 里 `datasource.url` 连接目标 MySQL;
- 对比 `schema.prisma` 与当前数据库,自动创建缺失的表、字段、索引、约束(**非破坏性**,已有数据一般保留);
- 若目标库不存在会自动创建。

**要点**:

- 与 `prisma migrate dev` 不同,`db push` 是**直接同步结构**,不生成迁移文件,适合演示/快速开发。正式项目建议使用 `migrate`。
- 重新运行是幂等的:数据库已是最新时提示 “The database is already in sync with the Prisma schema.”。
- **Prisma 7 中 `db push` 不再自动执行 `generate`**,改完 schema 后请先后运行 `generate` 再 `db:push`。

### 4. `npm --prefix server run db:seed`

```bash
npm --prefix server run db:seed
```

等价于执行 `prisma db seed`,它会运行 `prisma.config.ts` 里 `migrations.seed` 指定的命令:

```
tsx prisma/seed.js
```

即用 `tsx` 运行 `server/prisma/seed.js`。该脚本:

1. 用 `@prisma/adapter-mariadb` 创建适配器并实例化 `PrismaClient`;
2. 清空并重建示例数据 —— 写入部门树与大批量用户(约 10 万行);
3. 完成后断开连接。

> 种子脚本独立于后端启动流程。后端 `dev`/`start` 启动时只会写入**少量默认数据(200 个用户 + 部门树)**,`db:seed` 则是用于把“大数据量演示”数据一次性灌入(虚拟滚动页需要)。

### 5. `npm --prefix server run dev`

```bash
npm --prefix server run dev
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

### 6. `npm --prefix server run start`

```bash
npm --prefix server run start
```

等价于 `tsx src/index.js`,启动**非热重载**的生产运行方式,其余同 `dev`。

### 7. `npm --prefix server run db:studio`

```bash
npm --prefix server run db:studio
```

等价于执行 `prisma studio`,启动 Prisma Studio —— 一个基于浏览器、只读/可编辑可视化的数据库工具,便于检查种子数据是否写入正确。按 `Ctrl+C` 退出。

---

## 四、Prisma CLI 命令参考(validate / migrate 等)

以下命令均在 `server/` 目录运行;若在项目根目录,请改用 `npm --prefix server exec prisma <命令>`。

### 4.1 校验与格式化

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

### 4.2 迁移(migrate)——版本化 schema 变更

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
  npm --prefix server run generate
  npm --prefix server run db:seed   # 如需灌入数据
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

### 4.3 数据库同步与内省

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

### 4.4 其它

#### `prisma init`

```bash
npx prisma init
```

- 在一个新项目里初始化 Prisma:生成 `schema.prisma`、`.env` 等;本仓库已初始化,无需重复。

#### `prisma studio`

```bash
npx prisma studio
```

- 启动基于浏览器的 Prisma Studio,可视化查看 / 编辑数据(等价于 `npm --prefix server run db:studio`)。

#### `prisma --version`

```bash
npx prisma --version
```

- 打印 Prisma CLI、客户端、查询引擎、schema 引擎等版本,用于确认升级结果。

### 4.5 Prisma 7 行为变更汇总

| 变更 | 旧版本(6.x) | Prisma 7 |
|---|---|---|
| `datasource.url` | 写在 `schema.prisma` | 必须写在 `prisma.config.ts` |
| `.env` 自动加载 | CLI 自动加载 | 不再自动加载,需 `import 'dotenv/config'` |
| 生成器 | `prisma-client-js`(输出到 node_modules) | `prisma-client`(自定义 `output`,输出 TS) |
| 客户端实例化 | `new PrismaClient({ datasourceUrl })` | 需传驱动适配器 `new PrismaClient({ adapter })` |
| `migrate dev` / `db push` 自动 generate | 自动 | 不再自动,需显式 `prisma generate` |
| `--skip-generate` / `--skip-seed` | 存在 | 已移除 |
| `db execute --schema` / `--url` | 存在 | 已移除,连接串走 config |

---

## 五、建议的执行顺序

首次初始化(或克隆仓库后):

```bash
# 1. 安装依赖
npm --prefix server install

# 2. 配置数据库连接
#    在 server/ 下创建 .env,写入 DATABASE_URL(见上文)

# 3. 生成客户端(改了 schema 后也无需重复?—— 需重复)
npm --prefix server run generate

# 4. 建库建表
npm --prefix server run db:push

# 5. (可选)导入大数据量种子数据
npm --prefix server run db:seed

# 6. 启动开发服务
npm --prefix server run dev
```

日常改动流程:

1. 修改 `prisma/schema.prisma` → 执行 `generate` + `db:push`;
2. 修改 `src/` 下业务代码 → `dev` 自动热重载;
3. 想重置/查看数据 → `db:seed` / `db:studio`。
