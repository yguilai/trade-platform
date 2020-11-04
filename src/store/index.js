import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import user from './modules/user'
import category from './modules/category'
import university from './modules/university'
import message from './modules/message'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    user,
    category,
    university,
    message
  },
  state: {},
  mutations: {},
  actions: {}
})
