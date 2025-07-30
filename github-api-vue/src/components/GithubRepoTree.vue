<template>
  <el-row class="main-container">
    <el-col :span="24">
      <div>
        <el-input
          class="form-input"
          v-model="filterText"
          placeholder="category or tag"
          style="width: 100%"
          clearable
          @input="onFilterInput"
        >
          <template #prefix>
            <el-icon>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5
                  6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5
                  4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6
                  0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5
                  11.99 14 9.5 14z"
                />
              </svg>
            </el-icon>
          </template>
        </el-input>
        <div class="top-toolbar">
          <el-tag v-if="state.highlightSeq > 0">{{
            `${state.highlightSeq} / ${state.highlightedNodes.length}`
          }}</el-tag>
          <el-tag @click="handleHighlightPrevious">↑</el-tag>
          <el-tag @click="handleHighlightNext">↓</el-tag>
        </div>

        <el-scrollbar ref="treeScrollbar" class="tree-scroll-area">
          <div
            v-loading="loading"
            class="loading-container"
            :element-loading-text="state.loadingText"
          >
            <el-tree
              ref="treeRef"
              :empty-text="state.emptyMessage"
              :data="tree"
              :filter-node-method="filterNode"
              :default-expand-all="true"
              :highlight-current="true"
              nodeKey="path"
              @node-click="onTreeNodeClick"
            >
              <template #default="{ node, data }">
                <span v-html="highlightLabel(data.label)"></span>
              </template>
            </el-tree>
          </div>
        </el-scrollbar>
      </div>
    </el-col>
    <!-- 파일 본문 다이얼로그 -->
    <el-dialog
      v-model="dialogVisible"
      fullscreen
      width="60vw"
      :title="dialogTitle"
      top="5vh"
      append-to-body
      :close-on-click-modal="false"
      :show-close="true"
    >
      <template #default>
        <!-- 플로팅 닫기 버튼: 우측 하단 -->
        <el-button
          class="dialog-float-close"
          type="primary"
          @click="dialogVisible = false"
          title="닫기"
        >
          Close
        </el-button>
        <v-md-preview height="50vh" v-if="dialogContent" :text="dialogContent" />
        <el-skeleton v-else :rows="6" animated />
      </template>
      <template #footer></template>
    </el-dialog>
  </el-row>
</template>

<script setup>
  import { ref, onMounted, reactive } from 'vue';
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
  const loading = ref(true);
  const error = ref('');

  // 파일 본문 다이얼로그 상태
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const dialogContent = ref('');

  const filterText = ref('');
  const treeRef = ref();
  const treeScrollbar = ref();

  const state = reactive({
    emptyMessage: '데이터를 로딩중입니다.',
    highlightedNodes: [],
    highlightCount: 0,
    highlightSeq: 0, // 현재 하이라이트된 시퀀스
    loadingText: '로딩중...',
  });

  onMounted(() => {
    token.value = getTokenFromUrl();
    fetchRepo();
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
        state.loadingText = path;
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
      if (tree.value && tree.value.length > 0) {
        state.emptyMessage = '데이터가 존재하지 않습니다.';
      } else {
        state.emptyMessage = '데이터가 존재하지 않습니다.';
      }
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

  const filterNode = (value, data) => {
    if (!value) return true;
    return data.label && data.label.toLowerCase().includes(value.toLowerCase());
  };

  const onFilterInput = () => {
    // if (treeRef.value) {
    //   treeRef.value.filter(filterText.value);
    // }

    console.log('filterText:', filterText.value, tree.value);
    state.highlightedNodes = [];
    state.highlightSeq = 0; // 초기화

    if (filterText.value) {
      updateHighlightedNodes();
    } else {
      // 검색어가 비어있으면 모든 노드 하이라이트 제거
      if (treeRef.value) {
        treeRef.value.setCurrentKey(null); // 현재 선택된 노드 초기화
      }
    }
  };

  const updateHighlightedNodes = () => {
    // 필터링된 노드 목록 업데이트 (하위 아이템까지 모두 비교)
    const result = [];
    function traverse(items) {
      if (!items) return;
      for (const item of items) {
        if (
          item.name &&
          filterText.value &&
          item.name.toLowerCase().indexOf(filterText.value.toLowerCase()) !== -1
        ) {
          result.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    }
    traverse(tree.value);
    state.highlightedNodes = result;
    state.highlightCount = result.length;

    if (state.highlightedNodes.length > 0) {
      state.highlightSeq = 1;
      treeRef.value.setCurrentKey(state.highlightedNodes[state.highlightSeq - 1].path);
      moveNodeFocus();
    }
  };

  const moveNodeFocus = () => {
    // setCurrentKey 이후 자동 스크롤
    setTimeout(() => {
      const el = document.querySelector('.el-tree-node.is-current');
      if (el) {
        // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.scrollIntoView();
      }
    }, 200);
  };

  // 검색어와 일치하는 부분만 <mark>로 감싸서 반환
  function highlightLabel(label) {
    // console.log(label, filterText.value);
    if (!filterText.value) return label;
    // 단어 단위로 정확히 일치하는 부분만 마킹 (대소문자 구분 없이)
    const regex = new RegExp(`(${filterText.value})`, 'gi');
    // console.log('👉', label.replace(regex, '<mark>$1</mark>'));
    return label.replace(regex, '<mark>$1</mark>');
  }

  const handleHighlightPrevious = () => {
    if (state.highlightSeq > 1) {
      state.highlightSeq = state.highlightSeq - 1;
      treeRef.value.setCurrentKey(state.highlightedNodes[state.highlightSeq - 1].path);
      moveNodeFocus();
    }
  };

  const handleHighlightNext = () => {
    if (state.highlightSeq < state.highlightedNodes.length) {
      state.highlightSeq = state.highlightSeq + 1;
      treeRef.value.setCurrentKey(state.highlightedNodes[state.highlightSeq - 1].path);
      moveNodeFocus();
    }
  };
</script>

<style scoped>
  .main-container {
    background: #ffffff;
  }
  .top-toolbar {
    height: 48px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 0px;
    padding: 0 16px;
    box-sizing: border-box;
    gap: 8px;
  }
  .github-repo-tree-layout,
  .full-width-row {
    width: 100%;
    max-width: 100%;
    /* min-height: 500px; */
    margin: 0;
    padding: 0;
    display: flex;
    box-sizing: border-box;
  }
  .tree-scroll-area {
    /* flex: 1 1 auto; */
    overflow-y: auto;
    /* padding: 3px 0 0 0; */
    height: calc(100dvh - 96px);
    box-sizing: border-box;
  }
  .mb-2 {
    margin-bottom: 16px;
  }
  .dialog-float-close {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2001;
  }
  .form-input {
    font-size: 20px;
    height: 48px;
    min-height: 48px;
    z-index: 999;
  }
  .loading-container {
    position: relative;
    height: calc(100dvh - 96px);
    width: 100%;
  }
  .toolbar-move-btn {
    min-width: 32px;
    padding: 0 8px;
    font-size: 18px;
    vertical-align: middle;
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
  :deep(.github-markdown-body) {
    font-size: 12px;
    padding: 0;
  }
  :deep(.form-input .el-input__wrapper),
  :deep(.form-input .el-input__inner) {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-size: 16px;
    height: 48px;
  }
  :deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.3);
  }
  mark {
    background: #ffe066;
    color: #222;
    padding: 0 2px;
    border-radius: 2px;
  }
</style>
