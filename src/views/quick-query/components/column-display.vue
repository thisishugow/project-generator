<template>
  <div class="quick-filter-item" style="display: inline-block">
    <!--A condition template&-->
    <el-button
      style="min-width: 15%"
      type="info"
      @click="
        dialogTableVisible = true;
        getData();
      "
    >
      <i class="el-icon-more" /> Column Display
    </el-button>
    <el-dialog :visible.sync="dialogTableVisible" title="Column Display:" append-to-body>
        <div style="margin:20px">Select the columns to display</div>
      <div style="display:flex; justify-content:center;align-items: center;flex-direction: column;">
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder="Search"
          right-check-change=""
          v-model="value"
          :data="options"
          :titles="['Display','Hiden']"
          
          >
        </el-transfer>
      </div>
      
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import draggable from 'vuedraggable'
export default {
  name: "ColumnDisplay",
  directives: {elDragDialog},
  components: {draggable},
  props: {
    columns: {
      type: Array,
      required: true,
      default: [],
    },
  },
  watch: {
    value:{
      handler: function(val, oldVal) {
        this.pipeToParent()
       },
       deep: true,
       immediate:false
    },
    columns:{
      handler: function(val, oldVal) {
       },
       deep: true,
       immediate:false
    },
  },
  data() {
    return {
      dialogTableVisible: false,
      value:[],
      options:null,
    };
  },
  created() {
    this.getData()
  },
  computed: {
    originalColumns(){
      let res = []
      this.options.forEach(element=>{
        res.push(element.label)
      })
      return res
    },
  },
  methods: {
    filterMethod(query, item) {
          return item.label.indexOf(query) > -1;
    },
    getData(){
      if (!this.options || typeof(this.options) == 'undefined' || this.options == 0){
        this.options = []
        this.columns.forEach((element, index, arr) =>{
          this.options.push(
            {
              key:index,
              label:element,
              disabled: false,
            }
          )
          }
        )
      }
    },
    // TODO: fix the error of selecting values cannot be reset. 
    pipeToParent() {
      if (this.value.length>0){
        this.value.forEach((element, index, arr) => {
          var colHiden = this.options[element].label
          this.columns = this.columns.filter(v => {return v != colHiden})
        })
      }
      
      // this.srcData[this.title]['unselected'] = this.list2
        
      // childByValue是在父组件on监听的方法
      // 第二个参数this.childValue是需要传的值
      this.$emit('listenChildColumnDisplay', this.columns)
    },
      
  },
};
</script>
<style scoped>
.dragArea {
  margin-top: 15px;
  min-height: 50px;
  padding-bottom: 30px;
}
.list-complete-item {
  cursor: pointer;
  position: relative;
  font-size: 14px;
  padding: 5px 12px;
  margin-top: 4px;
  border: 1px solid #bfcbd9;
  transition: all 1s;
}

.list-complete-item-handle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 50px;
}

.list-complete-item-handle2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 20px;
}
</style>