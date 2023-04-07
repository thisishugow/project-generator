<template>
    <div class="app-container">
        <el-scrollbar wrap-style="max-height: 40vh;max-width: 90vw" style="border-inline: solid 1px;writing-mode: horizontal-tb;border-inline-color: gray;">
        <el-table
        v-loading="loading"
        :data="dataReturn"
        size="mini"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        >
        <el-table-column v-for="col in Object.keys(dataReturn[0])" :key="col" v-bind:label="col" v-bind:prop="col" >
        </el-table-column>
        </el-table>
        </el-scrollbar>
        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination


export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {},
  props:{
    dataReturn: {
      type: Array,
      required: false,
      default: () => ([])
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20
      },
      importanceOptions: [1, 2, 3],
      showReviewer: false,
      dialogFormVisible: false,
      dialogStatus: '',
      loading: true,

    }
  },
  created(){
    this,getList()
  },
  methods: {
    getList() {
      this.listQuery = {
        page: 1,
        limit: 20
      }
      if (this.dataReturn.length>0){
        this.total = this.dataReturn.length
        let {page, limit} = this.listQuery
        this.list = this.dataReturn.slice((page-1)*limit,page*limit)
        this.loading = false
      }else{
        this.total = 0
        let {page, limit} = this.listQuery
        this.list = this.dataReturn.slice((page-1)*limit,page*limit)
      }
      
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

  }
}
</script>
