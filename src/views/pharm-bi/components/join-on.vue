<template>
    <div >
        <el-select v-model="colJoinOnL" placeholder="table 1 join by" filterable>
        <el-option v-for="item in columnsPoolL" :key="item.column" :value="item.column" :label="item.column">
            <span style="float: left">{{ item.column }}</span>
            <span style="float: right; color: #8492a6;">{{ item.datatype }}</span>
        </el-option>
        </el-select>
        =
        <el-select  v-model="colJoinOnR" placeholder="table 2 join by" filterable>
        <el-option v-for="item in columnsPoolR" :key="item.column" :value="item.column" :label="item.column">
            <span style="float: left">{{ item.column }}</span>
            <span style="float: right; color: #8492a6;">{{ item.datatype }}</span>
        </el-option>
        </el-select>
        <div style="display: inline-block; float: right;">
        <!-- <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addJoin"></el-button>
        <el-button type="primary" icon="el-icon-minus" circle size="mini" @click="popJoin"></el-button> -->
        </div>
  
    
    </div>
</template>
<script>
import { dataWarehouse, getColumns } from "@/api/data-warehouse";

export default {
  name: "JoinOn",
  components: {},
  props: {
    queryBlocks: {
      //{queryBlockL:{name:'', block:{}, table:'',}, queryBlockR:{}}
      type: Object,
    },
    id:{
        type:String,
        default:'join-0',
    }
  },
  data() {
    return {
      colJoinOnL: '',
      colJoinOnR: '',
      columnsPoolL:[],
      columnsPoolR:[],
      tmpColList:[]
    };
  },
  computed:{

  },
  watch: {
      queryBlocks:{
          handler:function(val, oldVal){
              this.initColumnOptions(val)
              console.log('初始化完成')
          },
          deep:true,
          immediate:true,
      },
      colJoinOnL:{
          handler: function(val, oldVal){
              this.pipeToParent()
          }
      },
      colJoinOnR:{
          handler: function(val, oldVal){
              this.pipeToParent()
          }
      }
  },
  created() {

  },
  methods: {
    async getColumns(queryBlock) {
      // await getColumns(queryBlock.table, true).then((response) => {
      //   this.tmpColList = Array()
      //   response.data.forEach((element) => {
      //     if (
      //       !["numeric", "float", "integer", "double"].includes(
      //         element.datatype.toLowerCase()
      //       )
      //     ) {
      //       this.tmpColList.push(element);
      //     }
      //   });

      //   // this.tmpColList =  columns;
      // });
        this.tmpColList =  queryBlock.columns;
    },
    async initColumnOptions(blockPairs){
        const {queryBlockL, queryBlockR} = blockPairs
        await this.getColumns(queryBlockL)
        this.columnsPoolL = [...this.tmpColList ]
        await this.getColumns(queryBlockR)
        this.columnsPoolR = [...this.tmpColList ]
    },
    pipeToParent(){
      this.$emit('listenChildJoin', {id:this.id, joinOn:[this.colJoinOnL, this.colJoinOnR]})
      console.log('Pipe to parent')
    }
  },

};
</script>
