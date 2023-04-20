<template>
  <div v-if="display">
    <h1>Query Settings</h1>
    <el-row :gutter="16">
      <el-col>
        <el-select
          v-model="queryBlock.name"
          placeholder="select a query"
          filterable
        >
          <el-option
            v-for="item in blocks"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
        <el-dropdown placement="bottom-start"> 
          <el-button title="Create New"
          >Create New<i class="el-icon-arrow-down el-icon--right"></i></el-button
        >
          <el-dropdown-menu style="min-width:200px;padding:5px">
            <el-dropdwon-item>
              <el-button @click="openQuery = true" type="text" title="Sample Data"
          >Sample Data</el-button
        >
            </el-dropdwon-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button @click="openQuery = true" title="Create New" v-if="false"
          >Create New</el-button
        >
        <el-dialog
          :visible.sync="openQuery"
          append-to-body
          fullscreen
          destroy-on-close
        >
          <quick-query></quick-query>
        </el-dialog>
      </el-col>
      <el-col>
        <!-- <div style="padding-top:10px;padding-bottom:10px"><strong>Setting Details</strong></div> -->
        <el-collapse>
          <el-collapse-item title="Setting Details">
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
export default {
  name: "QuerySetting",
  components: { QuickQuery },
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
      //{name: <block name>, block: <queryConditions>}
      queryBlock: { name: "Select a query", block: {} },
      openQuery: false,
    };
  },
  watch: {},
  created() {
    this.$watch("nodeName", () => {
      this.init();
      this.$forceUpdate();
    });
    this.init();
  },
  methods: {
    init() {
      if (this.nodeName.length > 0) {
        this.queryBlock.name = this.nodeName;
      } else {
        return;
      }
    },
    applySetting() {
      const _selectedBlock = this.selectedBlock
      this.graphData
        .getCellById(this.nodeId)
        .setAttrs({ text: { text: _selectedBlock.name } });
      this.graphData
        .getCellById(this.nodeId)
        .setData({ 
          stmt: _selectedBlock.stmt,
          query: _selectedBlock.name,
          columns:_selectedBlock.columns,
          settings:_selectedBlock.block,
         });
      console.log(_selectedBlock)
      this.$message(`Block set to '${_selectedBlock.name}'`);
      
    },
  },
};
</script>
