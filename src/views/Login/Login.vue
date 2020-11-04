<template>
  <div class="login">
    <div class="logo">
      <img src="../../assets/logo.png" alt="logo" />
    </div>

    <!-- Form -->
    <van-form @submit="doLogin">
      <!-- identifier Field -->
      <van-field
        v-model="identifier"
        name="identifier"
        label="用户"
        placeholder="用户名或邮箱"
        :rules="[{ required: true, message: '请输入用户名或邮箱' }]"
      />
      <!-- credential Field -->
      <van-field
        v-model="credential"
        :type="pass.type"
        name="credential"
        label="密码"
        placeholder="密码"
        :rules="[{ required: true, message: '请输入密码' }]"
        :right-icon="pass.rightEyeIco"
        @click-right-icon="showOrHidePassword"
      />
      <!-- captcha Field -->
      <van-field
        v-model="captcha"
        type="text"
        name="captcha"
        center
        clearable
        label="验证码"
        placeholder="请输入验证码"
        :rules="[{ required: true, message: '请输入验证码' }]"
      >
        <van-image
          slot="button"
          width="100"
          height="30"
          :src="baseApi + '/auth/captcha.png?r=' + rand"
          @click="refreshCaptcha"
        />
      </van-field>
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="footer">
      <a href="javascript:void(0);" @click="$router.push('/forgot')">
        忘记密码
      </a>

      <a href="javascript:void(0);" @click="$router.push('/register')">
        没有账号? 立即注册
      </a>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Form, Field, Button, Image, Toast } from 'vant'
import config from '@/config'
import cst from '@/constant'
import util from '@/util/common'

Vue.use(Form)
Vue.use(Field)
Vue.use(Button)
Vue.use(Image)

export default {
  name: 'Login',
  data() {
    return {
      baseApi: config.baseApi,
      identifier: '',
      credential: '',
      captcha: '',
      rand: '',
      pass: {
        credential: '',
        type: 'password',
        rightEyeIco: 'closed-eye',
      },
    }
  },
  created() {
    this.$store.commit('auth/setToken', null)
    this.rand = this.generateRandomNumbers(16)
  },
  mounted() {},
  methods: {
    doLogin(values) {
      values = { ...values, rand: this.rand }

      const loading = Toast.loading({
        message: '登录中...',
        duration: 0,
        forbidClick: true,
        onOpened: async () => {
          try {
            const res = await this.$api.auth.signIn(values)
            if (util.isReqSuccess(res)) {
              if (
                res.data.code === 200 &&
                res.data.data.token &&
                res.data.data.user
              ) {
                // 登录成功
                this.$store.commit('auth/setToken', res.data.data.token)
                this.$store.commit('user/setActiveUser', res.data.data.user)
                Toast.success('登录成功')
                // 登录成功跳转到首页
                this.$router.push({ path: '/' })
              } else {
                Toast.fail(res.data.msg)
              }
              this.rand = this.generateRandomNumbers(16)
            }
          } catch (e) {
            console.error(e)
            Toast.fail('意外的错误!')
          }
        },
      })
    },
    // 刷新验证码
    refreshCaptcha() {
      this.rand = this.generateRandomNumbers(16)
    },
    // 密码展示或隐藏
    showOrHidePassword() {
      if (this.pass.rightEyeIco === 'closed-eye') {
        this.pass.rightEyeIco = 'eye-o'
        this.pass.type = 'text'
      } else {
        this.pass.rightEyeIco = 'closed-eye'
        this.pass.type = 'password'
      }
    },
    // 生成随机数
    generateRandomNumbers(total) {
      // 如果不传total或者传0，设置成16位。
      total = total === undefined || total === 0 ? 16 : total
      let str = ''
      for (let i = 0; i < total; i++) {
        let number = parseInt(Math.random() * 35)
        // 当前生成的随机数大于等于10则进行转换。
        if (number >= 10) {
          str += this.numberConvertEnglishLetters(number)
        } else {
          str += number.toString()
        }
      }
      return str
    },
    //数字转换成英文字母
    numberConvertEnglishLetters(number) {
      let map = this.numberConvertEnglishLettersMap()
      for (let i = 0; i < map.length; i++) {
        if (map[i].key === number) {
          return map[i].value
        }
      }
    },

    //数字转换成英文字母的映射关系Map
    numberConvertEnglishLettersMap() {
      return [
        { key: 10, value: 'a' },
        { key: 11, value: 'b' },
        { key: 12, value: 'c' },
        { key: 13, value: 'd' },
        { key: 14, value: 'e' },
        { key: 15, value: 'f' },
        { key: 16, value: 'g' },
        { key: 17, value: 'h' },
        { key: 18, value: 'i' },
        { key: 19, value: 'j' },
        { key: 20, value: 'k' },
        { key: 21, value: 'l' },
        { key: 22, value: 'm' },
        { key: 23, value: 'n' },
        { key: 24, value: 'o' },
        { key: 25, value: 'p' },
        { key: 26, value: 'q' },
        { key: 27, value: 'r' },
        { key: 28, value: 's' },
        { key: 29, value: 't' },
        { key: 30, value: 'u' },
        { key: 31, value: 'v' },
        { key: 32, value: 'w' },
        { key: 33, value: 'x' },
        { key: 34, value: 'y' },
        { key: 35, value: 'z' },
      ]
    },
  },
}
</script>

<style scoped lang="stylus">
.login {
  width 100%
  height 100%
  font-size 14px
  overflow hidden
}

.logo {
  text-align center
  margin-top 100px

  img {
    width 240px
  }
}

.footer {
  display flex
  justify-content space-between
  padding 0 16px
}
</style>
