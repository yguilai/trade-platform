const auth = {
  namespaced: true,
  state: {
    token: null,
    network: true
  },
  getters: {
    getToken(state) {
      if (state.token) {
        return state.token
      }
      const token = localStorage.getItem('token')
      state.token = token === null ? null : token
      return state.token
    }
  },
  mutations: {
    setToken(state, token) {
      if (token === null) {
        localStorage.removeItem('token')
        localStorage.removeItem('activeUser')
        state.token = null
        return
      }
      localStorage.setItem('token', token)
      state.token = token
    },
    changeNetwork(state, network) {
      state.network = network
    }
  },
  actions: {
    refreshToken() {

    }
  }
}

export default auth
