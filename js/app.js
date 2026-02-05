// 核心应用逻辑
import {
    ensureFeaturesArray,
    ensureInvestorsArray,
    escapeHtml,
    getCompanyLogoHtml,
    getLayerText,
    getSceneText,
    getRegionText
} from './utils.js';
import { getMetadata } from './data-loader.js';

// 渲染公司卡片
export function renderCompanies(companies) {
    const container = document.getElementById('playersContainer');
    const metadata = getMetadata();
    
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
        <div class="player-card" onclick="window.app.showCompanyDetail(${company.id}, window.app.getAllCompanies())">
            <div class="card-header">
                <div class="company-logo">${getCompanyLogoHtml(company)}</div>
                <div class="company-info">
                    <h3>${company.name}</h3>
                    <div class="company-name-en">${company.nameEn}</div>
                    <div class="tags">
                        <span class="tag layer">${getLayerText(company.layer, metadata)}</span>
                        ${company.scene ? `<span class="tag scene">${getSceneText(company.scene, metadata)}</span>` : ''}
                        <span class="tag region">${getRegionText(company.region, metadata)}</span>
                        <span class="tag model">${(company.model || '').toUpperCase()}</span>
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
export function showCompanyDetail(companyId, allCompanies) {
    const company = allCompanies.find(c => c.id === companyId);
    if (!company) return;
    
    const metadata = getMetadata(); // Get metadata here as well
    // Set title
    document.getElementById('modalTitle').textContent = company.name || '';
    document.getElementById('modalSubtitle').textContent = [company.nameEn, company.founded ? `成立于 ${company.founded}` : ''].filter(Boolean).join(' | ') || '—';
    
    // Overview tab
    document.getElementById('tab-overview').innerHTML = `
        <div class="detail-section">
            <h4>📝 公司简介</h4>
            <p>${escapeHtml(company.description || '')}</p>
        </div>
        <div class="detail-section">
            <h4>✨ 核心功能</h4>
            <ul class="detail-feature-list">
                ${ensureFeaturesArray(company.features).map(f => `<li>${escapeHtml(String(f))}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Business info tab
    document.getElementById('tab-business').innerHTML = `
        <div class="metrics-grid-detail">
            <div class="metric-card-detail">
                <div class="label">ARR</div>
                <div class="value">${company.arr}</div>
            </div>
            <div class="metric-card-detail">
                <div class="label">MAU</div>
                <div class="value">${company.mau}</div>
            </div>
            <div class="metric-card-detail user-type">
                <div class="label">用户类型</div>
                <div class="value">${escapeHtml(company.userType || '')}</div>
            </div>
        </div>
        <div class="detail-section detail-info-section">
            <h4>💰 定价信息</h4>
            <p><strong>付费模式：</strong>${escapeHtml(company.pricingModel || '')}</p>
            <p><strong>价格区间：</strong>${escapeHtml(company.pricingRange || '')}</p>
        </div>
    `;
    
    // Funding history tab
    const fundingHTML = company.fundingRounds && company.fundingRounds.length > 0 ? `
        <div class="timeline">
            ${company.fundingRounds.map(round => `
                <div class="timeline-item">
                    <div class="timeline-item-content">
                        <div class="timeline-item-date">${round.date}</div>
                        <div class="timeline-item-round-amount">${round.round} - ${round.amount}</div>
                        <div class="timeline-item-investors">投资方：${ensureInvestorsArray(round.investors).map(i => escapeHtml(String(i))).join(', ')}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<p class="text-light">暂无融资信息</p>';
    
    const investorsList = ensureInvestorsArray(company.investors);
    document.getElementById('tab-funding').innerHTML = `
        <div class="detail-section">
            <h4>💼 融资概况</h4>
            <p><strong>总融资额：</strong>${escapeHtml(company.funding || '')}</p>
            <p><strong>主要投资方：</strong>${investorsList.map(i => escapeHtml(String(i))).join(', ')}</p>
        </div>
        <div class="detail-section">
            <h4>📅 融资历程</h4>
            ${fundingHTML}
        </div>
    `;
    
    // Related links tab
    document.getElementById('tab-links').innerHTML = `
        <div class="links-grid-detail">
            ${company.website ? `
                <a href="${company.website}" target="_blank" class="link-card-detail">
                    <div class="icon">🌐</div>
                    <div>
                        <h5 class="title">官方网站</h5>
                        <p class="description">访问主页</p>
                    </div>
                </a>
            ` : ''}
            ${company.github ? `
                <a href="${company.github}" target="_blank" class="link-card-detail">
                    <div class="icon">💻</div>
                    <div>
                        <h5 class="title">GitHub</h5>
                        <p class="description">查看源码</p>
                    </div>
                </a>
            ` : ''}
        </div>
    `;
    
    // Show modal
    document.getElementById('detailModal').classList.add('active');
}

// Close modal
export function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Modal tab switching
document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    });
});

// Close modal when clicking outside
document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') {
        closeModal();
    }
});