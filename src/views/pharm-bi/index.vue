<template>
  <div class="tab-container">
    <el-tabs style="margin-top:15px; height:100%; width:100%" type="border-card">
      <el-tab-pane :label="String('Workspace')" style="height:100%; width:100%" lazy='true'>
          <flow-editor></flow-editor>
      </el-tab-pane>
      <el-tab-pane :label="String('Output')" style="height:100%; width:100%" lazy='true'>
        <output-chart> </output-chart>
      </el-tab-pane>
    </el-tabs> 
  </div>
</template>
<script>
import flowEditor from './components/flow-editor'
import outputChart from './components/output.vue'

export default {
  name: 'Tab',
  components: { flowEditor, outputChart },
  data() {
    return {
      tabMapOptions: [
        { label: 'China', key: 'CN' },
        { label: 'USA', key: 'US' },
        { label: 'Japan', key: 'JP' },
        { label: 'Eurozone', key: 'EU' }
      ],
      activeName: 'CN',
      createdTimes: 0
    }
  },
  watch: {
    activeName(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    // init the default selected tab
    const tab = this.$route.query.tab
    if (tab) {
      this.activeName = tab
    }
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
  #container {
  display: flex;
  border: 1px solid #dfe3e8;
  height: 500px;
}
#stencil {
  width: 200px;
  height: 100%;
  position: relative;
  border-right: 1px solid #dfe3e8;
}
#graph-container {
  width: 100%;
  height: 500px;
}
.x6-widget-stencil {
  background-color: #fff;
}
.x6-widget-stencil-title {
  background-color: #fff;
}
.x6-widget-stencil-group-title {
  background-color: #fff !important;
}
.x6-widget-transform {
  margin: -1px 0 0 -1px;
  padding: 0px;
  border: 1px solid #239edd;
}
.x6-widget-transform > div {
  border: 1px solid #239edd;
}
.x6-widget-transform > div:hover {
  background-color: #3dafe4;
}
.x6-widget-transform-active-handle {
  background-color: #3dafe4;
}
.x6-widget-transform-resize {
  border-radius: 0;
}
.x6-widget-selection-inner {
  border: 1px solid #239edd;
}
.x6-widget-selection-box {
  opacity: 0;
}
</style>
