<template>
  <div class="goods-list">
    <van-pull-refresh @refresh="refreshGoodsList" v-model="isRefreshGoodsList">
      <van-list
        :error.sync="isGoodsLoadError"
        :finished="isGoodsListFinished"
        @load="onLoadLastGoods"
        error-text="请求失败，点击重新加载"
        finished-text="没有更多了"
        ref="goodsList"
        v-model="isGoodsLoading"
      >
        <van-card
          :desc="item.content"
          :key="item.id"
          :price="item.price"
          :thumb="item.smallImage | composeImageUrl"
          @click="$router.push('/Goods/' + item.id)"
          lazy-load
          v-for="item in goodsList"
        >
          <template #price>
            <div class="van-card__price">
              <span class="van-card__price-currency">¥</span>
              <span class="van-card__price-integer">{{
                parseInt(item.price)
              }}</span>
              <span>.</span>
              <span class="van-card__price-decimal">{{
                item.price.toString().indexOf('.') !== -1
                  ? item.price
                      .toString()
                      .substring(
                        item.price.toString().indexOf('.'),
                        item.price.toString().indexOf('.') + 2
                      )
                  : '00'
              }}</span>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import Vue from 'vue'
import { PullRefresh, List, Card } from 'vant'
import axios from '@/request/http'
import cst from '@/constant'

Vue.use(PullRefresh)
Vue.use(List)
Vue.use(Card)

export default {
  name: 'GoodsList',
  props: {
    api: String,
    params: Object,
  },
  mounted() {
    // console.log(this.api)
    // console.log(this.params)
  },
  data() {
    return {
      // 商品列表相关
      goodsList: [],
      // 是否重载商品列表
      isRefreshGoodsList: false,
      // 是否商品列表加载失败
      isGoodsLoadError: false,
      // 是否商品正在加载
      isGoodsLoading: false,
      // 是否已加载所有商品
      isGoodsListFinished: false,
      // // 商品当前页
      page: 1,
      // 商品每页个数
      size: 10,
      tt: this.params,
    }
  },
  methods: {
    refreshGoodsList() {
      // 设置列表没有全部加载完结束
      this.isGoodsListFinished = false
      this.page = 1
      this.goodsList = []
      this.isRefreshGoodsList = true
      this.loadLastGoodsData()
    },
    onLoadLastGoods() {
      if (this.isRefreshGoodsList) {
        this.isRefreshGoodsList = false
      }

      // 发送请求
      axios
        .request({
          url: this.api,
          params: {
            page: this.page,
            size: this.size,
            ...this.params,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            const page = res.data.data
            this.goodsList.push.apply(this.goodsList, page.list)
            this.page++
            if (page.isLastPage) {
              this.isGoodsListFinished = true
            }
            this.isGoodsLoading = false
          }
        })
        .catch((reason) => {
          console.log(reason)
          this.isGoodsLoading = false
          this.isGoodsLoadError = true
        })
    },
    // 主动加载数据
    loadLastGoodsData() {
      if (!this.isGoodsLoading) {
        this.isGoodsLoading = true
        this.onLoadLastGoods()
      }
    },
  },
  watch: {
    api() {
      this.refreshGoodsList()
    },
    params() {
      this.refreshGoodsList()
    },
  },
}
</script>

<style scoped lang="stylus">
.van-list {
  display flex
  flex-direction column

  .van-card {
    width 95%
    margin 0 auto
    margin-top 5px
    background-color #ffffff
    border-radius 10px

    .van-card__desc {
      color #000000
      word-wrap normal
      max-height 60px
    }

    .van-ellipsis {
      overflow hidden
      white-space normal
      text-overflow ellipsis
    }
  }
}

.van-card__price {
  color red
}
</style>
