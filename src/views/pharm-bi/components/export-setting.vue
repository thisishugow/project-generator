<template>
  <div>
    <h1>Pivot</h1>
    <el-row :gutter="16">
      
      Source Block
      <el-select
        v-model="srcBlockId"
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
      <div style="padding-top: 5px; padding-bottom: 10px">
        Save As 
        <el-input
          v-model="blockName"
          type="text"
          style="width: 50%"
          inline
        ></el-input>
      </div>
    </el-row>
    <el-row> </el-row>
    <el-button @click="applySetting">Save</el-button>
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
  name: "ExportBlock",
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
    connectedNodesPool() {
      this.getConnections("source");
      return this.connectedNodes;
    },
    colGroupByPool() {
      this.getColumns();
      return this.columns;
    },
  },
  data() {
    return {
      connectedNodes: [],
      blockName: "",
      srcBlockId: "",
      blockId: "",
      block: {},
      columns: [],
      applied: {},
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
        this.blockName = this.graphData.getCellById(
          this.nodeId
        ).attrs.text.text;
      } else {
        this.blockName = '**'+
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
      const blockExists = this.$store.state.blocks.blocks.some(
        (item) => item.name === this.blockName
      );
      if (this.blockName.length == 0) {
        this.$alert("Block Name is required.");
        return;
      }
      if (blockExists) {
        this.$alert(`Block name aleady exists: ${this.blockName}`);
        return;
      }
      this.$store
        .dispatch("blocks/addBlock", {
          name: this.blockName,
          block: null,
          table: null,
          stmt: this.block.stmt,
          columns: this.block.columns,
        })
        .then(() => {
          this.$message("Block saved.");
          console.log(this.block.stmt);
          console.log(this.block.columns);
          this.applied.blockId = this.nodeId;
          this.applied.srcBlockId = this.srcBlockId;
          this.applied.stmt = this.block.stmt;
          this.applied.columns = this.block.columns;
          this.graphData.getCellById(this.nodeId).setData(this.applied,{ overwrite: true });
          this.graphData
            .getCellById(this.nodeId)
            .setAttrs({ text: { text: this.blockName } });
        })
        .catch((error) => {
          console.log(error);
          this.$message(error);
        });
    },
  },
};
</script>
