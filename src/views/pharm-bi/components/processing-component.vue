<template>
  <div style="padding-bottom: 5px">
    <el-select v-model="method" placeholder="Process with" filterable>
      <el-option value="DATE" label="To Date" />
      <el-option value="CONCAT" label="Concat" />
      <el-option value="SUBSTR" label="Substr" />
    </el-select>
    <el-select
      v-if="!isConcat"
      v-model="processColumn"
      placeholder="select a column"
      filterable
    >
      <el-option
        v-for="item in columns"
        :key="item.column"
        :value="item.column"
        :label="item.column"
      >
        <span style="float: left">{{ item.column }}</span>
        <span style="float: right; color: #8492a6">{{ item.datatype }}</span>
      </el-option>
    </el-select>
    <el-select
      v-if="isConcat"
      v-model="processColumn"
      placeholder="select a column"
      filterable
      multiple
    >
      <el-option
        v-for="item in columns"
        :key="item.column"
        :value="item.column"
        :label="item.column"
      >
        <span style="float: left">{{ item.column }}</span>
        <span style="float: right; color: #8492a6">{{ item.datatype }}</span>
      </el-option>
    </el-select>
    <div v-if="isSubstr">
      Start
      <el-input-number
        placeholder="Start"
        v-model="subStart"
        size="small"
        :controls="false"
        :min="1"
      />
      End
      <el-input-number
        placeholder="End"
        v-model="subEnd"
        size="small"
        :controls="false"
        :min="subStart + 1"
      />
    </div>
  </div>
</template>
<script>
import { dataWarehouse, getColumns } from "@/api/data-warehouse";

export default {
  name: "ProcessComponent",
  components: {},
  props: {
    queryBlock: {
      // {name:'', block:{}, table:'', stmt:'', columns:'',}
      type: Object,
    },
    id: {
      type: String,
      default: "aggr-0",
    },
    setAlready: {},
  },
  computed: {
    isConcat() {
      if (this.method == "CONCAT") {
        return true;
      } else {
        return false;
      }
    },
    isSubstr() {
      if (this.method == "SUBSTR") {
        return true;
      } else {
        return false;
      }
    },
  },
  data() {
    return {
      processColumn: "",
      columns: [],
      tmpColList: [],
      method: "",
      subStart: null,
      subEnd: null,
    };
  },
  watch: {
    queryBlock: {
      handler: function (val, oldVal) {
        this.initColumnOptions(val);
      },
      deep: true,
      immediate: true,
    },
    method: {
      handler: function (val, oldVal) {
        this.pipeToParent();
      },
    },
    processColumn: {
      handler: function (val, oldVal) {
        this.pipeToParent();
      },
    },
    subEnd: {
      handler: function (val, oldVal) {
        this.pipeToParent();
      },
    },
    subStart: {
      handler: function (val, oldVal) {
        this.pipeToParent();
      },
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      if (this.setAlready) {
        const setCondition = this.setAlready.filter(
          (element) => element.id == this.id
        )[0];
        if (setCondition) {
          console.log("有進來")
          this.method = setCondition.setting[0];
          const tmpMethodValid = this.method;
          switch (tmpMethodValid) {
            case "DATE":
              this.processColumn = setCondition.setting[1];
              break;
            case "SUBSTR":
              this.processColumn = setCondition.setting[1];
              this.subStart = setCondition.setting[2];
              this.subEnd = setCondition.setting[3];
              break;
            case "CONCAT":
              this.processColumn = [...setCondition.setting].splice(1);
              break;
          }
        }
      }
    },
    async getColumns(queryBlock) {
      // await getColumns(queryBlock.table, true).then((response) => {
      //   this.tmpColList = Array()
      //   response.data.forEach((element) => {
      //     this.tmpColList.push(element);
      //   });
      // });
      if (this.queryBlock) {
        this.tmpColList = this.queryBlock.columns;
      }
    },
    async initColumnOptions(block) {
      this.getColumns(block);
      if (typeof this.tmpColList == "object") {
        this.columns = [...this.tmpColList];
      } else {
        this.columns = [];
      }
    },
    pipeToParent() {
      var setting = [];
      setting.push(this.method);
      if (Array.isArray(this.processColumn)) {
        this.processColumn.forEach((element) => {
          setting.push(element);
        });
      } else {
        setting.push(this.processColumn);
      }
      if (this.isSubstr) {
        setting.push(this.subStart);
        if (this.subEnd > 0) {
          setting.push(this.subEnd);
        }
      }

      this.$emit("listenChildComponent", {
        id: this.id,
        setting: setting,
      });
    },
  },
};
</script>
