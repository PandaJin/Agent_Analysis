// 筛选功能模块 - v2.0
// 新增：商业模式二级筛选

let currentFilters = {
    layer: '',
    scene: '',
    region: '',
    model: '',
    modelSub: '',  // 新增：商业模式二级筛选
    subScene: '',
    search: ''
};

// 商业模式二级分类定义
const modelSubCategories = {
    '2b': {
        'saas': 'SaaS订阅',
        'private': '私有化部署',
        'api': 'API调用计费',
        'project': '项目制咨询'
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
    // 主筛选器事件
    document.getElementById('layerFilter').addEventListener('change', handleFilterChange);
    document.getElementById('sceneFilter').addEventListener('change', handleSceneChange);
    document.getElementById('regionFilter').addEventListener('change', handleFilterChange);
    document.getElementById('modelFilter').addEventListener('change', handleModelChange);  // 修改：添加商业模式变化处理
    document.getElementById('searchInput').addEventListener('input', handleSearchChange);
});

function handleFilterChange(e) {
    const filterId = e.target.id;
    const value = e.target.value;
    
    if (filterId === 'layerFilter') currentFilters.layer = value;
    else if (filterId === 'regionFilter') currentFilters.region = value;
    
    applyFilters();
}

function handleSceneChange(e) {
    const value = e.target.value;
    currentFilters.scene = value;
    currentFilters.subScene = ''; // 重置二级筛选
    
    // 显示/隐藏场景二级筛选
    const subFiltersContainer = document.getElementById('subFilters');
    if (value && metadata.subScenes && metadata.subScenes[value]) {
        renderSubFilters(value, 'scene');
        subFiltersContainer.classList.add('active');
    } else {
        subFiltersContainer.classList.remove('active');
    }
    
    applyFilters();
}

// 新增：处理商业模式变化
function handleModelChange(e) {
    const value = e.target.value;
    currentFilters.model = value;
    currentFilters.modelSub = ''; // 重置二级筛选
    
    // 显示/隐藏商业模式二级筛选
    const modelSubContainer = document.getElementById('modelSubFilters');
    if (!modelSubContainer) {
        // 如果容器不存在，创建它
        const container = document.createElement('div');
        container.id = 'modelSubFilters';
        container.className = 'sub-filters';
        document.getElementById('subFilters').parentNode.insertBefore(
            container, 
            document.getElementById('subFilters').nextSibling
        );
    }
    
    const modelSubContainer2 = document.getElementById('modelSubFilters');
    if (value && modelSubCategories[value]) {
        renderModelSubFilters(value);
        modelSubContainer2.classList.add('active');
    } else {
        modelSubContainer2.classList.remove('active');
    }
    
    applyFilters();
}

function handleSearchChange(e) {
    currentFilters.search = e.target.value.toLowerCase();
    applyFilters();
}

// 渲染场景二级筛选器
function renderSubFilters(scene, type) {
    const subFiltersContainer = document.getElementById('subFilters');
    const subScenes = metadata.subScenes[scene];
    
    if (!subScenes) return;
    
    subFiltersContainer.innerHTML = Object.entries(subScenes).map(([key, label]) => `
        <div class="sub-filter-chip" data-value="${key}" onclick="handleSubFilterClick('${key}', 'scene')">
            ${label}
        </div>
    `).join('');
}

// 新增：渲染商业模式二级筛选器
function renderModelSubFilters(model) {
    const container = document.getElementById('modelSubFilters');
    const subCategories = modelSubCategories[model];
    
    if (!subCategories) return;
    
    container.innerHTML = `
        <div style="padding: 10px 0; color: #666; font-size: 12px; font-weight: 600;">
            💼 商业模式细分：
        </div>
    ` + Object.entries(subCategories).map(([key, label]) => `
        <div class="sub-filter-chip" data-value="${key}" data-type="model" onclick="handleSubFilterClick('${key}', 'model')">
            ${label}
        </div>
    `).join('');
}

// 修改：支持不同类型的二级筛选
function handleSubFilterClick(value, type) {
    if (type === 'scene') {
        // 切换选中状态
        if (currentFilters.subScene === value) {
            currentFilters.subScene = '';
        } else {
            currentFilters.subScene = value;
        }
        
        // 更新UI
        document.querySelectorAll('#subFilters .sub-filter-chip').forEach(chip => {
            if (chip.getAttribute('data-value') === currentFilters.subScene) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    } else if (type === 'model') {
        // 商业模式二级筛选
        if (currentFilters.modelSub === value) {
            currentFilters.modelSub = '';
        } else {
            currentFilters.modelSub = value;
        }
        
        // 更新UI
        document.querySelectorAll('#modelSubFilters .sub-filter-chip').forEach(chip => {
            if (chip.getAttribute('data-value') === currentFilters.modelSub) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }
    
    applyFilters();
}

// 应用所有筛选条件
function applyFilters() {
    let filtered = [...allCompanies];
    
    // 层级筛选
    if (currentFilters.layer) {
        filtered = filtered.filter(c => c.layer === currentFilters.layer);
    }
    
    // 场景筛选
    if (currentFilters.scene) {
        filtered = filtered.filter(c => c.scene === currentFilters.scene);
    }
    
    // 二级场景筛选
    if (currentFilters.subScene) {
        filtered = filtered.filter(c => c.subScene === currentFilters.subScene);
    }
    
    // 地域筛选
    if (currentFilters.region) {
        filtered = filtered.filter(c => c.region === currentFilters.region);
    }
    
    // 商业模式筛选
    if (currentFilters.model) {
        filtered = filtered.filter(c => c.model === currentFilters.model);
    }
    
    // 新增：商业模式二级筛选
    if (currentFilters.modelSub) {
        filtered = filtered.filter(c => c.modelSub === currentFilters.modelSub);
    }
    
    // 搜索筛选
    if (currentFilters.search) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(currentFilters.search) ||
            c.nameEn.toLowerCase().includes(currentFilters.search) ||
            c.description.toLowerCase().includes(currentFilters.search) ||
            c.features.some(f => f.toLowerCase().includes(currentFilters.search))
        );
    }
    
    // 更新显示
    companiesData = filtered;
    renderCompanies(filtered);
    
    // 更新统计
    document.getElementById('filteredCount').textContent = filtered.length;
    updateStatistics();
}
