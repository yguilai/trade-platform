import api from '@/request/api'
import { Toast } from 'vant'

const category = {
  namespaced: true,
  state: {
    categories: [],
  },
  getters: {
    getCategories(state) {
      return state.categories
    },
  },
  mutations: {
    setCategories(state, cates) {
      state.categories = cates
    },
  },
  actions: {
    loadCategories(context) {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
        onOpened: async () => {
          // 获取分类数据
          api.category
            .getTreeCategories()
            .then((res) => {
              if (res.data.code === 200) {
                context.commit('setCategories', res.data.data)
                Toast.clear()
              }
            })
            .catch((reason) => {
              Toast.fail(reason ? reason : '获取分类数据失败')
            })
        },
      })
    },
  },
}

export default category
