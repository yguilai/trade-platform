import axios from '../../http'
import qs from 'qs'

export default {
  createChat(params) {
    return axios.request({
      url: '/chats',
      method: 'POST',
      data: qs.stringify(params),
    })
  },
  getChatList(uid, page, size) {
    return axios.request({
      url: `/users/${uid}/chats`,
      method: 'GET',
      params: { page, size },
    })
  },
  deleteOfflineChatMsg(name) {
    return axios.request({
      url: `/chats/${name}/offlinemsg`,
      method: 'DELETE',
    })
  },
}
