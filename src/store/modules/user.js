import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { config } from '@vue/test-utils'

const getDefaultState = () => {  
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles:''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    // console.log("here to get token!!!"+getToken())
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) =>{
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    console.log("Set the token...")
    const { username, password } = userInfo 
    login({ username: username.trim(), password: password }).then(response=>{ // call /src/utils/request.js-response()
      const test_data = response
      console.log("this is test data: "+test_data) 
    }    
    )
    
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        // const { data } = response
        // console.log(response)
        const token_data = response.access_token
        // data = response.access_token
        commit('SET_TOKEN', token_data)
        setToken(token_data)
        window.localStorage.setItem("loginData", token_data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    let data = window.localStorage.getItem("loginData")
    console.log(state)
    return new Promise((resolve, reject) => {
      // data = window.localStorage.getItem("loginData")
      // commit("SET_ROLES", roles)
      // commit("SET_NAME", name)
      // commit("SET_AVATAR", avatar)
      // resolve({roles, name, avatar})
      getInfo(state.token).then(response => {
        const { data } = response
        let roles = data.roles
        let name = data.name
        let avatar = "https://www.baidu.com/img/flexible/logo/pc/result.png"
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
    
        commit('SET_NAME', name)
        commit("SET_ROLES", roles)
        commit('SET_AVATAR', avatar)
        resolve({roles, name, avatar})
      }).catch(error => {
        reject(error)
      })
      
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },

  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

