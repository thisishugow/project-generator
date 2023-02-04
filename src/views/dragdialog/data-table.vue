<template>
    <div class="app-container">
        <!-- <div class="filter-container">
            <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
            <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
                <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
                <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
            </el-select>
            <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
                Search
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
                Add
            </el-button>
            <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
                Export
            </el-button>
            <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
                reviewer
            </el-checkbox>
        </div> -->

        <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        size="mini"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        >
        
        <!-- <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
            <template slot-scope="{row}">
            <span>{{ row.id }}</span>
            </template>
        </el-table-column> -->
        <el-table-column v-for="col in Object.keys(list[0])" :key="col" v-bind:label="col" v-bind:prop="col" >
            <!-- <template slot-scope="{row}">
            <span>{{ row }}</span>
            </template> -->
        </el-table-column>
        </el-table>
    
        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
const sampleData = [
    {process:'PROC1', parameter:'PH', value:7.2, unit:''},
    {process:'PROC2', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC3', parameter:'PH', value:7.1, unit:''},
    {process:'PROC4', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC5', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC6', parameter:'PH', value:7.2, unit:''},
    {process:'PROC7', parameter:'PH', value:7.2, unit:''},
    {process:'PROC8', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC9', parameter:'PH', value:7.1, unit:''},
    {process:'PROC10', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC11', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC12', parameter:'PH', value:7.2, unit:''},
    {process:'PROC13', parameter:'PH', value:7.2, unit:''},
    {process:'PROC14', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC15', parameter:'PH', value:7.1, unit:''},
    {process:'PROC16', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC17', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC18', parameter:'PH', value:7.2, unit:''},
    {process:'PROC19', parameter:'PH', value:7.2, unit:''},
    {process:'PROC20', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC21', parameter:'PH', value:7.1, unit:''},
    {process:'PROC22', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC23', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC24', parameter:'PH', value:7.2, unit:''},
    {process:'PROC25', parameter:'PH', value:7.2, unit:''},
    {process:'PROC26', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC27', parameter:'PH', value:7.1, unit:''},
    {process:'PROC28', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC29', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC30', parameter:'PH', value:7.2, unit:''},
    {process:'PROC31', parameter:'PH', value:7.2, unit:''},
    {process:'PROC32', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC33', parameter:'PH', value:7.1, unit:''},
    {process:'PROC34', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC35', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC36', parameter:'PH', value:7.2, unit:''},
    {process:'PROC37', parameter:'PH', value:7.2, unit:''},
    {process:'PROC38', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC39', parameter:'PH', value:7.1, unit:''},
    {process:'PROC40', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC41', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC42', parameter:'PH', value:7.2, unit:''},
    {process:'PROC43', parameter:'PH', value:7.2, unit:''},
    {process:'PROC44', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC45', parameter:'PH', value:7.1, unit:''},
    {process:'PROC46', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC47', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC48', parameter:'PH', value:7.2, unit:''},
    {process:'PROC49', parameter:'PH', value:7.2, unit:''},
    {process:'PROC50', parameter:'WEIGHT', value:3.2, unit:'g'},
    {process:'PROC51', parameter:'PH', value:7.1, unit:''},
    {process:'PROC52', parameter:'WEIGHT', value:3.6, unit:'g'},
    {process:'PROC53', parameter:'HEIGHT', value:5.6, unit:'mm'},
    {process:'PROC54', parameter:'PH', value:7.2, unit:''}, 
    ]
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      sampleData: sampleData,
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      console.log(Object.keys(this.sampleData[0]))
      this.listLoading = false
      this.total = this.sampleData.length
      let {page, limit} = this.listQuery
      this.list = this.sampleData.slice((page-1)*limit,page*limit)


    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
  }
}
</script>
