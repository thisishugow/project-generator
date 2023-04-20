<template>
  <div>
    <h1>Visualization</h1>

    <el-row :gutter="16">
      <div style="padding-top: 5px; padding-bottom: 10px">
        <el-form label-width="120px" style="padding:0px;">
          <el-form-item label="Block Setting" style="margin-bottom:5px;">
            <el-input
              v-model="blockName"
              type="text"
              style="width: 50%;"
              inline
            ></el-input>
            <el-select
              v-model="srcBlockId"
              placeholder="select source block"
              filterable
              inline
            >
              <el-option
                v-for="item in connectedNodesPool"
                :key="item.id"
                :label="item.attrs.text.text"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Dimensions" style="margin-bottom:5px;">
            <el-select
              v-model="dimensionCols"
              placeholder="select columns of dimensions"
              filterable
              multiple
              inline
              style="width: 80%"
            >
              <el-option
                v-for="item in columns"
                :key="item.column"
                :value="item.column"
                :label="item.column"
              >
                <span style="float: left">{{ item.column }}</span>
                <span style="float: right; color: #8492a6">{{
                  item.datatype
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Value" style="margin-bottom:5px;">
            <el-select
              v-model="valueCols"
              placeholder="select column of value"
              filterable
              multiple
              inline
              style="width: 80%"
            >
              <el-option
                v-for="item in columns"
                :key="item.column"
                :value="item.column"
                :label="`${item.column} (${methodValueCols[item.column]? methodValueCols[item.column]:'*select an aggregation'})`"
              > 
              <!-- <el-row :gutter="2"> 
                <el-col :span="4">
                  <span style="float: left">{{ item.column }}</span>
                </el-col>
                <el-col :span="3"><span style="color: #8492a6">{{
                  item.datatype
                }}</span></el-col>
                <el-col :span="15" >
                  <el-radio-group v-model="methodValueCols[item.column]" size="mini" style="float: right; padding-top:10px">
                  <el-radio v-for="j in ['avg', 'stddev','count','max','min','sum']" :key="j" :value="j" :label="j" />
                </el-radio-group>
                </el-col>
              </el-row> -->
              <span style="float: left">{{ item.column }}</span>
              <span style="float:right;color: #8492a6">{{
                  item.datatype
                }}</span>
                <el-select v-model="methodValueCols[item.column]" size="mini" style="float: right;width: 100px;" > 
                  <el-option v-for="j in ['avg', 'stddev','count','max','min','sum']" :key="j" :value="j" :label="j" />
                </el-select>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Chart Type" style="margin-bottom:5px;">
        <visual-tooltip id="vizPanel" v-loading="loadingFigTool" :dimCols="dimensionCols" :valCols="valueCols" :chart-type.sync="chartType" />

          </el-form-item>
          <el-form-item label="Limit" style="margin-bottom:5px;">
            <el-select v-model="resLimit">
              <el-option v-for="limit in [50, 100, 200, 500, 1000]" :key="limit" :value="limit" :label="limit"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-button @click="executeGetData" style="float:right">Execute</el-button>
      </div>
    
      <div style="padding-top: 5px; padding-bottom: 5px"></div>
      <div style="padding-top: 5px; padding-bottom: 5px"></div>
    </el-row>
    <el-row> 
      <div v-loading="loadingChart">
        <graph-panel :schema="colsToFig" :data="chartData" :chartType="chartType"/>
      </div>
    </el-row>
    <el-button @click="applySetting" style="float:right">Apply</el-button>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { deepClone } from "@/utils/common";
import {
  makeGroupby,
  execStmt,
} from "@/api/data-warehouse";
import visualizePanel from './components/visualizePanel'
import visualTooltip from './components/visual-tooltip.vue'
import graphPanel from './components/graph-panel.vue'
import {sqlFunc} from '@/utils/configs'

export default {
  name: "chart",
  components: {visualizePanel, visualTooltip, graphPanel},
  props: {
    graphData: {
      //   type: Object,
      require: true,
    },
    display: {
      type: Boolean,
    },
    nodeId: {
      type: String,
      require: true,
    },
    nodeName: {
      type: String,
      require: false,
    },
  },
  computed: {
    ...mapGetters(["blocks"]),
    connectedNodesPool() {
      this.getConnections("source");
      return this.connectedNodes;
    },
    colGroupByPool() {
      this.getColumns();
      return this.columns;
    },
    
    colsToFig(){
      var resCols = [
          // {Column:'', Type:'', id:0, isDimension:true, name:''},
          // {Column:'', Type:'', id:1, calculFunc:'', name:''},
        ]
      this.dimensionCols.forEach(element=>{
        const el = this.columns.filter(e => e.column == element)[0]
        resCols.push(
          {
            Column:el.column,
            Type:el.datatype,
            id: resCols.length,
            isDimension:true,
            name: el.column
          }
        )
      })
      
      this.valueCols.forEach(element =>{
        const el = this.columns.filter(e => e.column == element)[0]
        resCols.push(
          {
            Column:`${ this.methodValueCols[element]}_${el.column}`,
            Type: el.datatype,
            id: resCols.length,
            calculFunc: this.methodValueCols[element],
            isDimension:false,
            // name: `${el.column} (${ this.methodValueCols[element]})`
            name: `${el.column} (${ this.methodValueCols[element]})`
          }
        )
      })
      return resCols
      
    },
    chartData() {
      return this.dataTransfer(this.result, this.colsToFig)? this.dataTransfer(this.result, this.colsToFig) : this.result
    },
  },
  data() {
    return {
      blockName:'',
      methodValueCols:{},
      connectedNodes: [],
      blockId: "",
      srcBlockId: "",
      block: {},
      valueCols: [],
      dimensionCols: [],
      colToRow: "",
      columns: [],
      aggrMethod: "MAX",
      applied: {},
      loadingFigTool:false,
      allSelected:[],
      result:[],
      chartType:'table',
      resLimit: 200,
      loadingChart:false,
    };
  },
  watch: {
    srcBlockId: {
      handler: function (val, oldVal) {
        this.block = this.graphData.getCellById(val).getData();
        this.getColumns();
        console.log(this.block);
      },
      deep: true,
    },
    colsToFig:{
      handler: function (val, oldVal){
       
        
      }
    }
  },
  mounted() {
    this.init();
  },
  created() {},
  methods: {
    init() {
      Object.assign(this.$data, this.$options.data.call(this)); // initialized all $data default values, otherwise the component will show the previous behavior.
      const appliedSettings = this.graphData.getCellById(this.nodeId).getData();
      if (appliedSettings) {
        this.srcBlockId = appliedSettings.srcBlockId;
        this.blockId = appliedSettings.blockId;
        this.blockName = this.graphData.getCellById(
          this.nodeId
        ).attrs.text.text;
        this.dimensionCols = appliedSettings.settings.dimensionCols
        this.valueCols = appliedSettings.settings.valueCols
        this.methodValueCols = appliedSettings.settings.methodValueCols
        this.chartType = appliedSettings.settings.chartType
        this.result = appliedSettings.settings.chartData
        this.resLimit = appliedSettings.settings.resLimit
        this.applied.stmt = appliedSettings.stmt
        this.applied.columns = appliedSettings.columns
      } else {
        this.blockName =
          this.graphData.getCellById(this.nodeId).attrs.text.text +
          "-" +
          this.nodeId;
        console.log("Create a new block");
      }
    },
    getConnections(fromEdge) {
      var edges = this.graphData.getConnectedEdges(this.nodeId, { deep: true });
      const graph = this.graphData;

      switch (fromEdge) {
        case "source":
          // get source nodes
          edges
            .map(function (edge) {
              return graph.getCellById(edge.source.cell);
            })
            .forEach((element) => {
              if (!this.connectedNodes.includes(element)) {
                this.connectedNodes.push(element);
              }
            });
          break;
        case "target":
          // get target nodes
          edges
            .map(function (edge) {
              return graph.getCellById(edge.target.cell);
            })
            .forEach((element) => {
              this.connectedNodes.push(element);
            });
          break;
      }
    },
    getColumns() {
      this.columns = this.block.columns;
    },
    applySetting() {
      this.graphData
        .getCellById(this.nodeId)
        .setAttrs({ text: { text: this.blockName } });
      this.applied.srcBlockId = this.srcBlockId
      this.applied.blockId = this.nodeId
      this.applied.stmt = this.applied.stmt
      this.applied.columns = this.applied.columns
      this.applied.settings = {
        valueCols:this.valueCols,
        dimensionCols:this.dimensionCols,
        methodValueCols:this.methodValueCols,
        colsToFig:this.colsToFig,
        chartType:this.chartType,
        chartData:this.result,
        resLimit: this.resLimit,
        colsToFig: this.colsToFig,
        chartName : this.blockName
      }
      this.graphData.getCellById(this.nodeId).setData(this.applied,{ overwrite: true })
        this.$message(`Block set to '${this.blockName}'`);

    },
    dataTransfer(data, schema) {
      if (this.chartType != 'table'){
          const chartData = data.map(item => {
          const dataItem = {}
          schema.forEach(column => {
            // hasxAxis = hasxAxis || column.asxAxis
            if (column.calculFunc) {
              column.lable = `${column.Column}(${sqlFunc[column.calculFunc]})`
            } else {
              column.lable = `${column.Column}`
            }
            column.name = column.Column
            column.asxAxis = column.isDimension
            dataItem[column.Column] = item[column.Column]
          })
          return dataItem
        })
        return chartData
      }else{
          const chartData = data.map(item => {
          const dataItem = {}
          schema.forEach(column => {
            if (column.calculFunc) {
              column.name = `${column.Column}(${sqlFunc[column.calculFunc]})`
            } else {
              column.name = `${column.Column}`
            }
            dataItem[column.Column] = item[column.Column]
          })
          return dataItem
        })
        return chartData
      }
      
    },
    executeGetData(){
      this.loadingChart = true
      const srcStmt = this.block.stmt
      const groupby = this.dimensionCols
      const aggrConditions = []
      this.valueCols.forEach(element=>{
        aggrConditions.push([this.methodValueCols[element], element])
        if(!['avg', 'stddev','count','max','min','sum'].includes(this.methodValueCols[element])){
          this.$alert(`${element} need a legal aggregation method.`)
          this.loadingChart = false

          return
        }
      })
  
      makeGroupby({
        table: srcStmt, 
        groupby: groupby,
        aggregation_list: aggrConditions,
      }).then(res=>{
        const data = res.data
        console.log(data)
        this.applied.stmt = data.stmt
        this.applied.columns = data.columns
        execStmt(data.stmt, this.resLimit).then(response=>{
          const res = response.data
          this.result = res
          this.loadingChart = false
        })
      })
    },
  },
};
</script>
