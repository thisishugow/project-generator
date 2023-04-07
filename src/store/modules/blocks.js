import { resetRouter } from '@/router'
import { config } from '@vue/test-utils'

const getBlocks = () => {
  return {
    blocks: [
      //{name: <block name>, block: <queryConditions>, table:<table name>, stmt::<'select * from table_1'>, columns:[{column:'value', type:1700},]}
    ],
  }
}

const state = getBlocks()

const mutations = {
  SAVE_BLOCK: (state, block) => {
    state.blocks.push(block)
  },
  DEL_BLOCK: (state, block) => {
    state.blocks.filter((item,index, array) => {
      if(String(item.name) === String(block)){
        state.blocks.splice(index,1)
      }     
    })

  },
}

const actions = {
  addBlock({ commit }, block) {
    return new Promise(resolve => {
      commit('SAVE_BLOCK', block)
      resolve(block)
    })

  },
  delBlock({ commit }, block) {
    return new Promise(resolve => {
      commit('DEL_BLOCK', block)
      resolve(block)
    })

  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

