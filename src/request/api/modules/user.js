import axios from '../../http'
import qs from 'qs'

export default {
  getUserInfoById(id) {
    return axios.request({
      url: `/users/${id}`,
      method: "GET"
    })
  },
  updateUserInfo(id, user) {
    return axios.request({
      url: `/users/${id}`,
      method: 'PUT',
      data: qs.stringify(user)
    })
  }
}
