<template>
    <div class="components-container" style="height:30%">
        Select a query
        <el-select
          v-model="selectedQueryName"
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
        <el-button @click="loadQuery">Load</el-button>
    </div>

</template>
<script>
import {mapGetters,} from 'vuex'
export default ({
    name:"LoadBlock",
    components:{

    },
    props:{
        queryConditions:{
            type: Object,
            require: true,

        }

    },
    computed:{
        ...mapGetters(['blocks',])
    }
    ,
    data() {
        return{
            selectedQueryName:'',
            selectedQuery: {},
        }
    },
    watch:{

    },
    created(){

    },
    methods:{
        loadQuery(){
            function _deepClone(obj){
            let cloneObj = {};
            for (let key in obj) {
              if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                cloneObj[key] = _deepClone(obj[key]);
              } else {
                cloneObj[key] = obj[key];
              }
            }
            return cloneObj;
        }
            this.queryConditions =  _deepClone(this.blocks.filter(v=> v.name == this.selectedQueryName)[0].block)
            console.log(this.queryConditions)
            this.$emit('listenChildLoadBlock', this.queryConditions)
            this.$message(`Query block '${this.selectedQueryName}' loaded.`)

        },
    },
})
</script>
