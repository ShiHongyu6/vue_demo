import type { App } from "vue"
import * as echarts from 'echarts'
import { $echartsKey, $mapJSONResourceKey, $eventBusKey } from './keys'
import { GeoMapJSONResource } from '@/core/FetchCacheManager'
import mitt from "mitt"


export default function(app: App) {
    app.provide($echartsKey, echarts)
    app.provide($mapJSONResourceKey, new GeoMapJSONResource(10))
    app.provide($eventBusKey, mitt())
}