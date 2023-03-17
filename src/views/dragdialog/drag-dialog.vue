<template>
  <div class="components-container">
    <split-pane split="horizontal">
      <template slot="paneL">
        <div class="top-container">
          <aside>
            Target Table: <strong>{{ tableName }}</strong>
          </aside>
          <quick-filter
            v-for="item in Object.keys(queryConditions)"
            :key="item"
            :title="item"
            :alias="queryConditions[item].alias"
            :srcData="queryConditions"
            v-on:listenChild="listenChild"
          ></quick-filter>
          <el-button @click="initSqlStmt" style="float: right">
            Execute (for test)
          </el-button>
          <el-button @click="getData" style="float: right"> Execute </el-button>
        </div>
      </template>
      <template slot="paneR">
        <div v-if="showResult" class="bottom-container">
          <div>
            <aside>
              Result: <strong>{{ tableName }}</strong>
            </aside>
          </div>
          <el-scrollbar
            wrap-style="max-height: 40vh;max-width: 90vw"
            style="
              border-inline: solid 1px;
              writing-mode: horizontal-tb;
              border-inline-color: gray;
            "
          >
            <el-table
              v-loading="listLoading"
              :data="queryRes"
              size="mini"
              border
              fit
              highlight-current-row
              style="width: 100%"
            >
              <el-table-column
                v-for="col in Object.keys(queryRes[0])"
                :key="col"
                v-bind:label="col"
                v-bind:prop="col"
              >
              </el-table-column>
            </el-table>
          </el-scrollbar>
          <!--Pagination-->
          <nav style="text-align: center">
            <ul class="pagination">
              <!-- 上一页 -->
              <li @click="prePage()" :class="{ disabled: params.page == 1 }">
                <a aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li
                :class="{ active: params.page == page }"
                v-for="(page, index) in pages"
                :key="index"
                @click="curPage(page)"
              >
                <a style="cursor: pointer">
                  {{ page }}
                </a>
              </li>
              <!-- 下一页 -->
              <li
                :class="{ disabled: params.page == totalPage }"
                @click="next()"
              >
                <a aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </template>
    </split-pane>
  </div>
</template>

<script>
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import DndList from "@/components/DndList";
import QuickFilter from "@/views/dragdialog/quick-filter.vue";
import QuickFilterAssembly from "@/views/dragdialog/quick-filter-assembly.vue";
import { dataWarehouse } from "@/api/data-warehouse";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import waves from "@/directive/waves"; // waves directive
import splitPane from "vue-splitpane";

import ComplexTable from "@/views/dragdialog/data-table.vue";
export default {
  name: "DragDialogDemo",
  directives: { elDragDialog, waves },
  components: {
    DndList,
    ComplexTable,
    QuickFilter,
    QuickFilterAssembly,
    Pagination,
    splitPane,
  },
  data() {
    return {
      listLoading: true,
      // target table name
      tableName: "sample_data",
      // the pool of conditions.
      //! queryConditions can be a prop which is an only variable in this component.
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
        update_dtt:{
          selected:[],
          operator:"",
          datatype:"timestamp",
          alias: 'Insert On',
        },
      },
      sqlStmt: "",
      queryRes: [],
      showResult: false,
      params: {
        page: 1,
        pagesize: 20,
        name: "",
      },
      total: 0,
      dataPaged: [],
      total: 0, //总的条数
      totalPage: 0, //总的页数
      flag: false,
    };
  },
  watch: {},
  created() {
    // this.getData();
  },
  computed: {
    pages() {
      let totalPage = this.totalPage;
      let page = this.params.page;
      // 总的页数小于10页
      if (totalPage < 10) return totalPage;
      // 总的页数大于10页添加省略号
      if (page <= 5) {
        // 前五页
        // (1) 页码小于5 左边显示六个
        return [1, 2, 3, 4, 5, 6, "...", totalPage];
      } else if (page >= totalPage - 5) {
        // 后五页
        // console.log("触发")
        // (2) 页码大于总页数-5 右边显示六个
        return [
          1,
          "...",
          totalPage - 5,
          totalPage - 4,
          totalPage - 3,
          totalPage - 2,
          totalPage - 1,
          totalPage,
        ];
      } else {
        // 中间五页
        // (3)页码在 5-（totalPage-5）之间 左边区间不能小于5  右边区间不能大于总页数totalPage，注意  左边的当前页-num 不能小于1， 右边的当前页+num不能大于总页数
        return [
          1,
          "...",
          page - 1,
          page,
          page + 1,
          page + 2,
          page + 3,
          "...",
          totalPage,
        ];
      }
    },
    num() {
      let { pagesize, page } = this.params;
      // (1-1) * 10 + 10 + 0 + 1 = 1;
      // (2-1) * 10 + 10 + 0 + 1 = 11
      // 第一页 = (当前页 -1 )* 每页的条数 + 索引值 + 1 保证是从1开始的
      return (i) => (page - 1) * pagesize + i + 1; // (当前页- 1 * 每页的条数) + 索引值 + 1
    },
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
    // to get the returned from quick-filter-assembly
    listenChild: function (listToPass) {
      const { title, selected, operator } = listToPass;
      this.queryConditions[title]["selected"] = selected;
      this.queryConditions[title]["operator"] = operator;
    },
    // Initialize `this.queryConditions` to an executable SQL statement.
    initSqlStmt() {
      const { page, pagesize, name } = this.params;
      dataWarehouse(this.tableName, this.queryConditions, page, pagesize)
        .then((response) => {
          const { data } = response;
          // console.log(data)
          const { result, total_items } = data;
          if (!result) {
            console.log("Query failed.");
          }

          this.queryRes = Array(...result);
          this.listLoading = false;
          this.showResult = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getData() {
      if (this.flag) return;
      const { page, pagesize, name } = this.params;
      this.flag = true;
      dataWarehouse(this.tableName, this.queryConditions, page, pagesize)
        .then((response) => {
          const { data } = response;
          const { result, total_items } = data;
          if (result.length==0||total_items==0) {
            console.log("Query failed.");
            this.showResult = false;
          }else{
            this.total = total_items;
            this.totalPage = Math.ceil(this.total / this.params.pagesize);
            this.queryRes = Array(...result);
            this.listLoading = false;
            this.showResult = true;
          }
          this.flag = false;
          
        })
        .catch((error) => {
          console.log(error);
        });
    },
    curPage(page) {
      if (page == "...") return;
      if (this.flag) return;
      this.params.page = page;
      this.getData();
    },
    prePage() {
      // if(this.params.page == '...') return
      if (this.params.page > 1) {
        if (this.flag) return;
        --this.params.page;
        this.getData();
      }
    },
    next() {
      // if(this.params.page == '...') return
      if (this.flag) return;
      if (this.params.page < this.totalPage) {
        ++this.params.page;
        this.getData();
      }
    },
  },
};
</script>
<style  scoped>
.components-container {
  position: relative;
  height: 100vh;
}

.left-container {
  /* background-color: #F38181; */
  height: 100%;
}

.right-container {
  /* background-color: #FCE38A; */
  height: 200px;
}

.top-container {
  /* background-color: #FCE38A; */
  width: 100%;
  height: 100%;
}

.bottom-container {
  width: 100%;
  /* background-color: #95E1D3; */
  height: 100%;
}

.pagination {
  display: flex;
  width: 100%;
  list-style-type: none;
}

.pagination a {
  border: 1px solid #ddd; /* Gray */
  /* color: black; */
  float: left;
  padding: 8px 16px;
  text-decoration: none;
  /* margin: 8px 0; */
}

.active {
  background-color: #409eff;
  color: #fff;
  background-origin: content-box;
}
</style>