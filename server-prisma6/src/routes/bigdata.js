const express = require('express')
const { ok } = require('../utils/response')

const router = express.Router()

const ROLES = ['前端', '后端', '测试', '产品', '设计']
const NAMES = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨磊', '赵敏', '黄军', '周艳', '吴杰']

// GET /api/bigdata?size=100000&cols=20  内存生成,不落库
router.get('/', (req, res) => {
  const size = Math.min(200000, Math.max(1, Number(req.query.size) || 10000))
  const cols = Math.min(200, Math.max(0, Number(req.query.cols) || 0))
  const list = new Array(size)
  for (let i = 0; i < size; i++) {
    const row = {
      id: i + 1,
      name: `${NAMES[i % NAMES.length]}${i + 1}`,
      role: ROLES[i % ROLES.length],
      sex: i % 2,
      age: 20 + (i % 36),
      salary: 6000 + (i % 400) * 100,
      rate: (i % 100) / 100,
      address: `演示地址第 ${i + 1} 号`
    }
    for (let c = 0; c < cols; c++) {
      row[`col${c}`] = `${i + 1}-${c}`
    }
    list[i] = row
  }
  ok(res, { list, total: size })
})

module.exports = router
