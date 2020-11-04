<template>
  <div class="my-bought">
    <van-nav-bar @click-left="$router.back()" left-arrow title="我买到的宝贝" />

    <order-list :type="2" />
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar } from 'vant'
import OrderList from '@/components/OrderList/OrderList'

Vue.use(NavBar)

export default {
  name: 'MyBought',
  components: {
    OrderList,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped lang="stylus">
.my-bought {
  width 100%
  height 100vh
}
</style>
