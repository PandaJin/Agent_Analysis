// 数据加载模块
let companiesData = [];
let allCompanies = [];
let metadata = {};

async function loadData() {
    try {
        document.getElementById('loadingSpinner').classList.add('active');
        
        const response = await fetch('data/companies.json');
        const data = await response.json();
        
        companiesData = data.companies;
        allCompanies = [...data.companies];
        metadata = data.metadata;
        
        // 更新UI
        document.getElementById('lastUpdate').textContent = data.lastUpdate;
        document.getElementById('totalCount').textContent = data.totalCompanies || companiesData.length;
        
        // 计算统计数据
        updateStatistics();
        
        // 渲染公司卡片
        renderCompanies(companiesData);
        
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
    // 计算最高ARR
    let maxARR = '$0';
    let maxAmount = 0;
    companiesData.forEach(company => {
        if (company.arr && company.arr !== 'N/A') {
            const match = company.arr.match(/\$?([\d.]+)([BMK]?)/);
            if (match) {
                let amount = parseFloat(match[1]);
                const unit = match[2];
                if (unit === 'B') amount *= 1000;
                if (unit === 'K') amount /= 1000;
                if (amount > maxAmount) {
                    maxAmount = amount;
                    maxARR = company.arr;
                }
            }
        }
    });
    document.getElementById('maxARR').textContent = maxARR;
    
    // 计算总融资额
    let totalFunding = 0;
    companiesData.forEach(company => {
        if (company.funding && company.funding !== 'N/A' && company.funding !== '未披露') {
            const match = company.funding.match(/\$?([\d.]+)([BMK]?)/);
            if (match) {
                let amount = parseFloat(match[1]);
                const unit = match[2];
                if (unit === 'B') amount *= 1;
                else if (unit === 'M') amount /= 1000;
                else if (unit === 'K') amount /= 1000000;
                totalFunding += amount;
            }
        }
    });
    document.getElementById('totalFunding').textContent = `$${totalFunding.toFixed(1)}B`;
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
