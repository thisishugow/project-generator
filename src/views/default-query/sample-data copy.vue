<template>
  <quick-query :queryConditions="conditions" />
</template>
<script>
import QuickQuery from "@/views/quick-query/index.vue";
export default {
  data() {
    return {
      tableName: "sample_data",
      conditions: {
        process: {
          selected: [],
          operator: "eq",
          datatype: "varchar",
          alias: "Process",
        },
        param_name: {
          selected: [],
          operator: "eq",
          datatype: "varchar",
          alias: "QC Step",
        },
        update_dtt: {
          selected: [],
          operator: "",
          datatype: "timestamp",
          alias: "Duration",
        },
      },
    };
  },
};
</script>

<style>
</style>