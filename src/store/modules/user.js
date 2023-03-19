import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { config } from '@vue/test-utils'

const getDefaultState = () => {  
  return {
    token: '',
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
    const { username, password } = userInfo 
   
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const token_data = response.data['access_token'] //! api retuns key 'access_token'
        commit('SET_TOKEN', token_data)
        setToken(token_data) //! DO NOT REMOVE
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const  { data }  = response
        let roles = data.role
        let name = data.username
        let avatar = "/static/img/Otis.jpg"
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

