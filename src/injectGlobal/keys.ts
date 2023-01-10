import type { GeoMapJSONResource } from '@/core/FetchCacheManager';
import type { InjectionKey } from 'vue';
import type * as echarts from 'echarts';
import type { Emitter, EventType } from 'mitt'


export const $echartsKey = Symbol() as InjectionKey<typeof echarts>;
export const $mapJSONResourceKey = Symbol() as InjectionKey<GeoMapJSONResource>;
export const $eventBusKey = Symbol() as InjectionKey<Emitter<Record<EventType, unknown>>>;