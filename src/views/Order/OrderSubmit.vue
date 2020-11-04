<template>
  <div class="order-submit">
    <!-- NavBar -->
    <van-nav-bar @click-left="$router.back()" left-arrow title="订单提交" />

    <van-card
      :desc="goods.content"
      :price="goods.price"
      :thumb="goods.smallImage | composeImageUrl"
      @click="$router.push('/Goods/' + goods.id)"
      lazy-load
    >
      <template #price>
        <div class="van-card__price">
          <span class="van-card__price-currency">¥</span>
          <span class="van-card__price-integer">{{
            parseInt(goods.price)
          }}</span>
          <span>.</span>
          <span class="van-card__price-decimal">{{
            goods.price | decimalFilter
          }}</span>
        </div>
      </template>
    </van-card>

    <van-submit-bar
      :price="goods.price * 100"
      button-text="立即提交"
      @submit="submitOrder"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, NavBar, Card, SubmitBar } from 'vant'

Vue.use(NavBar)
Vue.use(Card)
Vue.use(SubmitBar)

export default {
  name: 'OrderSubmit',
  data() {
    return {
      goods: null,
    }
  },
  created() {
    const tmpGoods = this.$route.query.goods
    if (tmpGoods === undefined || tmpGoods === null) {
      Toast.fail({
        message: '错误的页面, 即将跳转到首页',
        onClose: () => {
          this.$router.push('/home')
        },
      })
    } else {
      this.goods = JSON.parse(tmpGoods)
    }
  },
  methods: {
    // 提交订单
    submitOrder() {
      Toast.loading({
        message: '正在提交...',
        forbidClick: true,
        duration: 0,
        onOpened: async () => {
          try {
            const params = {
              goodsId: this.goods.id,
              buyerId: this.$store.getters['user/getUserId'],
            }

            const res = await this.$api.order.submitOrder(params)

            if (this.isReqSuccess(res)) {
              if (res.data.code === 200 && res.data.data) {
                Toast.success({
                  message: '订单提交成功, 请及时与卖家联系',
                  forbidClick: true,
                  onClose: () =>
                    this.$router.push(`/order/${res.data.data.id}`),
                })
              } else {
                Toast.fail({
                  message: '订单提交失败, ' + res.data.msg,
                  forbidClick: true,
                })
              }
            } else {
              Toast.fail('订单提交失败, 请重试')
            }
          } catch (e) {
            console.error(e)
            Toast.fail(e.data.msg)
          }
        },
      })
    },
    // 判断请求是否成功
    isReqSuccess(res) {
      return !!(res && res.status === 200 && res.data)
    },
  },
  filters: {
    // 保留小数点后两位
    decimalFilter(val) {
      return val.toString().indexOf('.') !== -1
        ? val
            .toString()
            .substring(
              val.toString().indexOf('.'),
              val.toString().indexOf('.') + 2
            )
        : '00'
    },
  },
}
</script>

<style scoped lang="stylus">
.order-submit {
  width 100%
  height 100%
}

.van-card__price {
  color red
}

.van-card:not(:first-child) {
  margin-top 0
}

.van-ellipsis {
  white-space normal
  max-height 50px
}
</style>
