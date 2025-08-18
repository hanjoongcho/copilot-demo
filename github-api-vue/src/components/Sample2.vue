<template>
  <el-menu :router="true" mode="horizontal" class="nav-menu">
    <el-menu-item index="/sample1">스택바</el-menu-item>
    <el-menu-item index="/sample2">파이</el-menu-item>
  </el-menu>
  <div style="padding: 32px">
    <h2>부서별 상태별 파이 차트</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 32px">
      <div v-for="(team, idx) in teams" :key="team" style="flex: 1 1 250px; text-align: center">
        <h3>{{ team }}</h3>
        <canvas
          :ref="el => (chartCanvases[idx] = el)"
          style="max-width: 220px; margin: 0 auto"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const teams = ['기획팀', '개발팀', '디자인팀', '영업팀', '마케팅팀', '인사팀'];

  // 각 팀별 상태 데이터
  const teamStatusData = [
    { 진행전: 5, 진행중: 2, 진행완료: 7 },
    { 진행전: 3, 진행중: 4, 진행완료: 5 },
    { 진행전: 2, 진행중: 3, 진행완료: 6 },
    { 진행전: 4, 진행중: 2, 진행완료: 8 },
    { 진행전: 1, 진행중: 5, 진행완료: 4 },
    { 진행전: 2, 진행중: 3, 진행완료: 6 },
  ];

  // fill(알파값)과 보더 컬러 정의
  const fillColors = [
    'rgba(255, 99, 132, 0.5)', // 진행전
    'rgba(54, 162, 235, 0.5)', // 진행중
    'rgba(75, 192, 192, 0.5)', // 진행완료
  ];
  const borderColors = [
    'rgba(255, 99, 132, 1)', // 진행전
    'rgba(54, 162, 235, 1)', // 진행중
    'rgba(75, 192, 192, 1)', // 진행완료
  ];

  const chartCanvases = ref([]);

  onMounted(async () => {
    const { default: Chart } = await import('chart.js/auto');
    chartCanvases.value.forEach((canvas, idx) => {
      new Chart(canvas, {
        type: 'pie',
        data: {
          labels: ['진행전', '진행중', '진행완료'],
          datasets: [
            {
              data: [
                teamStatusData[idx].진행전,
                teamStatusData[idx].진행중,
                teamStatusData[idx].진행완료,
              ],
              backgroundColor: fillColors,
              borderColor: borderColors,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: false },
          },
        },
      });
    });
  });
</script>
