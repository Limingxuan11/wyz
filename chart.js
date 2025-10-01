/**
 * 统一封装：在指定 canvas 上绘制球员能力雷达图
 * @param {string} canvasId  页面里 <canvas id="xxx"> 的 ID
 * @param {Object} player    单个球员对象（含 abilities 字段）
 */
function createRadarChart(canvasId, player) {
  const ab = player.abilities;
  const data = {
    labels: ['射门', '传球', '拦截', '速度', '意识', '盘带', '积极性', '身体'],
    datasets: [{
      label: player.name,
      data: [
        ab.shooting,
        ab.passing,
        ab.defending,
        ab.pace,
        ab.awareness,
        ab.dribbling,
        ab.workRate,
        ab.physical
      ],
      backgroundColor: 'rgba(26, 84, 144, 0.2)',
      borderColor: 'rgba(26, 84, 144, 1)',
      pointBackgroundColor: 'rgba(26, 84, 144, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(26, 84, 144, 1)'
    }]
  };

  // 如果该 canvas 已经实例化过 Chart，先销毁避免重叠
  if (Chart.getChart) {              // Chart.js 3.x
    const old = Chart.getChart(canvasId);
    if (old) old.destroy();
  }

  new Chart(document.getElementById(canvasId), {
    type: 'radar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}
