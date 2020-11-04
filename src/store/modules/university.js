const university = {
  namespaced: true,
  state: {
    universities: []
  },
  getters: {
    getUniversityList(state) {
      return state.universities
    }
  },
  mutations: {
    setUniversityList(state, list) {
      state.universities = list
    }
  }
}

export default university
