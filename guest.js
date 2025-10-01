// 初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadPlayers();
});

// 显示标签页
function showTab(tabName) {
    // 隐藏所有标签页
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有标签的active类
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(tab => tab.classList.remove('active'));
    
    // 显示选中的标签页
    document.getElementById(tabName).classList.add('active');
    
    // 添加active类到对应的标签
    event.target.classList.add('active');
    
    // 如果切换到排行榜，加载排行榜
    if (tabName === 'ranking') {
        loadRanking();
    }
}

// 加载球员列表
function loadPlayers() {
    const players = getPlayers();
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerCard = createPlayerCard(player, index);
        playerList.appendChild(playerCard);
    });
}

// 创建球员卡片（只读）
function createPlayerCard(player, index) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    const avatar = player.avatar || 'images/default-avatar.png';
    
    card.innerHTML = `
        <img src="${avatar}" alt="${player.name}" class="player-avatar">
        <h3 class="player-name">${player.name}</h3>
        <p class="player-position">${player.position}</p>
        <canvas id="chart-${index}" class="radar-chart"></canvas>
        <p><strong>惯用脚：</strong>${player.preferredFoot}</p>
        <p><strong>健康状态：</strong>${player.fitness}</p>
        <p><strong>特性：</strong>${player.traits || '暂无描述'}</p>
        <p><strong>总体评分：</strong>${calculateOverall(player.abilities).toFixed(1)}</p>
    `;
    
    // 创建雷达图
    setTimeout(() => {
        createRadarChart(`chart-${index}`, player);
    }, 100);
    
    return card;
}

// 创建雷达图
function createRadarChart(canvasId, player) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const data = {
        labels: ['射门', '传球', '拦截', '速度', '意识', '盘带', '积极性', '身体'],
        datasets: [{
            label: player.name,
            data: [
                player.abilities.shooting,
                player.abilities.passing,
                player.abilities.defending,
                player.abilities.pace,
                player.abilities.awareness,
                player.abilities.dribbling,
                player.abilities.workRate,
                player.abilities.physical
            ],
            backgroundColor: 'rgba(26, 84, 144, 0.2)',
            borderColor: 'rgba(26, 84, 144, 1)',
            pointBackgroundColor: 'rgba(26, 84, 144, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(26, 84, 144, 1)'
        }]
    };
    
    new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 加载排行榜
function loadRanking() {
    const players = getPlayers();
    const rankingContainer = document.getElementById('rankingContainer');
    
    // 计算总体评分并排序
    const rankedPlayers = players.map((player, index) => {
        const overall = calculateOverall(player.abilities);
        const previousOverall = getPreviousOverall(player);
        const rankChange = calculateRankChange(players, index, overall);
        
        return {
            ...player,
            index: index,
            overall: overall,
            previousOverall: previousOverall,
            overallChange: overall - previousOverall,
            rankChange: rankChange
        };
    }).sort((a, b) => b.overall - a.overall);
    
    // 创建排行榜表格
    let tableHTML = `
        <div class="ranking-table">
            <table>
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>球员</th>
                        <th>位置</th>
                        <th>总体评分</th>
                        <th>评分变化</th>
                        <th>排名变化</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rankedPlayers.forEach((player, rank) => {
        const rankChange = player.rankChange;
        const overallChange = player.overallChange;
        
        tableHTML += `
            <tr>
                <td>${rank + 1}</td>
                <td>
                    <img src="${player.avatar || 'images/default-avatar.png'}" alt="${player.name}" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 10px;">
                    ${player.name}
                </td>
                <td>${player.position}</td>
                <td>${player.overall.toFixed(1)}</td>
                <td>
                    ${overallChange > 0 ? '+' : ''}${overallChange.toFixed(1)}
                    ${overallChange > 0 ? '<span class="rank-change rank-up">↑</span>' : overallChange < 0 ? '<span class="rank-change rank-down">↓</span>' : ''}
                </td>
                <td>
                    ${rankChange > 0 ? '+' : ''}${rankChange}
                    ${rankChange > 0 ? '<span class="rank-change rank-up">↑</span>' : rankChange < 0 ? '<span class="rank-change rank-down">↓</span>' : ''}
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    rankingContainer.innerHTML = tableHTML;
}

// 计算总体评分
function calculateOverall(abilities) {
    const values = Object.values(abilities);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// 获取之前的总体评分
function getPreviousOverall(player) {
    if (!player.history || player.history.length === 0) {
        return calculateOverall(player.abilities);
    }
    return player.history[player.history.length - 1].overall;
}

// 计算排名变化
function calculateRankChange(players, playerIndex, newOverall) {
    const player = players[playerIndex];
    if (!player.history || player.history.length < 2) {
        return 0;
    }
    
    const previousOverall = player.history[player.history.length - 2].overall;
    let oldRank = 1;
    let newRank = 1;
    
    players.forEach((p, index) => {
        if (index !== playerIndex) {
            const pOverall = calculateOverall(p.abilities);
            if (pOverall > previousOverall) oldRank++;
            if (pOverall > newOverall) newRank++;
        }
    });
    
    return oldRank - newRank;
}

// 获取所有球员
function getPlayers() {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}
