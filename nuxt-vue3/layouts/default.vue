<template>
  <el-container>
    <!-- Top Horizontal Menu -->
    <!-- <el-header
      height="60px"
      style="background: #f5f7fa; border-bottom: 1px solid #ebeef5; padding: 0"
    >
      <el-menu mode="horizontal" :default-active="$route.path" router style="border: none">
        <el-menu-item index="/">Home</el-menu-item>
        <el-sub-menu index="1">
          <template #title>Sample Pages</template>
          <el-menu-item index="/sample/page1">Sample Page 1</el-menu-item>
          <el-menu-item index="/sample/page2">Sample Page 2</el-menu-item>
          <el-menu-item index="/sample/page3">Sample Page 3</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-header> -->
    <!-- Main Content with Routing Tabs -->
    <el-main style="padding: 0">
      <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="Home" name="/" />
        <el-tab-pane label="Sample 1" name="/sample/page1" />
        <el-tab-pane label="Sample 2" name="/sample/page2" />
        <el-tab-pane label="Sample 3" name="/sample/page3" />
      </el-tabs>
      <div style="padding: 0px">
        <NuxtPage />
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const activeTab = ref(route.path);

watch(
  () => route.path,
  (newPath) => {
    // activeTab.value = newPath;
  }
);

function onTabClick(tab: any) {
  console.log(tab);
  router.push(tab.props.name);
}
</script>

<style scoped>
/* Custom styles for layout */
</style>
