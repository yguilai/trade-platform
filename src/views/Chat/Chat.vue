<template>
  <div class="chat" v-if="goods.id && chatObj.userId">
    <div class="top-nav">
      <!-- NavBar -->
      <van-nav-bar
        :title="chatObj.nickname"
        fixed
        left-arrow
        @click-left="$router.back()"
      />

      <van-cell
        class="goods-fixed"
        :title="'￥' + goods.price"
        :label="
          goods.status === GOODS_STATUS.NORMAL
            ? '交易前聊一聊'
            : goods.status === GOODS_STATUS.TRADING
            ? '商品正在交易, 请及时与对方联系'
            : '交易已完成, 和对方交个朋友吧'
        "
        slot="header"
        center
      >
        <van-image
          slot="icon"
          radius="5"
          :src="goods.smallImage | composeImageUrl"
          lazy-load
          @click="$router.push(`/goods/${goods.id}`)"
        />

        <van-button
          size="small"
          slot="right-icon"
          type="danger"
          v-if="activeUser.userId !== goods.sellerId"
          @click="buyGoods"
        >
          {{ goods.status === GOODS_STATUS.NORMAL ? '立即购买' : '查看订单' }}
        </van-button>
        <van-button
          size="small"
          slot="right-icon"
          type="danger"
          v-if="
            activeUser.userId === goods.sellerId &&
              goods.status !== GOODS_STATUS.NORMAL
          "
          @click="buyGoods"
          text="查看订单"
        />
      </van-cell>
    </div>

    <!-- msgPanel -->
    <div class="msg-panel" ref="msgPanel">
      <!-- 遍历历史消息 -->
      <div class="msg-item" v-for="msg in historyMsg" :key="msg.time">
        <van-divider>{{ msg.time | timeFormat }}</van-divider>
        <div
          :class="[
            'msg-content',
            activeUser.userId === msg.from
              ? 'msg-content-right'
              : 'msg-content-left',
          ]"
        >
          <van-image
            class="msg-avatar"
            width="45"
            height="45"
            round
            :src="
              activeUser.userId === msg.from
                ? activeUser.avatar
                : chatObj.avatar | composeImageUrl
            "
          />
          <div
            :class="[
              'msg-text',
              activeUser.userId === msg.from
                ? 'msg-text-right'
                : 'msg-text-left',
            ]"
          >
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- @keydown.native按下回车键发送消息 -->
    <van-field
      class="input-msg"
      v-model="message"
      center
      clearable
      placeholder="想跟TA说点什么呢"
      rows="1"
      autosize
      type="textarea"
      @keydown.native="enterSendMessage($event)"
    >
      <van-button
        slot="button"
        @click="sendMessage"
        size="small"
        type="primary"
        color="#FEE70F"
        text="发送"
      />
    </van-field>
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar, Cell, Image, Button, Field, Divider, Toast } from 'vant'
import config from '@/config'
import cst from '@/constant'
import moment from 'moment'
import dayjs from 'dayjs'
import util from '@/util/common'
import { GOODS_CST } from '@/constant'

Vue.use(NavBar)
Vue.use(Cell)
Vue.use(Image)
Vue.use(Button)
Vue.use(Field)
Vue.use(Divider)

export default {
  name: 'Chat',
  data() {
    return {
      webSock: null,
      wsUriSuffix: '',
      connRetry: 0,
      chatObj: {},
      goods: {},
      orderId: 0,
      message: '',
      historyMsg: [],
      GOODS_STATUS: { ...GOODS_CST },
    }
  },
  created() {
    // 页面启动就加载用户和商品数据
    this.loadUserAndGoods()
  },
  destroyed() {
    // 离开当前页面就销毁对应websocket连接, 释放资源
    if (this.webSock) this.webSock.close()
  },
  mounted() {
    // 页面渲染完成就发送已读消息请求, 删除离线缓存的消息
    this.readHistoryMsg()
  },
  methods: {
    //立即购买商品/查看订单
    buyGoods() {
      switch (this.goods.status) {
        case GOODS_CST.NORMAL:
          this.$router.push({
            path: '/orderSubmit',
            query: { goods: JSON.stringify(this.goods) },
          })
          break
        case GOODS_CST.TRADING:
        case GOODS_CST.TRADING_OVER:
          // DONE 前往订单查看页面
          this.$router.push({
            path: `/order/${this.orderId}`,
          })
          break
        default:
          Toast.fail({
            message: '商品已下架',
            onClose: () => this.$router.back(),
          })
      }
    },
    // 已读消息
    readHistoryMsg() {
      const name = this.$route.params.ids
      this.$api.chat.deleteOfflineChatMsg(name).then((res) => {
        if (res.data.code === 200) {
          this.$store.commit('message/readOfflineMsg', name)
        }
      })
    },
    // 回车发送消息
    enterSendMessage(event) {
      if (event.keyCode === 13) {
        this.sendMessage()
        event.preventDefault() // 阻止浏览器默认换行操作
        return false
      }
    },
    // 发送消息
    sendMessage() {
      if (this.message.trim() !== '') {
        const msg = {
          name: this.$route.params.ids,
          from: this.activeUser.userId,
          to: this.chatObj.userId,
          content: this.message,
          time: new Date().getTime(),
        }
        this.webSock.send(JSON.stringify(msg))
        this.message = ''
      }
    },
    // 获取用户和商品数据
    loadUserAndGoods() {
      const ids = this.$route.params.ids.split('_')
      if (ids.length !== 3) {
        Toast.fail({
          message: '非法的请求',
          forbidClick: true,
          onClose: () => this.$router.back(),
        })
        return
      }

      // 从url中提取参数
      const [buyerId, goodsId, sellerId] = ids
      const activeUserId = this.activeUser.userId
      if (
        activeUserId &&
        activeUserId !== parseInt(buyerId) &&
        activeUserId !== parseInt(sellerId)
      ) {
        Toast.fail({
          message: '非法的请求',
          forbidClick: true,
          onClose: () => this.$router.back(),
        })
        return
      }

      // 判断聊天对象
      const chatObjId = parseInt(buyerId) === activeUserId ? sellerId : buyerId

      const load = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
        onOpened: async () => {
          try {
            // 使用异步等待机制, 获取商品及聊天对象信息
            const goodsRes = await this.$api.goods.getOneGoods(goodsId)
            if (util.isReqSuccess(goodsRes) && goodsRes.data.code === 200) {
              // 判断当前商品状态, 防止其他用户进入聊天
              this.goods = goodsRes.data.data
              switch (this.goods.status) {
                case GOODS_CST.TRADING:
                case GOODS_CST.TRADING_OVER:
                  // 商品状态为正在交易则获取订单id
                  if (!this.loadOrderId(this.goods.id)) {
                    Toast.fail({
                      message: '数据加载失败',
                      forbidClick: true,
                      onClose: () => {
                        this.$router.back()
                      },
                    })
                  }
                  break
                case GOODS_CST.OFF:
                  Toast.fail({
                    message: '商品已下架',
                    forbidClick: true,
                    onClose: () => this.$router.back(),
                  })
                  break
              }
            } else {
              Toast.fail('数据加载失败!')
              return
            }

            const userRes = await this.$api.user.getUserInfoById(chatObjId)

            if (util.isReqSuccess(userRes) && userRes.data.code === 200) {
              this.chatObj = userRes.data.data
              this.initWebSocket()
              load.clear()
            } else {
              Toast.fail('数据加载失败!')
            }
          } catch (e) {
            console.error(e)
            Toast.fail('意外的错误')
          }
        },
      })
    },
    async loadOrderId(goodsId) {
      const res = await this.$api.order.getOrderId(goodsId)
      if (res.status === 200 && res.data && res.data.code === 200) {
        this.orderId = res.data.data
        return true
      }
      return false
    },
    // 初始化ws连接
    initWebSocket() {
      // 发起连接的用户在前
      this.webSock = new WebSocket(
        `${config.wsUri}/chat/${this.$route.params.ids}`
      )
      this.webSock.onmessage = this.webSocketOnMessage
      this.webSock.onopen = this.webSocketOnOpen
      this.webSock.onerror = this.webSocketOnError
      this.webSock.onclose = this.webSocketClose
    },
    // 连接打开
    webSocketOnOpen() {
      console.log('ws 连接成功')
    },
    // ws连接建立失败重连, 重连次数最多3次
    webSocketOnError() {
      while (this.connRetry < 2) {
        this.initWebSocket()
        this.connRetry++
      }
    },
    // 数据接收
    webSocketOnMessage(e) {
      const msg = JSON.parse(e.data)
      // 表示是历史消息
      if (msg.from === -1) {
        const hm = JSON.parse(msg.content)
        this.historyMsg = this.historyMsg.concat(hm)
      } else if (msg.from !== 0) {
        this.historyMsg.push(msg)
      }
    },
    // ws连接关闭
    webSocketClose(e) {
      console.log('ws断开连接')
    },
  },
  computed: {
    // 获取当前登录用户
    activeUser() {
      return this.$store.getters['user/getUser']
    },
  },
  filters: {
    // 日期格式化
    timeFormat(val) {
      // momentjs替换成更加轻量的dayjs
      // return moment(val).format('YYYY-MM-DD HH:mm:ss')
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  watch: {
    historyMsg() {
      // 监听historyMsg变化 页面自动滚动到底部
      this.$nextTick(() => {
        let msgPanel = document.querySelector('.msg-panel')
        msgPanel.scrollTop = msgPanel.scrollHeight
      })
    },
  },
}
</script>

<style scoped lang="stylus">
.chat {
  width 100%
  height 100%
}

.goods-fixed {
  position fixed
  z-index 5000
  top 46px
  padding 5px 8px 5px 8px

  >>> .van-image {
    margin-right 4px

    .van-image__img {
      width 50px
      height 50px
    }
  }
}

.input-msg {
  position fixed
  bottom 0
}

.msg-panel {
  width 100%
  position fixed
  top 106px
  bottom 50px
  padding-bottom 10px
  overflow-y scroll

  .msg-item {
    padding 5px

    .van-divider {
      margin 0
      color #ccc
      font-size 12px

      .van-divider::after, .van-divider::before {
        border-width 0
      }

    }

    .msg-content {
      display flex

      .msg-text {
        background-color: #fff;
        padding 15px 5px
        max-width 280px
        word-break break-word
        border-radius 5px
      }

      .msg-text-left {
        position relative
        margin-left 10px
      }

      .msg-text-right {
        position relative
        margin-right 10px
      }

      .msg-text-left::before {
        content ''
        display block
        width 0
        height 0
        position absolute
        top 15px
        left -8px
        border-top solid 8px transparent
        border-right solid 8px #fff
        border-bottom solid 8px transparent
      }

      .msg-text-right::after {
        content ''
        display block
        width 0
        height 0
        position absolute
        top 15px
        right -8px
        border-top solid 8px transparent
        border-left solid 8px #fff
        border-bottom solid 8px transparent
      }

      .msg-text-right {
        margin-right 10px
      }
    }

    .msg-content-left {
      flex-direction row
    }

    .msg-content-right {
      flex-direction row-reverse
    }
  }
}
</style>
