<template>
  <div class="my-publish" v-if="user.userId">
    <van-nav-bar
      :title="user.nickname + '的宝贝'"
      @click-left="$router.back()"
      left-arrow
      fixed
    />

    <goods-list
      ref="goodsList"
      class="goods-list"
      :api="`/users/${user.userId}/goods`"
      :params="{}"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar, Toast } from 'vant'
import GoodsList from '@/components/GoodsList/GoodsList.vue'
import util from '@/util/common'

Vue.use(NavBar)

export default {
  name: 'MyPublish',
  components: {
    GoodsList,
  },
  data() {
    return {
      user: {},
    }
  },
  created() {
    const userId = this.$route.params.uid
    if (userId === this.activeUser.userId.toString()) {
      this.user = this.activeUser
    } else {
      this.loadUserInfo(userId)
    }
  },
  mounted() {
    if (this.user.userId === this.activeUser.userId) {
      this.$refs.goodsList.loadLastGoodsData()
    }
  },
  methods: {
    loadUserInfo(id) {
      const load = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
        onOpened: async () => {
          let res = null
          try {
            res = await this.$api.user.getUserInfoById(id)
          } catch (e) {
            Toast.fail('意外的错误')
            console.error(e)
          }

          if (res && util.isReqSuccess(res) && res.data.code === 200) {
            this.user = res.data.data
            load.clear()
            // this.$refs.goodsList.loadLastGoodsData()
          } else {
            Toast.fail('数据加载出错')
          }
        },
      })
    },
  },
  computed: {
    activeUser() {
      return this.$store.getters['user/getUser']
    },
  },
}
</script>

<style scoped lang="stylus">
.my-publish
  width 100%
  height 100%

.goods-list
  padding-top 50px

.van-nav-bar .van-icon
  color #000
  font-size 16px
</style>
