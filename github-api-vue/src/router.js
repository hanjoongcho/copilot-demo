import { createRouter, createWebHistory } from 'vue-router';
import GithubRepoTree from './components/GithubRepoTree.vue';
import Sample1 from './components/Sample1.vue';
import Sample2 from './components/Sample2.vue';

const routes = [
  { path: '/', component: GithubRepoTree },
  { path: '/sample1', component: Sample1 },
  { path: '/sample2', component: Sample2 },
];

const router = createRouter({
  history: createWebHistory('/copilot-demo/'), // base 경로 추가
  routes,
});

export default router;
