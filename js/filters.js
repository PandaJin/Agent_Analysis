// 筛选功能模块 - v3.0
// 第一级：技术栈 → 第二级：层级细分/应用场景 → 第三级：仅应用场景细分

let currentFilters = {
    layer: '',
    scene: '',
    region: '',
    model: '',
    modelSub: '',
    subScene: '',
    search: ''
};

// 应用场景（仅应用层时在第二级展示）的选项
const sceneLabels = {
    'general': '通用场景',
    'horizontal': '水平场景',
    'function': '行业职能',
    'vertical': '行业垂直'
};

// 商业模式二级分类（与 metadata 一致，可后续改为从 metadata 读取）
const modelSubCategories = {
    '2b': {
        'saas': 'SaaS订阅',
        'private': '私有化部署',
        'api': 'API调用计费',
        'project': '项目制咨询',
        'platform': '平台授权'
    },
    '2c': {
        'freemium': '免费+会员',
        'subscription': '订阅制',
        'ads': '广告模式',
        'iap': '应用内购买'
    },
    '2b2c': {
        'hybrid': '混合订阅',
        'platform': '平台抽成',
        'ecosystem': '生态分成'
    }
};

// 初始化筛选器
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.layer-tab').forEach(btn => {
        btn.addEventListener('click', () => setLayer(btn.dataset.layer || ''));
    });
    document.getElementById('regionFilter').addEventListener('change', handleFilterChange);
    document.getElementById('modelFilter').addEventListener('change', handleModelChange);
    document.getElementById('searchInput').addEventListener('input', handleSearchChange);
});

function handleFilterChange(e) {
    const filterId = e.target.id;
    const value = e.target.value;
    if (filterId === 'regionFilter') currentFilters.region = value;
    else if (filterId === 'modelFilter') currentFilters.model = value;
    applyFilters();
}

function setLayer(value) {
    const metadata = window.metadata || {};
    currentFilters.layer = value;
    currentFilters.scene = '';
    currentFilters.subScene = '';

    document.querySelectorAll('.layer-tab').forEach(t => {
        t.classList.toggle('active', (t.dataset.layer || '') === value);
        t.setAttribute('aria-selected', (t.dataset.layer || '') === value ? 'true' : 'false');
    });

    const subFiltersEl = document.getElementById('subFilters');
    const sceneSubFiltersEl = document.getElementById('sceneSubFilters');
    sceneSubFiltersEl.classList.remove('active');
    sceneSubFiltersEl.innerHTML = '';

    if (!value) {
        subFiltersEl.classList.remove('active');
        subFiltersEl.innerHTML = '';
        applyFilters();
        return;
    }

    if (value === 'application') {
        subFiltersEl.innerHTML = Object.entries(sceneLabels).map(([key, label]) =>
            `<button type="button" class="chip sub-filter-chip" data-value="${key}" data-type="scene">${label}</button>`
        ).join('');
        subFiltersEl.classList.add('active');
        subFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => handleSubFilterClick(chip.dataset.value, 'scene'));
        });
    } else if (metadata.subScenes && metadata.subScenes[value]) {
        const subScenes = metadata.subScenes[value];
        subFiltersEl.innerHTML = Object.entries(subScenes).map(([key, label]) =>
            `<button type="button" class="chip sub-filter-chip" data-value="${key}" data-type="layerSub">${label}</button>`
        ).join('');
        subFiltersEl.classList.add('active');
        subFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => handleSubFilterClick(chip.dataset.value, 'layerSub'));
        });
    } else {
        subFiltersEl.classList.remove('active');
        subFiltersEl.innerHTML = '';
    }
    applyFilters();
}

function handleSubFilterClick(value, type) {
    const subFiltersEl = document.getElementById('subFilters');
    const sceneSubFiltersEl = document.getElementById('sceneSubFilters');

    if (type === 'layerSub') {
        currentFilters.scene = '';
        currentFilters.subScene = currentFilters.subScene === value ? '' : value;
        sceneSubFiltersEl.classList.remove('active');
        sceneSubFiltersEl.innerHTML = '';
        subFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-value') === currentFilters.subScene);
        });
    } else if (type === 'scene') {
        currentFilters.subScene = '';
        currentFilters.scene = currentFilters.scene === value ? '' : value;
        subFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-value') === currentFilters.scene);
        });
        // 第三级：仅当应用层且选了有细分的场景时展示
        const metadata = window.metadata || {};
        if (currentFilters.scene && metadata.subScenes && metadata.subScenes[currentFilters.scene]) {
            const subScenes = metadata.subScenes[currentFilters.scene];
            sceneSubFiltersEl.innerHTML = Object.entries(subScenes).map(([key, label]) =>
                `<button type="button" class="chip sub-filter-chip" data-value="${key}" data-type="sceneSub">${label}</button>`
            ).join('');
            sceneSubFiltersEl.classList.add('active');
            sceneSubFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
                chip.addEventListener('click', () => handleSubFilterClick(chip.dataset.value, 'sceneSub'));
            });
        } else {
            sceneSubFiltersEl.classList.remove('active');
            sceneSubFiltersEl.innerHTML = '';
        }
    } else if (type === 'sceneSub') {
        currentFilters.subScene = currentFilters.subScene === value ? '' : value;
        sceneSubFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-value') === currentFilters.subScene);
        });
    } else if (type === 'model') {
        currentFilters.modelSub = currentFilters.modelSub === value ? '' : value;
        document.querySelectorAll('#modelSubFilters .sub-filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-value') === currentFilters.modelSub);
        });
    }

    applyFilters();
}

function handleModelChange(e) {
    const value = e.target.value;
    currentFilters.model = value;
    currentFilters.modelSub = '';

    const modelSubEl = document.getElementById('modelSubFilters');
    const metadata = window.metadata || {};
    const categories = modelSubCategories[value] || (metadata.modelSubCategories && metadata.modelSubCategories[value]);
    if (value && categories) {
        modelSubEl.innerHTML = Object.entries(categories).map(([key, label]) =>
            `<button type="button" class="chip sub-filter-chip" data-value="${key}" data-type="model">${label}</button>`
        ).join('');
        modelSubEl.classList.add('active');
        modelSubEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => handleSubFilterClick(chip.dataset.value, 'model'));
        });
    } else {
        modelSubEl.classList.remove('active');
        modelSubEl.innerHTML = '';
    }
    applyFilters();
}

function handleSearchChange(e) {
    currentFilters.search = e.target.value.toLowerCase();
    applyFilters();
}

// 应用所有筛选条件
function applyFilters() {
    const allCompanies = window.allCompanies || [];
    if (!allCompanies.length) {
        console.warn('⚠️ allCompanies not ready yet');
        return;
    }
    
    let filtered = [...allCompanies];

    if (currentFilters.layer) {
        filtered = filtered.filter(c => c.layer === currentFilters.layer);
    }
    // 非应用层：按层级细分（subScene）筛选
    if (currentFilters.layer && currentFilters.layer !== 'application' && currentFilters.subScene) {
        filtered = filtered.filter(c => c.subScene === currentFilters.subScene);
    }
    // 应用层：按应用场景（scene）筛选
    if (currentFilters.layer === 'application' && currentFilters.scene) {
        filtered = filtered.filter(c => c.scene === currentFilters.scene);
    }
    // 应用层：按场景细分（subScene）筛选
    if (currentFilters.layer === 'application' && currentFilters.subScene) {
        filtered = filtered.filter(c => c.subScene === currentFilters.subScene);
    }

    if (currentFilters.region) {
        filtered = filtered.filter(c => c.region === currentFilters.region);
    }
    if (currentFilters.model) {
        filtered = filtered.filter(c => c.model === currentFilters.model);
    }
    if (currentFilters.modelSub) {
        filtered = filtered.filter(c => c.modelSub === currentFilters.modelSub);
    }
    if (currentFilters.search) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(currentFilters.search) ||
            (c.nameEn && c.nameEn.toLowerCase().includes(currentFilters.search)) ||
            c.description.toLowerCase().includes(currentFilters.search) ||
            (Array.isArray(c.features) ? c.features.some(f => String(f).toLowerCase().includes(currentFilters.search)) : (c.features && String(c.features).toLowerCase().includes(currentFilters.search)))
        );
    }

    filtered = typeof window.sortCompanies === 'function' ? window.sortCompanies(filtered) : filtered;
    window.companiesData = filtered;

    if (typeof renderCompanies === 'function') {
        renderCompanies(filtered);
    } else {
        console.error('❌ renderCompanies function not found');
    }
    
    document.getElementById('filteredCount').textContent = filtered.length;
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
}