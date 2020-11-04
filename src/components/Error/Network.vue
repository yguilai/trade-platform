<template>
  <div class="error-network">
    <van-empty image="network" description="网络错误" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Empty} from 'vant'

  Vue.use(Empty)

  export default {
    name: "Network",
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped lang="stylus">
  .error-network {
    width 100%
    height 100%
  }
</style>
