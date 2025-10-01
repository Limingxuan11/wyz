// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user.type) {
        window.location.href = 'login.html';
        return;
    }
    
    // 显示用户名
    document.getElementById('username').textContent = user.username;
    
    // 如果是管理员，显示管理相关功能
    if (user.type === 'admin') {
        document.getElementById('adminTab').classList.remove('hidden');
        document.getElementById('addPlayerBtn').classList.remove('hidden');
    }
    
    // 加载首页统计数据
    loadHomeStats();
    
    // 加载球员列表
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
    
    // 根据标签页加载相应内容
    switch(tabName) {
        case 'players':
            loadPlayers();
            break;
        case 'ranking':
            loadRanking();
            break;
        case 'home':
            loadHomeStats();
            break;
    }
}

// 加载首页统计数据
function loadHomeStats() {
    const players = getPlayers();
    
    // 球员总数
    document.getElementById('totalPlayers').textContent = players.length;
    
    if (players.length > 0) {
        // 计算平均战力
        const avgOverall = players.reduce((sum, player) => {
            return sum + calculateOverall(player.abilities);
        }, 0) / players.length;
        document.getElementById('avgRating').textContent = avgOverall.toFixed(1);
        
        // 最高战力
        const maxOverall = Math.max(...players.map(player => calculateOverall(player.abilities)));
        document.getElementById('maxRating').textContent = maxOverall.toFixed(1);
        
        // 最近更新时间
        const lastUpdate = players.reduce((latest, player) => {
            const playerLatest = player.history && player.history.length > 0 
                ? new Date(player.history[player.history.length - 1].date)
                : new Date(player.createdAt);
            return playerLatest > latest ? playerLatest : latest;
        }, new Date(0));
        
        document.getElementById('lastUpdate').textContent = lastUpdate.toLocaleDateString();
    } else {
        document.getElementById('avgRating').textContent = '0';
        document.getElementById('maxRating').textContent = '0';
        document.getElementById('lastUpdate').textContent = '暂无数据';
    }
}

// 加载球员列表
function loadPlayers() {
    const players = getPlayers();
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    if (players.length === 0) {
        playerList.innerHTML = '<p style="text-align: center; color: #666;">暂无球员数据</p>';
        return;
    }
    
    players.forEach((player, index) => {
        const playerCard = createPlayerCard(player, index);
        playerList.appendChild(playerCard);
    });
}

// 创建球员卡片
function createPlayerCard(player, index) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    const avatar = player.avatar || 'images/default-avatar.png';
    const overall = calculateOverall(player.abilities);
    
    card.innerHTML = `
        <img src="${avatar}" alt="${player.name}" class="player-avatar">
        <h3 class="player-name">${player.name}</h3>
        <p class="player-position">${player.position}</p>
        <p class="player-overall">总体评分: ${overall.toFixed(1)}</p>
        <canvas id="chart-${index}" class="radar-chart"></canvas>
        <p><strong>惯用脚：</strong>${player.preferredFoot}</p>
        <p><strong>健康状态：</strong>${player.fitness}</p>
        <p><strong>特性：</strong>${player.traits || '暂无描述'}</p>
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
    
    if (players.length === 0) {
        rankingContainer.innerHTML = '<p style="text-align: center; color: #666;">暂无球员数据</p>';
        return;
    }
    
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

// 导出数据功能
function exportData() {
    const players = getPlayers();
    const dataStr = JSON.stringify(players, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `players_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// 导入数据功能
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const players = JSON.parse(event.target.result);
                if (confirm(`确定要导入 ${players.length} 名球员的数据吗？这将覆盖现有数据。`)) {
                    savePlayers(players);
                    alert('数据导入成功！');
                    location.reload();
                }
            } catch (error) {
                alert('文件格式错误，请确保上传正确的JSON文件。');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
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

// 保存球员数据
function savePlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
}
