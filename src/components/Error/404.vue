<template>
  <div class="error-404">
    <van-empty image="error" description="页面不见了" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Empty} from 'vant'

  Vue.use(Empty)

  export default {
    name: "404",
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped lang="stylus">
  .error-404 {
    width 100%
    height 100%
  }
</style>
