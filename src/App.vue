<template>
  <div id="app">
    <div v-if="!network">
      <h3>我没网了</h3>
      <div @click="onRefresh">刷新</div>
    </div>
    <transition name="app-fade">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState({ network: state => state.auth.network })
  },
  created() {
    if (!this.loadActiveUser().userId) {
      this.$router.push('/login')
    }
  },
  methods: {
    onRefresh() {
      this.$router.replace('/refresh')
    },
    loadActiveUser() {
      return this.$store.getters['user/getUser']
    }
  }
}
</script>

<style lang="stylus">
#app
  width 100%
  height 100%
  font-size 14px
  box-sizing border-box

.app-fade-enter-active, .fade-leave-active
  transition opacity .3s

.app-fade-leave-to
  display none

.app-fade-enter, .app-fade-leave-to /* .app-fade-leave-active below version 2.1.8 */
  opacity 0
</style>
