<template>
  <div class="publish">
    <van-nav-bar title="发布" @click-right="publish">
      <van-button slot="right" round type="info" size="small" color="#FEE70F"
        >发布
      </van-button>
    </van-nav-bar>
    <van-form @submit="onSubmit" ref="publishForm">
      <van-field
        v-model="content"
        rows="6"
        autosize
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="品牌型号, 新旧程序, 入手渠道, 转手原因..."
        :rules="[{ required: true, message: '请输入商品相关内容' }]"
      ></van-field>

      <van-field
        name="uploader"
        :rules="[{ required: true, message: '请至少上传一张商品相关图片' }]"
      >
        <template #input>
          <van-uploader
            v-model="fileList"
            result-type="dataUrl"
            :max-count="8"
            :max-size="1024 * 1024 * 5"
            :multiple="true"
            upload-icon="plus"
            :before-read="beforeRead"
            :after-read="afterRead"
            :before-delete="beforeDelete"
          ></van-uploader>
        </template>
      </van-field>

      <van-field
        readonly
        clickable
        :value="realPrice"
        label="价格"
        placeholder="点击输入价格"
        input-align="right"
        @touchstart.native.stop="isKeyBoardShow = true"
        error-message-align="right"
        :rules="[{ required: true, message: '请设置商品价格' }]"
      ></van-field>

      <van-number-keyboard
        v-model="price"
        :show="isKeyBoardShow"
        theme="default"
        close-button-text="完成"
        extra-key="."
        @blur="isKeyBoardShow = false"
      ></van-number-keyboard>

      <van-field
        readonly
        clickable
        :value="category"
        label="分类"
        placeholder="点击选择分类"
        input-align="right"
        @click="onShowCategoriesClick"
        error-message-align="right"
        :rules="[{ required: true, message: '请选择商品分类' }]"
      ></van-field>

      <van-popup v-model="isCategoriesPickerShow" position="bottom" round>
        <van-picker
          ref="categoriesPicker"
          show-toolbar
          title="选择分类"
          :columns="realCategories"
          @confirm="onCategoriesConfirm"
        ></van-picker>
      </van-popup>
    </van-form>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  Button,
  Field,
  Uploader,
  Toast,
  NumberKeyboard,
  Picker,
  Popup,
  Form,
  List,
} from 'vant'
import qs from 'qs'
import cst from '@/constant'

Vue.use(NavBar)
Vue.use(Button)
Vue.use(Field)
Vue.use(Uploader)
Vue.use(NumberKeyboard)
Vue.use(Picker)
Vue.use(Popup)
Vue.use(Form)
Vue.use(List)

export default {
  name: 'Publish',
  data() {
    return {
      categories: [],
      content: '',
      fileList: [],
      price: '',
      isKeyBoardShow: false,
      isCategoriesPickerShow: false,
      realCategories: [], // 存储
      selectedCategory: [],
      qiniuToken: '',
      selectedCategoryId: null,
    }
  },
  created() {
    // 判断从store中获取的分类数据长度是否为0, 避免发送过多请求
    if (this.categoriesTmp.length === 0) {
      this.$store.dispatch('category/loadCategories')
    }
  },
  methods: {
    // 发布商品
    onSubmit(val) {
      let params = {
        // 商品内容
        content: this.content,
        smallImage: this.fileList[0].key,
        // 商品图片列表
        imageList: this.fileList.map((item) => item.key).join(','),
        // 发布商品的用户id
        sellerId: this.$store.getters['user/getUserId'],
        // 商品价格
        price: this.price,
        // 商品所属分类id
        categoryId: this.selectedCategoryId,
        // 商品所属高校, 即用户所属高校
        universityId: this.$store.getters['user/getUniversity'].id,
      }
      // 发送请求, 发布商品
      const load = Toast.loading({
        message: '发布中...',
        forbidClick: true,
        duration: 0,
        onOpened: async () => {
          const res = await this.$api.goods.publishGoods(params)
          if (res.status === 200 && res.data) {
            if (res.data.code === 200) {
              this.content = ''
              this.fileList = []
              this.price = ''
              this.selectedCategory = []
              Toast.success('发布成功')
            } else {
              Toast.fail(res.data.msg || '发布失败')
            }
          } else {
            Toast.fail('意外的错误, 发布失败')
          }
        },
      })
    },
    publish() {
      // 触发表单的submit事件
      this.$refs.publishForm.submit()
    },
    // 页面上删除文件之前, 先发送删除文件请求到后台, 由后台向七牛云发送删除文件请求
    // 避免前端拿到操作资源的秘钥
    beforeDelete(file, detail) {
      file.status = 'uploading'
      file.message = '删除中...'
      return new Promise((resolve, reject) => {
        if (!file.key || file.key === '') resolve(true)

        this.$api.file.deleteFIleFromQiniu(file.key).then((res) => {
          if (res.data.code === 200) resolve(true)
          else reject('删除失败')
        })
      })
    },
    beforeRead(file) {
      if (Array.isArray(file)) {
        for (let f of file) {
          if (this.isFileExist(f)) {
            Toast.fail('上传失败, 请勿选择重复的图片')
            return false
          }
        }
      } else {
        if (this.isFileExist(file)) {
          return false
        }
      }
      return true
    },
    // 判断文件是否已存在
    isFileExist(file) {
      for (const fItem of this.fileList) {
        const tmp = fItem.file
        if (
          tmp.name === file.name &&
          tmp.type === file.type &&
          tmp.size === file.size &&
          tmp.lastModified === file.lastModified
        )
          return true
      }
      return false
    },
    // 文件读取完成后, 发送上传文件请求
    async afterRead(file, detail) {
      this.changeFileStatus(file, 0)
      // 异步获取token
      let token = await this.getQiniuToken()

      // 判断是否是多文件上传
      if (Array.isArray(file)) {
        file.map((item) => {
          this.$api.file
            .uploadFileToQiniu(item.file, token)
            .then((res) => {
              item.key = res.data.key
              this.changeFileStatus(item, 1)
            })
            .catch((reason) => this.changeFileStatus(item, 2))
        })
      } else {
        this.$api.file
          .uploadFileToQiniu(file.file, token)
          .then((res) => {
            file.key = res.data.key
            this.changeFileStatus(file, 1)
          })
          .catch((reason) => this.changeFileStatus(file, 2))
      }
      return true
    },
    // 向后端发请求获取七牛云上传文件需要的token
    getQiniuToken() {
      if (this.qiniuToken !== '') return this.qiniuToken

      return new Promise((resolve, reject) => {
        this.$api.file
          .getQiniuToken()
          .then((res) => {
            if (res.data.code === 200) {
              resolve(res.data.data)
            }
          })
          .catch((reason) => reject(reason))
      })
    },
    // 改变上传文件的状态
    changeFileStatus(file, type) {
      if (Array.isArray(file)) {
        file.map((item) => {
          this.changeFileItemStatus(item, type)
        })
      } else {
        this.changeFileItemStatus(file, type)
      }
    },
    // 改变单个文件上传状态
    changeFileItemStatus(file, type) {
      switch (type) {
        case 0:
          file.status = 'uploading'
          file.message = '上传中'
          break
        case 1:
          file.status = 'done'
          file.message = '上传成功'
          break
        case 2:
          file.status = 'failed'
          file.message = '上传失败'
      }
    },
    // 展示分类事件
    onShowCategoriesClick() {
      if (this.realCategories.length === 0) {
        this.realCategories = this.filterChildrenCategories(
          this.deepCopy(this.categoriesTmp)
        )
      }
      this.isCategoriesPickerShow = true
    },
    // 分类选择器点击确认事件
    onCategoriesConfirm(selected) {
      this.isCategoriesPickerShow = false
      this.selectedCategory = selected
      // 获取所有列(有3列)选中值的索引, 用来获取选中项的id
      this.selectedCategoryId = this.getSelectedCategoryId(
        this.$refs.categoriesPicker.getIndexes()
      )
    },
    // 获取选中项的分类id, 返回选中分类的最低级别的分类的id
    getSelectedCategoryId(selectedIndexes) {
      // 分类数据已经过filterChildrenCategories方法处理, 所有可以直接通过索引获取对应级别的分类
      // 获取一级分类
      const category1 = this.realCategories[selectedIndexes[0]]
      // 获取对应二级分类
      const category2 = category1.children[selectedIndexes[1]]
      // 获取对应三级分类
      const category3 = category2.children[selectedIndexes[2]]

      // 通过分类的分类名, 即text属性是否为空, 来判断这个分类是否存在
      if (category3.text !== '') {
        return category3.id
      } else if (category2.text !== '') {
        return category2.id
      } else if (category1.text !== '') {
        return category1.id
      }
    },
    // 过滤分类, 使其数据结构满足组件的要求
    filterChildrenCategories(categories) {
      return categories.map((item1) => {
        if (item1.children && item1.children.length !== 0) {
          item1.children = item1.children.map((item2) => {
            if (item2.children && item2.children.length !== 0) {
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
    deepCopy(val) {
      return JSON.parse(JSON.stringify(val))
    },
  },
  computed: {
    // 从store中获取分类数据
    categoriesTmp() {
      return this.$store.state.category.categories
    },
    // 返回选中的分类 以 分类1/分类2/分类3 的形式展示
    category() {
      return this.selectedCategory.filter((item) => item !== '').join('/')
    },
    realPrice() {
      if (this.price !== '') return '￥' + this.price
      else return ''
    },
  },
}
</script>

<style scoped lang="stylus">
.publish {
  width 100%
  height 100%
  background-color #fff
}

.van-cell {
  padding 10px 11.5px
}

.publish {
  overflow auto
}
</style>
