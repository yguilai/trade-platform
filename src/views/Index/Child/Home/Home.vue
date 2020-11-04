<template>
  <div class="home">
    <van-nav-bar
      @click-left="showUniversitySelectorAndLoadData"
      @click-right="showAddressSelectorAndLoadData"
      class="nav"
      fixed
      title="首页"
      :border="false"
    >
      <van-button
        :data-uid="defaultUniversity.id"
        class="university nav-button"
        slot="left"
        type="default"
      >
        {{ defaultUniversity.name | ellipse(7) }}
      </van-button>
      <van-button
        :data-code="defaultCity.code"
        class="city nav-button"
        slot="right"
        type="default"
      >
        {{ defaultCity.name }}
      </van-button>
    </van-nav-bar>

    <van-popup v-model="showAddressSelector" position="bottom" round>
      <van-area
        :area-list="areaList"
        :columns-num="2"
        :loading="isAddressLoading"
        :value="defaultCity.code"
        @cancel="showAddressSelector = false"
        @confirm="onAddressSelectorConfirm"
        title="请选择您所在城市"
      />
    </van-popup>

    <van-popup v-model="showUniversitySelector" position="bottom" round>
      <van-picker
        show-toolbar
        title="请选择您所在高校"
        :columns="universities"
        :default-index="universities.indexOf(defaultUniversity.name)"
        @cancel="showUniversitySelector = false"
        @confirm="onUniversitySelectorConfirm"
      />
    </van-popup>

    <van-popup
      v-model="showSearch"
      position="bottom"
      :style="{ height: '100%' }"
    >
      <van-search
        @cancel="showSearch = false"
        @search="onSearch"
        background="transparent"
        placeholder="请输入搜索关键词"
        ref="search"
        shape="round"
        show-action
        v-model="search"
      />
    </van-popup>

    <div class="home-content">
      <van-search
        @click="onSearchClick"
        class="search"
        input-align="center"
        placeholder="请输入搜索关键词"
        shape="round"
        v-model="search"
      />

      <goods-list ref="goodsList" :api="'/goods'" :params="goodsListParams"/>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    NavBar,
    Area,
    Search,
    Popup,
    Button,
    Picker,
    Icon,
    Toast,
    List,
    PullRefresh,
    Card,
  } from 'vant'
  import cst from '@/constant'
  import qs from 'qs'
  import GoodsList from '@/components/GoodsList/GoodsList.vue'

  Vue.use(NavBar)
  Vue.use(Area)
  Vue.use(Search)
  Vue.use(Popup)
  Vue.use(Button)
  Vue.use(Picker)
  Vue.use(Icon)
  Vue.use(List)
  Vue.use(PullRefresh)
  Vue.use(Card)

  export default {
    name: 'Home',
    components: {
      GoodsList,
    },
    data() {
      return {
        search: '',
        showAddressSelector: false,
        showUniversitySelector: false,
        areaList: {},
        isAddressLoading: false,
        isUniversityLoading: false,
        showSearch: false,
        selected: {
          city: {},
          university: {},
        },
      }
    },
    created() {
      if (this.location) {
        this.loadUniversityData()
      }
    },
    mounted() {
      if (!this.location) {
        this.showAddressSelectorAndLoadData()
      }

      this.$refs.goodsList.loadLastGoodsData()
    },
    methods: {
      // 地址选择器 点击确定事件
      onAddressSelectorConfirm(selected) {
        this.showAddressSelector = false
        if (!this.location || selected[1].code !== this.location.city.code) {
          this.$store.commit('user/updateCity', selected[1])
          this.$store.commit('university/setUniversityList', [])
          this.loadUniversityData()
          this.showUniversitySelector = true
        }
      },
      // 高校选择器 点击确定事件
      onUniversitySelectorConfirm(selected) {
        this.showUniversitySelector = false
        // 修改了高校就发送请求
        if (
          !this.location.university ||
          selected !== this.location.university.name
        ) {
          this.$api.university
            .updateUserUniversity(
              this.$store.state.user.activeUser.userId,
              selected
            )
            .then((res) => {
              if (res.data.code === cst.SUCCESS) {
                Toast.success('更新成功')
                // DOEN 修改store中的高效数据
                this.$store.commit('user/updateUniversity', res.data.data)
                // 重载商品数据
                // this.$refs.GoodsList.refreshGoodsList()
                // 现在是可以由组件内部自动重载
              } else {
                Toast.success('更新失败, ' + res.data.meta.msg)
              }
            })
            .catch((reason) => {
              console.log(reason)
              Toast.fail(reason ? '选择出错' : reason)
            })
        }
      },
      // 点击搜索框事件
      onSearchClick() {
        // 点击搜索框之后弹出实际搜索框并自动聚焦
        this.showSearch = true
        this.$nextTick(() => {
          this.$refs.search.getElementsByTagName('input')[0].focus()
        })
      },
      // 搜索
      onSearch() {
        this.$router.push({
          path: '/search',
          query: {q: this.search}
        })
      },
      // 展示地址选择器弹出层
      showAddressSelectorAndLoadData() {
        this.showAddressSelector = true
        this.isAddressLoading = true

        if (Object.keys(this.areaList).length === 0) {
          const cityData = localStorage.getItem('city_list')
          if (cityData) {
            this.areaList = qs.parse(cityData)
          } else {
            this.$api.city
              .getCityList()
              .then((res) => {
                const cityData = res.data.data
                if (res.data.code === 200 && cityData) {
                  localStorage.setItem('city_list', qs.stringify(cityData))
                  this.areaList = cityData
                }
              })
              .catch((reason) => {
                console.log(reason)
                Toast.fail('获取数据失败, 请重试')
              })
          }
        }
        this.isAddressLoading = false
      },
      // 展示高校选择器
      showUniversitySelectorAndLoadData() {
        this.showUniversitySelector = true
      },
      // 载入高校列表
      async loadUniversityData() {
        if (this.universities.length === 0) {
          this.$api.university
            .getUniversitiesByCity(this.location.city.name)
            .then((res) => {
              if (res.data.code === 200) {
                const list = res.data.data.map((item) => item.name)
                if (list.length === 0) {
                  Toast('当前城市没有开放的高校')
                  this.showUniversitySelector = false
                  return
                }
                this.$store.commit('university/setUniversityList', list)
              }
            })
            .catch((reason) => {
              console.log(reason)
              Toast.fail(reason)
            })
        }
      },
    },
    computed: {
      // 设置默认高校
      defaultUniversity() {
        if (!this.$store.getters['user/getUniversity']) {
          return {
            id: 1753,
            name: '长沙学院',
          }
        } else {
          return this.$store.getters['user/getUniversity']
        }
      },
      // 设置默认城市
      defaultCity() {
        if (!this.$store.getters['user/getCity']) {
          return {
            code: '430100',
            name: '长沙市',
          }
        }
        return this.$store.getters['user/getCity']
      },
      // 用户地址
      location() {
        return this.$store.getters['user/getLocation']
      },
      // 登录用户
      activeUser() {
        return this.$store.getters['user/getUser']
      },
      // 用户所属高校
      universities() {
        return this.$store.getters['university/getUniversityList']
      },
      // 商品列表参数
      goodsListParams() {
        return {universityId: this.$store.getters['user/getUniversity'].id}
      },
    },
    filters: {
      ellipse(val, count) {
        return val.length > count ? val.substring(0, count - 1) + '...' : val
      },
    },
  }
</script>

<style scoped lang="stylus">
  .home {
    width 100%
    height 100%
  }

  >>> .van-hairline--bottom::after {
    border-bottom-width: 0;
  }

  .home-content .van-search {
    background-color transparent
  }

  .home-content .van-search__content {
    background-color #fff
  }

  >>> .van-grid-item__content {
    background-color transparent
  }

  >>> .van-grid-item__content--surround::after {
    border-width: 0;
  }

  .nav {
    border-bottom-left-radius 15px
    border-bottom-right-radius 15px
    background-color $bgColor
  }

  .nav-button {
    background-color $bgColor
  }

  .university, .city {
    border 0
    padding 0
  }

  .home-content {
    padding-top 48px
    // padding-bottom 50px
    height calc(100vh - 48px)
  }

  .van-grid-item {
    border-radius 10px
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
