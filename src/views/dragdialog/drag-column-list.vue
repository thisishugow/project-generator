<template>
  <div class="quick-filter-item" style="display: inline-block">
    <!--A condition template&-->
    <el-button style="min-width:15%;" type="info" @click="dialogTableVisible = true">
      <i class="el-icon-s-tools" /> Column Order
    </el-button>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Column Order:" @dragDialog="handleDrag">
        Drag to change the order.
        <draggable :list="columns" group="columns" class="dragArea">
          <div v-for="element in columns" :key="element" class="list-complete-item">
            <div class="list-complete-item-handle2">
              <svg-icon icon-class="drag" /> {{ element }}
            </div>
          </div>
        </draggable>
    </el-dialog>    
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import draggable from 'vuedraggable'

export default {
  name: 'DragColumnList',
  directives: { elDragDialog },
  components: { draggable },
  props:{
    columns: {
      type: Array,
      required: true,
      default: []
    },
  },
 watch:{
    columns:{
      handler: function(val, oldVal) {
       },
       deep: true,
       immediate:false
    },
    
  },
  data() {
    return {
      // objectToPass:[],
      dialogTableVisible: false,

    }
  },
  created() {
  },
  computed:{
 
  },
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur()
    },
    getData() {
      
    },
    pipeToParent() {
    }
  },

}
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