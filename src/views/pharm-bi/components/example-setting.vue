<template>
  <div>
    <h1>Pivot</h1>
    <el-row :gutter="16">
      <el-select
        v-model="blockId"
        placeholder="select the block"
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
      <div style="padding-top: 5px; padding-bottom: 5px">
        <p>Group By</p>
        <el-select
          v-model="colGroupBy"
          placeholder="group by column"
          filterable
          multiple
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
      </div>
      <div style="padding-top: 5px; padding-bottom: 5px">
        <p>Column to Row</p>
        <el-select v-model="colToRow" placeholder="Column to Row" filterable>
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
      </div>
      <div style="padding-top: 5px; padding-bottom: 5px">
        <p>Aggregation</p>
        <el-radio-group
          v-model="aggrMethod"
          style="padding-top: 5px; padding-bottom: 5px"
        >
          <el-radio label="MAX">MAX</el-radio>
          <el-radio label="MIN">MIN</el-radio>
          <el-radio label="COUNT">COUNT</el-radio>
          <el-radio label="AVG">AVG</el-radio>
          <el-radio label="STDDEV">STDDEV</el-radio>
          <el-radio label="SUM">SUM</el-radio>
        </el-radio-group>
      </div>
    </el-row>
    <el-row> </el-row>
    <el-button @click="applySetting">Apply</el-button>
    <div>{{ applied }}</div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { deepClone } from "@/utils/common";
import {
  dataWarehouse,
  getColumns,
  getStmt,
  makeGroupby,
  makeJoin,
} from "@/api/data-warehouse";

export default {
  name: "Pivot",
  components: {},
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
    connectedNodesPool(){
      this.getConnections("source");
      return this.connectedNodes
    },
    colGroupByPool(){
      this.getColumns()
      return this.columns
    }
  },
  data() {
    return {
      connectedNodes: [],
      blockId: "",
      block:{},
      colGroupBy: [],
      colToRow:'',
      columns: [],
      aggrMethod: "MAX",
      applied:{},
    };
  },
  watch: {
    blockId:{
      handler:function(val, oldVal){
        this.block = this.graphData.getCellById(val).getData()
        this.getColumns()
        console.log(this.block)
      },
      deep: true,
    }
  },
  mounted() {
    this.init();
    
  },
  created() {
    
  },
  methods: {
    init() {
      Object.assign(this.$data, this.$options.data.call(this)); // initialized all $data default values, otherwise the component will show the previous behavior.
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
    getColumns(){
      this.columns = this.block.columns
    },
    applySetting(){

    },

  },
};
</script>
