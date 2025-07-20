<template>
  <el-row :gutter="0" class="github-repo-tree-layout full-width-row">
    <!-- 좌측 카드: 토큰 입력, 저장소 정보, 에러, 로딩 -->
    <!-- <el-col :span="11" class="left-col">
      <el-card shadow="hover" class="left-card">
        <el-alert v-if="error" :title="error" type="error" show-icon class="mb-2" />
        <el-skeleton v-if="loading" rows="4" animated />
        <template v-else>
          <el-card class="mb-2" shadow="never">
            <template #header>
              <span>저장소 정보</span>
            </template>

            <h2>GitHub 저장소 트리 보기</h2>
            <el-form :inline="true" @submit.prevent>
              <el-form-item>
                <el-input
                  v-model="token"
                  type="password"
                  placeholder="Personal Access Token"
                  style="width: 260px"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="loading" @click="fetchRepo">조회</el-button>
              </el-form-item>
            </el-form>
            <el-scrollbar>
              <pre style="margin: 0">{{ repo }}</pre>
            </el-scrollbar>
          </el-card>
        </template>
      </el-card>
    </el-col> -->
    <!-- 구분선 -->
    <!-- <el-col :span="2">
      <el-divider direction="vertical" class="divider-col" />
    </el-col> -->
    <!-- 우측 카드: 트리 목록 -->
    <el-col :span="24" class="right-col">
      <el-card shadow="hover" class="right-card">
        <template #header>
          <span>파일/디렉토리 트리</span>
        </template>
        <div class="tree-scroll-area">
          <el-form :inline="true" @submit.prevent>
            <el-form-item>
              <el-input
                v-model="token"
                type="password"
                placeholder="Personal Access Token"
                style="width: 260px"
                show-password
              />
              <el-button
                type="primary"
                :loading="loading"
                @click="fetchRepo"
                style="margin-left: 10px"
                >조회</el-button
              >
            </el-form-item>
            <el-form-item> </el-form-item>
          </el-form>
          <el-skeleton v-if="loading" :rows="6" animated />
          <template v-else>
            <div v-if="tree && tree.length">
              <div style="margin-bottom: 8px; color: #888">총 {{ tree.length }}개 항목</div>
              <el-tree :data="tree" @node-click="onTreeNodeClick" />
            </div>
            <el-empty v-else-if="tree && !tree.length" description="파일이 없습니다." />
            <div v-else style="color: #bbb">
              트리 정보를 조회하려면 토큰을 입력 후 조회를 누르세요.
            </div>
          </template>
        </div>
      </el-card>
    </el-col>
    <!-- 파일 본문 다이얼로그 -->
    <el-dialog v-model="dialogVisible" fullscreen width="60vw" :title="dialogTitle" top="5vh">
      <template #default>
        <v-md-preview height="50vh" v-if="dialogContent" :text="dialogContent" />
        <el-skeleton v-else :rows="6" animated />
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import TreeView from './TreeView.vue';
  import 'element-plus/dist/index.css';
  import {
    ElRow,
    ElCol,
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElAlert,
    ElSkeleton,
    ElScrollbar,
    ElEmpty,
    ElDivider,
    ElDialog,
    ElMessageBox,
  } from 'element-plus';

  // 마크다운 뷰어 라이브러리(v-md-preview) import
  import VMdPreview from '@kangc/v-md-editor/lib/preview';
  import '@kangc/v-md-editor/lib/style/preview.css';
  import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
  import '@kangc/v-md-editor/lib/theme/style/github.css';
  import VMdEditor from '@kangc/v-md-editor';
  VMdEditor.use(githubTheme);

  function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  }

  const token = ref(getTokenFromUrl());
  const repo = ref(null);
  const tree = ref(null);
  const loading = ref(false);
  const error = ref('');

  // 파일 본문 다이얼로그 상태
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const dialogContent = ref('');

  onMounted(() => {
    token.value = getTokenFromUrl();
  });

  async function fetchRepo() {
    if (!token.value) {
      error.value = '토큰을 입력하세요.';
      return;
    }
    error.value = '';
    loading.value = true;
    repo.value = null;
    tree.value = null;
    try {
      // 저장소 정보
      const repoRes = await axios.get('https://api.github.com/repos/hanjoongcho/self-development', {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/vnd.github+json',
        },
      });
      repo.value = JSON.stringify(repoRes.data, null, 2);

      // 트리 구조 재귀적으로 가져오기 (UTF-8 인코딩)
      async function fetchTree(path = '') {
        const encodedPath = path ? '/' + encodeURIComponent(path).replace(/%2F/g, '/') : '';
        const url = `https://api.github.com/repos/hanjoongcho/self-development/contents${encodedPath}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token.value}`,
            Accept: 'application/vnd.github+json',
          },
        });
        if (Array.isArray(res.data)) {
          return await Promise.all(
            res.data.map(async item => {
              if (item.type === 'dir') {
                return {
                  ...item,
                  label: item.name,
                  children: await fetchTree(item.path),
                };
              } else {
                return { ...item, label: item.name };
              }
            })
          );
        } else {
          return [];
        }
      }
      tree.value = await fetchTree();
    } catch (e) {
      error.value = e?.response?.data?.message || e.message;
    } finally {
      loading.value = false;
    }
  }

  // el-tree 노드 클릭 이벤트 핸들러
  async function onTreeNodeClick(data, node, component) {
    if (Array.isArray(data.children) && data.children.length > 0) {
      // 디렉토리면 아무 동작 안함
      return;
    }
    // 파일 본문 가져오기
    if (data.path) {
      // 확장자가 .md가 아니면 안내 메시지 후 팝업 열지 않음
      if (!data.name?.toLowerCase().endsWith('.md')) {
        ElMessageBox.alert('마크다운 파일(.md)만 상세보기가 가능합니다.', '알림', {
          confirmButtonText: '확인',
          type: 'warning',
        });
        return;
      }
      dialogTitle.value = data.name || data.path;
      dialogContent.value = '';
      dialogVisible.value = true;
      try {
        const res = await axios.get(
          `https://api.github.com/repos/hanjoongcho/self-development/contents/${encodeURIComponent(
            data.path
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              Accept: 'application/vnd.github.v3.raw',
            },
          }
        );
        // 파일이 text라면 바로, binary라면 base64 decode
        if (typeof res.data === 'string') {
          dialogContent.value = res.data;
        } else if (res.data && res.data.content) {
          const decoded = atob(res.data.content.replace(/\n/g, ''));
          dialogContent.value = decoded;
        } else {
          dialogContent.value = '파일 본문을 가져올 수 없습니다.';
        }
      } catch (err) {
        dialogContent.value = '파일 본문 조회 실패: ' + err;
      }
    }
  }
</script>

<style scoped>
  .github-repo-tree-layout,
  .full-width-row {
    width: 100%;
    max-width: 100%;
    min-height: 500px;
    margin: 0;
    padding: 0;
    display: flex;
    box-sizing: border-box;
    height: calc(100vh - 1rem);
  }
  .left-col,
  .right-col {
    height: 100%;
    display: flex;
    align-items: stretch;
  }
  .divider-col {
    height: 90dvh;
  }
  .left-card,
  .right-card {
    width: 100%;
    height: calc(100%);
    min-height: 400px;
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .right-card {
    padding: 0;
  }
  .tree-scroll-area {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 24px;
    height: calc(100% - 60px);
  }
  .mb-2 {
    margin-bottom: 16px;
  }
  /* el-card__body의 높이를 100%로 지정 */
  :deep(.el-card__body) {
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;
    padding: 24px;
    box-sizing: border-box;
  }
  :deep(.el-dialog__body) {
    text-align: left;
  }
</style>
