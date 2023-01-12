<template>
    <div id="bar-chart" ref="domMountedRef"></div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useEcharts, useEchartResize } from '@/service/echartsHooks'
import { useCovidStore } from '@/stores';

const { domMountedRef, echartInstanceRef } = useEcharts()

const { chinaDayList } = storeToRefs(useCovidStore())
watch([chinaDayList, echartInstanceRef], ([chinaDayList, echartInstance]) => {
    if(!chinaDayList) {
        return
    }

    const option = createOption(chinaDayList)

    if (option && echartInstance) {
        echartInstance.setOption(option)
    }
})


useEchartResize(echartInstanceRef)

</script>

<script lang="ts">

function createOption(chinaDayList: any | null) {
    if (!chinaDayList) {
        return null
    }
    const option = {
        xAxis: {
            type: 'category',
            data: chinaDayList.map(({ date }: any) => date)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: chinaDayList.map(({ total }: any) => total.confirm),
                type: 'line',
                smooth: true
            }
        ],
        tooltip: {
            trigger: 'axis'
        },

        title: {
            text: '全国确诊人数折线图',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        }
    };

    return option
}
</script>

<style scoped>
#bar-chart {
    width: 100%;
    height: 50%;
}
</style>