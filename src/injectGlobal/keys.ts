import type { GeoMapJSONResource } from '@/core/FetchCacheManager';
import type { InjectionKey } from 'vue';
import type * as echarts from 'echarts';


export const $echartsKey = Symbol() as InjectionKey<typeof echarts>;
export const $mapJSONResourceKey = Symbol() as InjectionKey<GeoMapJSONResource>;