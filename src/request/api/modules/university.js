import axios from '../../http'
import qs from 'qs'

export default {
  getUniversitiesByCity(city) {
    if (!city){
      return Promise.reject("城市为空")
    }
    return axios.request({
      url: '/universities',
      method: 'GET',
      params: {city}
    })
  },
  updateUserUniversity(uid, university) {
    if (!uid || !university) {
      return Promise.reject("用户id或高校名称不能为空")
    }
    return axios.request({
      url: `/users/${uid}/universities`,
      method: 'PUT',
      data: qs.stringify({
        university
      })
    });
  }
}
