<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="5">
      <el-card style="margin-top: 10px; margin-bottom: 10px">
        <div class="chart-wrapper" style="display: flex">
          <el-col :span="2">
            <el-avatar :size="Number('50')" :src="avatar"></el-avatar>
          </el-col>
          <el-col :span="5">
            <strong>User Name</strong> {{ name }} <br />
            <strong>Role</strong> {{ roles }}
          </el-col>
          <el-col :span="10">
            <strong>Emp ID</strong> Q104834 <br />
            <strong>Email</strong> test.wang@coloscious.com
          </el-col>
          <el-col>
            <span> Completed Tasks</span>
            <el-progress :percentage="70" />
            <span> Finished Analysis</span>
            <el-progress :percentage="86" />
          </el-col>
        </div>
      </el-card>

    </el-row>
    <el-row :gutter="8">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        style="padding-right: 8px; margin-bottom: 30px"
      >
        <el-card style="margin-top: 10px; margin-bottom: 5px;">
           <h3 style="margin-bottom:2px;margin-top:5px">Projects</h3>

          <transaction-table />
        </el-card>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
        style="margin-bottom: 30px"
      >
        <el-card style="margin-top: 10px; margin-bottom: 5px">
           <h3 style="margin-bottom:2px;margin-top:5px">Tasks</h3>
          <todo-list />
        </el-card>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
        style="margin-bottom: 30px"
      >
        <el-card style="margin-top: 10px; margin-bottom: 5px">
          <!-- <box-card /> -->
           <h3 style="margin-bottom:2px;margin-top:5px">Analysis</h3>
          <el-table :data="tableData" style="width: 100%;padding-top: 15px;">
            <el-table-column
              prop="date"
              label="Last Update"
              width="110">
            </el-table-column>
            <el-table-column
              prop="name"
              label="Analysis"
              width="180">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- <div class="dashboard-text">device: {{ device }}</div> -->
    <!-- <div class="dashboard-text">permission_routes: {{ permission_routes }}</div> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TransactionTable from "./components/TransactionTable";
import TodoList from "./components/TodoList";
import PanThumb from "@/components/PanThumb";
import BoxCard from "./components/BoxCard";

export default {
  name: "Dashboard",
  components: {
    TransactionTable,
    TodoList,
    BoxCard,
    PanThumb,
  },
  computed: {
    ...mapGetters(["name", "roles", "device", "permission_routes", "avatar"]),
  },
  data(){
    return {
      tableData: [{
            date: '2016-05-02',
            name: 'Product-1-P01A13',
          }, {
            date: '2016-05-04',
            name: 'Product-1-P01A13R',
          }, {
            date: '2016-05-01',
            name: 'Product-3-P24T02',
          }, {
            date: '2016-05-03',
            name: 'Product-2-P01W02',
          }]
    }
     
  }
};
</script>

<style lang="scss" scoped>
// .dashboard {
//   &-container {
//     margin: 30px;
//   }
//   &-text {
//     font-size: 30px;
//     line-height: 46px;
//   }
// }
.dashboard-editor-container {
  padding-top: 5px;
  padding-left: 32px;
  padding-right: 32px;
  height: 100%;
  // background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.header-card {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 30px;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
