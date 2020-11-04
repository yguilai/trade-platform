<template>
  <div class="category-details">
    <!-- NavBar -->
    <van-nav-bar
      :title="category.text"
      @click-left="$router.back()"
      @click-right="showCategoryPicker"
      left-arrow
      fixed
    >
      <template #right>
        <van-button
          type="primary"
          size="small"
          icon="fenlei"
          icon-prefix="iconfont"
        />
      </template>
    </van-nav-bar>

    <van-popup
      v-model="isShowCategoriesPicker"
      position="bottom"
      round
      @opened="categoriesPickerOpened"
    >
      <van-picker
        ref="categoriesPickerAtDetails"
        show-toolbar
        title="选择分类"
        :columns="actualCategories"
        @cancel="isShowCategoriesPicker = false"
        @confirm="onCategoriesPickerConfirm"
      />
    </van-popup>

    <goods-list
      class="goods-list"
      ref="goodsList"
      :api="'/categories/' + category.id + '/goods'"
      :params="goodsListParams"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  Toast,
  Icon,
  Button,
  Popup,
  Picker,
  PullRefresh,
  List,
  Card,
} from 'vant'
import GoodsList from '@/components/GoodsList/GoodsList'

Vue.use(NavBar)
Vue.use(Icon)
Vue.use(Button)
Vue.use(Popup)
Vue.use(Picker)
Vue.use(PullRefresh)
Vue.use(List)
Vue.use(Card)

export default {
  name: 'CategoryDetails',
  components: {
    GoodsList,
  },
  data() {
    return {
      category: {
        id: this.$route.params.cid,
        text: this.$route.query.text || '',
      },
      isShowCategoriesPicker: false,
      // 当前页面实际分类数据
      actualCategories: [],
    }
  },
  created() {
    if (this.categoriesTmp.length === 0) {
      this.$store.dispatch('category/loadCategories')
    }
  },
  mounted() {
    this.$refs.goodsList.loadLastGoodsData()
  },
  methods: {
    // 展开分类选择器
    showCategoryPicker() {
      if (this.actualCategories.length === 0) {
        this.actualCategories = this.filterChildrenCategories(
          this.deepCopy(this.categoriesTmp)
        )
      }
      this.isShowCategoriesPicker = true
    },
    // 当选择器展开完成 自动选中当前分类
    categoriesPickerOpened() {
      this.findCategoryFromTree(this.actualCategories, 'id', this.category.id)
        .map((i) => i.text)
        .forEach((v, k) => {
          this.$refs.categoriesPickerAtDetails.setColumnValue(k, v)
        })
    },
    // 分类选择器选择确认
    onCategoriesPickerConfirm(values) {
      this.isShowCategoriesPicker = false
      const selectCategoryText = values.filter((i) => i !== '').pop()
      const selectCategories = this.findCategoryFromTree(
        this.actualCategories,
        'text',
        selectCategoryText
      )
      this.category =
        selectCategories.length !== 0 ? selectCategories.pop() : this.category
    },
    // 过滤分类的子分类, 使其满足Picker组件要求的数据格式
    // 严格保证分类为三级, 如果一级分类没有子分类, 就为其添加空的二级分类和三级分类, 二级分类亦然,
    // 三级分类保证其没有子分类
    filterChildrenCategories(categories) {
      // 遍历一级分类
      // 如果一级分类没有子分类, 则为该分类添加一个text为空的子分类, 空子分类也添加一个空子分类
      return categories.map((item1) => {
        if (item1.children && item1.children.length !== 0) {
          // 遍历二级分类
          // 如果二级分类没有子分类, 则为该分类添加一个空的子分类
          item1.children = item1.children.map((item2) => {
            if (item2.children && item2.children.length !== 0) {
              // 遍历三级分类
              // 如果某分类有子分类就删除
              item2.children = item2.children.map((item3) => {
                if (item3.children && item3.children.length === 0) {
                  delete item3.children
                }
                return item3
              })
            } else if (item2.children && item2.children.length === 0) {
              item2.children.push({ text: '' })
            }
            return item2
          })
        } else if (item1.children && item1.children.length === 0) {
          item1.children.push({ text: '', children: [{ text: '' }] })
        }
        return item1
      })
    },
    // 深拷贝
    deepCopy(val) {
      return JSON.parse(JSON.stringify(val))
    },
    // 递归查找分类
    // 从分类树中 查找对象属性名为key, 值为val的分类
    findCategoryFromTree(categories, key, val) {
      let cList = []

      for (const c of categories) {
        if (c[key] && c[key] === val) {
          cList.push(c)
          break
        } else if (c.children && c.children.length !== 0) {
          cList.push(c)
          const resList = this.findCategoryFromTree(c.children, key, val)
          let has = false
          for (const res of resList) {
            if (res[key] && res[key] === val) {
              has = true
              break
            }
          }

          if (!has) {
            cList.pop()
          } else {
            cList.push(...resList)
          }
        }
      }
      return cList
    },
  },
  computed: {
    categoriesTmp() {
      return this.$store.state.category.categories
    },
    goodsListParams() {
      return { universityId: this.$store.getters['user/getUniversity'].id }
    },
  },
  watch: {
    category() {
      this.$router.replace({
        path: `/categoryDetails/${this.category.id}`,
        query: { text: this.category.text },
      })
    },
  },
}
</script>

<style scoped lang="stylus">
.category-details {
  width 100%
  height 100%
}

.van-nav-bar {
  background-color #fff
  .van-icon {
    color #000
    font-size 16px
  }
}

.van-button--primary {
  color #000
  background-color transparent
  border 0
}

.van-button--small {
  min-width 30px
}


.goods-list {
  padding-top 50px
}

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
</style>
