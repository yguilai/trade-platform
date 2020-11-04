<template>
  <div class="profile">
    <van-cell class="user" :title="user.nickname" center :label="user.username">
      <van-image
        slot="icon"
        radius="5"
        class="user-avatar"
        width="50"
        height="50"
        :src="user.avatar | composeImageUrl"
        lazy-load
      ></van-image>
    </van-cell>

    <div class="panel-list">
      <!--title="标题" desc="描述信息" status="状态"-->
      <van-panel>
        <div slot="header" class="van-cell__title">
          <span class="panel-item-title">卖在TP</span>
        </div>
        <van-grid column-num="3" clickable :border="false">
          <van-grid-item
            @click="toPage(`/users/${user.userId}/publish`)"
            icon="shop-o"
            text="我发布的"
          />
          <van-grid-item
            @click="toPage(`/mySold`)"
            icon="gold-coin-o"
            text="我卖出的"
          />
        </van-grid>
      </van-panel>

      <van-panel>
        <div slot="header" class="van-cell__title">
          <span class="panel-item-title">买在TP</span>
        </div>

        <van-grid column-num="3" clickable :border="false">
          <van-grid-item
            @click="toPage('/myStar')"
            icon="star-o"
            text="我收藏的"
          />
          <van-grid-item
            @click="toPage('/myBought')"
            icon="bag-o"
            text="我买到的"
          />
        </van-grid>
      </van-panel>

      <van-panel>
        <div slot="header" class="van-cell__title">
          <span class="panel-item-title">我</span>
        </div>
        <van-grid column-num="3" clickable :border="false">
          <van-grid-item
            @click="toPage('/myProfile')"
            icon="ziliao"
            icon-prefix="iconfont"
            text="我的资料"
          />
          <van-grid-item
            icon="xiugaimima"
            icon-prefix="iconfont"
            text="修改密码"
            @click="toPage('/updatePwd')"
          />
          <van-grid-item
            icon="tuichu"
            icon-prefix="iconfont"
            text="退出登录"
            @click="logout"
          />
        </van-grid>
      </van-panel>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Cell, Image, Panel, Grid, GridItem, Dialog } from 'vant'

Vue.use(Cell)
Vue.use(Image)
Vue.use(Panel)
Vue.use(Grid)
Vue.use(GridItem)

export default {
  name: 'User',
  data() {
    return {}
  },
  methods: {
    toPage(path) {
      this.$router.push(path)
    },
    logout() {
      Dialog.confirm({
        message: '确认退出登录?',
        closeOnPopstate: true,
        closeOnClickOverlay: true,
      })
        .then(() => {
          this.$router.push('/login')
        })
        .catch(() => {})
    },
  },
  computed: {
    user() {
      return this.$store.state.user.activeUser
    },
  },
}
</script>

<style scoped lang="stylus">
.profile {
  width 100%
  height 100%
  overflow-y auto
}

.user {
  padding 20px 10px
  border-bottom-left-radius 15px
  border-bottom-right-radius 15px
  background-color $bgColor
}


.user-avatar {
  margin 0 8px
}


.van-cell__label {
  color #fff
}


.panel-list {
  display flex
  flex-direction column
  padding-bottom 60px

  .van-cell-group {
    margin 0 auto
    margin-top 10px
    width 95%
    border-radius 10px

    .van-panel__header {
      border-top-left-radius 10px
      border-top-right-radius 10px
    }

    .van-panel__content {
      border-bottom-left-radius 10px
      border-bottom-right-radius 10px
      padding 10px 16px
    }
  }
}


.van-cell__title {
  padding 10px 16px 0 16px

  .panel-item-title {
    font-weight 900
  }
}
</style>
