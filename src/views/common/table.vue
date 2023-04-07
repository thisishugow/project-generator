<template>
  <el-table
    v-loading="listLoading"
    :data="queryRes"
    size="mini"
    :key="reloadElTable"
    border
    fit
    highlight-current-row
    style="width: 100%"
    height="300px"
    :max-height="400"
    :show-header="true"
    :header-row-style="{ height: '25x' }"
    :header-cell-style="{
      background: '#f2f2f2',
      'font-weight': 'bold',
      color: '#333',
    }"
    :row-style="{ height: '25px' }"
    :cell-style="{ 'padding-top': '0', 'padding-bottom': '0' }"
    :fixed="true"
    :scroll-y="200"
  >
    <el-table-column
      v-for="col in columns"
      :key="col"
      v-bind:label="col"
      v-bind:prop="col"
      sortable
      resizable
    >
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  name: "blank",
  components: {},
  props: {
      queryData:{
          type:Array,
      },

  },
  data() {
    return {
      listLoading:true,
      queryRes:[],
      // only for el-table's key that is for the component to monitor the update
      reloadElTable: true,
    };
  },
  watch: {},
  computed:{
      columns(){
          
      },
  },
  created() {
      
  },
  methods: {
      getData(){
          if(this.queryData){
            this.queryRes = [...this.queryData]
            this.columns = Object.keys(this.queryRes[0])
          }
          
      }
  },
};
</script>
