const user = {
  namespaced: true,
  state: {
    activeUser: {
      userId: null,
      nickname: '燕归来',
      username: 'yguilai',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      gender: 1,
      email: '',
      location: {
        university: {
          id: 1753,
          name: '长沙学院'
        },
        city: {
          code: '430100',
          name: '长沙市'
        }
      }
    }
  },
  getters: {
    getUser(state) {
      return loadUser(state)
    },
    getCity(state) {
      const user = loadUser(state)
      if (user.location) return user.location.city
      return null
    },
    getUniversity(state) {
      const user = loadUser(state)
      if (user.location) {
        return user.location.university
      }
      return null
    },
    getLocation(state) {
      const user = loadUser(state)
      return user.location
    },
    getUserId(state) {
      const user = loadUser(state)
      return user.userId
    }
  },
  mutations: {
    setActiveUser(state, user) {
      if (user) {
        Object.assign(state.activeUser, state.activeUser, user)
        updateUserCache(state.activeUser)
      }
    },
    updateUniversity(state, university) {
      if (state.activeUser.location) {
        state.activeUser.location = { ...state.activeUser.location, university }
      } else {
        state.activeUser = { ...state.activeUser, location: { university } }
      }
      updateUserCache(state.activeUser)
    },
    updateCity(state, city) {
      if (state.activeUser.location) {
        state.activeUser.location = { ...state.activeUser.location, city }
      } else {
        state.activeUser = { ...state.activeUser, location: { city } }
      }
      updateUserCache(state.activeUser)
    }
  },
  actions: {}
}

const loadUser = state => {
  if (state.activeUser.userId === null) {
    let user = localStorage.getItem('activeUser')
    if (user) {
      state.activeUser = JSON.parse(user)
      return state.activeUser
    }
  }
  return state.activeUser
}

const updateUserCache = user => {
  localStorage.setItem('activeUser', JSON.stringify(user))
}

export default user
