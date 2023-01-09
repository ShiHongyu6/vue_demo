<template>
  <svg class="icon" :class="[color ? 'customStyle' : false]" aria-hidden="true">
    <use :xlink:href="`#${name}`" />
  </svg>
</template>

<script setup lang="ts">

defineProps<{
  name: string;
  color?: string;
}>()


</script>

<style scoped>
.customStyle {
  color: v-bind(color);
}

</style>

<style>
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>