import type { App } from "vue"
import * as echarts from 'echarts'
import { $echartsKey, $mapJSONResourceKey } from './keys'
import { GeoMapJSONResource } from '@/core/FetchCacheManager'


export default function(app: App) {
    app.provide($echartsKey, echarts)
    app.provide($mapJSONResourceKey, new GeoMapJSONResource(10))
}