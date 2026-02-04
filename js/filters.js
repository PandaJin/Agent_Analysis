// 筛选功能模块

let currentFilters = {
    layer: '',
    scene: '',
    region: '',
    model: '',
    subScene: '',
    search: ''
};

// 初始化筛选器
document.addEventListener('DOMContentLoaded', () => {
    // 主筛选器事件
    document.getElementById('layerFilter').addEventListener('change', handleFilterChange);
    document.getElementById('sceneFilter').addEventListener('change', handleSceneChange);
    document.getElementById('regionFilter').addEventListener('change', handleFilterChange);
    document.getElementById('modelFilter').addEventListener('change', handleFilterChange);
    document.getElementById('searchInput').addEventListener('input', handleSearchChange);
});

function handleFilterChange(e) {
    const filterId = e.target.id;
    const value = e.target.value;
    
    if (filterId === 'layerFilter') currentFilters.layer = value;
    else if (filterId === 'regionFilter') currentFilters.region = value;
    else if (filterId === 'modelFilter') currentFilters.model = value;
    
    applyFilters();
}

function handleSceneChange(e) {
    const value = e.target.value;
    currentFilters.scene = value;
    currentFilters.subScene = ''; // 重置二级筛选
    
    // 显示/隐藏二级筛选
    const subFiltersContainer = document.getElementById('subFilters');
    if (value && metadata.subScenes && metadata.subScenes[value]) {
        renderSubFilters(value);
        subFiltersContainer.classList.add('active');
    } else {
        subFiltersContainer.classList.remove('active');
    }
    
    applyFilters();
}

function handleSearchChange(e) {
    currentFilters.search = e.target.value.toLowerCase();
    applyFilters();
}

// 渲染二级筛选器
function renderSubFilters(scene) {
    const subFiltersContainer = document.getElementById('subFilters');
    const subScenes = metadata.subScenes[scene];
    
    if (!subScenes) return;
    
    subFiltersContainer.innerHTML = Object.entries(subScenes).map(([key, label]) => `
        <div class="sub-filter-chip" data-value="${key}" onclick="handleSubFilterClick('${key}')">
            ${label}
        </div>
    `).join('');
}

function handleSubFilterClick(subSceneValue) {
    // 切换选中状态
    if (currentFilters.subScene === subSceneValue) {
        currentFilters.subScene = '';
    } else {
        currentFilters.subScene = subSceneValue;
    }
    
    // 更新UI
    document.querySelectorAll('.sub-filter-chip').forEach(chip => {
        if (chip.getAttribute('data-value') === currentFilters.subScene) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
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
