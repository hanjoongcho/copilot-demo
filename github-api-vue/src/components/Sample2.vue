<template>
  <el-menu :router="true" mode="horizontal" class="nav-menu">
    <el-menu-item index="/sample1">StackBar</el-menu-item>
    <el-menu-item index="/sample2">Pie</el-menu-item>
    <el-menu-item index="/sample3">PolarArea</el-menu-item>
  </el-menu>
  <div style="padding: 32px">
    <h2>Chart.js Pie</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 32px">
      <div v-for="(team, idx) in teams" :key="team" style="flex: 1 1 250px; text-align: center">
        <h3>{{ team }}</h3>
        <canvas :ref="el => (chartCanvases[idx] = el)" style="margin: 0 auto"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const teams = ['기획팀', '개발팀', '디자인팀', '영업팀', '마케팅팀', '인사팀'];

  const teamStatusData = [
    { 진행전: 5, 진행중: 2, 진행완료: 7 },
    { 진행전: 3, 진행중: 4, 진행완료: 5 },
    { 진행전: 2, 진행중: 3, 진행완료: 6 },
    { 진행전: 0, 진행중: 1, 진행완료: 1 },
    { 진행전: 0, 진행중: 0, 진행완료: 1 },
    { 진행전: 0, 진행중: 0, 진행완료: 0 },
  ];

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
    const { default: ChartDataLabels } = await import('chartjs-plugin-datalabels');
    Chart.register(ChartDataLabels);

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
            title: { display: true, text: '부서별 업무 진행 상태' },
            datalabels: {
              color: '#333333',
              font: { weight: 'normal', size: 12 },
              formatter: (value, ctx) => {
                const label = ctx.chart.data.labels[ctx.dataIndex];
                if (value === 0) {
                  return '';
                } else {
                  return `${label}: ${value}`;
                }
              },
            },
          },
        },
        plugins: [ChartDataLabels, noDataPlugin],
      });
    });
  });

  const noDataPlugin = {
    id: 'noData',
    beforeDraw(chart) {
      const { datasets } = chart.data;
      const total = datasets[0].data.reduce((a, b) => a + b, 0);
      if (total === 0) {
        const {
          ctx,
          chartArea: { width, height },
        } = chart;
        ctx.save();
        ctx.font = '16px Arial';
        ctx.fillStyle = 'gray';
        ctx.textAlign = 'center';
        ctx.fillText('No Data', width / 2, height / 2);
        ctx.restore();
      }
    },
  };
</script>
