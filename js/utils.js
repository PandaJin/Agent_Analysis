// js/utils.js
// 通用辅助函数模块

/** 将 features 规范为数组（数据里可能是字符串） */
export function ensureFeaturesArray(features) {
    if (Array.isArray(features)) return features;
    if (features == null || features === '') return [];
    return [String(features)];
}

/** 将 investors 规范为数组 */
export function ensureInvestorsArray(investors) {
    if (Array.isArray(investors)) return investors;
    if (investors == null || investors === '') return [];
    return [String(investors)];
}

/** HTML 转义 */
export function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/** 生成公司 Logo HTML：优先 logoUrl → 网站 favicon → 文字缩写 */
export function getCompanyLogoHtml(company) {
    if (company.logoUrl) {
        return `<img src="${company.logoUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="logo-fallback" style="display:none;">${(company.logo || company.name || '').substring(0, 2)}</span>`;
    }
    if (company.website) {
        try {
            const domain = new URL(company.website).hostname.replace(/^www\./, '');
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
            return `<img src="${faviconUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="logo-fallback" style="display:none;">${(company.logo || company.name || '').substring(0, 2)}</span>`;
        } catch (e) {}
    }
    return (company.logo || (company.name || '').substring(0, 2));
}

// 辅助函数，用于将内部key映射为显示文本 (从metadata中加载)
export function getLayerText(layer, metadata) {
    const map = metadata?.categories?.layers || {
        'infrastructure': '基础设施',
        'llm': '大模型',
        'platform': '平台框架',
        'application': '应用'
    };
    return map[layer] || layer;
}

export function getSceneText(scene, metadata) {
    const map = metadata?.categories?.scenes || {
        'general': '通用场景',
        'horizontal': '水平场景',
        'function': '行业职能',
        'vertical': '行业垂直'
    };
    return map[scene] || scene;
}

export function getRegionText(region, metadata) {
    const map = metadata?.categories?.regions || {
        'china': '国内',
        'overseas': '出海',
        'global': '海外'
    };
    return map[region] || region;
}

// ARR值解析函数
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

// 公司排序函数
const LAYER_ORDER = { infrastructure: 0, llm: 1, platform: 2, application: 3 };
export function sortCompanies(list) {
    return [...list].sort((a, b) => {
        const orderA = LAYER_ORDER[a.layer] ?? 99;
        const orderB = LAYER_ORDER[b.layer] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const arrA = parseARRValue(a.arr);
        const arrB = parseARRValue(b.arr);
        if (arrA !== arrB) return arrB - arrA;
        return (a.name || '').localeCompare(b.name || '', 'zh');
    });
}
