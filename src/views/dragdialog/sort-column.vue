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
      <i class="el-icon-sort" /> Sort By Column
    </el-button>
    <el-dialog :visible.sync="dialogTableVisible" title="Sort by Column:" @dragDialog="handleDrag">
      Drag to change the order.
      <draggable :list="form" group="form" class="dragArea">
      <el-form
        v-for="col in form"
        :key="col.name"
        label="Sort Options"
        ref="form"
        :model="col"
        label-width="120px"
        class="list-complete-item"
      >
        <el-col :span="1">      
        <el-checkbox name="sorted" v-model="col.sorted" />
        </el-col>  
        <el-col :span="6">
        {{ col.name }}
        </el-col> : 
        <el-radio-group v-model="col.order">
          <el-radio label="ascending" />
          <el-radio label="descending" />
        </el-radio-group>
      </el-form>
      </draggable>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import draggable from 'vuedraggable'
export default {
  name: "SortColumn",
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
      form:{
        handler: function(val, oldVal) {
           this.pipeToParent(); // call it in the context of your component object
       },
       deep: true,
       immediate:true
      }
  },
  data() {
    return {
      // objectToPass:[],
      dialogTableVisible: false,
      // {<columnName>:{order:'Ascending', sorted:true}}
      form: [],
    };
  },
  created() {},
  computed: {},
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur();
    },
    getData() {
      if (this.form.length === 0) {
        this.columns.forEach((element) => {
          this.form.push({name:element, order:"ascending", sorted:false});
        });
      }
    },
    pipeToParent() {
        const res = []
        this.form.forEach(element=>{
                if(element.sorted == true){
                    res.push({name:element.name, order:element.order})
                }
            }
        )
        this.$emit('listenSortColumn', res)
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