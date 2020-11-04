<template>
  <div class="search">
    <van-nav-bar title="搜索"
                 left-arrow
                 @click-left="$router.back()"
    />
    <van-search
      input-align="center"
      placeholder="请输入搜索关键词"
      shape="round"
      @search="onSearch"
      v-model="search"
    />

    <goods-list :api="`/goods/s`" :params="query"/>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Toast, NavBar, Search } from 'vant'
  import GoodsList from "@/components/GoodsList/GoodsList"

  Vue.use(NavBar)
  Vue.use(Search)

  export default {
    name: "Search",
    components: {
      GoodsList
    },
    data() {
      return {
        search: '',
        q: ''
      }
    },
    created() {
      const query = this.$route.query.q
      if (!query) {
        Toast.fail({
          message: '异常错误',
          onClose: () => {
            this.$router.back()
          }
        })
        return
      }
      this.q = this.search = query
    },
    methods: {
      onSearch() {
        this.q = this.search
      }
    },
    computed: {
      query() {
        return {q: this.q}
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .van-search {
    background-color transparent
  }

  .van-search__content {
    background-color #fff
  }
</style>
