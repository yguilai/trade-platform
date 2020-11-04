<template>
  <div class="error-general">
    <van-empty image="error" description="意外的错误" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import {Empty} from 'vant'

  Vue.use(Empty)

  export default {
    name: "General",
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped lang="stylus">
  .error-general {
    width 100%
    height 100%
  }
</style>
