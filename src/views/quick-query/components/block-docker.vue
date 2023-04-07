<template>
  <div class="save-block" style="display: inline-block">
    <!--A condition template&-->
    <el-button
      style="min-width: 15%"

      @click="
        dialogTableVisible = true;
      "
    >
      <i class="el-icon-circle-plus" /> Save as Block
    </el-button>
    <el-dialog :visible.sync="dialogTableVisible" title="Save as block:" append-to-body>
      <el-form
        ref="form"
        :model="blockForm"
        label-width="120px"
      >
        <el-form-item label="Block Name">
            <el-input v-model="blockForm.name" required></el-input>
        </el-form-item>
        <el-form-item>
            <el-button @click="dialogBlocksVisible = true;">All Blocks</el-button>
                <el-dialog :visible.sync="dialogBlocksVisible" title="All blocks" append-to-body style="min-width:500px;">
                      <el-table label-position="left" :data="blocks" >
                        <el-table-column  type="expand">
                            <template slot-scope="scope">
                                 <!-- <strong>Conditions: </strong><pre>{{scope.row.block}}</pre> -->
                                 <el-form label-position="left" inline >
                                     <el-form-item v-for="k in Object.keys(scope.row.block)" :key="k" :label="k">
                                        <span v-if="scope.row.block[k].selected.some(v => v)">Selected: <input type="text" :value="scope.row.block[k].selected" readonly><br></span>
                                        <span v-if="scope.row.block[k].selected.some(v => v)">Opoerator: <input type="text" :value="scope.row.block[k].operator" readonly></span>
                                     </el-form-item>
                                 </el-form>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="Name" sortable resizable>
                        </el-table-column>
                        <el-table-column
                            prop="name"
                            fixed="right"
                            label="Edit"
                            width="100">
                            <template slot-scope="scope">
                                <el-popconfirm ref="confirmDeleteBlock" title="Are you sure to delete it?" @onConfirm="deleteBlock(scope.row.name)">
                                    <el-button slot="reference" type="text" size="small" >Delete</el-button>
                                </el-popconfirm>
                            </template>
                            </el-table-column>
                      </el-table>
                </el-dialog>
            <el-button type="primary" @click="saveBlock">Save</el-button>
      </el-form-item>
      </el-form>
      
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import { getStmt } from '@/api/data-warehouse'

export default {
  name:"BlockDocker",
  directives: {elDragDialog},
  components:{ },
  props:{
      queryConditions:{
          type: Object,
          require: false,
          default: {},
      },
      srcTable:{
        type:String,
        require: true,
      }
  },
  computed:{
      ...mapGetters(["blocks",]),
  },
  data(){
      return {
          blockList:[],
          blockForm: {
              name:'',
              queryCondition:{},
          },
          dialogTableVisible:false,
          dialogBlocksVisible:false,

      }
  },
  methods:{
      getBlocks(){

      },
      saveBlock(){
        // // TODO: write a detection of the duplicated blocks.name
        const blockExists = this.$store.state.blocks.blocks.some(item => item.name === this.blockForm.name);
        if (this.blockForm.name.length==0){
            this.$alert('Block Name is required.')
            return
        }
        if(blockExists){
            this.$alert(`Block name aleady exists: ${this.blockForm.name}`)
            return
        }
       
        getStmt(this.srcTable, this.queryConditions).then(response =>{
          const data = response.data
          console.log(data)
          const stmt = data.stmt
          const columns = data.columns
          this.$store.dispatch('blocks/addBlock', {name:this.blockForm.name, block:this.deepClone(this.queryConditions), table:this.srcTable, stmt:stmt, columns:columns}, ).then(() => {     
              this.$message('Block saved.') 
              console.log(stmt)     
              console.log(columns)     

              this.blockForm.name = ''  
            }
            ).catch((error) => {
              console.log(error)
              this.$message(error)  
            })

        })

      },
      deleteBlock(blockName){
          this.$store.dispatch('blocks/delBlock', blockName)
          this.$message(`Block '${blockName}' is deleted`)
      },
      deepClone(obj){
        function _deepClone(obj){
            let cloneObj = {};
            for (let key in obj) {
              if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                cloneObj[key] = _deepClone(obj[key]);
              } else {
                cloneObj[key] = obj[key];
              }
            }
            return cloneObj;
        }
        return _deepClone(obj)
      },

  }
}
</script>

<style>

</style>