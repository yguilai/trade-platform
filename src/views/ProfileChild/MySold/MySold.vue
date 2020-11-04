<template>
  <div class="my-sold">
    <van-nav-bar @click-left="$router.back()" left-arrow title="我卖出的宝贝" />

    <order-list :type="1" />
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar } from 'vant'
import OrderList from '@/components/OrderList/OrderList'

Vue.use(NavBar)

export default {
  name: 'MySold',
  components: {
    OrderList,
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="stylus">
.my-sold {
  width 100%
  height 100vh
}
</style>
