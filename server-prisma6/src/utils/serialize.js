// Prisma 模型为驼峰,API 出口统一序列化为 snake_case(与前端约定一致)

function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`
}

function fmtDateTime(d) {
  if (!d) return null
  const dt = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`
}

function serializeUser(u) {
  return {
    id: u.id,
    name: u.name,
    nickname: u.nickname,
    sex: u.sex,
    age: u.age,
    role: u.role,
    dept_id: u.deptId,
    email: u.email,
    phone: u.phone,
    address: u.address,
    salary: Number(u.salary),
    join_date: fmtDate(u.joinDate),
    status: u.status,
    created_at: fmtDateTime(u.createdAt),
    updated_at: fmtDateTime(u.updatedAt)
  }
}

function serializeDept(d) {
  return {
    id: d.id,
    parent_id: d.parentId,
    name: d.name,
    manager: d.manager,
    emp_count: d.empCount
  }
}

module.exports = { serializeUser, serializeDept, fmtDate }
