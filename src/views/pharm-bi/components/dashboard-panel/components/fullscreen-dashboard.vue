<template>
  <div v-loading="loading">
    <div>
      
        <h2 style="text-align: center">{{ blockName }}
            <a :href="homeUrl"  style="float:right;padding-right:20px"><i class="el-icon-s-home" /></a>
        </h2>
    </div>
    <div>
      <dashboardItem
        v-if="ready"
        :chartDataList.sync="chartDataList"
        :dashboard.sync="currentDashboard"
        :mode="mode"
        :dashboardHeight.sync="dashboardHeight"
      />
    </div>
  </div>
</template>

<script>
import dashboardItem from "./dashboardItem";
import { getScheduledDashboard } from "@/api/data-warehouse";

export default {
  name: "fullscreenDashboard",
  components: { dashboardItem },
  created() {
    this.dashboardId = this.$route.params.id;
    this.init();
  },
  mounted() {
    this.dashboardId = this.$route.params.id;
    console.log(this.$route.params.id);
  },
  props: {},
  computed: {
    homeUrl() {
      return `http://${location.host}/`;
    },
  },
  data() {
    return {
      loading: false,
      dashboardId: "",
      chartDataList: [],
      currentDashboard: {},
      mode: "view",
      dashboardHeight: 800,
      blockName: "",
      ready: false,
    };
  },
  methods: {
    async init() {
      this.loading = true;
      getScheduledDashboard(this.dashboardId).then((response) => {
        const data = response.data;
        const graphData = data.json_file;
        console.log(graphData);
        const dashboardSettings = graphData.cells.filter(
          (element) => element.id == this.dashboardId
        )[0].data;
        console.log("Dashboard 資料");
        console.log(dashboardSettings);
        this.chartDataList = dashboardSettings.settings.chartDataList;
        this.currentDashboard = dashboardSettings.settings.dashboard;
        this.dashboardHeight = dashboardSettings.settings.dashboardHeight;
        this.blockName = dashboardSettings.blockName;
        this.ready = true;
        this.loading = false;
      });
    },
  },
};
</script>

<style>
</style>