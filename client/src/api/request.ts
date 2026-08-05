import axios from 'axios'
import { message } from 'antdv-next'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 后端统一返回 {code,msg,data},拦截器解包 data
request.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code !== 0) {
        message.error(body.msg || '请求失败')
        return Promise.reject(new Error(body.msg || '请求失败'))
      }
      return body.data
    }
    return body
  },
  (err) => {
    const msg = err?.response?.data?.msg || err.message || '网络错误'
    message.error(msg)
    return Promise.reject(err)
  }
)

export default request
