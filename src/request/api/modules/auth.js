import qs from 'qs'
import axios from '../../http'

const auth = {
  signIn(params) {
    return sendPostRequest('/auth/login', params)
  },
  signUp(params) {
    return sendPostRequest('/auth/register', params)
  },
  refreshToken(params) {
    return sendPostRequest('/auth/refresh', params)
  },
  checkIdentifier(params) {
    return axios.request({
      url: '/auth/check',
      method: 'GET',
      params: params,
    })
  },
  getEmailCode(params) {
    return sendPostRequest('/auth/email', params)
  },
  updatePwd(params) {
    return axios.request({
      url: '/auth/updatePwd',
      method: 'PUT',
      data: qs.stringify(params),
    })
  },
  forgotPwd(params) {
    return axios.request({
      url: '/auth/forgot',
      method: 'PUT',
      data: qs.stringify(params),
    })
  },
}

const sendPostRequest = (api, params) => {
  return axios.request({
    url: api,
    method: 'POST',
    data: qs.stringify(params),
  })
}

export default auth
