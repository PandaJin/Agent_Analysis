// 数据加载模块
// 使用 window 确保全局可访问
window.companiesData = [];
window.allCompanies = [];
window.metadata = {};

// 为了兼容旧代码，保留局部引用
let companiesData = window.companiesData;
let allCompanies = window.allCompanies;
let metadata = window.metadata;

const LAYER_ORDER = { infrastructure: 0, llm: 1, platform: 2, application: 3 };

function parseARRValue(arrStr) {
    if (arrStr == null || arrStr === '') return -1;
    const str = String(arrStr).trim();
    if (str === 'N/A') return -1;
    const match = str.match(/\$?([\d.]+)([BMK]?)/);
    if (!match) return -1;
    let amount = parseFloat(match[1]);
    const unit = (match[2] || '').toUpperCase();
    if (unit === 'B') amount *= 1000;
    else if (unit === 'K') amount /= 1000;
    return amount;
}

/** 按技术栈层级 → ARR 降序 → 名称 排序，供全局使用 */
window.sortCompanies = function sortCompanies(list) {
    return [...list].sort((a, b) => {
        const orderA = LAYER_ORDER[a.layer] ?? 99;
        const orderB = LAYER_ORDER[b.layer] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const arrA = parseARRValue(a.arr);
        const arrB = parseARRValue(b.arr);
        if (arrA !== arrB) return arrB - arrA;
        return (a.name || '').localeCompare(b.name || '', 'zh');
    });
};

async function loadData() {
    try {
        document.getElementById('loadingSpinner').classList.add('active');
        
        const response = await fetch('data/companies.json');
        const data = await response.json();
        
        window.allCompanies = allCompanies = window.sortCompanies(data.companies);
        window.companiesData = companiesData = [...allCompanies];
        window.metadata = metadata = data.metadata;
        
        console.log('✅ Data loaded:', {
            totalCompanies: allCompanies.length,
            hasMetadata: !!metadata.subScenes
        });
        
        // 更新UI
        const lastEl = document.getElementById('lastUpdate');
        if (lastEl) lastEl.textContent = data.lastUpdate;
        
        // 计算统计数据
        updateStatistics();
        
        // 渲染公司卡片
        renderCompanies(companiesData);
        const countEl = document.getElementById('filteredCount');
        if (countEl) countEl.textContent = companiesData.length;
        
        document.getElementById('loadingSpinner').classList.remove('active');
        
        return data;
    } catch (error) {
        console.error('数据加载失败:', error);
        document.getElementById('loadingSpinner').classList.remove('active');
        document.getElementById('playersContainer').innerHTML = `
            <div class="empty-state">
                <h3>数据加载失败</h3>
                <p>请检查 data/companies.json 文件是否存在</p>
                <p style="color: #e74c3c; margin-top: 10px;">错误: ${error.message}</p>
            </div>
        `;
    }
}

function updateStatistics() {
    const el = document.getElementById('filteredCount');
    if (el) el.textContent = (window.companiesData || companiesData || []).length;
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
