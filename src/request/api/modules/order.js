import axios from '@/request/http'
import qs from 'qs'

export default {
  submitOrder(params) {
    return axios.request({
      url: '/orders',
      method: 'POST',
      data: qs.stringify(params),
    })
  },
  getOrderInfo(oid) {
    return axios.request({
      url: `/orders/${oid}`,
      method: 'GET',
    })
  },
  getOrderId(gid) {
    return axios.request({
      url: `/goods/${gid}/orders`,
      method: 'GET',
    })
  },
  updateOrderStatus(oid, status) {
    return axios.request({
      url: `/orders/${oid}`,
      method: 'PUT',
      data: qs.stringify({ status }),
    })
  },
  getOrderList(uid, type) {
    return axios.request({
      url: `/users/${uid}/orders`,
      method: 'GET',
      params: { type },
    })
  }
}
