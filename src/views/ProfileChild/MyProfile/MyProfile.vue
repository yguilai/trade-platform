<template>
  <div class="my-profile">
    <!-- NavBar -->
    <van-nav-bar
      title="我的资料"
      @click-left="$router.back()"
      left-arrow
      fixed
    />

    <!-- Form -->
    <van-form
      @submit="onSubmit"
      input-align="right"
      error-message-align="right"
    >
      <van-field name="avatar" label="头像">
        <template #input>
          <!-- Uploader -->
          <van-uploader
            style="display: none"
            v-model="avatar"
            :after-read="afterReadFile"
            ref="uploader"
          />
          <van-image :src="user.avatar" radius="5" @click="uploadAvatar" />
        </template>
      </van-field>
      <!-- username Field -->
      <van-field
        label="用户名"
        name="username"
        placeholder="用户名"
        readonly
        class="readonly"
        v-model="user.username"
      />
      <!-- email Field -->
      <van-field
        class="readonly"
        label="邮箱"
        name="email"
        placeholder="邮箱"
        readonly
        v-model="user.email"
      />
      <!-- nickname Field -->
      <van-field
        :rules="[{ required: true, message: '请输入昵称' }]"
        label="昵称"
        name="nickname"
        placeholder="昵称"
        v-model="user.nickname"
      />
      <!-- gender Field -->
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="user.gender" direction="horizontal">
            <van-radio name="1">男</van-radio>
            <van-radio name="0">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <!-- age Field -->
      <van-field
        v-model="user.age"
        name="age"
        label="年龄"
        placeholder="年龄"
        type="digit"
        :rules="[{ required: true, message: '请输入年龄' }]"
      />
      <!-- submit Button -->
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  Form,
  Field,
  Button,
  RadioGroup,
  Radio,
  Uploader,
  Dialog,
  Image,
  Toast,
} from 'vant'
import config from '@/config'
import { FILE_CST } from '@/constant'

Vue.use(NavBar)
Vue.use(Form)
Vue.use(Field)
Vue.use(Button)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Uploader)
Vue.use(Image)

export default {
  name: 'MyProfile',
  data() {
    return {
      user: {
        id: 0,
        nickname: '',
        username: '',
        email: '',
        avatar: '',
        gender: true,
        age: 0,
      },
      avatar: [],
    }
  },
  created() {
    this.user = { ...this.activeUser }
    this.user.avatar = config.cdn + this.user.avatar
    this.user.gender = this.user.gender ? '1' : '0'
  },
  methods: {
    onSubmit(val) {
      Dialog.confirm({
        message: '确认修改?',
        closeOnPopstate: true,
        closeOnClickOverlay: true,
      })
        .then(() => {
          let isSubmitSuccess = false
          let load = Toast.loading({
            message: '正在提交...',
            duration: 0,
            forbidClick: true,
            onOpened: async () => {
              try {
                // 上传头像
                let avatarKey = undefined
                if (this.avatar.length !== 0) {
                  const file = this.avatar[0]
                  // 获取上传凭证
                  const tokenRes = await this.$api.file.getQiniuToken()
                  if (
                    tokenRes.status === 200 &&
                    tokenRes.data &&
                    tokenRes.data.code === 200
                  ) {
                    const token = tokenRes.data.data
                    // 上传头像
                    const res = await this.$api.file.uploadFileToQiniu(
                      file.file,
                      token
                    )
                    if (res.status === 200) {
                      avatarKey = res.data.key
                    }
                  }
                }

                // 提交 个人资料修改
                let userData = {
                  userId: this.activeUser.userId,
                  nickname: this.user.nickname,
                  gender: this.user.gender,
                  age: this.user.age,
                }

                if (avatarKey !== undefined) {
                  userData['avatar'] = avatarKey
                }

                const res = await this.$api.user.updateUserInfo(
                  userData.userId,
                  userData
                )
                if (res.status === 200 && res.data && res.data.code === 200) {
                  this.$store.commit('user/setActiveUser', userData)
                  isSubmitSuccess = true
                }
              } catch (e) {
                isSubmitSuccess = false
                console.log(e)
              } finally {
                if (isSubmitSuccess) {
                  Toast.success('提交成功')
                } else {
                  Toast.fail('提交失败')
                }
              }
            },
          })
        })
        .catch(() => {})
    },
    uploadAvatar() {
      this.avatar = []
      this.$refs.uploader.chooseFile()
    },
    async afterReadFile(file) {
      this.user.avatar = file.content
      return true
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
.my-profile {
  width 100%
  height 100%
}

.van-nav-bar .van-icon {
  color #000
  font-size 16px
}

.van-form {
  padding-top 46px
}

>>> input[readonly='readonly'] {
  color #999
}

.van-image {
  width 80px
  height 80px
}
</style>
