<template>
  <div v-if="display">
    <h1>Operation Settings</h1>
    <el-row :gutter="16">
      <div style="padding-top: 5px; padding-bottom: 10px;">
         Block Name <el-input v-model="blockName" type="text" style="width: 50%" inline></el-input>
      </div>
      <el-col>
        <div>
          <el-radio-group
            v-model="operationAction"
            style="padding-top: 5px; padding-bottom: 5px"
          >
            <el-radio :label="String('join')">JOIN</el-radio>
            <el-radio :label="String('group')">GROUP</el-radio>
          </el-radio-group>
        </div>
        <!-- Select NAME of the query blocks-->
        <div v-if="operationAction == String('join')">
          Table 1
          <el-select
            v-model="operatingBlockL"
            placeholder="select the block"
            filterable
            inline
          >
            <el-option
              v-for="item in groupByBlockOptions"
              :key="item.label"
              :value="item.label"
              :label="item.label"
            />
          </el-select>
          Table 2
          <el-select
            v-model="operatingBlockR"
            placeholder="select the block"
            filterable
            inline
          >
            <el-option
              v-for="item in groupByBlockOptions"
              :key="item.label"
              :value="item.label"
              :label="item.label"
            />
          </el-select>
          <div style="padding-top: 5px; padding-bottom: 5px">
            <el-select
              v-model="joinMethod"
              placeholder="select the block"
              filterable
            >
              <el-option value="left" />
              <el-option value="inner" />
              <el-option value="full" />
            </el-select>
            JOIN
          </div>
          <div style="padding-top: 5px; padding-bottom: 5px">ON</div>
          <!-- join conditions component *block begin-->
          <div v-if="operatingBlockL.length > 0">
            <component
              :is="String('join-on')"
              v-for="item in joinComponentsList"
              :key="item"
              :queryBlocks="{ queryBlockL: blockLeft, queryBlockR: blockRight }"
              :setAlready="joinOnConditions"
              v-bind:id="`${item}`"
              v-on:listenChildJoin="listenChildJoin"
            />
          </div>
          <div
            v-if="operatingBlockL.length > 0"
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
              @click="addJoin"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-minus"
              circle
              size="mini"
              @click="popJoin"
            ></el-button>
          </div>
        </div>

        <!-- join conditions component & block end-->

        <!--* Group conditions component * block begin-->
        <div v-if="operationAction == String('group')">
          <el-select
            v-model="operatingBlockL"
            placeholder="select the block"
            filterable
          >
            <el-option
              v-for="item in groupByBlockOptions"
              :key="item.label"
              :value="item.label"
              :label="item.label"
            />
          </el-select>
          <p>Group By</p>
          <el-select
            v-if="operatingBlockL.length > 0"
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
          {{ colGroupByOptions }}
          <!-- An invisible variable which used to trigger computed() -->
          <p>Aggreate</p>

          <component
            :is="String('aggregate-query')"
            v-for="item in aggrComponentsList"
            :key="item"
            :queryBlock="blockLeft"
            :setAlready="groupByAggrConditions"
            v-bind:id="`${item}`"
            v-on:listenChildAggr="listenChildAggr"
          />
          <div
            v-if="operatingBlockL.length > 0"
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
              @click="addAggr"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-minus"
              circle
              size="mini"
              @click="popAggr"
            ></el-button>
          </div>
        </div>
        <!-- & Group conditions component & block end-->
      </el-col>
      <el-col>
        <!-- <div style="padding-top:10px;padding-bottom:10px"><strong>Setting Details</strong></div> -->
        <el-collapse>
          <el-collapse-item title="Preview">
            <el-form
              v-if="selectedBlock"
              label-position="left"
              label-width="20%"
            >
              <el-form-item
                v-for="k in Object.keys(selectedBlock.block)"
                :key="k"
                :label="k"
              >
                <span v-if="selectedBlock.block[k].selected.some((v) => v)"
                  >Selected:
                  <input
                    type="text"
                    :value="selectedBlock.block[k].selected"
                    readonly /><br
                /></span>
                <span v-if="selectedBlock.block[k].selected.some((v) => v)"
                  >Opoerator:
                  <input
                    type="text"
                    :value="selectedBlock.block[k].operator"
                    readonly
                /></span>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
    <el-row> </el-row>
    <el-button @click="applySetting">Apply</el-button>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import QuickQuery from "@/views/quick-query/index.vue";
import {
  dataWarehouse,
  getColumns,
  getStmt,
  makeGroupby,
  makeJoin,
} from "@/api/data-warehouse";
import JoinOn from "@/views/pharm-bi/components/join-on";
import AggregateQuery from "@/views/pharm-bi/components/aggregate-query";
import { deepClone } from "@/utils/common";

export default {
  name: "OperationSetting",
  components: { QuickQuery, JoinOn, AggregateQuery },
  computed: {
    ...mapGetters(["blocks"]),
    selectedBlock() {
      const res = this.blocks.filter((v) => v.name == this.queryBlock.name);
      if (res.length > 0) {
        return res[0];
      } else {
        return false;
      }
    },
    groupByBlockOptions() {
      this.getConnections("source");
      return this.connectedNodes;
    },
    colGroupByOptions() {
      if (this.getBlockByName(this.operatingBlockL)) {
        const res = this.getBlockByName(this.operatingBlockL);
        this.columns = res.columns;
        var columns = [];
        // getColumns(res.table, true).then(response=>{
        //   this.columns = []
        //   response.data.forEach(element=>{
        //     this.columnsRaw.push(element)
        //     if(!['numeric','float','integer','double'].includes(element.datatype.toLowerCase())){
        //       this.columns.push(element)
        //     }

        //   }

        //   )

        //   return
        // })
      } else {
        return;
      }
    },
    // The query object wait to be processed (left, mandatory)
    blockLeft() {
      return this.getBlockByName(this.operatingBlockL);
    },
    // The query object wait to be processed (right, optional)
    blockRight() {
      return this.getBlockByName(this.operatingBlockR);
    },
  },
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
  data() {
    return {
      blockName: "",
      //{name: <block name>, block: <queryConditions>}
      operationAction: "join",
      connectedNodes: [], // the upstream and downstream connected nodes.
      queryBlock: { name: "Select a query", block: {} },
      openQuery: false,
      blockId: "",
      operatingBlockL: "", // ther name of the block from left
      operatingBlockR: "", // the name of the block from right
      aggregatedCol: "", // the columns that used in aggregation.
      colGroupBy: [], // the columns used to group by.
      columnsRaw: [], // unused, the columns' raw pool that wait to be selected.
      columns: [], // the columns' pool that wait to be selected.
      joinMethod: "", // method of join: inner, inner, full
      aggrMethod: "", // method of aggregation: avg, stddev, sum, count, max, min
      joinComponentsList: [],
      aggrComponentsList: [],
      groupByAggrConditions: [],
      joinOnConditions: [],
      applied: {
        operation: {
          type: "",
          blockNames: [],
        },
        settings: {},
        stmt: "",
        columns: [],
      },
    };
  },
  watch: {},
  mounted() {},
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.nodeName.length > 0) {
        this.queryBlock.name = this.nodeName;
        const appliedSettings = this.graphData
          .getCellById(this.nodeId)
          .getData();
        if (typeof appliedSettings !== "undefined") {
          this.operationAction = appliedSettings.operation.type;
          this.blockName = this.graphData.getCellById(this.nodeId).attrs.text.text;
          if (this.operationAction == "group") {
            this.operatingBlockL = appliedSettings.operation.blockNames[0];
            this.colGroupBy = appliedSettings.groupby;
            appliedSettings.groupByAggrConditions.forEach((element, index) => {
              this.groupByAggrConditions.push(element);
              this.aggrComponentsList.push(`aggr-${index}`);
            });
          } else {
            this.operatingBlockL = appliedSettings.operation.blockNames[0];
            this.operatingBlockR = appliedSettings.operation.blockNames[1];
            // Data example:  {id:this.id, joinOn:[this.colJoinOnL, this.colJoinOnR]}
            appliedSettings.settings.forEach((element, index) => {
              this.joinOnConditions.push(element);
              this.joinComponentsList.push(element.id);
            });
            this.joinMethod = appliedSettings.joinMethod;
          }
        } else {
          console.log("A new block");
          this.blockName = '**'+ this.graphData.getCellById(this.nodeId).attrs.text.text + '-' + this.nodeId;
          this.aggrComponentsList = [];
          this.joinComponentsList = [];
          this.aggrComponentsList.push("aggr-0");
          this.joinComponentsList.push("join-0");
        }
      }
    },
    /**
     * @param {String} from: ['source', 'target'], to fetch the connected node.
     */
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
    getBlockByName(blockName) {
      // const res = this.blocks.filter((v) => v.name == blockName)[0];
      const res = this.groupByBlockOptions.filter(
        (v) => v.label == blockName
      )[0];
      if (res) {
        return res.getData();
      } else {
        return;
      }
    },
    async applySetting() {
      this.applied.operation.type = this.operationAction;
      if (this.operationAction === "join") {
        const leftBlock = this.getBlockByName(this.operatingBlockL);
        const rightBlock = this.getBlockByName(this.operatingBlockR);
        await makeJoin({
          left: leftBlock.stmt,
          right: rightBlock.stmt,
          on: this.joinOnConditions.map(({ id, joinOn }) => [...joinOn]),
          how: this.joinMethod,
        }).then((response) => {
          const stmt = response.data.stmt;
          const columns = response.data.columns;
          this.applied.operation.blockNames = [
            this.operatingBlockL,
            this.operatingBlockR,
          ];
          this.applied.joinMethod = this.joinMethod;
          this.applied.settings = [...this.joinOnConditions];
          this.applied.stmt = stmt;
          this.applied.columns = columns;
        });
      } else {
        const { stmt, columns } = this.getBlockByName(this.operatingBlockL);
        const _aggregationList = this.groupByAggrConditions.map(
          ({ method, column }) => [method, column]
        );
        var reqData = {
          table: stmt,
          groupby: [...this.colGroupBy],
          aggregation_list: _aggregationList,
        };
        // post to backend api and get stmt, columns
        await makeGroupby(reqData).then((response) => {
          const stmt = response.data.stmt;
          const columns = response.data.columns;
          this.blockId = this.nodeId;
          this.applied.blockId = this.nodeId;
          this.applied.operation.blockNames = [this.operatingBlockL];
          this.applied.settings = [..._aggregationList];
          this.applied.groupByAggrConditions = [...this.groupByAggrConditions];
          this.applied.groupby = [...this.colGroupBy];
          this.applied.stmt = stmt;
          this.applied.columns = [...columns];
        });
      }

      this.graphData
        .getCellById(this.nodeId)
        .setAttrs({ text: { text: this.blockName } });
      this.graphData.getCellById(this.nodeId).setData(this.applied,{ overwrite: true });
      console.log(this.applied);
      this.$message(`Block set to '${this.operationAction}'`);
    },
    addJoin() {
      this.joinComponentsList.push(
        `join-${this.joinComponentsList.length + 1}`
      );
    },
    // pop out a quick quickFilterAssebly
    popJoin() {
      const lastItem = this.joinComponentsList.pop();
      const idx = this.joinOnConditions.findIndex((element) => {
        element.id === lastItem.id;
      });
      this.joinOnConditions.splice(idx, 1);
    },
    addAggr() {
      this.aggrComponentsList.push(`aggr-${this.aggrComponentsList.length}`);
    },
    // pop out a quick quickFilterAssebly
    popAggr() {
      const lastItem = this.aggrComponentsList.pop();
      const idx = this.groupByAggrConditions.findIndex((element) => {
        element.id === lastItem.id;
      });
      this.groupByAggrConditions.splice(idx, 1);
    },

    listenChildAggr: function (val) {
      if (this.groupByAggrConditions.some((element) => element.id == val.id)) {
        const idx = this.groupByAggrConditions.findIndex(
          (element) => element.id === val.id
        );
        this.groupByAggrConditions[idx] = deepClone(val);
      } else {
        this.groupByAggrConditions.push(val);
      }
    },
    listenChildJoin: function (val) {
      if (this.joinOnConditions.some((element) => element.id == val.id)) {
        const idx = this.joinOnConditions.findIndex(
          (element) => element.id === val.id
        );
        this.joinOnConditions[idx] = val;
      } else {
        this.joinOnConditions.push(val);
      }
    },
  },
};
</script>
