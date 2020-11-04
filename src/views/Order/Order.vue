<template>
  <div class="order">
    <!-- NavBar -->
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()"/>

    <van-pull-refresh
      v-if="order.id"
      v-model="isRefreshing"
      @refresh="refreshOrder"
    >
      <van-steps
        v-if="order.status !== OrderStatus.OFF"
        :active="order.status"
        active-icon="flag-o"
        active-color="#38f"
      >
        <van-step>买家下单</van-step>
        <van-step>商家接单</van-step>
        <van-step>线下交易</van-step>
        <van-step>交易完成</van-step>
      </van-steps>

      <van-cell title="订单编号" :value="order.code"/>
      <van-cell title="下单时间" :value="order.createTime | timeFormat"/>
      <van-cell
        title="更新时间"
        :value="order.updateTime || order.createTime | timeFormat"
      />
      <van-cell
        v-if="order.status === OrderStatus.OFF"
        title="状态"
        value="订单已取消"
      />
      <van-cell title="卖家" :value="order.seller.nickname"/>
      <van-cell title="买家" :value="order.buyer.nickname"/>
      <van-cell title="商品">
        <template #right-icon>
          <van-icon name="arrow-down" style="line-height: inherit;"/>
        </template>
      </van-cell>
      <van-card
        :price="order.goods.price.toString() + '.00'"
        :desc="order.goods.content"
        :thumb="order.goods.smallImage | composeImageUrl"
        @click="$router.push(`/goods/${order.goods.id}`)"
      />
    </van-pull-refresh>

    <div class="bottom-bar" v-if="order.id">
      <van-button
        text="与TA交谈"
        round
        type="warning"
        @click="
          $router.push(
            `/chat/${order.buyer.userId}_${order.goods.id}_${order.seller.userId}`
          )
        "
      />

      <van-button
        text="确认接单"
        round
        type="danger"
        v-if="
          order.seller.userId === activeUserId &&
            order.status === OrderStatus.BUYER_PLACE_ORDER
        "
        @click="sellerConfirmReceiptOrder"
      />

      <van-button
        text="取消订单"
        round
        type="danger"
        v-if="
          order.buyer.userId === activeUserId &&
            order.status === OrderStatus.BUYER_PLACE_ORDER
        "
        @click="cancelOrder"
      />

      <van-button
        text="交易完成"
        round
        type="danger"
        v-if="
          order.buyer.userId === activeUserId &&
            order.status === OrderStatus.SELLER_RECEIPT_ORDER
        "
        @click="buyerConfirmTradingCompleted"
      />
    </div>
  </div>
</template>

<script>
  import cst from '@/constant'
  import Vue from 'vue'
  import {
    NavBar,
    Steps,
    Step,
    PullRefresh,
    Cell,
    CellGroup,
    Icon,
    Toast,
    Card,
    Button,
    Dialog
  } from 'vant'
  import dayjs from 'dayjs'
  import { ORDER_CST } from '@/constant'

  Vue.use(NavBar)
  Vue.use(Steps)
  Vue.use(Step)
  Vue.use(PullRefresh)
  Vue.use(CellGroup)
  Vue.use(Cell)
  Vue.use(Icon)
  Vue.use(Card)
  Vue.use(Button)

  export default {
    name: 'Order',
    data() {
      return {
        // 订单数据
        order: {
          // 订单状态
          status: cst.ORDER.BUYER_PLACE_ORDER,
        },

        OrderStatus: {...ORDER_CST},

        // 是否正在下拉刷新
        isRefreshing: false,
      }
    },
    created() {
      this.loadOrderInfo()
    },
    methods: {
      sellerConfirmReceiptOrder() {
        Dialog.confirm({
          message: '确认接单?',
          closeOnClickOverlay: true,
        })
          .then(async () => {
            Toast.loading({
              message: '提交中...',
              forbidClick: true,
              duration: 0,
              onOpened: async () => {
                const res = await this.$api.order.updateOrderStatus(
                  this.order.id,
                  ORDER_CST.SELLER_RECEIPT_ORDER
                )

                if (res.status === 200 && res.data && res.data.code === 200) {
                  this.loadOrderInfo()
                  Toast.clear()
                } else {
                  Toast.fail('提交失败, 请重试')
                }
              },
            })
          })
          .catch(() => {
          })
      },
      buyerConfirmTradingCompleted() {
        Dialog.confirm({
          message: '确认已完成线下交易?',
          closeOnClickOverlay: true,
        })
          .then(async () => {
            Toast.loading({
              message: '提交中...',
              forbidClick: true,
              duration: 0,
              onOpened: async () => {
                const res = await this.$api.order.updateOrderStatus(
                  this.order.id,
                  ORDER_CST.TRADING_COMPLETED
                )

                if (res.status === 200 && res.data && res.data.code === 200) {
                  this.loadOrderInfo()
                  Toast.clear()
                } else {
                  Toast.fail('提交失败, 请重试')
                }
              },
            })
          })
          .catch(() => {
          })
      },
      async loadOrderInfo() {
        const oid = this.$route.params.oid
        if (oid === undefined || oid === null) {
          Toast.fail({
            message: '访问异常',
            forbidClick: true,
            onClose: () => {
              this.$router.back()
            },
          })
          return
        }

        const res = await this.$api.order.getOrderInfo(oid)
        if (
          res.status === 200 &&
          res.data &&
          res.data.code === 200 &&
          res.data.data
        ) {
          this.order = res.data.data
          this.isRefreshing = false
        } else {
          Toast.fail('订单数据加载失败')
        }
      },
      refreshOrder() {
        this.loadOrderInfo()
      },
      // 取消订单
      cancelOrder() {
        Dialog.confirm({
          title: '取消订单',
          message: '确认取消订单',
        })
          .then(async () => {
            try {
              const res = await this.$api.order.updateOrderStatus(this.order.id, ORDER_CST.OFF)
              console.log(res)
            } catch (e) {
              Toast.fail({message: '订单取消失败'})
            }
          })
          .catch(() => {});
      }
    },
    filters: {
      timeFormat(val) {
        return dayjs(val)
          .subtract(8, 'hour')
          .format('YYYY-MM-DD HH:mm:ss')
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
  .order {
    width 100%
    height 100%
  }

  .van-pull-refresh {
    width 100%
    height calc(100% - 46px)
  }

  .van-cell__value {
    flex 3
  }

  .van-icon {
    color #969799
  }

  .van-ellipsis {
    white-space normal
  }

  .van-card__desc {
    max-height 80px
  }

  .van-card {
    background-color #fff
  }

  .van-card:not(:first-child) {
    margin-top 0
  }

  .bottom-bar {
    position fixed
    bottom 0
    width 100%
    height 50px
    display flex
    justify-content flex-end
    align-items center
    background-color #fff

    .van-button {
      width 110px
      height 40px
      line-height 40px
      margin-right 16px
      border none
    }

    .van-button--warning {
      background-image linear-gradient(to right, $bgColor, #ee0a24)
    }

    .van-button--danger {
      background-image linear-gradient(to right, #ee0a24, red)
    }
  }
</style>
