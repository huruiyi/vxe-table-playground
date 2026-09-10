const express = require('express')
const { prisma } = require('../prisma')
const { ok } = require('../utils/response')
const { serializeDept } = require('../utils/serialize')

const router = express.Router()

function buildTree(rows, parentId = 0) {
  return rows
    .filter((r) => r.parent_id === parentId)
    .map((r) => {
      const children = buildTree(rows, r.id)
      return children.length ? { ...r, children } : { ...r }
    })
}

// GET /api/departments/tree  ?flat=1 返回扁平结构(给 tree-config.transform 用)
router.get('/tree', async (req, res, next) => {
  try {
    const rows = await prisma.department.findMany({ orderBy: { id: 'asc' } })
    const flat = rows.map(serializeDept)
    ok(res, req.query.flat ? flat : buildTree(flat))
  } catch (err) {
    next(err)
  }
})

// GET /api/departments/children?parentId=0  树形懒加载
router.get('/children', async (req, res, next) => {
  try {
    const parentId = Number(req.query.parentId) || 0
    const rows = await prisma.department.findMany({ where: { parentId } })
    // 标记是否有子节点,前端据此显示展开箭头
    const ids = rows.map((r) => r.id)
    let hasChildSet = new Set()
    if (ids.length) {
      const childRows = await prisma.department.findMany({
        where: { parentId: { in: ids } },
        select: { parentId: true },
        distinct: ['parentId']
      })
      hasChildSet = new Set(childRows.map((r) => r.parentId))
    }
    ok(res, rows.map((r) => ({ ...serializeDept(r), hasChild: hasChildSet.has(r.id) })))
  } catch (err) {
    next(err)
  }
})

module.exports = router
