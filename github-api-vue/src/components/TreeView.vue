<template>
  <ul class="no-bullet">
    <li v-for="node in nodes" :key="node.path">
      <span v-if="node.type==='dir'">📁 {{ node.name }}</span>
      <span v-else>📄 {{ node.name }}</span>
      <TreeView v-if="node.children && node.children.length" :nodes="node.children" />
    </li>
  </ul>
</template>

<script setup>
defineProps({
  nodes: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.no-bullet {
  list-style: none;
  padding-left: 1em;
}
</style>