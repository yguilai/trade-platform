import axios from 'axios'
import router from '@/router'
import store from '@/store'
import { Toast } from 'vant'
import config from '@/config'
import { QINIU } from '@/constant'

let instance = axios.create({ timeout: 1000 * 12 })

instance.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'
instance.defaults.baseURL = config.baseApi

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在请求头中添加token
    const token = store.getters['auth/getToken']
    token !== null && (config.headers.Authorization = 'Bearer ' + token)
    return config
  },
  (error) => Promise.error(error)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => (res.status === 200 ? Promise.resolve(res) : Promise.reject(res)),
  (error) => {
    const { response } = error
    if (response) {
      errorHandle(response.status, response.data.message, response.data)
      return Promise.reject(response)
    } else {
      store.commit('auth/changeNetwork', false)
    }
  }
)

const toLogin = () => {
  router.replace({
    path: '/login',
    query: {
      redirect: router.currentRoute.fullPath,
      status: 401,
    },
  })
}

const errorHandle = (status, other, data) => {
  switch (status) {
    case 400:
      Toast.fail({
        message: data.msg || '请求出错, 请重试',
      })
      break
    case 401:
      if (data.error === QINIU.QINIU_BAD_TOKEN) {
        return
      }
      Toast({
        type: 'fail',
        duration: 2000,
        message: '未登录或登录过期, 请重新登录',
        overlay: true,
        forbidClick: true,
        onClose: () => toLogin(),
      })
      break
    case 403:
      Toast({
        type: 'fail',
        duration: 2000,
        message: '访问权限受限, 请联系管理员',
        overlay: true,
        forbidClick: true,
      })
      break
    case 404:
      Toast.fail('请求的资源不存在')
      break
    case 500:
      Toast.fail('系统出小差了, 让管理员来处理吧ಥ_ಥ')
      break
    default:
      console.log(other)
  }
}

export default instance
