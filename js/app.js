// 核心应用逻辑 — v4.0 分页 + 内容适配
import {
    ensureFeaturesArray, ensureInvestorsArray, escapeHtml,
    getCompanyLogoHtml, getAgentTagDisplay, getAgentTagClass,
    formatARRDisplay, formatMAU, formatNumber, getCardDescription,
    getRegionText
} from './utils.js';
import { getMetadata, getAllCompanies } from './data-loader.js';

const PAGE_SIZE = 40;
const SHOW_TENCENT_TRACK = false;
let _currentList = [];
let _displayedCount = 0;

// --- Card Rendering with Pagination ---

export function renderCompanies(companies) {
    const container = document.getElementById('playersContainer');
    _currentList = companies;
    _displayedCount = 0;
    container.innerHTML = '';

    if (!companies || !companies.length) {
        container.innerHTML = `<div class="empty-state"><h3>未找到匹配的产品</h3><p>尝试调整筛选条件或搜索关键词</p></div>`;
        document.getElementById('loadMoreWrap').style.display = 'none';
        return;
    }

    appendNextPage();
}

function appendNextPage() {
    const container = document.getElementById('playersContainer');
    const start = _displayedCount;
    const end = Math.min(start + PAGE_SIZE, _currentList.length);
    const batch = _currentList.slice(start, end);

    container.insertAdjacentHTML('beforeend', batch.map(cardTemplate).join(''));
    _displayedCount = end;
    updateLoadMoreButton();
}

export function loadMore() {
    appendNextPage();
}

function updateLoadMoreButton() {
    const wrap = document.getElementById('loadMoreWrap');
    const btn = document.getElementById('loadMoreBtn');
    if (_displayedCount < _currentList.length) {
        wrap.style.display = '';
        btn.textContent = `加载更多（已显示 ${_displayedCount} / ${_currentList.length}）`;
    } else {
        wrap.style.display = 'none';
    }
}

// --- Card Template ---

function cardTemplate(c) {
    const arrDisplay = formatARRDisplay(c);
    const mauDisplay = formatMAU(c);
    const desc = escapeHtml(getCardDescription(c));
    const tagClass = getAgentTagClass(c.agentTag);
    const companyLine = [c.company, c.country].filter(Boolean).join(' · ');
    const level2 = c.agentTagLevel2 || '';
    const market = c.market || '';
    const category = c.category || '';

    return `
    <div class="player-card" onclick="window.app.showCompanyDetail(${c.id}, window.app.getAllCompanies())">
        <div class="card-top">
            <div class="card-logo">${getCompanyLogoHtml(c)}</div>
            <div class="card-title-area">
                <div class="card-name">${escapeHtml(c.name)}</div>
                <div class="card-company">${escapeHtml(companyLine || c.nameEn || '')}</div>
            </div>
            ${arrDisplay !== 'N/A' ? `<div class="card-arr-badge">${arrDisplay}</div>` : ''}
        </div>
        <div class="card-tags">
            <span class="card-tag ${tagClass}">${escapeHtml(c.agentTag || '—')}</span>
            ${level2 ? `<span class="card-tag tag-level2">${escapeHtml(level2)}</span>` : ''}
            ${market ? `<span class="card-tag tag-market">${escapeHtml(market)}</span>` : ''}
            ${category ? `<span class="card-tag tag-category">${escapeHtml(category)}</span>` : ''}
        </div>
        <div class="card-desc">${desc}</div>
        <div class="card-metrics">
            <div class="card-metric">
                <div class="card-metric-label">ARR</div>
                <div class="card-metric-value">${arrDisplay}</div>
            </div>
            <div class="card-metric">
                <div class="card-metric-label">MAU</div>
                <div class="card-metric-value">${mauDisplay}</div>
            </div>
        </div>
    </div>`;
}

// --- Detail Modal ---

export function showCompanyDetail(companyId, allCompanies) {
    const company = allCompanies.find(c => c.id === companyId);
    if (!company) return;

    document.getElementById('modalTitle').textContent = company.name || '';
    document.getElementById('modalSubtitle').textContent =
        [company.nameEn, company.company, company.founded ? `成立于 ${company.founded}` : ''].filter(Boolean).join(' · ') || '—';

    renderOverviewTab(company);
    renderBusinessTab(company);
    renderFundingTab(company);
    renderLinksTab(company);

    // Reset to overview tab
    document.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'overview'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === 'tab-overview'));

    document.getElementById('detailModal').classList.add('active');
}

function renderOverviewTab(c) {
    const breadcrumbs = [c.agentTag, c.agentTagLevel2, c.agentTagLevel3].filter(Boolean);
    const bcHtml = breadcrumbs.length
        ? `<div class="detail-breadcrumb">${breadcrumbs.map(b => `<span>${escapeHtml(b)}</span>`).join('<span class="bc-sep">›</span>')}</div>`
        : '';

    let ttHtml = '';
    if (SHOW_TENCENT_TRACK) {
        const tencentTrack = [c.tencentTrack1, c.tencentTrack2, c.tencentTrack3, c.tencentTrack4, c.tencentTrack5, c.tencentTrack6].filter(Boolean);
        ttHtml = tencentTrack.length
            ? `<div class="detail-section"><h4>☁️ 腾讯云赛道</h4><div class="detail-breadcrumb">${tencentTrack.map(t => `<span>${escapeHtml(t)}</span>`).join('<span class="bc-sep">›</span>')}</div></div>`
            : '';
    }

    document.getElementById('tab-overview').innerHTML = `
        ${bcHtml ? `<div class="detail-section"><h4>🏷️ Agent 标签</h4>${bcHtml}</div>` : ''}
        ${c.company ? `<div class="detail-section"><h4>🏢 公司</h4><p>${escapeHtml(c.company)}</p></div>` : ''}
        <div class="detail-section">
            <h4>📝 简介</h4>
            <p>${escapeHtml(c.description || '（待补充）')}</p>
        </div>
        ${ensureFeaturesArray(c.features).length ? `
        <div class="detail-section">
            <h4>✨ 核心功能</h4>
            <ul class="detail-feature-list">${ensureFeaturesArray(c.features).map(f => `<li>${escapeHtml(String(f))}</li>`).join('')}</ul>
        </div>` : ''}
        ${ttHtml}
    `;
}

function renderBusinessTab(c) {
    const arrDisplay = formatARRDisplay(c);
    const mauDisplay = formatMAU(c);
    const arrWeb = c.arrWebMillion != null ? `$${c.arrWebMillion}M` : '';
    const arrApp = c.arrAppMillion != null ? `$${c.arrAppMillion}M` : '';

    document.getElementById('tab-business').innerHTML = `
        <div class="metrics-grid-detail">
            <div class="metric-card-detail"><div class="label">ARR</div><div class="value">${arrDisplay}</div></div>
            <div class="metric-card-detail"><div class="label">MAU</div><div class="value">${mauDisplay}</div></div>
            <div class="metric-card-detail user-type"><div class="label">用户类型</div><div class="value">${escapeHtml(c.userType || '—')}</div></div>
        </div>
        ${(c.arrWebMillion != null || c.arrAppMillion != null) ? `
        <div class="detail-section">
            <h4>📊 收入拆分</h4>
            <p><strong>产品收入 ARR：</strong>${c.arrProductMillion != null ? `$${c.arrProductMillion}M` : '—'}</p>
            ${arrWeb ? `<p><strong>Web 收入 ARR：</strong>${arrWeb}</p>` : ''}
            ${arrApp ? `<p><strong>APP 收入 ARR：</strong>${arrApp}</p>` : ''}
        </div>` : ''}
        ${(c.country || c.isChineseProduct || c.category || c.market) ? `
        <div class="detail-section">
            <h4>🌐 市场与分类</h4>
            ${c.market ? `<p><strong>市场：</strong>${escapeHtml(c.market)}</p>` : ''}
            ${c.country ? `<p><strong>国家：</strong>${escapeHtml(c.country)}</p>` : ''}
            ${c.isChineseProduct ? `<p><strong>华人产品：</strong>${escapeHtml(c.isChineseProduct)}</p>` : ''}
            ${c.category ? `<p><strong>分类：</strong>${escapeHtml(c.category)}</p>` : ''}
        </div>` : ''}
        <div class="detail-section">
            <h4>💰 定价信息</h4>
            <p><strong>付费模式：</strong>${escapeHtml(c.pricingModel || '—')}</p>
            <p><strong>价格区间：</strong>${escapeHtml(c.pricingRange || '—')}</p>
        </div>
    `;
}

function renderFundingTab(c) {
    const fundingHTML = c.fundingRounds?.length ? `
        <div class="timeline">${c.fundingRounds.map(r => `
            <div class="timeline-item"><div class="timeline-item-content">
                <div class="timeline-item-date">${r.date}</div>
                <div class="timeline-item-round-amount">${r.round} - ${r.amount}</div>
                <div class="timeline-item-investors">投资方：${ensureInvestorsArray(r.investors).map(i => escapeHtml(String(i))).join(', ')}</div>
            </div></div>`).join('')}
        </div>` : '<p class="text-light">暂无融资信息</p>';

    document.getElementById('tab-funding').innerHTML = `
        <div class="detail-section">
            <h4>💼 融资概况</h4>
            <p><strong>总融资额：</strong>${escapeHtml(c.funding || '—')}</p>
            <p><strong>主要投资方：</strong>${ensureInvestorsArray(c.investors).map(i => escapeHtml(String(i))).join(', ') || '—'}</p>
        </div>
        <div class="detail-section"><h4>📅 融资历程</h4>${fundingHTML}</div>
    `;
}

function renderLinksTab(c) {
    document.getElementById('tab-links').innerHTML = `
        <div class="links-grid-detail">
            ${c.website ? `<a href="${c.website}" target="_blank" class="link-card-detail"><div class="icon">🌐</div><div><div class="title">官方网站</div><p class="description">访问主页</p></div></a>` : ''}
            ${c.github ? `<a href="${c.github}" target="_blank" class="link-card-detail"><div class="icon">💻</div><div><div class="title">GitHub</div><p class="description">查看源码</p></div></a>` : ''}
        </div>
        ${!c.website && !c.github ? '<p class="text-light">暂无链接</p>' : ''}
    `;
}

export function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Modal tab switching & close on backdrop
document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

document.getElementById('detailModal')?.addEventListener('click', e => {
    if (e.target.id === 'detailModal') closeModal();
});

document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    if (window.app?.loadMore) window.app.loadMore();
});

// --- Back to Top & Sticky Search ---

const backToTopBtn = document.getElementById('backToTop');
const searchSection = document.querySelector('.search-section');
let _ticking = false;

function onScroll() {
    if (_ticking) return;
    _ticking = true;
    requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', scrollY > 400);
        }

        if (searchSection) {
            searchSection.classList.toggle('scrolled', scrollY > 120);
        }

        _ticking = false;
    });
}

window.addEventListener('scroll', onScroll, { passive: true });

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
