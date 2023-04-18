import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import permission from './modules/permission' // add permission for Vuex
import blocks from './modules/blocks'
import chart from './modules/chart'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission, // add permission for Vuex
    blocks,
    chart,
  },
  getters
})

export default store
