<template>
    <div class="map-container">
        <div id="map" ref="domMountedRef"></div>
        <div v-if="covidDataLoading || mapJSONLoading" class="loading">Loading...</div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { useCovidStore } from '@/stores'
import { getAdcodeByName, getChildrenByName } from './geoMetaGetters';
import { useEcharts, useEchartResize, useFetchMapJSON, useClickSelect } from '@/service/echartsHooks';

const props = withDefaults(
    defineProps<{
        mapName: string;
    }>(),
    {
        mapName: '',
    }
)

const emit = defineEmits<{
    (e: 'onSelected', selectedData: SelectedDataType): void,
}>()

defineExpose({
    selectByName,
})

// 仅在dom挂载之后 才能初始化echarts
const { domMountedRef, echartInstanceRef } = useEcharts()

//#region 选择相关的内容
function selectGetter(data: any): SelectedDataType {
    return {
        name: data.name as string,
        adcode: data.adcode as string,
    }
}
//  在echartInstance上绑定点击选择事件
const { selectedData, clearSelected } = useClickSelect(echartInstanceRef, selectGetter, 'adcode', { name: '', adcode: '' })
//  每次selectedData被修改时 通过dispatch派发一个action进行选择
watch(selectedData, (selected) => {
    const payload = {
        seriesIndex: 0,
        name: selected.name
    }
    echartInstanceRef.value?.dispatchAction({
        type: 'select',
        ...payload
    })

    emit('onSelected', selected)
})
// 被definExpose导出给父组件调用
function selectByName(name: string) {
    const adcode = getAdcodeByName(name)
    if(!adcode) {
        return
    }
    selectedData.value = {
        name,
        adcode
    }
}


// 根据地图名称获取map geo json，并且自动注册到全局echarts模块
const adcode = computed(() => getAdcodeByName(props.mapName))
const { isLoading: mapJSONLoading, mapJSONRef } = useFetchMapJSON(adcode, true, instanceUUID)

const covidStore = useCovidStore()
const { isLoading: covidDataLoading, data: covidDataRef, domesticData } = storeToRefs(covidStore)

//#region 当数据或地图重新获取时 重新进行绘制
let echartOption: any = initOption(instanceUUID)
let setOptionFns: SetOptionFns | null = null
watch([mapJSONRef, covidDataRef, echartInstanceRef], ([mapJSON, covidData, echartInstance], [mapJSONOld, covidDataOld]) => {
    // 如果没有进行数据数据获取 什么都不做
    if (mapJSON === mapJSONOld && covidData === covidDataOld) {
        return
    }

    if (!mapJSON || !covidData) {
        return
    }

    if(echartInstance) {
        clearSelected()
        setOptionFns = setOptionFnsCreator(echartOption, props.mapName, domesticData.value)
        setOptionFns.setOptionSeries(selectedData.value)
        setOptionFns.setOptionVisualMap()
        echartInstance.setOption(echartOption, true)
    }
})
//#endregion

useEchartResize(echartInstanceRef)
</script>

<script lang="ts">
export type SelectedDataType = {
    name: string,
    adcode: string,
}
type SetOptionFns = {
    setOptionSeries: (selectedData: SelectedDataType) => void
    setOptionVisualMap: () => void
}

// 用于echart注册地图 
const instanceUUID = uuidv4()

//#region 设置option
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
        animation: false
    }
}
function setOptionFnsCreator(echartOption: any, name: string, domesticData: any): SetOptionFns {
    const children = getChildrenByName(name)
    const nop = { setOptionSeries(selectedData: SelectedDataType) { }, setOptionVisualMap() { } }
    if (!children) {
        return nop
    }

    const parentAdcode = getAdcodeByName(name)
    if (!parentAdcode) {
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

    const parentDataTreeNode = findSubTreeNode(domesticData, parentAdcode)
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
        setOptionSeries(selectedData: SelectedDataType) {
            Object.assign(echartOption, {
                series: [
                    {
                        type: 'map',
                        map: instanceUUID,
                        // geoIndex: 0,
                        data: childrenData.map((item: any) => ({
                            selected: selectedData.adcode === item.id,
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
    }
}
//#endregion


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
#map,
.map-container,
.loading {
    width: 100%;
    height: 100%
}

.control {
    position: absolute;
}

.map-container {
    overflow: hidden;
    position: relative;
}

.loading {
    position: absolute;
    left: 0;
    top: 0;
}
</style>