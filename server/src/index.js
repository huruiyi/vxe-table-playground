require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initDb } = require('./prisma')
const usersRouter = require('./routes/users')
const departmentsRouter = require('./routes/departments')
const bigdataRouter = require('./routes/bigdata')

const PORT = Number(process.env.PORT || 3000)

async function main() {
  try {
    await initDb()
    console.log('[db] connected & initialized')
  } catch (err) {
    console.error('[db] init failed:', err.message)
    console.error('请确认 MySQL 已启动且 DATABASE_URL 正确,并已执行 npx prisma db push(dev/start 脚本会自动执行)')
    process.exit(1)
  }

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  app.get('/api/health', (req, res) => res.json({ code: 0, msg: 'ok', data: 'up' }))
  app.use('/api/users', usersRouter)
  app.use('/api/departments', departmentsRouter)
  app.use('/api/bigdata', bigdataRouter)

  // 统一错误处理
  app.use((err, req, res, next) => {
    console.error('[error]', err)
    res.status(500).json({ code: 1, msg: err.message || '服务器内部错误', data: null })
  })

  app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`)
  })
}

main()
