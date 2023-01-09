<template>
    <div class="bfc flex container">
        <div class="bfc flex layout-left">
            <svg-icon :name="iconCarName"></svg-icon>
            <svg-icon name="alarm"></svg-icon>
        </div>
        <div class="bfc flex layout-midd">
            <div class="bfc flex layout-midd-header">

            </div>
            <div class="bfc flex layout-midd-body">
                <GeoMap :map-name="name"></GeoMap>
            </div>
        </div>
        <div class="bfc flex layout-right">
            {{  name  }}
        </div>
    </div>
</template>

<script setup lang="ts">
import GeoMap from '@/components/GeoMap/index.vue';
import { ref } from 'vue';
import iconCarName from '@/assets/icons/options.svg'

const name = ref('中华人民共和国');

setTimeout(() => {
    name.value = '内蒙古自治区'
}, 3000);

</script>

<style scoped lang="less">
.bfc {
    overflow: hidden;
}

.flex {
    display: flex;
}

.container {
    height: 100%;

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

        &-header,
        &-body {
            width: 100%;
        }

        &-header {
            flex-basis: 0;
            flex-grow: 1;
        }

        &-body {
            flex-basis: 0;
            flex-grow: 3;
        }
    }
}
</style>