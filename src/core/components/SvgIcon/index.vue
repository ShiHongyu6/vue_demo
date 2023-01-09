<template>
  <i class="icon-container">
    <svg class="icon-svg" aria-hidden="true">
      <use :xlink:href="`#${name}`" />
    </svg>
  </i>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  /**
   * 通过指向svg syboml的id进行引用
   */
  name: string;

  /**
   * 指定大小
   * 默认值：
   *  size = 1
   *  sizeUnit = 'em'
   * 即，默认大小为1em
   */
  size?: number;
  sizeUnit?: string;
}>(), {
  size: 1,
  sizeUnit: 'em',
})

const sizeWithUnit = computed(() => `${props.size}${props.sizeUnit}`)

</script>

<style scoped>
.icon-container {
  overflow: hidden;
  display: inline-block;
  width: v-bind(sizeWithUnit);
  height: v-bind(sizeWithUnit);
}
</style>

<style>
.icon-svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>