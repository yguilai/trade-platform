import axios from '@/request/http'

export default {
  getCityList() {
    return axios.request({
      url: '/cities',
      method: 'GET',
    })
  },
}
