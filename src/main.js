import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './request/api'
import config from '@/config'

import './assets/css/reset.css'
import './assets/css/iconfont.css'
import 'lib-flexible'

// 全局使用懒加载
import { Lazyload } from 'vant'
Vue.use(Lazyload)

Vue.prototype.$api = api
Vue.config.productionTip = false

// composeImageUrl全局过滤器, 给图片链接添加上cdn
Vue.filter('composeImageUrl', (val) => {
  return config.cdn + val
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
