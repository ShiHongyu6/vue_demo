<template>
    <div id="map" ref="dom"></div>
</template>

<script setup lang="ts">
import type { EChartsType } from 'echarts';
import { inject, ref, onMounted, computed, onUpdated, watchEffect } from 'vue';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { Deferred } from 'ts-deferred'

import { useCovidStore } from '@/stores'
import { $echartsKey, $mapJSONResourceKey } from '@/injectGlobal/keys';
import { getAdcodeByName } from './geoMetaGetters';

const props = withDefaults(
    defineProps<{
        mapName: string;
    }>(),
    {
        mapName: '',
    }
);

let chart: EChartsType | null = null;
const $echarts = inject($echartsKey)!;

const adcode = computed(() => getAdcodeByName(props.mapName));
const $mapJSONResource = inject($mapJSONResourceKey);

const initDefer = new Deferred();
let isFirstSet = true;
watchEffect(async () => {
    const mapJson = await $mapJSONResource!.getResource(adcode.value)

    await initDefer.promise
    $echarts.registerMap(props.mapName, <any>mapJson)

    if(isFirstSet) {
        setGeoFirst(props.mapName);
    } else {
        setGeoMapName(props.mapName);
    }

});
// #region 设置options.geo

//#region 第一次设置options.geo
function setGeoFirst(name: string) {
    chart!.setOption({
        geo: {
            map: name,
            label: {
                show: true,
                fontSize: "15",
                color: "rgba(0,0,0,0.7)",
            },
            itemStyle: {
                borderColor: "#02c0ff",
            },
            emphasis: {
                itemStyle: {
                    areaColor: "#F3B329",
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 20,
                    borderWidth: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                },
            },
        },
        series: [
            {
                name: "店铺数量",
                type: "map",
                geoIndex: 0,
                // data: res.data,
            },
        ],
    })
}
//#endregion
// #region 设置options.geo.map.name
function setGeoMapName(name: string) {
    chart!.setOption({
        geo: {
            map: name,
        }
    })
}

// #endregion

// #endregion



// const state = useCovidStore();

// #region 初始化echarts
const dom = ref<HTMLDivElement>();
function initEcharts() {
    chart = $echarts.init(dom.value!);
    chart.setOption(INIT_OPTIONS)
    initDefer.resolve()
}
onMounted(() => {
    console.log(dom.value?.clientWidth)
    if (!props.mapName.length) {
        return;
    }
    // state.getData();
    // console.log("mapData", res);

    initEcharts()
});
// #endregion

// #region 处理resize
function resizeHandler() {
    if (!chart) {
        return;
    }

    chart.resize();
}
// 防抖
const debouncedResizeHandler = useDebounceFn(resizeHandler, 300);
useEventListener(window, 'resize', debouncedResizeHandler);
// #endregion
</script>

<script lang="ts">
const INIT_OPTIONS = {
    title: {
        text: "发货地分布情况",
        top: "10px",
        left: "center",
        textStyle: {
            color: "black",
        },
    },

    // tooltip: {
    //     formatter: function (params) {
    //         return (
    //             params.seriesName + "<br />" + params.name + "：" + params.value
    //         );
    //     }, //数据格式化
    // },
}

</script>

<style scoped>
#map {
    overflow: hidden;
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: 1;
}

.control {
    z-index: 1;
    position: absolute;
}
</style>