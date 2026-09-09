require('dotenv').config()
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
const { PrismaClient } = require('../src/generated/prisma/client')

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

const SURNAMES = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '许', '何']
const GIVEN = ['伟', '芳', '娜', '敏', '静', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英']
const ROLES = ['前端', '后端', '测试', '产品', '设计']
const CITIES = ['北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区', '杭州市西湖区', '成都市高新区', '武汉市洪山区', '南京市玄武区']

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

function randomUser(i, deptIds) {
  return {
    name: pick(SURNAMES) + pick(GIVEN),
    nickname: `nick_${i}`,
    sex: randInt(0, 1),
    age: randInt(20, 55),
    role: pick(ROLES),
    deptId: pick(deptIds),
    email: `user${i}@example.com`,
    phone: `13${randInt(0, 9)}${String(randInt(0, 99999999)).padStart(8, '0')}`,
    address: pick(CITIES),
    salary: randInt(6000, 50000) + randInt(0, 99) / 100,
    joinDate: new Date(Date.UTC(randInt(2015, 2025), randInt(0, 11), randInt(1, 28))),
    status: randInt(0, 10) > 1 ? 1 : 0
  }
}

// 部门树:3 层。[name, parentIndex(种子数组下标, -1 表示根), manager]
const DEPT_SEED = [
  ['集团总部', -1, '王总'],
  ['技术中心', 0, '李征'],
  ['产品中心', 0, '陈平'],
  ['运营中心', 0, '周洋'],
  ['前端组', 1, '韩梅'],
  ['后端组', 1, '刘伟'],
  ['测试组', 1, '赵静'],
  ['产品一部', 2, '孙磊'],
  ['产品二部', 2, '吴敏'],
  ['用户运营', 3, '郑娜'],
  ['内容运营', 3, '冯军'],
  ['基础架构', 5, '朱杰'],
  ['业务开发', 5, '许涛']
]

async function seedDepartments() {
  const count = await prisma.department.count()
  if (count > 0) {
    const rows = await prisma.department.findMany({ select: { id: true } })
    return rows.map((r) => r.id)
  }
  const idByIndex = []
  for (const [name, parentIndex, manager] of DEPT_SEED) {
    const dept = await prisma.department.create({
      data: {
        name,
        manager,
        parentId: parentIndex === -1 ? 0 : idByIndex[parentIndex],
        empCount: randInt(5, 60)
      }
    })
    idByIndex.push(dept.id)
  }
  console.log(`[seed] created ${idByIndex.length} departments`)
  return idByIndex
}

async function seedUsers(deptIds) {
  const total = Number(process.env.SEED_USER_COUNT || 100000)
  const batchSize = Number(process.env.SEED_BATCH_SIZE || 5000)

  // 先清空已有用户,保证数据量稳定
  const cleared = await prisma.user.deleteMany({})
  console.log(`[seed] cleared ${cleared.count} users, preparing ${total} rows`)

  for (let offset = 0; offset < total; offset += batchSize) {
    const size = Math.min(batchSize, total - offset)
    const data = []
    for (let j = 0; j < size; j++) {
      data.push(randomUser(offset + j + 1, deptIds))
    }
    await prisma.user.createMany({ data })
    console.log(`[seed] inserted ${offset + size}/${total}`)
  }
  const finalCount = await prisma.user.count()
  console.log(`[seed] done, total users: ${finalCount}`)
}

async function main() {
  const deptIds = await seedDepartments()
  await seedUsers(deptIds)
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
