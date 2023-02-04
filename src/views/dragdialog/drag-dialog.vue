<template>
  <div class="components-container">
    Article
    <el-button type="primary" @click="dialogTableVisible = true">
      open a Drag Dialog
    </el-button>

    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Quick Selection: " @dragDialog="handleDrag">
      <!-- <el-select ref="select" v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-table :data="gridData">
        <el-table-column property="date" label="Date" width="150" />
        <el-table-column property="name" label="Name" width="200" />
        <el-table-column property="address" label="Address" />
      </el-table> -->
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
    <div>
        <ul>
        <li v-for="t in list1" :key=t>
        {{ t.author }}: {{t.title}}
        </li>
      </ul>
    </div>
    <div class="components-container">
      <complex-table></complex-table>
    </div>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import DndList from '@/components/DndList'
import ComplexTable from '@/views/dragdialog/data-table.vue'
export default {
  name: 'DragDialogDemo',
  directives: { elDragDialog },
  components: { DndList, ComplexTable },
  data() {
    return {
      searchForm:{name:''},
      list1: [],
      list2: [],
      listOriginal:[],
      dialogTableVisible: false,

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
      this.listLoading = true
      var samplePool = [{"title": "C-test1", "id": 0, "author":"author1"},
                    {"title": "A-test2", "id": 1, "author":"author1"},
                    {"title": "B-test3", "id": 2, "author":"author1"},
                    {"title": "C-test4", "id": 3, "author":"author2"},
                    {"title": "D-test5", "id": 4, "author":"author2"},
                    {"title": "A-test6", "id": 5, "author":"author3"}
                    ]
      this.listOriginal = samplePool
      this.list1 = []
      this.list2 = samplePool
    },
    filterIt(){
    var filteringItem = this.searchForm.name
    if (filteringItem){    
      this.list2 = this.list2.filter(v => {return v.title.startsWith(filteringItem)})
      console.log(this.list2)
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
    }
  }

}
</script>
