<template>
<div>
  <div class="chart-container" style="display: flex;flex-direction: column;justify-content: space-between;">
    <el-card style="margin-bottom:5px;text-align:center"><strong>{{dashboardName}}</strong></el-card>
    <el-row style="flex-grow: 1;margin-bottom:5px"> 
    <chart height="100%" width="100%" />
    </el-row>
     <el-row :gutter="16" >
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
    <div style="display: inline-block; float: right; margin-top:5px">
        <el-button>Export Report</el-button>
    </div>
</div>
</template>
<script>
import Chart from "@/components/Charts/LineMarker";
import RaddarChart from './graphs/RaddarChart'
import PieChart from './graphs/PieChart'
import BarChart from './graphs/BarChart'

export default {
  name: "outputChart",
  components: {
    Chart,
    RaddarChart,
    PieChart,
    BarChart,
  },
  props: {
      dashboardName:{
          type: String,
          default: "<unnamed>",
          require: false,
      }
  },
  data() {
    return {};
  },
  watch: {},
  created() {},
  methods: {
    initScatter() {},
  },
};
</script>
<style lang="scss" scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
  padding: 32px;
  background-color: rgb(240, 242, 245);

}

.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }


}
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>