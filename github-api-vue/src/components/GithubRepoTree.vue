<!-- filepath: src/components/GithubRepoTree.vue -->
<template>
  <div style="text-align: left;">
    <h2>GitHub 저장소 트리 보기</h2>
    <input v-model="token" type="password" placeholder="Personal Access Token" style="width:300px" />
    <button @click="fetchRepo">조회</button>
    <div v-if="loading">로딩 중...</div>
    <div v-if="error" style="color:red">{{ error }}</div>
    <div v-if="repo">
      <h3>저장소 정보</h3>
      <pre>{{ repo }}</pre>
    </div>
    <div v-if="tree && tree.length">
      <h3>파일/디렉토리 트리 {{ tree.length }}</h3>
      <TreeView :nodes="tree" />
    </div>
    <div v-else-if="tree && !tree.length">
      <h3>파일/디렉토리 트리</h3>
      <div>파일이 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import axios from 'axios'
import TreeView from './TreeView.vue'

const token = ref('')
const repo = ref(null)
const tree = ref(null)
const loading = ref(false)
const error = ref('')

async function fetchRepo() {
  if (!token.value) {
    error.value = '토큰을 입력하세요.'
    return
  }
  error.value = ''
  loading.value = true
  repo.value = null
  tree.value = null
  try {
    // 저장소 정보
    const repoRes = await axios.get(
      'https://api.github.com/repos/hanjoongcho/self-development',
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    repo.value = JSON.stringify(repoRes.data, null, 2)

    // 트리 구조 재귀적으로 가져오기 (UTF-8 인코딩)
    async function fetchTree(path = '') {
      // 한글 경로를 포함한 전체 경로를 UTF-8로 인코딩
      const encodedPath = path
        ? '/' + encodeURIComponent(path).replace(/%2F/g, '/')
        : ''
      const url = `https://api.github.com/repos/hanjoongcho/self-development/contents${encodedPath}`
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/vnd.github+json',
        },
      })
      if (Array.isArray(res.data)) {
        return await Promise.all(
          res.data.map(async (item) => {
            if (item.type === 'dir') {
              return {
                ...item,
                name: item.name,
                children: await fetchTree(item.path),
              }
            } else {
              return { ...item, name: item.name }
            }
          })
        )
      } else {
        return []
      }
    }
    tree.value = await fetchTree()
  } catch (e) {
    error.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}
</script>