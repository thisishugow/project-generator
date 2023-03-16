<template>
  <div class="quick-filter-item">
    <!--A condition template&-->
    <el-button style="min-width:15%;" type="primary" @click="dialogTableVisible = true">
      {{ alias }}
    </el-button>
    <el-select v-model="operator" style="width:80px">
      <el-option label="=" value="eq" />
      <el-option label="in" value="in" />
      <el-option label=">=" value="ge" />
      <el-option label="<=" value="le" />
      <el-option label="not in" value="nin" />
    </el-select>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Quick Select: " @dragDialog="handleDrag">
      <div>
        <el-form ref="form" :model="searchForm" label-width="100px">
          
          <el-col :span="100">
            <el-form-item label="Search name">
              <el-input  v-model="searchForm.name" @keyup.enter.native="filterIt" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-button type="filter" @click="filterIt">Filter</el-button>
          </el-col>
        </el-form>
      </div>
      <br><br><br><br>
      <div class="editor-container">
        <dnd-list :list1="list1" :list2="list2" list2-title="Item Pool"  list1-title="Selected" />
      </div>
      <el-button type="primary" @click="onSelectAll">
        <i class="el-icon-caret-right" />
      </el-button>
    <el-button type="primary" @click="onRemoveAll">
       <i class="el-icon-caret-left" />
    </el-button>
    </el-dialog>
    <el-input style="width:60%" v-bind:value="list1.join()" />
    <!--A condition template*-->  
    </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import DndList from '@/components/DndList'
import {getPool} from "@/api/data-warehouse"

export default {
  name: 'QuickFilter',
  directives: { elDragDialog },
  props:{
    title: {
      type: String,
      required: true,
      default: []
    },
    srcData: {
      type: Object,
      required: false,
      // default: ()=> ({'example':{'selected':[], 'unselected':[]}})
    },
    alias: {
      type: String,
      required: true,
      default: ''
    },
  },
 watch:{
    list1:{
      handler: function(val, oldVal) {
           this.pipeToParent(); // call it in the context of your component object
       },
       deep: true,
       immediate:true
    },
    operator:{
      handler: function(val, oldVal) {
           this.pipeToParent(); // call it in the context of your component object
       },
       deep: true,
       immediate:true
    },
    dialogTableVisible:{
      handler: function(val, oldVal){
        if (val && this.listOriginal.length==0){this.getData()}
      },
      deep: true
    },
  },
  components: { DndList },
  data() {
    return {
      searchForm:{name:''},
      list1: [],
      list2: [],
      listOriginal:[],
      // objectToPass:[],
      dialogTableVisible: false,
      operator: 'eq',

    }
  },
  created() {
  },
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur()
    },
    getData() {
      this.listLoading = true
      // this.listOriginal = this.srcData[this.title]['unselected']
      getPool('sample_data', this.title).then(response => {
        this.listOriginal = Array(...response.data)
        this.list1 = []
        this.list2 = this.listOriginal 
      }).catch(error => {
        console.error(error);
      });
    },
    filterIt(){
    var filteringItem = this.searchForm.name
    if (filteringItem){    
      this.list2 = this.list2.filter(v => {return v.startsWith(filteringItem)})
      }else{
        this.list2 = this.listOriginal.filter(item => !this.list1.includes(item))
      }
    },
    onSelectAll(){
      this.list2.forEach(e => this.list1.push(e))
      this.list2 = []
    },
    onRemoveAll(){
      this.list1.forEach(e => this.list2.push(e))
      this.list1 = []
    },

    pipeToParent() {
      const res = {
        'title': this.title,
        'selected': this.list1,
        'operator': this.operator,
      }
      // this.srcData[this.title]['unselected'] = this.list2
        
      // childByValue是在父组件on监听的方法
      // 第二个参数this.childValue是需要传的值
      this.$emit('listenChild', res)
    }
  },

}
</script>
