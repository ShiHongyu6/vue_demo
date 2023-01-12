import { $echartsKey, $mapJSONResourceKey } from "@/injectGlobal";
import { useDebounceFn, useEventListener } from "@vueuse/core";
import type { EChartsType } from "echarts";
import { inject, onMounted, shallowRef, ref, unref, watch, watchEffect, type ShallowRef, type ComputedRef, type WatchSource, onUnmounted } from "vue";
import type { Ref } from "vue";

/**
 * 初始化一个echarts
 * @returns { domMountedRef } 一个挂载echart的dom ref， 需要指向在template的元素
 * @returns { $echarts } 全局注入的 echarts 模块
 * @returns { echartInstanceRef } echart实例
 */
export function useEcharts() {
    const domMountedRef = shallowRef<HTMLDivElement | null>(null)
    const $echarts = inject($echartsKey)!
    const echartInstanceRef = shallowRef<EChartsType>()

    watch(domMountedRef, () => {
        if (domMountedRef.value)
            echartInstanceRef.value = $echarts.init(domMountedRef.value)
    })

    return {
        domMountedRef,
        $echarts,
        echartInstanceRef: echartInstanceRef,
    }
}

/**
 * 为echartInstance绑定事件处理
 * 
 * @param echartInstance 
 * @param event 
 * @param handler 
 * @returns
 */
export function useEchartsEventListender(echartInstanceRef: ShallowRef<EChartsType | undefined>, event: string, handler: (e: any) => void) {

    watch(echartInstanceRef, (newInstance, oldInstance) => {
        newInstance?.on(event, handler)
        oldInstance?.off(event, handler)
    })

    onUnmounted(() => {
        const instance = unref(echartInstanceRef)
        instance?.off(event, handler)
    })
}


/**
 * 为echart设置resize事件
 * 使用vueuse中的useEventListener挂载事件 当组件实例销毁时 自动卸载事件处理
 * @param echartInstance 添加resize的echart实例
 * @param debounce 防抖的时间 如果不想开启防抖 则传false 默认有300ms的防抖
 */
export function useEchartResize(echartInstanceRef: ShallowRef<EChartsType | undefined>, debounce: number | false = 300) {

    if (debounce < 0) {
        console.warn('param debounce shoulde be bigger than 0')
        debounce = 0
    }

    function resizeHandler() {
        const echartInstance = unref(echartInstanceRef)
        if (!echartInstance) {
            return;
        }

        echartInstance.resize();
    }

    if (!debounce) {
        useEventListener(window, 'resize', resizeHandler)
        return
    }

    // 防抖
    const debouncedResizeHandler = useDebounceFn(resizeHandler, debounce);
    useEventListener(window, 'resize', debouncedResizeHandler);
}

/**
 * 获取map geo JSON
 * @param adcodeRef 地图adcode
 * @param autoRegister 自动注册到全局echarts模块
 * @param registerName 自动注册时使用的name
 * @returns { mapJSONRef } 获取到的mapJSON
 * @returns { isLoading } 因为是异步获取 用来表示是否获取完成
 */
export function useFetchMapJSON(adcodeRef: ShallowRef<string | null> | ComputedRef<string | null>, autoRegister?: boolean, registerName?: string) {
    const $mapJSONResource = inject($mapJSONResourceKey)
    const $echarts = inject($echartsKey)

    const isLoading = shallowRef(true)
    const mapJSONRef = shallowRef<any>()
    watch(adcodeRef, async (adcode) => {
        if(!adcode) {
            return
        }

        isLoading.value = true
        mapJSONRef.value = await $mapJSONResource!.getResource(adcode)
        if (autoRegister) {
            if (!registerName) {
                console.error('params registerName must all exist cause of autoRegister is true')
            } else {
                $echarts!.registerMap(registerName, mapJSONRef.value)
            }
        }
        isLoading.value = false
    },{
        immediate: true
    })

    return { mapJSONRef, isLoading }
}


/**
 * 给echartInstance绑定click事件
 *  提供一个getter回调 用这个回调函数的返回值修改selectedData.value
 *  不进行选择时 selectedData.value = null
 * @param echartInstance 
 * @param getter
 */
export function useClickSelect<
    DataType extends object,
    SelectedData extends object,
    Getter extends (data: DataType) => SelectedData
>(
    echartInstance: ShallowRef<EChartsType | undefined>,
    getter: Getter,
    avoidDeepEqualIdKey: keyof SelectedData
): { selectedData: ShallowRef<SelectedData | null>, clearSelected: () => void }
/**
 * 给echartInstance绑定click事件
 *  提供一个getter回调 用这个回调函数的返回值修改selectedData.value
 * @param echartInstance 
 * @param getter 
 * @param dataUsedClear 
 */
export function useClickSelect<
    DataType extends object,
    SelectedData extends object,
    Getter extends (data: DataType) => SelectedData
>(
    echartInstance: ShallowRef<EChartsType | undefined>,
    getter: Getter,
    avoidDeepEqualIdKey: keyof SelectedData,
    dataUsedClear: SelectedData
): { selectedData: ShallowRef<SelectedData>, clearSelected: () => void }

export function useClickSelect<
    DataType extends object,
    SelectedData extends object,
    Getter extends (data: DataType) => SelectedData
>(
    echartInstance: ShallowRef<EChartsType | undefined>,
    getter: Getter,
    avoidDeepEqualIdKey: keyof SelectedData,
    dataUsedClear?: SelectedData
) {
    const selectedData = shallowRef<SelectedData | null>(dataUsedClear ?? null)
    useEchartsEventListender(echartInstance, 'click', clickHandler)

    function clearSelected() {
        selectedData.value = dataUsedClear ?? null
    }

    function clickHandler(e: any) {
        const pre = selectedData.value
        const cur = getter ? getter(e.data) : e.data

        // 再次点击时 取消选择
        if (pre && cur && pre[avoidDeepEqualIdKey] === cur[avoidDeepEqualIdKey]) {
            clearSelected()
            return
        }

        selectedData.value = cur
    }

    return { selectedData, clearSelected }
}
