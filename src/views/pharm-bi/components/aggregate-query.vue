<template>
  <div>
    <el-select
      v-model="aggrMethod"
      placeholder="select the aggregation"
      filterable
    >
      <el-option value="sum" />
      <el-option value="avg" />
      <el-option value="stddev" />
      <el-option value="count" />
      <el-option value="max" />
      <el-option value="min" />
    </el-select>
    <el-select v-model="aggregatedCol" placeholder="select a column" filterable>
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
  </div>
</template>
<script>
import { dataWarehouse, getColumns } from "@/api/data-warehouse";

export default {
  name: "AggregateQuery",
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
    setAlready:{

    },

  },
  data() {
    return {
      aggregatedCol: "",
      columns: [],
      tmpColList: [],
      aggrMethod: "",
    };
  },
  watch: {
    queryBlock: {
      handler: function (val, oldVal) {
        this.initColumnOptions(val);
      },
      deep: true,
      immediate:true,
    },
    aggrMethod: {
      handler: function (val, oldVal) {
        if(val){
          this.pipeToParent();
        }
      },
    },
    aggregatedCol: {
      handler: function (val, oldVal) {
        if(val){
          this.pipeToParent();
        }
      },
    },
  },
  mounted(){
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
          this.aggrMethod = setCondition.method
          this.aggregatedCol = setCondition.column
        }
      }
    },
    getColumns() {
      if (this.queryBlock){
        this.tmpColList = this.queryBlock.columns;
      }else{
        this.tmpColList = []
      }
    },
    initColumnOptions(block) {
      this.getColumns(block);
      this.columns = [...this.tmpColList];
    },
    pipeToParent() {
      this.$emit("listenChildAggr", {
        id: this.id,
        method: this.aggrMethod,
        column: this.aggregatedCol,
      });
      console.log("Pipe to parent");
    },
  },
};
</script>
