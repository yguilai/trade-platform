<template>
  <div class="category">
    <van-nav-bar title="分类" :fixed="true"></van-nav-bar>
    <van-tree-select
      height="100vh"
      :items="categories"
      :main-active-index.sync="activeIndex"
    >
      <template slot="content">
        <div v-for="c1 in categoriesContent" :key="c1.id">
          <!-- <div
          v-for="(c1, i) in categoriesContent"
          :key="c1.id"
          v-if="activeIndex === i"
        > -->
          <div v-for="c2 in c1.children" :key="c2.id" class="category-2">
            <van-cell :title="c2.text" is-link @click="toCategoryDetails(c2)" />
            <!--<van-divider content-position="left">{{c2.text}}</van-divider>-->
            <van-grid :border="false" :column-num="3" clickable>
              <van-grid-item
                v-for="c3 in c2.children"
                :key="c3.id"
                @click="toCategoryDetails(c3)"
                icon="photo-o"
                :text="c3.text"
              >
                <div slot="default">
                  <van-image
                    class="van-icon van-grid-item__icon"
                    width="28"
                    height="28"
                    slot="icon"
                    :src="c3.ico | composeImageUrl"
                    error-icon="photo-o"
                  >
                    <van-loading slot="loading" color="#1989fa" />
                  </van-image>
                  <span class="van-grid-item__text">{{ c3.text }}</span>
                </div>
              </van-grid-item>
            </van-grid>
          </div>
        </div>
      </template>
    </van-tree-select>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  TreeSelect,
  Image,
  Grid,
  GridItem,
  Divider,
  Toast,
  Cell,
  Loading,
} from 'vant'
import config from '@/config'

Vue.use(NavBar)
Vue.use(TreeSelect)
Vue.use(Image)
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(Divider)
Vue.use(Cell)
Vue.use(Loading)

export default {
  name: 'Category',
  data() {
    return {
      activeIndex: 0,
    }
  },
  created() {
    if (this.categories.length === 0) {
      this.$store.dispatch('category/loadCategories')
    }
  },
  methods: {
    toCategoryDetails(category) {
      this.$router.push({
        path: `/categoryDetails/${category.id}`,
        query: { text: category.text },
      })
    },
  },
  computed: {
    categories() {
      return this.$store.state.category.categories
    },
    categoriesContent() {
      return this.categories.filter((cate, index) => this.activeIndex === index)
    },
  },
}
</script>

<style scoped lang="stylus">
.category
  width 100%
  height 100%

.nav
  border-bottom-left-radius 15px
  border-bottom-right-radius 15px
  background-color $bgColor

.van-tree-select
  padding-top 46px
  padding-bottom 50px
  overflow hidden

>>> .van-sidebar-item--select
  border-color: $bgColor

>>> .van-nav-bar .van-icon
  color #000

.van-image
  margin auto
  display block

.van-grid-item__content
  text-align center
</style>
