<template>
  <div class="goods-list">
    <van-pull-refresh v-model="isRefreshOrderList" @refresh="refreshOrderList">
      <van-list
        :error.sync="isOrderLoadError"
        :finished="isOrderListFinished"
        @load="onLoadLastOrderList"
        error-text="请求失败，点击重新加载"
        finished-text="没有更多了"
        ref="orderList"
        v-model="isOrderLoading"
      >
        <van-card
          v-for="order in orderList"
          :key="order.code"
          :price="order.goods.price"
          :title="order.code"
          :desc="order.goods.content"
          :thumb="order.goods.smallImage | composeImageUrl"
          @click="$router.push(`/order/${order.id}`)"
        >
          <template #tags>
            <van-tag
              type="danger"
              v-if="order.status === ORDER_STATUS.OFF"
            >
              已取消
            </van-tag>
            <van-tag
              type="danger"
              v-if="order.status === ORDER_STATUS.BUYER_PLACE_ORDER"
            >
              待接单
            </van-tag>
            <van-tag
              type="danger"
              v-if="order.status === ORDER_STATUS.SELLER_RECEIPT_ORDER"
            >
              线下交易ing
            </van-tag>
            <van-tag
              type="danger"
              v-if="order.status === ORDER_STATUS.TRADING_COMPLETED"
            >
              交易完成
            </van-tag>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import Vue from 'vue'
import { PullRefresh, List, Card, Tag, Toast } from 'vant'
import { ORDER_CST } from '@/constant'

Vue.use(PullRefresh)
Vue.use(List)
Vue.use(Card)
Vue.use(Tag)

export default {
  name: 'GoodsList',
  props: {
    type: Number,
  },
  data() {
    return {
      orderList: [],
      // 是否重载订单列表
      isRefreshOrderList: false,
      // 是否商品列表加载失败
      isOrderLoadError: false,
      // 是否商品正在加载
      isOrderLoading: false,
      // 是否已加载所有商品
      isOrderListFinished: false,
      // 订单当前页
      page: 1,
      // 订单每页个数
      size: 10,
      ORDER_STATUS: { ...ORDER_CST },
    }
  },
  methods: {
    refreshOrderList() {
      // 设置列表没有全部加载完结束
      this.isOrderListFinished = false
      this.page = 1
      this.orderList = []
      this.isRefreshOrderList = true
      this.loadOrderList()
    },
    async onLoadLastOrderList() {
      if (this.isRefreshOrderList) {
        this.isRefreshOrderList = false
      }

      // DONE 发送请求获取订单列表
      const res = await this.$api.order.getOrderList(
        this.$store.getters['user/getUserId'],
        this.type // 1表示获取卖出的商品的订单
      )

      if (res.status === 200 && res.data && res.data.code === 200) {
        const page = res.data.data
        this.orderList.push.apply(this.orderList, page.list)
        this.page++
        if (page.isLastPage) {
          this.isOrderListFinished = true
        }
        this.isOrderLoading = false
      } else {
        Toast.fail(res.data.msg || res.msg)
        this.isOrderLoading = false
        this.isOrderLoadError = true
      }
    },
    // 主动加载订单数据
    loadOrderList() {
      if (!this.isOrderLoading) {
        this.isOrderLoading = true
        this.onLoadLastOrderList()
      }
    },
  },
  watch: {
    type() {
      this.refreshOrderList()
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
.van-pull-refresh {
  width 100%
  height calc(100vh - 46px)
}

.van-ellipsis {
  white-space normal
  max-height 50px
}

.van-card__title {
  font-weight bold
  color #000
}

.van-card {
  background-color #fff
  margin 0 10px
  margin-top: 10px;
  border-radius 10px
}
</style>
