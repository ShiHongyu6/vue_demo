<template>
    <div id="map" ref="dom"></div>
</template>

<script setup lang="ts">
import type { EChartsType } from 'echarts';
import { inject, ref, onMounted, computed, shallowRef, watchEffect, onUnmounted } from 'vue';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { Deferred } from 'ts-deferred'
import { v4 as uuidv4 } from 'uuid'

import { useCovidStore } from '@/stores'
import { $echartsKey, $mapJSONResourceKey, $eventBusKey } from '@/injectGlobal/keys'
import { getAdcodeByName, getChildrenByName } from './geoMetaGetters';
import { BusEvent } from '@/core/busEventEnum'

const props = withDefaults(
    defineProps<{
        mapName: string;
    }>(),
    {
        mapName: '',
    }
);

// 用于echart注册地图 
const instanceUUID = uuidv4()

let chart: EChartsType | null = null
const $echarts = inject($echartsKey)!
const initDefer = new Deferred();
const fechDataFinishDefer = new Deferred()


//#region 当name改变时 动态修改地图和加载数据
const adcode = computed(() => getAdcodeByName(props.mapName))
const $mapJSONResource = inject($mapJSONResourceKey)
let echartOption: any = null;
let setOptionFns = null
watchEffect(async () => {
    // adcode.value是在await让步之前访问的 所以可以侦听到
    const mapJson = await $mapJSONResource!.getResource(adcode.value)

    await initDefer.promise
    $echarts.registerMap(instanceUUID, <any>mapJson)
    echartOption = initOption(instanceUUID)

    await fechDataFinishDefer.promise
    clearSelected()
    setOptionFns = setOptionFnsCreator(props.mapName)
    setOptionFns.all()
    chart!.setOption(echartOption, true)
});
//#endregion

//#region 订阅covidState获取数据的事件
const $eventBus = inject($eventBusKey)! // 已经在全局注入了 一定存在
const state = useCovidStore()
$eventBus.on(BusEvent.CovidStateEvent.FETCH_DATA_FINISH, covidStateFetchFinishHandler)
onUnmounted(() => $eventBus.off(BusEvent.CovidStateEvent.FETCH_DATA_FINISH, covidStateFetchFinishHandler));

function covidStateFetchFinishHandler() {
    fechDataFinishDefer.resolve()
}
//#endregion


//#region 设置echart option
//  鼠标点击地图时 选中某一块
const selected = shallowRef({
    name: '',
    adcode: ''
});
function clearSelected() { selected.value = { name: '', adcode: '' } }
function setOptionFnsCreator(name: string) {
    const children = getChildrenByName(name)
    const nop = { setOptionSeries() { }, setOptionVisualMap() { }, all() { } }
    if (!children) {
        return nop
    }
    const adcodeNameMap = new Map();
    children.forEach(({ name, adcode }) => {
        // 台湾在json中的id和meta中的adcode不一致 要特殊处理
        if ('710000' === adcode) {
            adcode = '700000'
        }
        adcodeNameMap.set(adcode, name);
    })


    const parentAdcode = getAdcodeByName(name)
    const parentDataTreeNode = findSubTreeNode(state.domesticData, parentAdcode)
    if (!parentDataTreeNode) {
        return nop
    }
    const childrenData = parentDataTreeNode.children
    if (!childrenData || !children.length) {
        return nop
    }

    // geometa和json对于区域name不一样，例如：中国-中华人民共和国
    // 而json中的id和adcode可以对应
    // 有一些例外：
    //            geometa：中华人民共和国--->adcode 100000
    //            json   : 中国         --->id     0
    // 
    //            geometa：台湾省       --->adcode 710000
    //            json   : 台湾         --->id     700000
    function findSubTreeNode(treeRootNode: any, adcode: string) {
        if ('100000' === adcode) {
            adcode = '0'
        }
        if ('710000' === adcode) {
            adcode = '700000'
        }

        // 如果当前节点就是要找的 直接返回
        if (treeRootNode.id === adcode) {
            return treeRootNode
        }

        if (treeRootNode.children && treeRootNode.children.length) {
            for (let childRootNode of treeRootNode.children) {
                const subTreeNode: any = findSubTreeNode(childRootNode, adcode)
                if (subTreeNode) {
                    return subTreeNode
                }
            }
        }

        return null
    }

    return {
        //  #region 设置 option.series 
        setOptionSeries() {
            Object.assign(echartOption, {
                series: [
                    {
                        type: 'map',
                        map: instanceUUID,
                        // geoIndex: 0,
                        data: childrenData.map((item: any) => ({
                            selected: selected.value.adcode === item.id,
                            name: adcodeNameMap.get(item.id),
                            value: item.total.confirm,
                            details: [item.today, item.total],
                            adcode: item.id,
                        })),
                    }
                ]
            })
        },
        //  #endregion

        //  #region 设置VisualMap
        setOptionVisualMap() {
            // 求总确诊人数的最大值和最小值，用来设置visualMap
            const { confirm } = childrenData[0].total
            let minConfirm = confirm
            let maxConfirm = confirm
            childrenData.forEach((item: any) => {
                if (item.total.confirm > maxConfirm) {
                    maxConfirm = item.total.confirm
                }

                if (item.total.confirm < minConfirm) {
                    minConfirm = item.total.confirm
                }
            })

            Object.assign(echartOption, {
                visualMap: {
                    left: 'right',
                    min: minConfirm,
                    max: maxConfirm,
                    inRange: {
                        color: [
                            '#313695',
                            '#4575b4',
                            '#74add1',
                            '#abd9e9',
                            '#e0f3f8',
                            '#ffffbf',
                            '#fee090',
                            '#fdae61',
                            '#f46d43',
                            '#d73027',
                            '#a50026'
                        ]
                    },
                    text: ['High', 'Low'],
                    calculable: true
                },
            })
        },
        //  #endregion

        all() {
            this.setOptionSeries()
            this.setOptionVisualMap()
        }
    }
}
//#endregion

// #region 初始化echarts
const dom = ref<HTMLDivElement>();
function initEcharts() {
    chart = $echarts.init(dom.value!);
    chart.on('click', clickHandler);
    initDefer.resolve()
}
onMounted(() => {
    if (!props.mapName.length) {
        return;
    }

    initEcharts()
});
onUnmounted(() => {
    chart?.off('click', clickHandler)
})
// 单击选择事件处理
function clickHandler(e: any) {
    // 再次点击时 取消选择
    if (e.data.adcode === selected.value.adcode) {
        clearSelected()
        return
    }

    selected.value = {
        name: e.data.name,
        adcode: e.data.adcode,
    }
}
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
function initOption(instanceUUID: string) {
    return {
        geo: {
            map: instanceUUID,
        },
        tooltip: {
            show: true,
            // formatter: toolTipValueFomatter,
            formatter: function (params: any) {
                const [today, total] = params.data.details
                return toolTipValueFomatter(params.name, today, total)
            },
        },
    }
}

function toolTipValueFomatter(name: string, today: any, total: any) {
    return ([
        `<span style="font-size:1.1em;font-weight: bold">${name}</span>`,
        //数据中有 null 所以用Number转换
        `确诊：<span style="color:rgb(198, 33, 0)">${Number(total.confirm)}</span> <span style="color:rgb(222, 55, 0);">+${Number(today.confirm)}</span>`,
        `治愈：<span style="color:rgb(19, 194, 102)">${Number(total.heal)}</span> <span style="color:rgb(28, 206, 196);">+${Number(today.heal)}</span>`,
        `重症：<span style="color:rgb(202, 97, 62)">${Number(total.severe)}</span> <span style="color:rgb(241, 131, 52);">+${Number(today.severe)}</span>`,
        `死亡：<span style="color:rgb(10, 10, 10)">${Number(total.dead)}</span> <span style="color:rgb(100, 100, 100);">+${Number(today.dead)}</span>`,
    ].join('<br/>'))
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