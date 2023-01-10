<template>
    <div class="bfc flex container">
        <div class="bfc flex flexWrap layout-left" style="font-size: 100px; color: #bfa">
            <svg-icon :name="iconNme_options" :size="200" size-unit="px"></svg-icon>
            <svg-icon name="alarm"></svg-icon>
        </div>
        <div class="bfc flex layout-midd">
            <div class="bfc flex layout-midd-body">
                <GeoMap :map-name="name2"></GeoMap>
            </div>
            <div class="bfc flex layout-midd-bottom">
            </div>
        </div>
        <div class="bfc flex layout-right">
            {{ covidState.data }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'

import GeoMap from '@/components/GeoMap/index.vue'
import iconNme_options from '@/assets/icons/options.svg'
import { useCovidStore } from '@/stores'
import { $eventBusKey } from '@/injectGlobal'
import { BusEvent } from '@/core/busEventEnum'

const eventBus = inject($eventBusKey)!;
const covidState = useCovidStore()

onMounted(async () => {
    await covidState.fetchCovidData()
    eventBus.emit(BusEvent.CovidStateEvent.FETCH_DATA_FINISH)
})

const name1 = ref('中华人民共和国')
const name2 = ref('中华人民共和国')

setTimeout(() => {
    name1.value = '内蒙古自治区'
    name2.value = '陕西省'
}, 3000);

</script>

<style scoped lang="less">
.bfc {
    overflow: hidden;
}

.flex {
    display: flex;
}

.flexWrap {
    flex-wrap: wrap;
}

.container {
    height: 100%;
    background-image: url('/background.png');

    .layout {
        height: 100%;
    }

    .layout-left,
    .layout-right {
        flex-basis: 0;
        flex-grow: 5;
    }

    .layout-midd {
        flex-basis: 0;
        flex-grow: 8;

        flex-direction: column;
        ;

        &-bottom,
        &-body {
            width: 100%;
        }

        &-body {
            flex-basis: 0;
            flex-grow: 3;
        }

        &-bottom {
            flex-basis: 0;
            flex-grow: 1;
        }

    }
}
</style>