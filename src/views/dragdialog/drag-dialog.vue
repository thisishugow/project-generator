<template>
  <div class="components-container">
    <quick-filter
      :title="String('process')"
      :alias="String('Process')"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    >
    </quick-filter>
  
    <quick-filter
      :title="String('param_name')"
      :alias="String('QC Step')"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    >
    </quick-filter>
    <el-button @click="initSqlStmt" style="float:right "> Execute </el-button>
    <div class="components-container">
      <!-- 
      //TODO: 傳入complex-table 為 SQL stmt，讓 complex-table 去執行 post 請求。邏輯如下:
          request('post', sqlStmt).then(response => display(response.data))
      //TODO: 需要新增一個執行 button，用於條件都選擇完後，最終執行:
          complex-table 已透過 props 取得 sqlStmt，按下該按鈕後發送 request
      //TODO: 使用 pharmquer_backend_api 執行 pagination
          reference: https://uriyyo-fastapi-pagination.netlify.app/  
      -->
      <!-- <component v-if="showResult" :is="String('ComplexTable')" :dataReturn="queryRes"> </component> -->
      <div  v-if="showResult" class="app-container">
        <el-scrollbar wrap-style="max-height: 40vh;max-width: 90vw" style="border-inline: solid 1px;writing-mode: horizontal-tb;border-inline-color: gray;">
        <el-table
        v-loading="listLoading"
        :data="queryRes"
        size="mini"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        >
        <el-table-column v-for="col in Object.keys(queryRes[0])" :key="col" v-bind:label="col" v-bind:prop="col" >
        </el-table-column>
        </el-table>
        </el-scrollbar>

    </div>
    </div>
  </div>
</template>

<script>
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import DndList from "@/components/DndList";
import QuickFilter from "@/views/dragdialog/quick-filter.vue";
import QuickFilterAssembly from "@/views/dragdialog/quick-filter-assembly.vue";
import {dataWarehouse} from "@/api/data-warehouse"
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import waves from '@/directive/waves' // waves directive


import ComplexTable from "@/views/dragdialog/data-table.vue";
export default {
  name: "DragDialogDemo",
  directives: { elDragDialog, waves, },
  components: { DndList, ComplexTable, QuickFilter, QuickFilterAssembly, Pagination },
  data() {
    return {
      listLoading:true,
      // the pool of conditions. 
      queryConditions: {
        /* Query conditions, stored as 
          ```
          {'<column 1>':{
              'selected':[], // list, seleted items. 
              'unselected':[], // list, the pool of items waiting to be selected. 
              'datatype':<['numeric', 'varchar', 'timestamp']>, // str, data type, must be corresponded to the data type in the database.
              'operator':<['eq', 'in', 'le', 'ge', 'ne', 'nin']>,
              'alias':'<Column name to display>'
            }, //str, eq:=, in:in, le:<=, ge:>=, nin:not in
           '<column 2>':{'selected':[], 'unselected':[]...}
          }
          ```
        */
        process: {
          // unselected: [],
          selected: [],
          operator: "eq",
          datatype: "varchar",
          alias: "Process",
        },
        param_name: {
          // unselected: [],
          selected: [],
          operator: "eq",
          datatype: "varchar",
          alias: "QC Step",
        },
      },
      sqlStmt: "",
      targetTable: "pharmquer.demo_data",
      queryRes:[],
      showResult:false,
      listQuery: {
        page: 1,
        limit: 20
      },
      total: 0,
      dataPaged:[],

    };
  },
  watch: {
  },
  created() {
    // this.getData();
  },
  methods: {
    // v-el-drag-dialog onDrag callback function
    handleDrag() {
      this.$refs.select.blur();
    },
    // add a new quickFilterAssebly
    addQuickFilterAssembly() {
      this.filterComponents.push(this.filterComponents.length);
    },
    // pop out a quick quickFilterAssebly
    popQuickFilterAssembly() {
      this.filterComponents.pop(1);
    },
    // * function for testing.
    // initialize the testing data.
    getData() {
      // var samplePool = ["PROC1", "PROC2", "PROC3"];
      // this.queryConditions.process.unselected = samplePool;
      // this.queryConditions.param_name.unselected = ['PH', 'WEIGHT'];
    },

    // to get the returned from quick-filter-assembly
    listenChild: function (listToPass) {
      
      const { title, selected, operator } = listToPass;
      this.queryConditions[title]['selected'] = selected
      this.queryConditions[title]['operator'] = operator
      
    },
    // Initialize `this.queryConditions` to an executable SQL statement.
    initSqlStmt() {
      dataWarehouse(this.queryConditions).then(response => {
        const  { data }  = response
        if (!data) {
          return console.log('Query failed.')
        }
        this.queryRes = Array(...data)
        this.listLoading = false
        this.showResult = true
      }).catch(error => {
        console.log(error)
      })
    },
  },
};
</script>
