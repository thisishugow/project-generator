<template>
  <div class="app-container">
    <el-row>
      <el-form label-width="120px" style="padding: 0px">
        <el-form-item label="Block Name" style="margin-bottom: 5px">
          <el-input
            v-model="blockName"
            type="text"
            style="width: 50%"
            inline
          ></el-input>
        </el-form-item>
        <el-form-item label="Chart Blocks" style="margin-bottom: 5px">
          <!-- <el-tooltip class="item" effect="dark" content="Select the Visualize Blocks" placement="top-start"> -->
          <el-select
            v-model="srcBlockIdList"
            placeholder="select chart blocks"
            filterable
            inline
            multiple
            style="width: 80%"
            :disabled="mode!=='edit'"
          >
            <el-option
              v-for="item in connectedNodesPool"
              :key="item.id"
              :label="item.attrs.text.text"
              :value="item.id"
            />
          </el-select>
          <!-- </el-tooltip> -->
        </el-form-item>
        <el-form-item label="Dashboad Size" style="margin-bottom: 5px">
          <el-slider v-model="dashboardHeight" :max="1600" :min="500" style="width:80%" :disabled="mode!=='edit'"></el-slider>
        </el-form-item>
      </el-form>
      <!-- <el-dialog title="Dashboard" width="750px" :visible.sync="editDialogVisible">
        <el-form label-width="160px">
          <el-form-item :label="blockName">
            <el-input v-model="dbObj.name" size="small" style="width: 450px;" placeholder="Dashboard Name" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="dbObj.desc" type="textarea" :rows="5" size="small" style="width: 450px;" placeholder="Dashboard Description" />
          </el-form-item>
        </el-form>
      </el-dialog> -->
    </el-row>
    <el-row>
      <el-switch v-model="editOn" active-text="Edit" style="float:left;padding-top:30px;padding-bottom:0px"/>
      <dashboardItem :chartDataList.sync="chartDataList" :dashboard.sync="currentDashboard" :mode="mode" :dashboardHeight.sync="dashboardHeight"/>
    </el-row>
    <el-row style="padding-top:5px">
      <el-button @click="publishDashboard" style="float: right">Publish</el-button>
      <el-button @click="applySetting" style="float: right">Apply</el-button>
    </el-row>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import dashboardItem from "./components/dashboardItem";
// import { addDashboard, updateDashboard, dashboardList, deleteDashboard, dbOrder } from '@/api/dashboard'

export default {
  components: { dashboardItem, draggable },
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
      blockId: "",
      srcBlockId: "",
      srcBlockIdList: [],
      block: {},
      blockList: [],
      chartDataList:[],
      dashboardList: [],
      connectedNodes: [],
      editOn:true,
      currentDashboard: {
        content: {
          layout: [
              // {
              //   id: "33011d2f-a7a2-43bb-9fb4-19f372b3bb80",
              //   x: 0,
              //   y: 0,
              //   w: 12,
              //   h: 9,
              //   i: "33011d2f-a7a2-43bb-9fb4-19f372b3bb80",
              //   moved: false,
              //   yOffSet: 9,
              //   xOffSet: 12,
              //   bottomLine: [
              //     [0, 9],
              //     [12, 9],
              //   ],
              //   topLine: [
              //     [0, 0],
              //     [12, 0],
              //   ],
              // },
              // {
              //   id: "f7320979-1b31-4571-ab46-f409c9aa0e8a",
              //   x: 12,
              //   y: 0,
              //   w: 12,
              //   h: 9,
              //   i: "f7320979-1b31-4571-ab46-f409c9aa0e8a",
              //   moved: false,
              // },
            ],
        },
        dashboard_id: this.nodeId,
        desc: "",
        is_private: true,
        name: this.blockName,
        status: 1,
      },
      editDialogVisible: false,
      dbObj: {},
      loading: false,
      isCollapse: false,
      dashboardHeight:800,
      applied: {},
    };
  },
  computed:{
    connectedNodesPool() {
      this.getConnections("source");
      return this.connectedNodes;
    },
    mode(){

      return this.editOn? 'edit':'view'
    },
  },
  created() {
    this.init();
  },
  watch: {
    // srcBlockId: {
    //   handler: function (val, oldVal) {
    //     this.block = this.graphData.getCellById(val).getData();
    //     this.getColumns();
    //     console.log(this.block);
    //   },
    //   deep: true,
    // },
    srcBlockIdList:{
      handler: function(val,oldVal){
        const srcBlockIdList = this.srcBlockIdList
        var tmpList = []
        srcBlockIdList.forEach(element=>{
        tmpList.push(this.graphData.getCellById(element).getData())
      })
      this.chartDataList = tmpList
      },
      deep:true,
      immediate:true,
    }
  },
  methods: {
    init() {
      const appliedSettings = this.graphData.getCellById(this.nodeId).getData();
      
      if (appliedSettings) {
        this.srcBlockIdList = appliedSettings.srcBlockId;
        this.blockId = appliedSettings.blockId;
        this.chartDataList = appliedSettings.settings.chartDataList
        this.currentDashboard = appliedSettings.settings.dashboard
        this.dashboardHeight = appliedSettings.settings.dashboardHeight
        this.editOn = false
        this.blockName = this.graphData.getCellById(
          this.nodeId
        ).attrs.text.text;
      } else {
        this.blockName =
          this.graphData.getCellById(this.nodeId).attrs.text.text +
          "-" +
          this.nodeId;
        console.log("Create a new block");
      }
    },
    applySetting() {
      this.applied = {}
      this.applied.blockId = this.nodeId
      this.applied.blockName = this.blockName
      this.applied.srcBlockId = [...this.srcBlockIdList]
      this.applied.settings = {
        dashboard: this.currentDashboard,
        chartDataList: this.chartDataList,
        dashboardHeight: this.dashboardHeight,
      }
      this.graphData.getCellById(this.nodeId).setAttrs({ text: { text: this.blockName } });
      this.graphData.getCellById(this.nodeId).setData(this.applied, { overwrite: true })
      this.$message(`Block set to '${this.blockName}'`)
    },
    publishDashboard(){},
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
              if (!this.connectedNodes.includes(element) && element.attrs.title.text =="Visualize") {
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
    getList() {
      this.loading = true;
    },
    switchDb(db) {
      if (db.dashboard_id === this.currentDashboard.dashboard_id) {
        this.getList();
        return;
      }
      // this.$confirm('确定要离开当前页面吗?系统可能不会保存您所做的更改。', '提示').then(() => {
      this.currentDashboard = db;
      this.$router.push(`/dashboard?id=${this.currentDashboard.dashboard_id}`);
      // })
    },
    addDashboard() {
      this.dbObj = {};
      this.editDialogVisible = true;
    },
    editDashboard(db) {
      this.dbObj = Object.assign({}, db);
      this.editDialogVisible = true;
    },
    handleCommand(cmd) {
      if (cmd.type === "edit") {
        this.editDashboard(cmd.target);
      } else {
        this.deleteDashboard(cmd.target);
      }
    },
    handleSubmit() {
      if (this.dbObj.dashboard_id) {
        updateDashboard(this.dbObj).then((resp) => {
          this.getList();
          this.editDialogVisible = false;
        });
      } else {
        addDashboard(this.dbObj).then((resp) => {
          this.getList();
          this.editDialogVisible = false;
        });
      }
    },
    handleOrderChange(evt) {
      const data = {
        order: this.dashboardList.map((item) => item.dashboard_id),
      };
      dbOrder(data);
    },
    deleteDashboard(db) {
      this.$confirm("Sure to delete", "Confirm").then(() => {
        deleteDashboard({ dashboard_id: db.dashboard_id }).then(() => {
          this.getList();
          this.$message({
            type: "success",
            message: "Delete successfilly",
          });
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  min-height: calc(100vh - 62px);
  align-items: stretch;
  .dashboard-list {
    width: 250px;
    min-height: 100%;
    padding: 20px 10px;
    .el-card__header {
      div {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #606266;
        i {
          cursor: pointer;
        }
      }
      padding: 5px 0px;
    }
    .dashboard-list-item {
      display: flex;
      justify-content: space-between;
      line-height: 35px;
      font-size: 14px;
      cursor: pointer;
      color: #606266;
      i {
        margin-right: 10px;
        line-height: 35px;
      }
    }
    .high-light-dashboard {
      color: #205cd8;
    }
  }
  .dashboard-wrapper {
    width: 100%;
  }
}
</style>
