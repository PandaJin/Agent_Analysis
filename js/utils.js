// js/utils.js — 通用辅助函数

export function ensureFeaturesArray(features) {
    if (Array.isArray(features)) return features;
    if (features == null || features === '') return [];
    return [String(features)];
}

export function ensureInvestorsArray(investors) {
    if (Array.isArray(investors)) return investors;
    if (investors == null || investors === '') return [];
    return [String(investors)];
}

export function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function getCompanyLogoHtml(company) {
    const fallbackText = (company.logo || (company.name || '').substring(0, 2));
    if (company.logoUrl) {
        return `<img src="${company.logoUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="logo-fallback" style="display:none;">${fallbackText}</span>`;
    }
    if (company.website) {
        try {
            const domain = new URL(company.website).hostname.replace(/^www\./, '');
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
            return `<img src="${faviconUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="logo-fallback" style="display:none;">${fallbackText}</span>`;
        } catch (_) {}
    }
    return fallbackText;
}

// --- Display helpers ---

export function getAgentTagDisplay(company) {
    return company.agentTag || '—';
}

export function getLayerText(layer, metadata) {
    const map = metadata?.categories?.layers || {
        infrastructure: '基础设施', llm: '大模型',
        platform: '平台框架', application: '应用'
    };
    return map[layer] || layer;
}

export function getSceneText(scene, metadata) {
    const map = metadata?.categories?.scenes || {
        general: '通用场景', horizontal: '水平场景',
        function: '行业职能', vertical: '行业垂直'
    };
    return map[scene] || scene;
}

export function getRegionText(region, metadata) {
    const map = metadata?.categories?.regions || {
        china: '国内', overseas: '出海', global: '海外'
    };
    return map[region] || region;
}

// --- Number formatting ---

export function formatNumber(n) {
    if (n == null || n === '' || n === 'N/A') return 'N/A';
    const num = Number(n);
    if (!Number.isFinite(num)) return String(n);
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(0) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
    return String(num);
}

export function formatARRDisplay(company) {
    if (company.arrProductMillion != null && Number.isFinite(company.arrProductMillion)) {
        const m = company.arrProductMillion;
        if (m >= 1000) return '$' + (m / 1000).toFixed(1) + 'B';
        if (m >= 1) return '$' + m.toFixed(0) + 'M';
        if (m > 0) return '$' + (m * 1000).toFixed(0) + 'K';
        return '$0';
    }
    return company.arr || 'N/A';
}

export function formatMAU(company) {
    if (company.mau && company.mau !== 'N/A') {
        return formatNumber(company.mau);
    }
    return 'N/A';
}

export function getCardDescription(company) {
    if (company.description && company.description.length >= 10) return company.description;
    const parts = [company.category, company.agentTagLevel3, company.agentTagLevel2].filter(Boolean);
    if (parts.length) return parts.join(' · ');
    return company.description || '（待补充）';
}

// --- Sorting ---

const AGENT_TAG_ORDER = {
    '基础设施层': 0, '大模型层': 1, '平台/框架层': 2,
    'Agent中间层': 3, 'Agent应用层': 4
};

export function parseARRValue(arrStr) {
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

export function getARRSortValue(c) {
    if (c.arrProductMillion != null && Number.isFinite(c.arrProductMillion)) return c.arrProductMillion;
    return parseARRValue(c.arr);
}

export function sortCompanies(list) {
    return [...list].sort((a, b) => {
        const orderA = AGENT_TAG_ORDER[a.agentTag] ?? 99;
        const orderB = AGENT_TAG_ORDER[b.agentTag] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const arrA = getARRSortValue(a);
        const arrB = getARRSortValue(b);
        if (arrA !== arrB) return arrB - arrA;
        return (a.name || '').localeCompare(b.name || '', 'zh');
    });
}

// --- AgentTag CSS class mapping ---

export function getAgentTagClass(agentTag) {
    if (!agentTag) return 'tag-agent';
    if (agentTag.includes('基础设施')) return 'tag-infra';
    if (agentTag.includes('大模型')) return 'tag-llm';
    if (agentTag.includes('平台') || agentTag.includes('框架')) return 'tag-platform';
    if (agentTag.includes('中间')) return 'tag-middle';
    return 'tag-agent';
}
