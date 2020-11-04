<template>
  <div class="goods" v-if="user.userId">
    <van-nav-bar
      title="商品详情"
      fixed
      left-arrow
      @click-left="$router.back()"
    />

    <van-panel class="content">
      <van-cell
        class="user"
        :title="user.nickname"
        slot="header"
        clickable
        @click="$router.push(`/users/${user.userId}/publish`)"
      >
        <van-image
          :src="user.avatar | composeImageUrl"
          class="user-avatar"
          height="50"
          lazy-load
          radius="5"
          slot="icon"
          width="50"
        />
      </van-cell>
      <div class="goods-price">{{ goods.price }}</div>
      <div class="goods-content">{{ goods.content }}</div>
      <div class="image-list">
        <van-image
          v-for="(url, i) in goods.imageList.split(',')"
          :key="url + i"
          @click="onImageClick(i)"
          :src="url | composeImageUrl"
        />
      </div>
    </van-panel>

    <van-goods-action>
      <van-goods-action-icon
        :icon="star.ico"
        :text="star.text"
        :color="star.color"
        @click="onStar"
      />
      <van-goods-action-button type="danger" text="我想要" @click="onWant" />
    </van-goods-action>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  GoodsAction,
  GoodsActionIcon,
  GoodsActionButton,
  Panel,
  Image,
  Toast,
  ImagePreview,
  Cell,
} from 'vant'
import config from '@/config'
import cst from '@/constant'

Vue.use(NavBar)
Vue.use(GoodsAction)
Vue.use(GoodsActionButton)
Vue.use(GoodsActionIcon)
Vue.use(Panel)
Vue.use(Image)
Vue.use(ImagePreview)
Vue.use(Cell)

export default {
  name: 'Goods',
  data() {
    return {
      //
      user: {},
      goods: {},
      unStar: {
        ico: 'star-o',
        text: '收藏',
        color: '#000000',
        isStared: false,
      },
      stared: {
        ico: 'star',
        text: '已收藏',
        color: '#FEE70F',
        isStared: true,
      },
      star: {
        ico: 'star-o',
        text: '收藏',
        color: '#000000',
        isStared: false,
      },
    }
  },
  created() {
    this.loadGoodsAndUserAndStar()
  },
  destroyed() {
    sessionStorage.setItem(`goods_${this.goods.id}`, JSON.stringify(this.goods))
    sessionStorage.setItem(
      `user_${this.user.userId}`,
      JSON.stringify(this.user)
    )
  },
  methods: {
    loadGoodsAndUserAndStar() {
      Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
        onOpened: async () => {
          let isReqSuccess = false
          try {
            const goodsRes = await this.$api.goods.getOneGoods(
              this.$route.params.gid
            )

            if (this.isReqSuccess(goodsRes) && goodsRes.data.code === 200) {
              this.goods = goodsRes.data.data
              isReqSuccess = true
              // 获取用户数据
              this.$api.user
                .getUserInfoById(this.goods.sellerId)
                .then((res) => {
                  if (res.data.code === 200) {
                    this.user = res.data.data
                  } else {
                    isReqSuccess = false
                  }
                })
              // 判断当前商品是否被当前登录用户收藏
              this.$api.goods
                .isStar(this.$store.getters['user/getUserId'], this.goods.id)
                .then((res) => {
                  if (res.data.code === 200) {
                    this.star = res.data.data.isStar ? this.stared : this.unStar
                  } else {
                    isReqSuccess = false
                  }
                })
            }
          } catch (e) {
            console.warn(e)
          } finally {
            if (isReqSuccess) {
              Toast.clear()
            } else {
              Toast.fail('数据获取失败')
            }
          }
        },
      })
    },
    onStar() {
      if (this.isMyselfGoods()) {
        return Toast.fail('不需要收藏自己发布的商品')
      }

      if (this.star.isStared) {
        this.$api.goods.unStar(this.activeUserId, this.goods.id).then((res) => {
          if (res.data.code === 200) {
            this.star = this.unStar
          } else {
            Toast.fail('取消收藏失败')
          }
        })
      } else {
        this.$api.goods
          .addStar(this.activeUserId, this.goods.id)
          .then((res) => {
            if (res.data.code === 200) {
              this.star = this.stared
            } else {
              Toast.fail('收藏失败')
            }
          })
      }
    },
    onWant() {
      if (this.isMyselfGoods()) {
        return Toast.fail('不能购买自己发布的商品')
      }
      const buyerId = this.activeUserId
      const sellerId = this.user.userId
      const goodsId = this.goods.id
      const params = {
        name: `${buyerId}_${goodsId}_${sellerId}`,
        sellerId: sellerId,
        buyerId: buyerId,
        goodsId: goodsId,
      }

      this.$api.chat
        .createChat(params)
        .then((res) => {
          if (res.data.meta.code === cst.SUCCESS) {
            this.$router.push(`/chat/${params.name}`)
          } else {
            Toast.fail('意外的错误')
          }
        })
        .catch((reason) => {
          console.log(reason)
          Toast.fail('意外的错误')
        })
    },
    onImageClick(index) {
      ImagePreview({
        images: this.goods.imageList
          .split(',')
          .map((item) => config.cdn + item),
        startPosition: index,
      })
    },
    isMyselfGoods() {
      const activeUser = this.$store.getters['user/getUser']
      if (activeUser.userId === this.goods.sellerId) {
        return true
      }
      return false
    },
    isReqSuccess(res) {
      if (res.status === 200 && res.data) {
        return true
      }
      return false
    },
  },
  computed: {
    activeUserId() {
      return this.$store.getters['user/getUserId']
    },
  },
}
</script>

<style scoped lang="stylus">
.van-nav-bar {
  .van-icon {
    color #000000
  }
}

.content {
  padding-top 46px
  padding-bottom 50px

  .user-avatar {
    margin-right 8px
  }

  .van-panel__content {
    padding 10px 16px

    .goods-price {
      font-size 18px
      font-weight 900
      color red
      padding 15px 0
    }

    .goods-price::before {
      content '￥'
      font-size 14px
      font-weight normal
    }

    .image-list {
      display flex
      flex-direction column
      margin auto
    }
  }
}
</style>
