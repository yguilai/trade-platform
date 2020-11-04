import axios from '../../http'

export default {
  getTreeCategories() {
    return axios.request({
      url: '/categories',
      method: "GET"
    })
  }
}
