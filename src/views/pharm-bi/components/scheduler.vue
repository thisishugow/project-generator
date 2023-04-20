<template>
  <div>
    <el-row :gutter="16">
      <div style="padding-top: 5px; padding-bottom: 10px">
        <el-form label-width="120px" style="padding: 0px">
          <el-form-item label="Block Name" style="margin-bottom: 0px">
            <el-input
              v-model="blockName"
              type="text"
              style="width: 70%"
              inline
            ></el-input>
          </el-form-item>
          <el-form-item label="Dashboard" style="margin-bottom: 0px">
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
          <el-form-item label="Trigger" style="margin-bottom: 0px">
            <el-select
              v-model="trigger"
              placeholder="select source block"
              filterable
              inline
            >
              <el-option
                v-for="item in [
                  { label: `Every morning at 6:00.`, value: '0 6 * * *' },
                  { label: 'Every 12 hours.', value: '0 */12 * * *' },
                  { label: 'Every hour.', value: '0 * * * *' },
                  { label: 'Every 15 minutes.', value: '*/15 * * * *' },
                  { label: 'N/A', value: '' },
                ]"
                :key="item.label"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Status" style="margin-bottom: 0px">
            <el-select
              v-model="status"
              placeholder="select a status"
              filterable
              inline
            >
              <el-option
                v-for="item in ['new', 'private', 'published', 'scheduled']"
                :key="item"
                :label="item"
                :value="item"
              >
                <el-tag :type="item | statusFilter" style="width: 100%">
                  {{ item }}
                </el-tag>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Enable" style="margin-bottom: 0px">
            <el-switch
              v-model="isEnable"
              active-text="Enable"
              inactive-text="Disable"
            ></el-switch>
          </el-form-item>
          <el-form-item label="Subscribers" style="margin-bottom: 0px">
            <el-button
              style="width: 52%"
              @click="displaySubscribers = !displaySubscribers"
              >Edit</el-button
            >
            <el-dialog
              :visible.sync="displaySubscribers"
              title="User List"
              append-to-body
              width="100vh"
            >
              <div>
                <el-transfer
                  v-model="subscribers"
                  :data="
                    userList.map((element) => {
                      return {
                        key: element.id,
                        label: `${element.username}: ${element.email}`,
                        value: element.id,
                      };
                    })
                  "
                ></el-transfer>
              </div>
            </el-dialog>
          </el-form-item>
        </el-form>
      </div>
    </el-row>
    <el-row>
      <div v-if="sharableLink">
        Dashboard
        <a :href="sharableLink" style="color: #205cd8" target="_blank">{{
          block.blockName
        }}</a>
        is published
      </div>
      <el-button @click="applySetting" style="float: right">Apply</el-button>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { deepClone } from "@/utils/common";
import { createScheduledDashboard } from "@/api/data-warehouse";
import { getUserList } from "@/api/user";


export default {
  name: "Scheduler",
  filters: {
    statusFilter(status) {
      const statusMap = {
        new: "info",
        published: "primary",
        private: "danger",
        scheduled: "success",
      };
      return statusMap[status];
    },
  },
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
    currFigure: {},
    currFigureId: {},
    dashboardList: {},
  },
  computed: {
    ...mapGetters(["blocks"]),
    connectedNodesPool() {
      this.getConnections("source");
      return this.connectedNodes;
    },
  },
  data() {
    return {
      blockName: "",
      methodValueCols: {},
      connectedNodes: [],
      blockId: "",
      srcBlockId: "",
      block: {},
      trigger: "",
      status: "new",
      isEnable: true,
      userList: [],
      subscribers: [],
      displaySubscribers: false,
      sharableLink: "",
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
    colsToFig: {
      handler: function (val, oldVal) {},
    },
  },
  mounted() {
    this.init();
  },
  created() {
    this.getUserList();
  },
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
        this.currFigureId = appliedSettings.settings.currFigureId;
        this.status = appliedSettings.settings.status;
        this.isEnable = appliedSettings.settings.isEnable;
        this.trigger = appliedSettings.settings.trigger;
        this.subscribers = appliedSettings.settings.subscribers;
        this.sharableLink = appliedSettings.settings.sharableLink;
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
              if (
                !this.connectedNodes.includes(element) &&
                element.attrs.title.text == "Dashboard"
              ) {
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
    getUserList() {
      getUserList().then((response) => {
        this.userList = response.data;
      });
    },
    applySetting() {
      if (this.currFigureId < 0) {
        this.$message({
          type: "warning",
          message: "Please save the current analysis first.",
        });
        return;
      }
      if (!this.srcBlockId) {
        return;
      }
      createScheduledDashboard({
        uuid_uri: this.srcBlockId,
        job_sv_id: this.currFigureId,
        status: this.status,
        is_enabled: this.isEnable ? 1 : 0,
        trigger_time: this.trigger,
        subscriber_user_id: this.subscribers.join(","),
      })
        .then((response) => {
          this.sharableLink = `http://${location.host}/#/dashboard/${this.srcBlockId}`;
          this.handleShare();
          this.applied.blockName = this.blockName;
          this.applied.srcBlockId = this.srcBlockId;
          this.applied.blockId = this.graphData.getCellById(this.nodeId).id;
          this.applied.settings = {
            currFigureId: this.currFigureId,
            status: this.status,
            isEnable: this.isEnable,
            trigger: this.trigger,
            subscribers: this.subscribers,
            sharableLink: this.sharableLink,
          };
          this.graphData
            .getCellById(this.nodeId)
            .setData(this.applied, { overwrite: true });
          this.graphData
            .getCellById(this.nodeId)
            .setAttrs({ text: { text: this.blockName } });
        })
        .catch((error) => console.log(error));
      this.graphData
        .getCellById(this.nodeId)
        .setAttrs({ text: { text: this.blockName } });
    },
    handleShare() {
      const href = this.$createElement;
      this.$msgbox({
        title: `Sharable Link`,
        message: href("p", null, [
          href(
            "a",
            {
              style: "color: #205cd8",
              attrs: { href: this.sharableLink, target: "_blank" },
            },
            this.sharableLink
          ),
        ]),
      });
    },
  },
};
</script>
