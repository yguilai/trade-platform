import axios from '@/request/http'

export default {
  // 上传文件到七牛云存储
  uploadFileToQiniu(file, token) {
    let formData = new FormData()
    formData.append("file", file)
    formData.append("token", token)

    return axios.request({
      url: 'https://upload-z2.qiniup.com',
      method: "POST",
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: false, // 禁止跨域携带cookie，带cookie在七牛上有可能出现跨域问题
      timeout: 30000,
      data: formData
    })
  },
  deleteFIleFromQiniu(key) {
    return axios.request({
      url: `/files/${key}`,
      method: "DELETE",
    })
  },
  getQiniuToken() {
    return axios.request({
      url:'/qntoken',
      method: "GET"
    })
  }
}
