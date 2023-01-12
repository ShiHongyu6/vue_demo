<template>
    <div class="bfc flex container">
        <div class="bfc flex flexWrap layout-left" style="font-size: 100px; color: #bfa">
            <BarChart></BarChart>
        </div>
        <div class="bfc flex layout-midd">
            <div class="bfc flex layout-midd-top">
            </div>
            <div class="bfc flex layout-midd-body">
                <ControledGeoMap></ControledGeoMap>
            </div>
        </div>
        <div class="bfc flex layout-right">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'

import ControledGeoMap from '@/components/ControledGeoMap/index.vue'
import BarChart from '@/components/BarChart/index.vue'
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

// setTimeout(() => {
//     name1.value = '内蒙古自治区'
//     name2.value = '陕西省'
// }, 5000);

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
    background-repeat: no-repeat;
    background-size: cover;
    flex: 1 1 0;


    .layout {
        height: 100%;
    }

    .layout-left {
        flex-basis: 0;
        flex-grow: 9
    }
    .layout-right {
        flex-basis: 0;
        flex-grow: 10;
    }

    .layout-midd {
        flex-basis: 0;
        flex-grow: 16;

        flex-direction: column;
        ;

        &-top,
        &-body {
            width: 100%;
        }
        &-top {
            flex-basis: 0;
            flex-grow: 1;
        }

        &-body {
            flex-basis: 0;
            flex-grow: 7;
        }


    }
}
</style>