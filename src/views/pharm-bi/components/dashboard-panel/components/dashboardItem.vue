<template>
  <div class="dashboard-wrapper">
    <div v-if="mode==='edit'" class="tool-bar">
      <div>
        <span class="db-name">{{ dashboard.name }}</span>
        <span>{{ dashboard.desc }}</span>
      </div>
      <div >
        <!-- <el-button @click="handleShare">
          Share
        </el-button> -->

        <el-button v-show="mode === 'edit'" @click="handleLinkChart">
          Add/Update
        </el-button>
      </div>
    </div>
    <div>
      <grid-layout
      v-loading="loading"
      :class="mode==='edit'? vue-grid-layout: 'published'"
      :layout="layout || []"
      :col-num="24"
      :row-height="30"
      :is-draggable="mode === 'edit'"
      :is-resizable="mode === 'edit'"
      :is-mirrored="false"
      :is-bounded="true"
      :vertical-compact="true"
      :pane-container="false"
      :margin="[7, 14]"
      :use-css-transforms="true"
      :style="`min-height: ${dashboardHeight}px;`"
      @layout-updated="handleLayoutChange"
    >
      <grid-item
        v-for="item in layout || []"
        :key="item.id"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        @resized="handleResize"
      >
        <el-card v-loading="chartLoading[item.i]" class="visualize-card" body-style="padding: 10px;">
          <div slot="header" class="operation-bar">
            <div>
              <span>{{ getChartItem(item.i).chart_name }}</span>
            </div>
            <div>
              <!-- <i v-show="mode === 'edit'" class="el-icon-edit" @click="handleEdit(getChartItem(item.i))" /> -->
              <!-- <i v-show="mode === 'edit'" class="el-icon-delete" @click="handleDelete(getChartItem(item.i))" /> -->
              <el-tooltip :content="getChartItem(item.i).desc" class="item" effect="dark" placement="top-end">
                <i class="el-icon-info" style="color:#409eff;cursor:pointer;" />
              </el-tooltip>
            </div>
          </div>
          <!-- <visualize-panel :key="item.index" :ref="`chartInstance${item.i}`" :data="results[item.i]" :schema="getChartItem(item.i).content.allSelected" :chart-type.sync="getChartItem(item.i).content.chartType" :is-edit-mode="false" :chart-style="{height: `${item.h*30 + 10 * (item.h-1) - 60}px`}" /> -->
          <graph-panel v-if="reloadChart" :key="item.index" :schema="getChartItem(item.i).columns" :data="results[item.i]"  :ref="`chartInstance${item.i}`" :chart-type.sync="getChartItem(item.i).chartType" :is-edit-mode="false" :chart-style="{height: `${item.h*30 + 10 * (item.h-1) - 60}px`}"/>
        </el-card>
      </grid-item>
    </grid-layout>
    </div>
    
    
  </div>
</template>
<script>
import { GridLayout } from 'vue-grid-layout'
import { GridItem } from 'vue-grid-layout'
import graphPanel from '@/views/pharm-bi/components/chart-panel/components/graph-panel.vue'
import { buildSqlSentence, buildFilterSentence } from '@/utils/buildSentence'

function isLineOverLap(line1, line2) {
  const start1 = {
    x: line1[0][0],
    y: line1[0][1]
  }
  const end1 = {
    x: line1[1][0],
    y: line1[1][1]
  }
  const start2 = {
    x: line2[0][0],
    y: line2[0][1]
  }
  const end2 = {
    x: line2[1][0],
    y: line2[1][1]
  }
  if (start1.y === start2.y && end1.y === end2.y) {
    if (start1.x >= start2.x && start1.x <= end2.x) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
export default {
  components: { GridLayout, GridItem, graphPanel },
  props: {
    chartDataList: {
      required: false,
    },
    dashboard: {
      required: false,
      type: Object,
      default: () => {
        return {}
      }
    },
    mode: {
      required: false,
      type: String,
      default: 'view'
    },
    dashboardHeight:{
      required: false,
      default:800,
    },
  },
  data() {
    return {
      charts: [],
      results: {},
      loading: false,
      layout: [],
      myChartList: [],
      showChartList: false,
      chartLoading: {},
      reloadChart:true,
    }
  },
  watch: {
    'dashboard.dashboard_id': {
      immediate: true,
      handler(value) {
        // if (!value) return
        // this.getList(value)
      },
    },
    chartDataList:{
      handler(val, oldVal){
        this.reloadChart = false;
        this.reloadChart = true;
        // this.getList()
      },
      deep:true,
    },
    layout:{
      handler(val, oldVal){
        this.reloadChart = false;
        this.reloadChart = true;
        this.dashboard.content.layout = this.layout
      },
      deep:true,
    }
  },
  created(){
    console.log(this.chartDataList)
    this.init()
  },
  methods: {
    init(){
      if(!this.dashboard.content.layout){
        console.log('create an empty dashboard')
        this.getList()
      }else{
        console.log(`load from dashboard ${this.dashboard.dashboard_id}`)
        this.loading = true
        this.layout = this.dashboard.content.layout
        this.chartDataList.forEach((element, index, arr)=>{
          this.results[element.blockId] = element.settings.chartData // push to results' list, the data list of registed charts. 
          this.charts.push({chart_id:element.blockId, columns:element.settings.colsToFig, chartType:element.settings.chartType, chart_name:element.settings.chartName}) // push to charts, the registed chart id list. 

        })
        this.handleLayoutChange()
        this.loading = false
      }
    },
    getList() {
      console.log('executing update/add')
      this.loading = true
      this.chartDataList.forEach((element, index, arr)=>{
        if (!this.layout.map(element=>element.id).includes(element.blockId)){
          this.results[element.blockId] = element.settings.chartData // push to results' list, the data list of registed charts. 
          this.charts.push({chart_id:element.blockId, columns:element.settings.colsToFig, chartType:element.settings.chartType, chart_name:element.settings.chartName}) // push to charts, the registed chart id list. 
          this.generatePosition({chart_id:element.blockId, }, this.layout, index)
        }else{
          console.log(`${element.blockId} is existed.`)
        }       
      })
      this.layout.forEach((element,index,arr)=>{
          const currentChartId = this.chartDataList.map((element)=>{return element.blockId})
          if(!currentChartId.includes(element.id)){
            arr.splice(index,1)
          }
      })
      this.handleLayoutChange()
      this.loading = false
    },
    getChartItem(id) {
      return this.charts.find(chart => chart.chart_id === id)
    },
    handleCaculPos(layout) {
      // const layout = JSON.parse(JSON.stringify(layout))
      const bottomItems = []
      layout.forEach(i => {
        i.yOffSet = i.y + i.h 
        i.xOffSet = i.x + i.w
        i.bottomLine = [[i.x, i.yOffSet], [i.xOffSet, i.yOffSet]]
        i.topLine = [[i.x, i.y], [i.xOffSet, i.y]]
      })
      layout.forEach(i => {
        const flag = layout.every(j => {
          return !isLineOverLap(i.bottomLine, j.topLine)
        })
        if (flag) {
          bottomItems.push(i)
        }
      })
      return bottomItems
    },
    generatePosition(chart, layout, index) {
      let posObj
      if (layout.length === 0) {
        posObj = {
          id: chart.chart_id,
          x: 0,
          y: 0,
          w: 12,
          h: 9,
          i: chart.chart_id
        }
      } else {
        const bottomItems = this.handleCaculPos(layout)
        const highestItem = bottomItems.reduce((result, item) => {
          if (result.bottomLine[0][1] > item.bottomLine[0][1]) {
            result = item
          }
          return result
        }, bottomItems[0])
        posObj = {
          id: chart.chart_id,
          x: highestItem.x,
          y: highestItem.yOffSet,
          w: highestItem.w,
          h: 9,
          i: chart.chart_id
        }
      }

      layout.push(posObj)
    },
    handleShare() {
      const h = this.$createElement
      const link = `http://${location.host}/fullscreendb/${this.dashboard.dashboard_id}`
      this.$msgbox({
        title: link,
        message: h('p', null, [
          h('a', { style: 'color: #205cd8', attrs: { href: link, target: '_blank' }}, link)
        ])
      })
    },
    handleLinkChart() {
      // chartList().then(resp => {
      //   this.myChartList = resp.data
      //   this.showChartList = true
      // })
      this.loading = true
      this.getList()
      this.loading = false
    },
    linkChart(chart) {
      const data = {
        chart_id: chart.chart_id,
        dashboard_id: this.dashboard.dashboard_id
      }
      addChartToDB(data).then(resp => {
        this.showChartList = false
        this.getList()
        this.$message({
          type: 'success',
          message: 'Saved successfully. '
        })
      })
    },
    isExisted(chart) {
      return this.charts.findIndex(item => item.chart_id === chart.chart_id) >= 0
    },
    handleEdit(chart) {
      this.$router.push(`/chartpanel/${chart.chart_id}`)
    },
    handleDelete(chart) {
      this.$confirm('Remove?', 'confirm', {
        type: 'warning'
      }).then(() => {
        // deleteChart(index)
        const deleteChartIndex = this.layout.findIndex(item => item.id === chart.chart_id)
        this.layout.splice(deleteChartIndex, 1)
        this.charts.splice(deleteChartIndex, 1)
        console.log(this.layout)
        console.log(this.charts)
        const data = {
          chart_id: chart.chart_id,
          dashboard_id: this.dashboard.dashboard_id
        }
      })
    },
    handleLayoutChange() {
      if (this.mode === 'view') return
      this.dashboard.content = this.dashboard.content || {}
      this.dashboard.content.layout = this.layout
    },
    handleResize(i, newH, newW, newHPx, newWPx) {
      this.$refs[`chartInstance${i}`][0].$children[0].$emit('resized')
    },
  }
}
</script>
<style lang="scss" scoped>
.tool-bar {
  display: flex;
  justify-content: space-between;
  border-top: none;
  height: 45px;
  line-height: 45px;
  color:#303133;
  padding: 0 10px;
  position: relative;
  .db-name {
    font-size: 1.2em;
    font-weight: 600;
    color: #909399;
    margin-left: 0;
  }
  span {
    color: #C0C4CC;
    font-size: 0.8em;
    margin-left: 10px;
  }
}
.visualize-card {
   .el-card__header {
    padding: 0;
    .operation-bar {
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      height: 35px;
      padding: 0 10px;
      line-height: 35px;
      z-index: 9;
      i {
        margin-right: 10px;
        color: #409EFF;
        cursor: pointer;
      }
    }
  }
}
.welcome-container {
  text-align: center;
  height: 500px;
  color:#C0C4CC;
   .el-button {
    margin-top: 200px;
    margin-bottom: 25px;
  }
}
.vue-grid-layout {
    background: #eee;
    background-image: radial-gradient(rgba(202, 202, 202, 0.671) 1px, transparent 1px);
    background-size: 10px 10px;
}
.published {
  background:#FFFFFF;
}

</style>
