import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/Index/Index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('../views/Index/Child/Home/Home.vue'),
        meta: {
          title: '首页',
        },
      },
      {
        path: 'publish',
        name: 'publish',
        component: () => import('../views/Index/Child/Publish/Publish.vue'),
        meta: {
          title: '发布',
        },
      },
      {
        path: 'message',
        name: 'message',
        component: () => import('../views/Index/Child/Message/Message.vue'),
        meta: {
          title: '消息',
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../views/Index/Child/Profile/Profile.vue'),
        meta: {
          title: '我',
        },
      },
      {
        path: '/category',
        name: 'category',
        component: () => import('../views/Index/Child/Category/Category.vue'),
        meta: {
          title: '分类',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/Login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register/Register.vue'),
    meta: {
      title: '注册',
    },
  },
  {
    path: '/forgot',
    name: 'Forgot',
    component: () => import('../views/Forgot/Forgot.vue'),
    meta: {
      title: '找回密码',
    },
  },
  {
    path: '/goods/:gid',
    name: 'goods',
    component: () => import('../views/Goods/Goods.vue'),
    meta: {
      title: '商品详情',
    },
  },
  {
    // 规定ids有 交易双方id和商品id组成, 格式为: '买家id_商品id_卖家id'
    path: '/chat/:ids',
    name: 'chat',
    component: () => import('../views/Chat/Chat.vue'),
    meta: {
      title: '聊天',
    },
  },
  {
    path: '/categoryDetails/:cid',
    name: 'categoryDetails',
    component: () => import('../views/CategoryDetails/CategoryDetails.vue'),
    meta: {
      title: '分类详情',
    },
  },
  {
    path: '/users/:uid/publish',
    name: 'UserPublish',
    component: () => import('../views/ProfileChild/MyPublish/MyPublish.vue'),
    meta: {
      title: '我发布的',
    },
  },
  {
    path: '/mySold',
    name: 'MySold',
    component: () => import('../views/ProfileChild/MySold/MySold.vue'),
    meta: {
      title: '我卖出的',
    },
  },
  {
    path: '/myBought',
    name: 'MyBought',
    component: () => import('../views/ProfileChild/MyBought/MyBought.vue'),
    meta: {
      title: '我买到的',
    },
  },
  {
    path: '/myProfile',
    name: 'MyProfile',
    component: () => import('../views/ProfileChild/MyProfile/MyProfile.vue'),
    meta: {
      title: '我的资料',
    },
  },
  {
    path: '/myStar',
    name: 'MyStar',
    component: () => import('../views/ProfileChild/MyStar/MyStar.vue'),
    meta: {
      title: '我的收藏夹',
    },
  },
  {
    path: '/updatePwd',
    name: 'UpdatePwd',
    component: () =>
      import('../views/ProfileChild/UpdatePassword/UpdatePassword.vue'),
    meta: {
      title: '修改密码',
    },
  },
  {
    path: '/orderSubmit',
    name: 'SubmitOrder',
    component: () => import('../views/Order/OrderSubmit.vue'),
    meta: {
      title: '订单提交',
    },
  },
  {
    path: '/order/:oid',
    name: 'Order',
    component: () => import('../views/Order/Order.vue'),
    meta: {
      title: '订单详情',
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search/Search.vue'),
    meta: {
      title: '商品查询',
    },
  },
]

const router = new VueRouter({
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 判断当前是否已登录
  const isLogin =
    store.getters['auth/getToken'] !== null &&
    store.getters['user/getUser'].userId !== null
  if (
    to.path === '/login' ||
    to.path === '/register' ||
    to.path === '/forgot'
  ) {
    next()
  } else {
    isLogin ? next() : next('/login')
  }
})

export default router
