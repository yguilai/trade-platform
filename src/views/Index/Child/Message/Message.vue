<template>
  <div class="message">
    <van-nav-bar
      title="消息"
      fixed
      class="nav"
      :border="false"
      :placeholder="true"
    />

    <van-pull-refresh
      class="chat-list"
      v-model="isRefreshChatList"
      @refresh="refreshChatList"
    >
      <van-list
        ref="chatList"
        v-model="isChatListLoading"
        :error.sync="isChatListLoadError"
        error-text="请求失败，点击重新加载"
        :finished="isChatListFinished"
        finished-text=""
        @load="onLoadChatList"
      >
        <van-cell
          center
          clickable
          @click="$router.push('/chat/' + item.name)"
          v-for="item in chatList"
          :key="'chat_' + item.id"
        >
          <template slot="title">
            <span class="chat-item-title" v-if="item.seller.userId === userId">
              {{ item.buyer.nickname | isOverMaxLength(1) }}
            </span>
            <span class="chat-item-title" v-else>
              {{ item.seller.nickname | isOverMaxLength(1) }}
            </span>
            <van-tag
              type="danger"
              v-if="
                hasUnreadMsg(
                  item.name,
                  item.seller.userId === userId
                    ? item.buyer.userId
                    : item.seller.userId
                )
              "
            >
              {{
                getUnreadChatMsg(
                  item.name,
                  item.seller.userId === userId
                    ? item.buyer.userId
                    : item.seller.userId
                ).unreadCount
              }}
            </van-tag>
          </template>
          <van-image
            slot="icon"
            class="chat-avatar"
            width="45"
            height="45"
            :src="
              item.seller.userId === userId
                ? item.buyer.avatar
                : item.seller.avatar | composeImageUrl
            "
          ></van-image>
          <van-image
            slot="right-icon"
            class="chat-goods-img"
            width="50"
            height="50"
            :src="item.goods.smallImage | composeImageUrl"
          />
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  SwipeCell,
  Cell,
  Image,
  Tag,
  List,
  PullRefresh,
  Toast,
  Button,
  Dialog,
} from 'vant'
import cst from '@/constant'

Vue.use(NavBar)
Vue.use(SwipeCell)
Vue.use(Cell)
Vue.use(Image)
Vue.use(Tag)
Vue.use(List)
Vue.use(PullRefresh)
Vue.use(Button)

export default {
  name: 'Message',
  data() {
    return {
      page: 1,
      size: 8,
      chatList: [],
      isRefreshChatList: false,
      isChatListLoading: false,
      isChatListLoadError: false,
      isChatListFinished: false,
    }
  },
  created() {
    this.loadChatList()
  },
  methods: {
    loadChatList() {
      if (!this.isChatListLoading) {
        this.isChatListLoading = true
        this.onLoadChatList()
      }
    },
    refreshChatList() {
      // 设置列表没有全部加载完结束
      this.isChatListFinished = false
      this.page = 1
      this.chatList = []
      this.isRefreshChatList = true
      this.loadChatList()
    },
    onLoadChatList() {
      if (this.isRefreshChatList) {
        this.isRefreshChatList = false
      }

      const uid = this.$store.getters['user/getUserId']

      this.$api.chat
        .getChatList(uid, this.page, this.size)
        .then((res) => {
          if (res.data.code === 200) {
            const { list, isLastPage } = res.data.data
            this.chatList = list
            this.isChatListFinished = isLastPage
            this.page++
            this.isChatListLoading = false
          } else {
            Toast.fail('意外的错误')
          }
        })
        .catch((reason) => {
          console.log(reason)
          // Toast.fail("意外的错误")
          this.isChatListLoadError = true
        })
    },
    // 判断是否有未读消息
    hasUnreadMsg(name, fromId) {
      return this.unreadHistoryMsg.some(
        (item) =>
          item.fromId === fromId && item.name === name && item.unreadCount !== 0
      )
    },
    // 获取未读消息
    getUnreadChatMsg(name, fromId) {
      for (const unreadMsg of this.unreadHistoryMsg)
        if (unreadMsg.fromId === fromId && unreadMsg.name === name)
          return unreadMsg
    },
  },
  computed: {
    userId() {
      return this.$store.getters['user/getUserId']
    },
    unreadHistoryMsg() {
      return this.$store.getters['message/getUnreadHistoryMsg']
    },
  },
  watch: {
    unreadHistoryMsg() {
      this.loadChatList()
    },
  },
  filters: {
    isOverMaxLength(value, type) {
      if (type) return value.length > 6 ? value.substring(0, 5) + '...' : value
      else return value.length > 7 ? value.substring(0, 7) + '...' : value
    },
  },
}
</script>

<style scoped lang="stylus">
.message {
  width 100%
  height 100%
}


>>> .van-nav-bar {
  border-bottom-left-radius 15px
  border-bottom-right-radius 15px
  background-color $bgColor
}

.chat-list {
  position fixed
  top 46px
  bottom 50px
  width 100%
  overflow-y auto
  display flex
  flex-direction column
}

.chat-avatar {
  margin-right 5px
}

.van-cell {
  width 98%
  margin 4px auto
  padding 10px 10px
  border-radius 5px

  .van-cell__title {
    display flex
    align-items center
  }

  .van-cell__value {
    margin-right 5px
  }
}

.chat-item-title {
  margin-right 5px
}

.van-swipe-cell__right button {
  height 100%
}
</style>
