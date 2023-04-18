<template>
  <div>
    <el-row>
      <h3>
        Saved Files 
        <el-button v-if="isCurrFigureIdExist" type="primary" style="float: right" @click="overwriteDashboard({id:currFigureId, sv_name:currFigure})">Save</el-button>
        <el-button
          @click.native.prevent="displayCreateNew = true"
          style="float: right"
          >New File</el-button
        >
        
      </h3>

      <el-dialog :visible.sync="displayCreateNew" title="Save" append-to-body>
        <el-form v-model="newDashboard" label-position="left" inline>
          <el-form-item label="Job ID">
            <el-input-number
              v-model="newDashboard.jobId"
              controls-position="right"
              :min="0"
              size="mini"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="Dashboard Name">
            <el-input
              type="text"
              v-model="newDashboard.svName"
              size="mini"
              style="min-width: 300px"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button @click.native.prevent="createNewDashboardRow">
          Apply
        </el-button>
      </el-dialog>
    </el-row>
    <el-table
      :data="dashboardList"
      style="width: 100%"
      max-height="250"
      size="mini"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="40" v-if="false"> </el-table-column>
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
      <el-table-column fixed="right" label="Operation" width="200">
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
            @click.native.prevent="loadFrom(row)"
            type="text"
            size="small"
          >
            Open
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
    dashboardList: {
      type: Array,
    },
    currFigure:{
      type:String,
    },
    currFigureId:{
      type:Number,
    },
    graphData: {},
  },
  mounted() {},
  created() {
    this.refreshList();
    this.newDashboard.svName = this.currFigure
  },
  computed: {
    ...mapGetters(["currentUserId"]),
    isCurrFigureIdExist(){
      if(this.currFigureId>-1){
        return true
      }else{
        return false
      }
    },
  },
  data() {
    return {
      newDashboard: { svName: "", jobId: null },
      displayCreateNew: false,
    };
  },
  watch: {
    currFigureId:{
      handler: function(val,oldVal){
        this.$emit('update:currFigureId', val)
      },
    }
  },
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
      });
      this.addRowMode();
    },
    async updateDashboard(row) {
      const existFileNameArr = [...this.dashboardList.filter(el=>el.id !== row.id).map((el)=> el.sv_name)]
      const { id, sv_name, sv_ver, status } = row;
      if(existFileNameArr.includes(sv_name.trim())){
        this.$message({
          message: '"Dashboard Name" exists already.',
          type: "error",
        });
        return;
      }
      this.$confirm("Sure to overwrite?", "Confirm", {
        confirmButtonText: "Ok",
        cancelButtonText: "Cancel",
      }).then(() => {
        updateDashboardInfo(id, {
          sv_name: sv_name.trim(),
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
        sv_name: this.newDashboard.svName.trim(),
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
      const existFileNameArr = this.dashboardList.map((el)=> el.sv_name)
      if(existFileNameArr.includes(this.newDashboard.svName.trim())){
        this.$message({
          message: '"Dashboard Name" exists already.',
          type: "error",
        });
        return;
      }
      createDashboard(newDashboard)
        .then((response) => {
          this.$message(`"${this.newDashboard.svName.trim()} saved successfilly."`);
          this.refreshList();
        })
        .catch((error) => {
          this.$alert(
            `"${this.newDashboard.svName.trim()}" saved failed. Details: ${error}`
          );
        });
    },
    overwriteDashboard(row) {
      this.$confirm("The operation is non-restorable.\nSure to overwrite?", "Confirm", {
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
            this.refreshList();
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
      this.$confirm("The operation is non-restorable.\nSure to Delete?", "Confirm", {
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
    loadFrom(row) {
      const id = row.id;
      this.$confirm(
        "Currrent flow will be replaced. Sure to load this?",
        "Confirm",
        { confirmButtonText: "Ok", cancelButtonText: "Cancel" }
      ).then(()=>{
        getDashboard(id).then(response=>{
          const graphDataLoaded = response.data.json_file
          this.$emit('update:currFigure', response.data.sv_name.trim())
          this.currFigureId = response.data.id
          this.$emit('update:currFigureId', response.data.id)
          this.graphData.fromJSON(graphDataLoaded)
          this.refreshList()
        }).catch(error=>{console.log(error)});
      }).catch(()=>{});
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