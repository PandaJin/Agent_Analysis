// 筛选功能模块 — v4.0 agentTag 三级联动 + 多维度筛选
import { getAllCompanies, getMetadata, setCompaniesData } from './data-loader.js';
import { sortCompanies } from './utils.js';

const AGENT_TAG_ORDER = ['基础设施层', '大模型层', '平台/框架层', 'Agent中间层', 'Agent应用层'];

let currentFilters = {
    agentTag: '',
    agentTagLevel2: '',
    agentTagLevel3: '',
    market: '',
    isChineseProduct: '',
    country: '',
    category: '',
    search: ''
};

let _searchTimer = null;

// --- Initialization ---

export function initializeFilters() {
    const metadata = getMetadata();
    buildAgentTagTabs(metadata);
    populateDropdown('marketFilter', metadata.markets || []);
    populateDropdown('chineseProductFilter', metadata.chineseProducts || []);
    populateDropdown('countryFilter', metadata.countries || []);
    populateDropdown('categoryFilter', metadata.categories || []);

    document.getElementById('marketFilter').addEventListener('change', e => { currentFilters.market = e.target.value; applyFilters(); });
    document.getElementById('chineseProductFilter').addEventListener('change', e => { currentFilters.isChineseProduct = e.target.value; applyFilters(); });
    document.getElementById('countryFilter').addEventListener('change', e => { currentFilters.country = e.target.value; applyFilters(); });
    document.getElementById('categoryFilter').addEventListener('change', e => { currentFilters.category = e.target.value; applyFilters(); });
    document.getElementById('searchInput').addEventListener('input', e => {
        clearTimeout(_searchTimer);
        _searchTimer = setTimeout(() => { currentFilters.search = e.target.value.trim().toLowerCase(); applyFilters(); }, 200);
    });

    applyFilters();
}

function populateDropdown(id, values) {
    const el = document.getElementById(id);
    if (!el) return;
    const first = el.options[0];
    el.innerHTML = '';
    el.appendChild(first);
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        el.appendChild(opt);
    });
}

// --- Agent Tag Tabs (Level 1) ---

function buildAgentTagTabs(metadata) {
    const container = document.getElementById('agentTagTabs');
    if (!container) return;
    const counts = metadata.agentTagCounts || {};
    const allBtn = createTabButton('', '全部', Object.values(counts).reduce((s, v) => s + v, 0), true);
    container.appendChild(allBtn);

    AGENT_TAG_ORDER.forEach(tag => {
        if (counts[tag]) {
            container.appendChild(createTabButton(tag, tag, counts[tag], false));
        }
    });
}

function createTabButton(value, label, count, isActive) {
    const btn = document.createElement('button');
    btn.className = 'filter-tab' + (isActive ? ' active' : '');
    btn.dataset.value = value;
    btn.innerHTML = `${label}<span class="tab-count">${count}</span>`;
    btn.addEventListener('click', () => setAgentTag(value));
    return btn;
}

function setAgentTag(value) {
    currentFilters.agentTag = value;
    currentFilters.agentTagLevel2 = '';
    currentFilters.agentTagLevel3 = '';
    currentFilters.market = '';
    currentFilters.isChineseProduct = '';
    currentFilters.country = '';
    currentFilters.category = '';

    document.querySelectorAll('#agentTagTabs .filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.value === value);
    });

    buildLevel2Chips(value);
    hideLevel3Chips();
    applyFilters();
}

// --- Level 2 Chips ---

function buildLevel2Chips(agentTag) {
    const container = document.getElementById('level2Chips');
    container.innerHTML = '';
    container.classList.remove('active');

    if (!agentTag) return;
    const tree = getMetadata().agentTagTree || {};
    const level2 = tree[agentTag];
    if (!level2 || !Object.keys(level2).length) return;

    const allCompanies = getAllCompanies();
    Object.keys(level2).sort((a, b) => a.localeCompare(b, 'zh')).forEach(key => {
        const count = allCompanies.filter(c => c.agentTag === agentTag && c.agentTagLevel2 === key).length;
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.dataset.value = key;
        chip.innerHTML = `${key}<span class="chip-count">${count}</span>`;
        chip.addEventListener('click', () => setLevel2(key));
        container.appendChild(chip);
    });
    container.classList.add('active');
}

function setLevel2(value) {
    currentFilters.agentTagLevel2 = currentFilters.agentTagLevel2 === value ? '' : value;
    currentFilters.agentTagLevel3 = '';

    document.querySelectorAll('#level2Chips .filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value === currentFilters.agentTagLevel2);
    });

    if (currentFilters.agentTagLevel2) {
        buildLevel3Chips(currentFilters.agentTag, currentFilters.agentTagLevel2);
    } else {
        hideLevel3Chips();
    }
    applyFilters();
}

// --- Level 3 Chips ---

function buildLevel3Chips(agentTag, level2) {
    const container = document.getElementById('level3Chips');
    container.innerHTML = '';
    container.classList.remove('active');

    const tree = getMetadata().agentTagTree || {};
    const level3 = tree[agentTag]?.[level2];
    if (!level3 || !Object.keys(level3).length) return;

    Object.entries(level3).sort((a, b) => b[1] - a[1]).forEach(([key, count]) => {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.dataset.value = key;
        chip.innerHTML = `${key}<span class="chip-count">${count}</span>`;
        chip.addEventListener('click', () => setLevel3(key));
        container.appendChild(chip);
    });
    container.classList.add('active');
}

function setLevel3(value) {
    currentFilters.agentTagLevel3 = currentFilters.agentTagLevel3 === value ? '' : value;
    document.querySelectorAll('#level3Chips .filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value === currentFilters.agentTagLevel3);
    });
    applyFilters();
}

function hideLevel3Chips() {
    const container = document.getElementById('level3Chips');
    container.innerHTML = '';
    container.classList.remove('active');
}

// --- Apply Filters ---

function matchSearch(c, q) {
    const fields = [
        c.name, c.nameEn, c.company, c.description,
        c.agentTag, c.agentTagLevel2, c.agentTagLevel3,
        c.category, c.country,
        c.tencentTrack1, c.tencentTrack2, c.tencentTrack3,
        ...(Array.isArray(c.features) ? c.features : [])
    ];
    return fields.some(f => f && String(f).toLowerCase().includes(q));
}

export function applyFilters() {
    const allCompanies = getAllCompanies();
    if (!allCompanies.length) return;

    const baseSet = allCompanies.filter(c => {
        if (currentFilters.agentTag && c.agentTag !== currentFilters.agentTag) return false;
        if (currentFilters.agentTagLevel2 && c.agentTagLevel2 !== currentFilters.agentTagLevel2) return false;
        if (currentFilters.agentTagLevel3 && c.agentTagLevel3 !== currentFilters.agentTagLevel3) return false;
        if (currentFilters.search && !matchSearch(c, currentFilters.search)) return false;
        return true;
    });

    updateDropdownOptions(baseSet);

    const filtered = baseSet.filter(c => {
        if (currentFilters.market && c.market !== currentFilters.market) return false;
        if (currentFilters.isChineseProduct && c.isChineseProduct !== currentFilters.isChineseProduct) return false;
        if (currentFilters.country && c.country !== currentFilters.country) return false;
        if (currentFilters.category && c.category !== currentFilters.category) return false;
        return true;
    });

    const sorted = sortCompanies(filtered);
    setCompaniesData(sorted);

    if (window.app?.renderCompanies) window.app.renderCompanies(sorted);
    updateStatistics();
}

function updateDropdownOptions(baseSet) {
    const markets = new Set();
    const chineseProducts = new Set();
    const countries = new Set();
    const categories = new Set();

    baseSet.forEach(c => {
        if (c.market) markets.add(c.market);
        if (c.isChineseProduct) chineseProducts.add(c.isChineseProduct);
        if (c.country) countries.add(c.country);
        if (c.category) categories.add(c.category);
    });

    syncDropdown('marketFilter', [...markets].sort(), currentFilters, 'market');
    syncDropdown('chineseProductFilter', [...chineseProducts].sort(), currentFilters, 'isChineseProduct');
    syncDropdown('countryFilter', [...countries].sort((a, b) => a.localeCompare(b, 'zh')), currentFilters, 'country');
    syncDropdown('categoryFilter', [...categories].sort((a, b) => a.localeCompare(b, 'zh')), currentFilters, 'category');
}

function syncDropdown(id, values, filters, filterKey) {
    const el = document.getElementById(id);
    if (!el) return;
    const prev = filters[filterKey];
    el.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = '全部';
    el.appendChild(allOpt);
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        el.appendChild(opt);
    });
    if (prev && values.includes(prev)) {
        el.value = prev;
    } else {
        el.value = '';
        filters[filterKey] = '';
    }
    el.disabled = values.length === 0;
}

export function updateStatistics() {
    const el = document.getElementById('filteredCount');
    if (el) el.textContent = getMetadata() ? (window.app?.getCompaniesData?.()?.length ?? 0) : 0;
}
