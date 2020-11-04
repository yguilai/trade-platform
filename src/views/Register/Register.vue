<template>
  <div class="register">
    <!-- NavBar -->
    <van-nav-bar
      title="用户注册"
      left-text="登录"
      left-arrow
      @click-left="toLogin"
    />
    <!-- Form -->
    <van-form @submit="onSubmit">
      <!-- username Field -->
      <van-field
        v-model="username"
        name="username"
        label="用户名"
        placeholder="用户名"
        :rules="[
          { required: true, message: '请输入用户名' },
          { validator: asyncCheckIdentifier, message: '用户名已存在' },
        ]"
      />

      <!-- password Field -->
      <van-field
        v-model="passIns[0].credential"
        :type="passIns[0].type"
        name="password"
        label="密码"
        placeholder="密码"
        :right-icon="passIns[0].rightEyeIco"
        @click-right-icon="showOrHidePassword(0)"
        :rules="[{ required: true, message: '请输入密码' }]"
      />

      <!-- rePassword Field -->
      <van-field
        v-model="passIns[1].credential"
        :type="passIns[1].type"
        name="rePassword"
        label="重复密码"
        placeholder="重复密码"
        :right-icon="passIns[1].rightEyeIco"
        @click-right-icon="showOrHidePassword(1)"
        :rules="[
          { required: true, message: '请再次输入密码' },
          { validator: checkPassword, message: '两次密码不一致' },
        ]"
      />

      <!-- gender Field -->
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="gender" direction="horizontal">
            <van-radio name="1">男</van-radio>
            <van-radio name="0">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- email Field -->
      <van-field
        v-model="email"
        type="text"
        name="email"
        label="邮箱"
        placeholder="邮箱"
        :rules="[
          { required: true, message: '请输入邮箱' },
          {
            pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            message: '请输入正确的邮箱',
          },
          { validator: asyncCheckIdentifier, message: '邮箱已存在' },
        ]"
      />

      <!-- emailCode Field -->
      <van-field
        v-model="emailCode"
        type="text"
        name="emailCode"
        label="邮箱验证码"
        center
        clearable
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
          >获取验证码
        </van-button>
        <van-count-down
          slot="button"
          v-else
          time="60000"
          @finish="canGetEmailCode = !canGetEmailCode"
        >
          <template v-slot="timeData">
            <span class="item">{{ timeData.seconds }}</span>
          </template>
        </van-count-down>
      </van-field>

      <p>注册即表示用户同意<a href="javascript:void(0);">《用户协议》</a></p>

      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  Form,
  Field,
  Button,
  Image,
  RadioGroup,
  Radio,
  NavBar,
  CountDown,
  Toast,
} from 'vant'
import cst from '@/constant'

Vue.use(Form)
Vue.use(Field)
Vue.use(Button)
Vue.use(Image)
Vue.use(Form)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(NavBar)
Vue.use(CountDown)

export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      emailCode: '',
      gender: '1',
      isLoading: false,
      passIns: [
        {
          index: 0,
          credential: '',
          type: 'password',
          rightEyeIco: 'closed-eye',
        },
        {
          index: 1,
          credential: '',
          type: 'password',
          rightEyeIco: 'closed-eye',
        },
      ],
      key: '',
      canGetEmailCode: true,
    }
  },
  created() {},
  methods: {
    onSubmit(values) {
      // 构建请求参数
      const params = {
        username: this.username,
        email: this.email,
        nickname: this.username,
        gender: this.gender,
        age: 0,
        password: this.passIns[0].credential,
        key: this.key,
        emailCode: this.emailCode,
      }

      const toast = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '正在注册',
        onOpened: async () => {
          let isReqSuccess = false
          try {
            const res = await this.$api.auth.signUp(params)
            if (res.status === 200 && res.data && res.data.code === 200) {
              isReqSuccess = true
            }
          } catch (error) {
            console.error(error)
            isReqSuccess = false
          } finally {
            if (isReqSuccess) {
              Toast.success({
                message: '注册成功, 即将跳转到登录页面',
                forbidClick: true,
                onClose: () => this.$router.push('/login'),
              })
            } else {
              Toast.fail('注册失败')
            }
          }
        },
      })
    },
    checkPassword(val) {
      return this.passIns[0].credential === this.passIns[1].credential
    },
    // 获取邮箱验证码
    async getEmailCode() {
      if (this.email === '') {
        Toast('请输入邮箱')
        return
      }
      this.isLoading = true

      try {
        let isReqSuccess = false
        const res = await this.$api.auth.getEmailCode({
          type: 'SIGNUP',
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
    // 跳转到登录页
    toLogin() {
      this.$router.push({ path: '/login' })
    },
    // 异步检测用户名或邮箱是否已存在
    asyncCheckIdentifier(val) {
      return new Promise((resolve) => {
        this.$api.auth.checkIdentifier({ identifier: val }).then((res) => {
          res.data.code === cst.USER_EXIST ? resolve(false) : resolve(true)
        })
      })
    },
    // 展示/隐藏密码
    showOrHidePassword(index) {
      if (this.passIns[index].rightEyeIco === 'closed-eye') {
        this.passIns[index].rightEyeIco = 'eye-o'
        this.passIns[index].type = 'text'
      } else {
        this.passIns[index].rightEyeIco = 'closed-eye'
        this.passIns[index].type = 'password'
      }
    },
  },
}
</script>

<style scoped lang="stylus">
.register {
  width 100%
  height 100%
  font-size 14px
  box-sizing border-box
  overflow hidden

  p {
    text-align center
    margin-top 16px
  }
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
