<template>
  <div v-loading="loaded" :key="loaded">
    <h1>Data Process</h1>
    <el-row :gutter="16">
      <div style="padding-top: 5px; padding-bottom: 10px;">
         Block Name <el-input v-model="blockName" type="text" style="width: 50%" inline></el-input>
      </div>
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
      <div style="padding-top: 5px; padding-bottom: 5px">
        <p>Process</p>
      </div>
    </el-row>
    <el-row>
      <!-- <process-component
        :queryBlock="block"
        :id="`process-0`"
        v-on:listenChildComponent="listenChildComponent"
      ></process-component> -->
      <component
        :is="String('process-component')"
        v-for="item in processingComponentList"
        :key="item"
        :id="`${item}`"
        :queryBlock="block"
        :setAlready="processingSettingList"
        v-on:listenChildComponent="listenChildComponent"
      ></component>
    </el-row>
    <el-row>
      <div
        style="
          display: inline-block;
          float: left;
          padding-top: 5px;
          padding-bottom: 5px;
        "
      >
        <el-button
          type="primary"
          icon="el-icon-plus"
          circle
          size="mini"
          @click="addComponent"
        ></el-button>
        <el-button
          type="primary"
          icon="el-icon-minus"
          circle
          size="mini"
          @click="popComponent"
        ></el-button>
      </div>
    </el-row>
    <el-button @click="applySetting">Apply</el-button>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { deepClone } from "@/utils/common";
import { dataProcess } from "@/api/data-warehouse";
import ProcessComponent from "@/views/pharm-bi/components/processing-component";

export default {
  name: "DataProcess",
  components: { ProcessComponent },
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
    setAlready(){
      if(this.graphData.getCellById(this.nodeId).getData()){
        return true
      }else{
        return false
      }
    }
  },
  data() {
    return {
      blockName:'',
      loaded:true,
      connectedNodes: [],
      srcBlockId: "",
      block: {},
      columns: [],
      processingComponentList: [],
      processingSettingList: [],
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
    
  },
  created() {
    Object.assign(this.$data, this.$options.data.call(this)); // initialized all $data default values, otherwise the component will show the previous behavior.
    this.init()
    this.loaded = false;
    this.$forceUpdate()

  },
  methods: {
    init() {
      const appliedSettings = this.graphData.getCellById(this.nodeId).getData()
      console.log(appliedSettings)
      if (appliedSettings){
        this.processingSettingList = [...appliedSettings.settings]
        this.processingSettingList.forEach(element=>{
          this.processingComponentList.push(element.id)
        })
        this.srcBlockId = appliedSettings.srcBlockId
        this.blockName = this.graphData.getCellById(this.nodeId).attrs.text.text;
      }else{
        this.processingComponentList.push('process-0')
        this.blockName = '**'+ this.graphData.getCellById(this.nodeId).attrs.text.text + '-' + this.nodeId;
        console.log('Create a new block')
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
      var reqData = {};
      reqData.stmt = this.block.stmt;
      reqData.process = [];
      this.processingSettingList.forEach((element) => {
        reqData.process.push(element.setting);
      });

      dataProcess(reqData).then((response) => {
        const data = response.data;
        this.blockId = this.nodeId;
        this.applied.blockId = this.nodeId;
        this.applied.srcBlockId = this.srcBlockId;
        this.applied.stmt = data.stmt;
        this.applied.columns = data.columns;
        this.applied.settings = [...this.processingSettingList];
        this.graphData.getCellById(this.nodeId).setData(this.applied,{ overwrite: true })
        this.graphData
        .getCellById(this.nodeId)
        .setAttrs({ text: { text: this.blockName } });
        this.$message(`Block set to '${this.blockName}'`);

      });
    },
    addComponent() {
      this.processingComponentList.push(
        `process-${this.processingComponentList.length}`
      );
    },
    // pop out a quick quickFilterAssebly
    popComponent() {
      const lastItem = this.processingComponentList.pop();
      console.log(lastItem)
      const idx = this.processingSettingList.findIndex((element) => 
        element.id == lastItem
      );
      console.log(idx);
      if(idx > -1){
          this.processingSettingList.splice(idx, 1);
      }
      console.log(this.processingSettingList);
    },

    listenChildComponent: function (val) {
      if (this.processingSettingList.some((element) => element.id == val.id)) {
        const idx = this.processingSettingList.findIndex(
          (element) => element.id === val.id
        );
        this.processingSettingList[idx] = val;
      } else {
        this.processingSettingList.push(val);
      }
    },
  },
};
</script>
