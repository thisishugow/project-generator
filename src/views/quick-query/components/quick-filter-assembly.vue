<template>
  <div class="components-container" v-bind:id="idFixed" >
    <!--A condition template&-->
    {{idFixed}}
    <el-select v-model="title" placeholer="Select a column">
      <el-option v-for="col in Object.keys(srcData)" :key="col" :label="srcData[col].alias" :value="col" />
    </el-select>
    <el-button type="primary" @click="dialogTableVisible = true">
      <svg-icon icon-class="edit" />
    </el-button>
    <el-select v-model="operator" style="width:80px">
      <el-option label="=" value="eq" />
      <el-option label="in" value="in" />
      <el-option label=">=" value="ge" />
      <el-option label="<=" value="le" />
      <el-option label="not in" value="nin" />
    </el-select>
    <div>{{operator}}</div>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Quick Select: " @dragDialog="handleDrag">

      <div>
        <el-form ref="form" :model="searchForm" label-width="100px">
          <el-col :span="10">
            <el-form-item label="Search name">
              <el-input v-model="searchForm.name" @keyup.enter.native="filterIt" />
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
        → 
      </el-button>
    <el-button type="primary" @click="onRemoveAll">
       ←
    </el-button>
    </el-dialog>
    <span style="background-color:yellow">
        <span v-for="t in list1" :key="t">
        {{t}},
        </span>
    </span>
    <!--A condition template*-->  

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import DndList from '@/components/DndList'
export default {
  name: 'QuickFilterAssembly',
  directives: { elDragDialog },
  props:{
    id: {
      type: Number,
      require: true,
    },
    srcData: {
      type: Object,
      required: false,
      // default: ()=> ({'example':{'selected':[], 'unselected':[]}})
    },
  },
 watch:{
    list1:{
      handler: function(val, oldVal) {
           this.pipeToParent(); // call it in the context of your component object
       },
       deep: true,
       immediate:false
    },
    operator:{
      handler: function(val, oldVal) {
           this.pipeToParent(); // call it in the context of your component object
       },
       deep: true,
       immediate:false
    },
    title:{
      handler: function(val, oldVal) {
           this.getData(); // call it in the context of your component object
       },
       deep: true,
       immediate:false
    },
  },
  components: { DndList },
  data() {
    return {
      searchForm:{name:''},
      list1: [],
      list2: [],
      title:'',
      alias:'',
      listOriginal:[],
      // objectToPass:[],
      dialogTableVisible: false,
      operator: 'eq',
      idFixed: 0,

    }
  },
  created() {
    this.getData()
  },
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur()
    },
    getData() {
      this.idFixed = this.id
      this.listLoading = true
      this.listOriginal = [...this.srcData[this.title]['unselected']]
      console.log(this.listOriginal)
      this.list1 = []
      this.list2 = this.listOriginal 
    },
    filterIt(){
    var filteringItem = this.searchForm.name
    if (filteringItem){    
      this.list2 = this.list2.filter(v => {return v.toString().startsWith(filteringItem)})
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
        'id': this.idFixed,
        'title': this.title,
        'selected': this.list1,
        'operator': this.operator,
      }
        
      // childByValue是在父组件on监听的方法
      // 第二个参数this.childValue是需要传的值
      this.$emit('listenChild', res)
    }
  }

}
</script>
