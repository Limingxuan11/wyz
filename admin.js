// 初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    document.getElementById('username').textContent = getCurrentUser().username;
    loadPlayers();
    
    // 添加球员表单提交
    document.getElementById('addPlayerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addPlayer();
    });
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

// 创建球员卡片
function createPlayerCard(player, index) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    const avatar = player.avatar || 'images/default-avatar.png';
    
    card.innerHTML = `
        <img src="${avatar}" alt="${player.name}" class="player-avatar">
        <h3 class="player-name">${player.name}</h3>
        <p class="player-position">${player.position}</p>
        <canvas id="chart-${index}" class="radar-chart"></canvas>
        <p><strong>特性：</strong>${player.traits || '暂无描述'}</p>
        <button onclick="editPlayer(${index})" class="btn">编辑</button>
        <button onclick="deletePlayer(${index})" class="btn btn-danger">删除</button>
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

// 添加球员
function addPlayer() {
    const player = {
        id: Date.now(),
        name: document.getElementById('playerName').value,
        avatar: document.getElementById('playerAvatar').value,
        position: document.getElementById('playerPosition').value,
        abilities: {
            shooting: parseInt(document.getElementById('shooting').value),
            passing: parseInt(document.getElementById('passing').value),
            defending: parseInt(document.getElementById('defending').value),
            pace: parseInt(document.getElementById('pace').value),
            awareness: parseInt(document.getElementById('awareness').value),
            dribbling: parseInt(document.getElementById('dribbling').value),
            workRate: parseInt(document.getElementById('workRate').value),
            physical: parseInt(document.getElementById('physical').value)
        },
        preferredFoot: document.getElementById('preferredFoot').value,
        fitness: document.getElementById('fitness').value,
        traits: document.getElementById('traits').value,
        createdAt: new Date().toISOString(),
        history: []
    };
    
    // 保存能力值历史
    player.history.push({
        date: new Date().toISOString(),
        overall: calculateOverall(player.abilities)
    });
    
    const players = getPlayers();
    players.push(player);
    savePlayers(players);
    
    alert('球员添加成功！');
    document.getElementById('addPlayerForm').reset();
    loadPlayers();
}

// 编辑球员
function editPlayer(index) {
    const players = getPlayers();
    const player = players[index];
    
    // 填充编辑表单
    const form = document.getElementById('editPlayerForm');
    form.innerHTML = `
        <input type="hidden" id="editIndex" value="${index}">
        <div class="form-group">
            <label>球员姓名</label>
            <input type="text" id="editName" value="${player.name}" required>
        </div>
        <div class="form-group">
            <label>头像URL</label>
            <input type="text" id="editAvatar" value="${player.avatar || ''}">
        </div>
        <div class="form-group">
            <label>位置</label>
            <select id="editPosition">
                <option value="前锋" ${player.position === '前锋' ? 'selected' : ''}>前锋</option>
                <option value="中场" ${player.position === '中场' ? 'selected' : ''}>中场</option>
                <option value="后卫" ${player.position === '后卫' ? 'selected' : ''}>后卫</option>
                <option value="守门员" ${player.position === '守门员' ? 'selected' : ''}>守门员</option>
            </select>
        </div>
        
        <h3>能力值（0-100）</h3>
        <div class="form-group">
            <label>射门</label>
            <input type="number" id="editShooting" min="0" max="100" value="${player.abilities.shooting}">
        </div>
        <div class="form-group">
            <label>传球</label>
            <input type="number" id="editPassing" min="0" max="100" value="${player.abilities.passing}">
        </div>
        <div class="form-group">
            <label>拦截</label>
            <input type="number" id="editDefending" min="0" max="100" value="${player.abilities.defending}">
        </div>
        <div class="form-group">
            <label>速度</label>
            <input type="number" id="editPace" min="0" max="100" value="${player.abilities.pace}">
        </div>
        <div class="form-group">
            <label>意识</label>
            <input type="number" id="editAwareness" min="0" max="100" value="${player.abilities.awareness}">
        </div>
        <div class="form-group">
            <label>盘带</label>
            <input type="number" id="editDribbling" min="0" max="100" value="${player.abilities.dribbling}">
        </div>
        <div class="form-group">
            <label>积极性</label>
            <input type="number" id="editWorkRate" min="0" max="100" value="${player.abilities.workRate}">
        </div>
        <div class="form-group">
            <label>身体</label>
            <input type="number" id="editPhysical" min="0" max="100" value="${player.abilities.physical}">
        </div>
        
        <div class="form-group">
            <label>惯用脚</label>
            <select id="editPreferredFoot">
                <option value="右脚" ${player.preferredFoot === '右脚' ? 'selected' : ''}>右脚</option>
                <option value="左脚" ${player.preferredFoot === '左脚' ? 'selected' : ''}>左脚</option>
                <option value="双脚" ${player.preferredFoot === '双脚' ? 'selected' : ''}>双脚</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>健康状态</label>
            <select id="editFitness">
                <option value="健康" ${player.fitness === '健康' ? 'selected' : ''}>健康</option>
                <option value="轻伤" ${player.fitness === '轻伤' ? 'selected' : ''}>轻伤</option>
                <option value="重伤" ${player.fitness === '重伤' ? 'selected' : ''}>重伤</option>
                <option value="恢复中" ${player.fitness === '恢复中' ? 'selected' : ''}>恢复中</option>
            </select>
        </div>

        <div class="form-group">
            <label>特性描述</label>
            <textarea id="editTraits">${player.traits || ''}</textarea>
        </div>

        <button type="submit" class="btn">保存修改</button>
        <button type="button" onclick="closeEditModal()" class="btn btn-danger">取消</button>
    `;
    
    // 显示模态框
    document.getElementById('editModal').classList.remove('hidden');
    
    // 绑定提交事件
    form.onsubmit = function(e) {
        e.preventDefault();
        saveEditedPlayer();
    };
}

// 保存编辑的球员
function saveEditedPlayer() {
    const index = parseInt(document.getElementById('editIndex').value);
    const players = getPlayers();
    const oldOverall = calculateOverall(players[index].abilities);
    
    // 更新球员信息
    players[index].name = document.getElementById('editName').value;
    players[index].avatar = document.getElementById('editAvatar').value;
    players[index].position = document.getElementById('editPosition').value;
    players[index].abilities = {
        shooting: parseInt(document.getElementById('editShooting').value),
        passing: parseInt(document.getElementById('editPassing').value),
        defending: parseInt(document.getElementById('editDefending').value),
        pace: parseInt(document.getElementById('editPace').value),
        awareness: parseInt(document.getElementById('editAwareness').value),
        dribbling: parseInt(document.getElementById('editDribbling').value),
        workRate: parseInt(document.getElementById('editWorkRate').value),
        physical: parseInt(document.getElementById('editPhysical').value)
    };
    players[index].preferredFoot = document.getElementById('editPreferredFoot').value;
    players[index].fitness = document.getElementById('editFitness').value;
    players[index].traits = document.getElementById('editTraits').value;
    
    // 计算新的总体评分
    const newOverall = calculateOverall(players[index].abilities);
    
    // 添加到历史记录
    if (!players[index].history) {
        players[index].history = [];
    }
    players[index].history.push({
        date: new Date().toISOString(),
        overall: newOverall,
        change: newOverall - oldOverall
    });
    
    savePlayers(players);
    closeEditModal();
    loadPlayers();
    alert('球员信息更新成功！');
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// 删除球员
function deletePlayer(index) {
    if (confirm('确定要删除这名球员吗？')) {
        const players = getPlayers();
        players.splice(index, 1);
        savePlayers(players);
        loadPlayers();
        alert('球员已删除！');
    }
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

// 保存球员数据
function savePlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
}
