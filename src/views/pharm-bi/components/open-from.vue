<template>
  <div>
    <el-table
      :data="dashboardList"
      style="width: 100%"
      max-height="250"
      size="mini"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="40"> </el-table-column>
      <el-table-column prop="sv_name" label="Dashboard Name" width="150">
        <template slot-scope="{ row }">
          <template v-if="row.edit">
            <el-input v-model="row.sv_name" class="edit-input" size="mini" />
          </template>
          <span v-else>{{ row.sv_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.edit">
            <el-select v-model="row.status" size="mini">
              <el-option
                v-for="s in [
                  'new',
                  'ongoing',
                  'published',
                  'ok',
                  'dropped',
                  'scheduled',
                ]"
                :key="s"
                :value="s"
              ></el-option>
            </el-select>
          </template>
          <el-tag v-else :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sv_ver" label="Version"> </el-table-column>
      <el-table-column prop="update_dtt" label="Saved At"> </el-table-column>
      <el-table-column fixed="right" label="Operation" width="180">
        <template slot-scope="{ row }">
          <!--.prevent修飾符用於防止點擊事件的默認行為。當.prevent修飾符與@click指令一起使用時，點擊事件將不會觸發其默認行為。-->
          <el-button
            v-if="!row.edit"
            @click.native.prevent="overwriteDashboard(row)"
            type="text"
            size="small"
          >
            Overwrite
          </el-button>

          <el-button
            v-if="!row.edit"
            @click.native.prevent="handleEditRow(row)"
            type="text"
            size="small"
          >
            Edit
          </el-button>
          <el-button
            v-if="!row.edit"
            @click.native.prevent="deleteRow(row)"
            type="text"
            size="small"
          >
            Delete
          </el-button>

          <el-button
            v-if="row.edit"
            @click.native.prevent="updateDashboard(row)"
            type="text"
            size="small"
          >
            Apply
          </el-button>
          <el-button
            v-if="row.edit"
            @click.native.prevent="cancelEdit(row)"
            type="text"
            size="small"
          >
            Cancel
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getDashboardList,
  createDashboard,
  updateDashboardInfo,
  overwriteDashboard,
  getDashboard,
  deleteDashboard,
} from "@/api/data-warehouse";
import { mapGetters } from "vuex";

export default {
  name: "SaveAsPage",
  filters: {
    statusFilter(status) {
      const statusMap = {
        ok: "success",
        published: "success",
        deleted: "danger",
        dropped: "info",
        scheduled: "success",
        ongoing: "warning",
      };
      return statusMap[status];
    },
  },
  components: {},
  props: {
    graphData: {},
  },
  mounted() {},
  created() {
    this.refreshList();
  },
  computed: {
    ...mapGetters(["currentUserId"]),
  },
  data() {
    return {
      newDashboard: { svName: "", jobId: null },
      displayCreateNew: false,
    };
  },
  watch: {},
  methods: {
    async addRowMode() {
      const items = this.dashboardList;
      this.dashboardList = items.map((v) => {
        this.$set(v, "edit", false); // https://vuejs.org/v2/guide/reactivity.html
        v.originalTitle = v.sv_name; //  will be used when user click the cancel botton
        v.originalStatus = v.status; //  will be used when user click the cancel botton
        return v;
      });
    },
    async refreshList() {
      await getDashboardList(this.currentUserId).then((response) => {
        const data = response.data;
        this.dashboardList = data;
        console.log(data);
      });
      this.addRowMode();
    },
    async updateDashboard(row) {
      this.$confirm("Sure to overwrite?", "Confirm", {
        confirmButtonText: "Ok",
        cancelButtonText: "Cancel",
      }).then(() => {
        const { id, sv_name, sv_ver, status } = row;
        updateDashboardInfo(id, {
          sv_name: sv_name,
          sv_ver: sv_ver,
          status: status,
        })
          .then((response) => {
            this.$message(`"${sv_name}" updated successfully.`);
            this.refreshList();
          })
          .catch((error) => {
            this.$alert(`Error: ${error}`);
          });
      });
    },
    createNewDashboardRow() {
      const newDashboard = {
        job_id: this.newDashboard.jobId,
        sv_name: this.newDashboard.svName,
        sv_ver: 0,
        status: "new",
        update_by: this.currentUserId,
        json_file: this.graphData.toJSON(),
      };
      if (!this.newDashboard.svName) {
        this.$message({
          message: '"Dashboard Name" is required.',
          type: "error",
        });
        return;
      }
      createDashboard(newDashboard)
        .then((response) => {
          this.$message(`"${this.newDashboard.svName} saved successfilly."`);
          this.refreshList();
        })
        .catch((error) => {
          this.$alert(
            `"${this.newDashboard.svName}" saved failed. Details: ${error}`
          );
        });
    },
    overwriteDashboard(row) {
      this.$confirm("Sure to overwrite?", "Confirm", {
        confirmButtonText: "Ok",
        cancelButtonText: "Cancel",
      }).then(() => {
        const data = row;
        const newDashboard = {
          json_file: this.graphData.toJSON(),
        };
        overwriteDashboard(row.id, newDashboard)
          .then((response) => {
            this.$message(`${data.sv_name} is updated successfully`);
          })
          .catch((error) => {
            this.$message({
              message: `${data.sv_name} is updated failed. Detail: ${error}`,
              type: "warning",
            });
          });
      });
    },
    handleEditRow(row) {
      row.edit = true;
    },
    deleteRow(row) {
      this.$confirm("Sure to Delete?", "Confirm", {
        confirmButtonText: "Ok",
        cancelButtonText: "Cancel",
      })
        .then(() => {
          deleteDashboard(row.id)
            .then((response) => {
              this.$message(`"${row.sv_name}" is deleted`);
              this.refreshList();
            })
            .catch((error) => {
              this.$message(
                `"${row.sv_name}" deleted failed. Detail: ${error}`
              );
            });
        })
        .catch(() => {});
    },
    cancelEdit(row) {
      row.sv_name = row.originalTitle;
      row.status = row.originalStatus;
      row.edit = false;
      this.$message({
        message: "The title has been restored to the original value",
        type: "warning",
      });
    },
  },
};
</script>

<style>
</style>