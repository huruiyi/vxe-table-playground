const express = require('express')
const { prisma } = require('../prisma')
const { ok, fail } = require('../utils/response')
const { serializeUser } = require('../utils/serialize')

const router = express.Router()

// 排序字段白名单:前端字段 -> Prisma 字段
const SORT_FIELDS = {
  id: 'id',
  name: 'name',
  age: 'age',
  sex: 'sex',
  salary: 'salary',
  joinDate: 'joinDate',
  join_date: 'joinDate',
  createdAt: 'createdAt'
}

// 提取可写字段(兼容驼峰与 snake_case 两种入参)
function pickWritable(body = {}) {
  const data = {}
  const map = {
    name: 'name',
    nickname: 'nickname',
    sex: 'sex',
    age: 'age',
    role: 'role',
    email: 'email',
    phone: 'phone',
    address: 'address',
    salary: 'salary',
    status: 'status',
    deptId: 'deptId',
    dept_id: 'deptId',
    joinDate: 'joinDate',
    join_date: 'joinDate'
  }
  for (const [key, field] of Object.entries(map)) {
    const val = body[key]
    if (val === undefined || val === null) continue
    data[field] = val
  }
  if (data.sex !== undefined) data.sex = Number(data.sex)
  if (data.age !== undefined) data.age = Number(data.age)
  if (data.status !== undefined) data.status = Number(data.status)
  if (data.deptId !== undefined) data.deptId = Number(data.deptId)
  if (data.salary !== undefined) data.salary = Number(data.salary) || 0
  if (data.joinDate !== undefined) {
    data.joinDate = data.joinDate ? new Date(data.joinDate) : null
  }
  return data
}

function buildWhere(query) {
  const where = {}
  if (query.name) where.name = { contains: query.name }
  if (query.role) where.role = query.role
  if (query.sex !== undefined && query.sex !== '') where.sex = Number(query.sex)
  if (query.status !== undefined && query.status !== '') where.status = Number(query.status)
  if (query.minAge || query.maxAge) {
    where.age = {}
    if (query.minAge) where.age.gte = Number(query.minAge)
    if (query.maxAge) where.age.lte = Number(query.maxAge)
  }
  return where
}

// GET /api/users 列表:分页 + 排序 + 筛选
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 10))
    const where = buildWhere(req.query)

    const orderBy = []
    const field = SORT_FIELDS[req.query.sortField]
    if (field) {
      orderBy.push({ [field]: String(req.query.sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc' })
    }
    orderBy.push({ id: 'asc' })

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])
    ok(res, { list: list.map(serializeUser), total })
  } catch (err) {
    next(err)
  }
})

// POST /api/users/batch-save 对接 vxe-grid proxy-config.ajax.save,单事务
router.post('/batch-save', async (req, res, next) => {
  try {
    const { insertRecords = [], updateRecords = [], removeRecords = [] } = req.body || {}
    const removeIds = removeRecords.map((r) => Number(r.id)).filter(Boolean)

    await prisma.$transaction(async (tx) => {
      for (const rec of insertRecords) {
        const data = pickWritable(rec)
        if (data.name) {
          await tx.user.create({ data })
        }
      }
      for (const rec of updateRecords) {
        const data = pickWritable(rec)
        if (rec.id && Object.keys(data).length) {
          await tx.user.update({ where: { id: Number(rec.id) }, data })
        }
      }
      if (removeIds.length) {
        await tx.user.deleteMany({ where: { id: { in: removeIds } } })
      }
    })

    ok(res, {
      inserted: insertRecords.length,
      updated: updateRecords.length,
      removed: removeIds.length
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
    if (!user) return fail(res, '用户不存在', 404, 404)
    ok(res, serializeUser(user))
  } catch (err) {
    next(err)
  }
})

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const data = pickWritable(req.body)
    if (!data.name) return fail(res, '姓名不能为空')
    const user = await prisma.user.create({ data })
    ok(res, { id: user.id })
  } catch (err) {
    next(err)
  }
})

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const data = pickWritable(req.body)
    if (!Object.keys(data).length) return fail(res, '没有可更新的字段')
    await prisma.user.update({ where: { id: Number(req.params.id) }, data })
    ok(res, { id: Number(req.params.id) })
  } catch (err) {
    if (err.code === 'P2025') return fail(res, '用户不存在', 404, 404)
    next(err)
  }
})

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    ok(res, null)
  } catch (err) {
    if (err.code === 'P2025') return fail(res, '用户不存在', 404, 404)
    next(err)
  }
})

module.exports = router
