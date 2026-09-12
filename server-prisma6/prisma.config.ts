// 使用了 prisma.config.ts 时，Prisma CLI 不再自动加载 .env，需要显式引入
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.js',
  },
})
