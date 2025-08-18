<template>
  <el-menu :router="true" mode="horizontal" class="nav-menu">
    <el-menu-item index="/sample1">StackBar</el-menu-item>
    <el-menu-item index="/sample2">Pie</el-menu-item>
    <el-menu-item index="/sample3">PolarArea</el-menu-item>
  </el-menu>
  <div style="padding: 32px">
    <h2>Chart.js Stack Bar</h2>
    <canvas ref="chartCanvas" style="height: 500px"></canvas>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const chartCanvas = ref(null);

  // 각 팀별로 합계가 60이 되도록 데이터셋 조정
  const dataByTeam = [
    { 진행전: 5, 진행중: 2, 진행완료: 7 },
    { 진행전: 3, 진행중: 4, 진행완료: 5 },
    { 진행전: 2, 진행중: 3, 진행완료: 6 },
    { 진행전: 0, 진행중: 1, 진행완료: 1 },
    { 진행전: 0, 진행중: 0, 진행완료: 1 },
    { 진행전: 0, 진행중: 0, 진행완료: 0 },
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
            maxBarThickness: 30,
            stack: 'status',
            borderSkipped: false, // 막대의 경계선이 스킵되지 않도록 설정
          },
          {
            label: '진행중',
            data: dataByTeam.map(t => t.진행중),
            backgroundColor: fillColors[1],
            borderColor: borderColors[1],
            borderWidth: 2,
            maxBarThickness: 30,
            stack: 'status',
            borderSkipped: false, // 막대의 경계선이 스킵되지 않도록 설정
          },
          {
            label: '진행완료',
            data: dataByTeam.map(t => t.진행완료),
            backgroundColor: fillColors[2],
            borderColor: borderColors[2],
            borderWidth: 2,
            maxBarThickness: 30,
            stack: 'status',
            borderSkipped: false, // 막대의 경계선이 스킵되지 않도록 설정
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: '부서별 업무 진행 상태' },
          datalabels: {
            color: '#222',
            font: { weight: 'normal', size: 10 },
            formatter: (value, ctx) => {
              console.log(value, ctx);
              const label = ctx.dataset.label;
              // return `${label}: ${value}`;
              return ``;
            },
          },
        },

        scales: {
          x: {
            stacked: true,
          },
          y: { stacked: true, max: 14 },
        },
      },
    });
  });
</script>
