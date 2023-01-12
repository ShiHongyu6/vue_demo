<template>
    <div class="map-path-container">
        <GeoMap :map-name="curName" @on-selected="changeMap"></GeoMap>
        <div class="path-btn-container">
            <div class="btn" @click="back">
                <svg-icon :name="backIconId"></svg-icon>
            </div>
            <div class="path-container">
                <span class="path-item" v-for="name of mapNameStack" :key="name">{{ name }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GeoMap, { type SelectedDataType } from '@/core/components/GeoMap/index.vue'
import backIconId from '@/assets/icons/back.svg'

const mapNameStack = ref(['中华人民共和国'])
const curName = computed(() => mapNameStack.value[mapNameStack.value.length - 1])
function changeMap(selectedData: SelectedDataType) {
    if(selectedData.name === '') {
        return
    }
    mapNameStack.value.push(selectedData.name)
}

function back() {
    if(mapNameStack.value.length <= 1) {
        return
    }
    mapNameStack.value.pop()
}
</script>

<style scoped lang="less">
.map-path-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .path-btn-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 2em;
        line-height: 2em;

        display: flex;
        justify-content: flex-start;
        align-items: center;
        .btn {
            width: 2em;
            height: 2em;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 0.1em;
            opacity: 0.6;

            &:hover {
                opacity: 0.8;
            }

            &:active {
                opacity: 1;
            }
        }

        .path-item{
            color: #fff;
            margin-left: 0.5em;
        }
    }
}
</style>