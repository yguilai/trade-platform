<template>
  <div class="index">
    <transition name="fade">
      <router-view />
    </transition>
    <!-- Tabbar -->
    <van-tabbar v-model="active" v-show="true" active-color="#FEE70F">
      <van-tabbar-item name="home" icon="home-o" to="/home"
        >首页</van-tabbar-item
      >
      <van-tabbar-item
        name="category"
        icon="fenlei"
        icon-prefix="iconfont"
        to="/category"
      >
        分类
      </van-tabbar-item>
      <van-tabbar-item name="publish" icon="add-o" to="/publish">
        发布
      </van-tabbar-item>
      <van-tabbar-item
        v-if="unreadMsgCount !== 0"
        name="message"
        icon="chat-o"
        :badge="unreadMsgCount"
        to="/message"
      >
        消息
      </van-tabbar-item>
      <van-tabbar-item v-else name="message" icon="chat-o" to="/message">
        消息
      </van-tabbar-item>
      <van-tabbar-item name="profile" icon="user-o" to="/profile">
        我
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tabbar, TabbarItem, Toast } from 'vant'

Vue.use(Tabbar)
Vue.use(TabbarItem)

export default {
  name: 'Index',
  data() {
    return {
      active: 'home',
      hbTimer: null,
      retry: 0,
    }
  },
  created() {
    if (!this.msgWebSock) this.initPushWebsocket()
  },
  mounted() {
    // tab bat active
    if (this.$router.currentRoute.name !== this.active) {
      this.active = this.$router.currentRoute.name
    }
    this.hbTimer = this.msgWebSocketHeartbeat()
  },
  methods: {
    // 初始化消息推送websocket连接, 用于接收服务端推送的消息, 同时提供判断是否在线的依据
    initPushWebsocket() {
      this.$store.commit('message/initMsgWebSock')
      this.$store.commit('message/webSockOnMessage')
    },
    // 每两分钟进行一次心跳检测
    msgWebSocketHeartbeat() {
      return setInterval(() => {
        const hb = {
          from: this.$store.getters['user/getUserId'],
          content: 'ping',
        }
        try {
          this.msgWebSock.send(JSON.stringify(hb))
        } catch (e) {
          console.log(e)
          if (this.retry < 2) {
            this.initPushWebsocket()
            this.retry++
          } else {
            Toast.fail('网络异常, 请刷新')
            clearInterval(this.hbTimer)
          }
        }
      }, 2 * 60 * 1000)
    },
  },
  computed: {
    msgWebSock() {
      return this.$store.getters['message/getMsgWebSock']
    },
    unreadMsgCount() {
      return this.$store.getters['message/getAllUnreadMsgCount']
    },
  },
}
</script>

<style scoped lang="stylus">
.index {
  width 100%
  height 100%
}

.fade-enter-active, .fade-leave-active {
  transition opacity .3s
}

.fade-leave-to {
  display none
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity 0
}
</style>
