<template>
  <div class="forgot">
    <van-nav-bar
      title="找回密码"
      left-arrow
      left-text="登录"
      @click-left="$router.back()"
    />

    <van-form @submit="forgotPwd">
      <van-field
        label="邮箱"
        v-model="email"
        name="email"
        placeholder="请输入邮箱"
        :rules="[
          { required: true, message: '请输入邮箱' },
          {
            pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            message: '请输入正确的邮箱',
          },
          { validator: asyncCheckIdentifier, message: '邮箱不存在' },
        ]"
      />
      <van-field
        v-model="emailCode"
        type="text"
        name="emailCode"
        label="邮箱验证码"
        center
        placeholder="邮箱验证码"
        :rules="[{ required: true, message: '请输入邮箱验证码' }]"
      >
        <van-button
          v-if="canGetEmailCode"
          native-type="button"
          slot="button"
          :loading="isLoading"
          type="primary"
          size="small"
          @click="getEmailCode"
          loading-text="发送中..."
          text="获取验证码"
        />
        <van-count-down
          v-else
          slot="button"
          time="60000"
          @finish="canGetEmailCode = !canGetEmailCode"
        >
          <template v-slot="timeData">
            <span class="item">{{ timeData.seconds }}</span>
          </template>
        </van-count-down>
      </van-field>
      <van-field
        label="新密码"
        v-model="newPwd"
        name="newPwd"
        type="password"
        placeholder="请输入新密码"
        :rules="[
          { required: true, message: '请输入新密码' },
          { validator: validatorPwdLenght, message: '密码长度必须大于6位' },
        ]"
      />

      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          找回密码
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar, Field, Button, Form, CountDown, Toast } from 'vant'
import cst from '@/constant'

Vue.use(NavBar)
Vue.use(Field)
Vue.use(Button)
Vue.use(Form)
Vue.use(CountDown)

export default {
  name: 'Forgot',
  data() {
    return {
      newPwd: '',
      email: '',
      key: '',
      emailCode: '',
      isLoading: false,
      canGetEmailCode: true,
    }
  },
  methods: {
    forgotPwd(val) {
      Toast.loading({
        message: '正在提交...',
        forbidClick: true,
        duration: 0,
        onOpened: async () => {
          const params = {
            ...val,
            key: this.key,
          }
          const res = await this.$api.auth.forgotPwd(params)

          if (res.status === 200 && res.data && res.data.code === 200) {
            Toast.success({
              message: '密码修改成功! 即将返回登录',
              onClose: () => this.$router.push('/login'),
            })
          } else {
            Toast.fail('修改失败')
          }
        },
      })
    },
    validatorPwdLenght(val) {
      return val.length >= 6
    },
    asyncCheckIdentifier(val) {
      return new Promise((resolve) => {
        this.$api.auth.checkIdentifier({ identifier: val }).then((res) => {
          if (res.data.code === cst.USER_EXIST) {
            Toast.clear()
            resolve(true)
          } else {
            Toast.clear()
            resolve(false)
          }
        })
      })
    },
    // 获取邮箱验证码
    async getEmailCode() {
      if (this.email === '') {
        Toast('请输入邮箱')
        return
      }
      this.isLoading = true
      let isReqSuccess = false

      try {
        const res = await this.$api.auth.getEmailCode({
          type: 'FORGOT',
          email: this.email,
        })

        // 判断请求是否成功
        if (res.status === 200 && res.data && res.data.code === 200) {
          this.key = res.data.data.key
          isReqSuccess = true
          this.isLoading = false
          this.canGetEmailCode = !this.canGetEmailCode
        }
      } catch (e) {
        isReqSuccess = false
        this.isLoading = false
      } finally {
        if (isReqSuccess) {
          Toast.success('验证码发送成功')
        } else {
          Toast.fail('验证码发送失败, 请重试')
        }
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.forgot {
  width 100%
  height 100vh
}

.item {
  display: inline-block
  min-width: 60px
  height: 30px
  padding: 0 8px
  font-size: 12px
  line-height: 28px
  color: #fff
  text-align: center
  background-color: #07c160
}
</style>
