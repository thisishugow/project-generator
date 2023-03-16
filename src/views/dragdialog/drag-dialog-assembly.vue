<template>
  <div class="components-container">
    <!-- <quick-filter
      :title="String('process')"
      :alias="String('Process')"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    >
    </quick-filter>

    <quick-filter
      :title="String('step')"
      :alias="String('QC Step')"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    >
    </quick-filter> -->
    {{filterComponents}}
    <!-- <quick-filter-assembly
      :id="filterComponents[filterComponents.length-1]"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    ></quick-filter-assembly> -->
    <component
      v-for="field in filterComponents"
      :id="filterComponents[filterComponents.length-1]"
      :key="field"
      :is="String('QuickFilterAssembly')"
      :srcData="queryConditions"
      v-on:listenChild="listenChild"
    ></component>
    <el-button @click="addQuickFilterAssembly">+</el-button>
    <el-button @click="popQuickFilterAssembly">-</el-button>
    <div>{{ queryConditions }}</div>
    <div>{{ conditionCollection }}</div>

    <div class="components-container">
      <!-- 
      //TODO: 傳入complex-table 為 SQL stmt，讓 complex-table 去執行 post 請求。邏輯如下:
          request('post', sqlStmt).then(response => display(response.data))
      //TODO: 需要新增一個執行 button，用於條件都選擇完後，最終執行:
          complex-table 已透過 props 取得 sqlStmt，按下該按鈕後發送 request
      //TODO: 使用 pharmquer_backend_api 執行 pagination
          reference: https://uriyyo-fastapi-pagination.netlify.app/  
      -->
      <!-- <complex-table
        :process="queryConditions"
        :sqlStmt="sqlStmt"
      ></complex-table> -->
    </div>
  </div>
</template>

<script>
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import DndList from "@/components/DndList";
import QuickFilter from "@/views/dragdialog/quick-filter.vue";
import QuickFilterAssembly from "@/views/dragdialog/quick-filter-assembly.vue";

import ComplexTable from "@/views/dragdialog/data-table.vue";
export default {
  name: "DragDialogDemo",
  directives: { elDragDialog },
  components: { DndList, ComplexTable, QuickFilter, QuickFilterAssembly },
  data() {
    return {
      // an array conatains the selected conditions. 
      conditionCollection: {},
      // an array contains components of quick-filter-assembly
      filterComponents: [0,],
      // the pool of conditions. 
      queryConditions: {
        /* Query conditions, stored as 
        ! 數據結構需要調整, 跟 conditionCollection 一同 
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
          unselected: [],
          // selected: [],
          // operator: "eq",
          datatype: "varchar",
          alias: "Process",
        },
        step: {
          unselected: [],
          // selected: [],
          // operator: "eq",
          datatype: "numeric",
          alias: "QC Step",
        },
      },
      sqlStmt: "",
      targetTable: "pharmquer.demo_data",
    };
  },
  watch: {
    queryConditions: {
      handler: function (val, oldVal) {
        this.initSqlStmt(); // call it in the context of your component object
      },
      deep: true,
      immediate: false,
    },
    conditionCollection: {
      handler: function (val, oldVal) {
        this.initSqlStmt(); // call it in the context of your component object
      },
      deep: true,
      immediate: false,
    },
  },
  created() {
    this.getData();
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
      this.listLoading = true;
      var samplePool = ["proc1", "proc2", "proc3"];
      this.queryConditions.process.unselected = samplePool;
      this.queryConditions.step.unselected = [1, 2, 3, 4];
    },

    // to get the returned from quick-filter-assembly
    listenChild: function (listToPass) {
      
      console.log(listToPass)
      const { id, title, selected, operator, datatype } = listToPass;
      this.conditionCollection[id] = {}
      this.conditionCollection[id]['title'] = title
      this.conditionCollection[id]['selected'] = selected
      this.conditionCollection[id]['operator'] = operator
      this.conditionCollection[id]['datatype'] = datatype
      console.log('conditionCollection: ')
      console.log(this.conditionCollection)
      
    },
    // Initialize `this.queryConditions` to an executable SQL statement.
    initSqlStmt() {
      const filterColumns = Object.keys(this.queryConditions);
      var stmtTemplate = "select * from " + this.targetTable + " where 1=1 ";
      const operators = {
        eq: "=",
        le: "<=",
        ge: ">=",
        in: "in",
        nin: "not in",
      };
      // by each column in queryConditions, generate the sql where clause
      for (let i = 0; i < filterColumns.length; i++) {
        var operator =
          operators[this.queryConditions[filterColumns[i]]["operator"]];
        var conditions = [
          ...this.queryConditions[filterColumns[i]]["selected"],
        ];
        var datatype = this.queryConditions[filterColumns[i]]["datatype"];
        if (conditions.length > 0) {
          // judge the type of the column
          // generate the sql stmt to execute.
          operator = operator == "=" && conditions.length > 1 ? "in" : operator;
          if (datatype == "varchar") {
            conditions.forEach((value, idx, arr) => {
              arr[idx] = `'${value}'`;
            });
          } else if (datatype == "timestamp") {
            //make it a compatible time format with db.
          }
          //where clause generator
          stmtTemplate = ` 
            ${stmtTemplate} 
            and ${filterColumns[i]} ${operator}
             (${conditions})
          `;
        }
      }
      this.sqlStmt = stmtTemplate;
    },
  },
};
</script>
