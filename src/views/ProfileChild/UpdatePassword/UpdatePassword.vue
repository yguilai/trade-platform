<template>
  <div class="update-pwd">
    <van-nav-bar left-arrow title="修改密码" @click-left="$router.back()" />

    <van-form @submit="updateByOldPwd">
      <van-field
        :rules="[{ required: true, message: '请输入旧密码' }]"
        label="旧密码"
        name="oldPwd"
        placeholder="旧密码"
        type="password"
        v-model="oldPwd"
      />
      <van-field
        :rules="[{ required: true, message: '请输入新密码' }]"
        label="新密码"
        name="newPwd"
        placeholder="新密码"
        type="password"
        v-model="newPwd"
      />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          修改
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar, Button, Form, Field, Dialog, Toast } from 'vant'

Vue.use(NavBar)
Vue.use(Button)
Vue.use(Form)
Vue.use(Field)

export default {
  name: 'UpdatePassword',
  data() {
    return {
      active: 0,
      newPwd: '',
      oldPwd: '',
    }
  },
  methods: {
    updateByOldPwd(val) {
      Dialog.confirm({
        message: '确认修改?',
        closeOnPopstate: true,
        closeOnClickOverlay: true,
      })
        .then(() => {
          Toast.loading({
            message: '正在提交...',
            forbidClick: true,
            duration: 0,
            onOpened: async () => {
              const params = {
                uid: this.$store.getters['user/getUserId'],
                ...val,
              }
              const res = await this.$api.auth.updatePwd(params)
              if (res.status === 200 && res.data) {
                if (res.data.code === 200) {
                  Toast.success({
                    message: '修改成功, 请重新登录',
                    onClose: () => this.$router.push('/login'),
                  })
                  return
                } else {
                  Toast.fail(res.data.msg || '意外的错误')
                  return
                }
              } else {
                Toast.fail(res.msg || '请求出错')
              }
            },
          })
        })
        .catch(() => {})
    },
  },
}
</script>

<style scoped lang="stylus">
.update-pwd {
  width 100%
  height 100%
}
</style>
