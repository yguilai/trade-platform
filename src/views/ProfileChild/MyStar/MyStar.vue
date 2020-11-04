<template>
  <div class="my-star">
    <van-nav-bar
      @click-left="$router.back()"
      left-arrow
      title="我的收藏夹"
    />
   
   <goods-list :api="`/users/${userId}/stars`" :params="{}"/>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {NavBar} from 'vant'
  import GoodsList from '@/components/GoodsList/GoodsList.vue'

  Vue.use(NavBar)

  export default {
    name: "MyStar",
    components: {
      GoodsList
    },
    data() {
      return {
        userId: this.$store.getters['user/getUserId']
      }
    },
    methods: {}
  }
</script>

<style scoped lang="stylus">
  .my-star {
    width 100%
    height 100%
  }
  
  .van-nav-bar {
    .van-icon {
      color #000000
    }
  }

  // .goods-list {
  //   padding-top 50px
  // }
</style>
