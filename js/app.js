// 核心应用逻辑

// 渲染公司卡片
function renderCompanies(companies) {
    const container = document.getElementById('playersContainer');
    
    if (!companies || companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>未找到匹配的公司</h3>
                <p>尝试调整筛选条件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = companies.map(company => `
        <div class="player-card" onclick="showCompanyDetail(${company.id})">
            <div class="card-header">
                <div class="company-logo">${company.logo || company.name.substring(0, 2)}</div>
                <div class="company-info">
                    <h3>${company.name}</h3>
                    <div class="company-name-en">${company.nameEn}</div>
                    <div class="tags">
                        <span class="tag layer">${getLayerText(company.layer)}</span>
                        ${company.scene ? `<span class="tag scene">${getSceneText(company.scene)}</span>` : ''}
                        <span class="tag region">${getRegionText(company.region)}</span>
                        <span class="tag model">${company.model.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="description">${company.description}</div>
                <div class="metrics-mini">
                    <div class="metric-mini">
                        <div class="metric-mini-label">ARR</div>
                        <div class="metric-mini-value">${company.arr || 'N/A'}</div>
                    </div>
                    <div class="metric-mini">
                        <div class="metric-mini-label">MAU</div>
                        <div class="metric-mini-value">${company.mau || 'N/A'}</div>
                    </div>
                </div>
                ${company.highlight ? `<div class="highlight-badge">🔥 ${company.highlight}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// 显示公司详情
function showCompanyDetail(companyId) {
    const company = allCompanies.find(c => c.id === companyId);
    if (!company) return;
    
    // 设置标题
    document.getElementById('modalTitle').textContent = company.name;
    document.getElementById('modalSubtitle').textContent = `${company.nameEn} | 成立于 ${company.founded}`;
    
    // 概览标签
    document.getElementById('tab-overview').innerHTML = `
        <div class="detail-section">
            <h4>📝 公司简介</h4>
            <p>${company.description}</p>
        </div>
        <div class="detail-section">
            <h4>✨ 核心功能</h4>
            <ul style="padding-left: 20px; line-height: 1.8;">
                ${company.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // 商业信息标签
    document.getElementById('tab-business').innerHTML = `
        <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
            <div class="metric-card" style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">ARR</div>
                <div style="font-size: 24px; font-weight: 700; color: #1e3a5f;">${company.arr}</div>
            </div>
            <div class="metric-card" style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">MAU</div>
                <div style="font-size: 24px; font-weight: 700; color: #1e3a5f;">${company.mau}</div>
            </div>
            <div class="metric-card" style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">用户类型</div>
                <div style="font-size: 16px; font-weight: 700; color: #1e3a5f;">${company.userType}</div>
            </div>
        </div>
        <div class="detail-section" style="margin-top: 25px;">
            <h4>💰 定价信息</h4>
            <p><strong>付费模式：</strong>${company.pricingModel}</p>
            <p><strong>价格区间：</strong>${company.pricingRange}</p>
        </div>
    `;
    
    // 融资历程标签
    const fundingHTML = company.fundingRounds && company.fundingRounds.length > 0 ? `
        <div class="timeline" style="position: relative; padding-left: 30px;">
            <div style="position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: #e0e0e0;"></div>
            ${company.fundingRounds.map(round => `
                <div class="timeline-item" style="position: relative; margin-bottom: 25px;">
                    <div style="position: absolute; left: -24px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #667eea; border: 3px solid white; box-shadow: 0 0 0 2px #667eea;"></div>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                        <div style="font-size: 12px; color: #667eea; font-weight: 600; margin-bottom: 5px;">${round.date}</div>
                        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${round.round} - ${round.amount}</div>
                        <div style="font-size: 13px; color: #666;">投资方：${round.investors.join(', ')}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<p style="color: #999;">暂无融资信息</p>';
    
    document.getElementById('tab-funding').innerHTML = `
        <div class="detail-section">
            <h4>💼 融资概况</h4>
            <p><strong>总融资额：</strong>${company.funding}</p>
            <p><strong>主要投资方：</strong>${company.investors.join(', ')}</p>
        </div>
        <div class="detail-section">
            <h4>📅 融资历程</h4>
            ${fundingHTML}
        </div>
    `;
    
    // 相关链接标签
    document.getElementById('tab-links').innerHTML = `
        <div class="links-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${company.website ? `
                <a href="${company.website}" target="_blank" class="link-card" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #f8f9fa; border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.3s; border: 2px solid transparent;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">🌐</div>
                    <div>
                        <h5 style="font-size: 14px; color: #333; margin-bottom: 3px;">官方网站</h5>
                        <p style="font-size: 11px; color: #999;">访问主页</p>
                    </div>
                </a>
            ` : ''}
            ${company.github ? `
                <a href="${company.github}" target="_blank" class="link-card" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #f8f9fa; border-radius: 10px; text-decoration: none; color: inherit; transition: all 0.3s; border: 2px solid transparent;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">💻</div>
                    <div>
                        <h5 style="font-size: 14px; color: #333; margin-bottom: 3px;">GitHub</h5>
                        <p style="font-size: 11px; color: #999;">查看源码</p>
                    </div>
                </a>
            ` : ''}
        </div>
    `;
    
    // 显示模态框
    document.getElementById('detailModal').classList.add('active');
}

// 关闭模态框
function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// 模态框标签切换
document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    });
});

// 点击模态框外部关闭
document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') {
        closeModal();
    }
});

// 辅助函数
function getLayerText(layer) {
    const map = {
        'infrastructure': '基础设施',
        'llm': '大模型',
        'platform': '平台框架',
        'application': '应用'
    };
    return map[layer] || layer;
}

function getSceneText(scene) {
    const map = {
        'general': '通用',
        'horizontal': '水平场景',
        'function': '行业职能',
        'vertical': '行业垂直'
    };
    return map[scene] || scene;
}

function getRegionText(region) {
    const map = {
        'china': '国内',
        'overseas': '出海',
        'global': '海外'
    };
    return map[region] || region;
}
