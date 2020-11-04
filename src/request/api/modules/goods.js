import axios from '@/request/http'
import qs from 'qs'

export default {
  publishGoods(params) {
    return axios.request({
      url: '/goods',
      method: "POST",
      data: qs.stringify(params)
    })
  },
  getGoodsListByUniversityId(params) {
    return axios.request({
      url: '/goods',
      method: "GET",
      params: params
    })
  },
  getOneGoods(id) {
    return axios.request({
      url: `/goods/${id}`,
      method: "GET"
    })
  },
  getGoodsListByCategoryId(id, params){
    return axios.request({
      url: `/categories/${id}/goods`,
      method: "GET",
      params: params
    })
  },
  getGoodsListBySellerId(id){
    return axios.request({
      url: `/users/${id}/goods`,
      method: "GET",
    })
  },
  getAllStared() {
    return axios.request({
      url: `users/${uid}/stars`,
      method: 'GET'
    })
  },
  isStar(uid, gid) {
    return axios.request({
      url: `users/${uid}/stars/${gid}`,
      method: 'GET'
    })
  },
  addStar(uid, gid) {
    return axios.request({
      url: `users/${uid}/stars`,
      method: 'POST',
      data: qs.stringify({goodsId: gid})
    })
  },
  unStar(uid, gid) {
    return axios.request({
      url: `users/${uid}/stars/${gid}`,
      method: 'DELETE',
    })
  }
}
