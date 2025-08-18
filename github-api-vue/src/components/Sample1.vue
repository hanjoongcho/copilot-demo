<template>
  <el-menu :router="true" mode="horizontal" class="nav-menu">
    <el-menu-item index="/sample1">스택바</el-menu-item>
    <el-menu-item index="/sample2">파이</el-menu-item>
  </el-menu>
  <div style="padding: 32px">
    <h2>Chart.js Stack Bar Chart 샘플</h2>
    <canvas ref="chartCanvas" style="max-width: 600px; height: 400px"></canvas>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const chartCanvas = ref(null);

  // 각 팀별로 합계가 60이 되도록 데이터셋 조정
  const dataByTeam = [
    { 진행전: 10, 진행중: 20, 진행완료: 30 }, // 기획팀
    { 진행전: 15, 진행중: 25, 진행완료: 20 }, // 개발팀
    { 진행전: 20, 진행중: 10, 진행완료: 30 }, // 디자인팀
    { 진행전: 18, 진행중: 12, 진행완료: 30 }, // 영업팀
    { 진행전: 12, 진행중: 28, 진행완료: 20 }, // 마케팅팀
    { 진행전: 25, 진행중: 15, 진행완료: 20 }, // 인사팀
  ];

  // 컬러 및 보더 컬러 정의
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

  onMounted(async () => {
    const { default: Chart } = await import('chart.js/auto');
    new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: ['기획팀', '개발팀', '디자인팀', '영업팀', '마케팅팀', '인사팀'],
        datasets: [
          {
            label: '진행전',
            data: dataByTeam.map(t => t.진행전),
            backgroundColor: fillColors[0],
            borderColor: borderColors[0],
            borderWidth: 2,
            stack: 'status',
          },
          {
            label: '진행중',
            data: dataByTeam.map(t => t.진행중),
            backgroundColor: fillColors[1],
            borderColor: borderColors[1],
            borderWidth: 2,
            stack: 'status',
          },
          {
            label: '진행완료',
            data: dataByTeam.map(t => t.진행완료),
            backgroundColor: fillColors[2],
            borderColor: borderColors[2],
            borderWidth: 2,
            stack: 'status',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: '부서별 업무 진행 상태 (스택 바 차트)' },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, max: 60 },
        },
      },
    });
  });
</script>
