// 验证管理员账号
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // 验证管理员账号
    if (username === 'lmx' && password === '040609') {
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('username', username);
        window.location.href = 'admin.html';
    } else {
        alert('账号或密码错误！');
    }
}

// 游客登录
function guestLogin() {
    localStorage.setItem('userType', 'guest');
    localStorage.setItem('username', '游客');
    window.location.href = 'guest.html';
}

// 显示管理员登录表单
function showAdminLogin() {
    document.getElementById('adminLoginForm').classList.remove('hidden');
}

// 隐藏管理员登录表单
function hideAdminLogin() {
    document.getElementById('adminLoginForm').classList.add('hidden');
}

// 登出
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 检查登录状态
function checkAuth() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = 'login.html';
    }
    return userType;
}

// 获取当前用户信息
function getCurrentUser() {
    return {
        type: localStorage.getItem('userType'),
        username: localStorage.getItem('username')
    };
}
