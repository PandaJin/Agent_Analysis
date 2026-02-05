// 筛选功能模块
import { getMetadata, getAllCompanies, getCompaniesData, setCompaniesData } from './data-loader.js';
import { getLayerText, getSceneText, getRegionText, sortCompanies } from './utils.js';

let currentFilters = {
    layer: '',
    scene: '',
    region: '',
    model: '',
    modelSub: '',
    subScene: '',
    search: ''
};

// Function to initialize filters and set up event listeners
export function initializeFilters() {
    document.querySelectorAll('.layer-tab').forEach(btn => {
        btn.addEventListener('click', () => setLayer(btn.dataset.layer || ''));
    });
    document.getElementById('regionFilter').addEventListener('change', handleFilterChange);
    document.getElementById('modelFilter').addEventListener('change', handleModelChange);
    document.getElementById('searchInput').addEventListener('input', handleSearchChange);

    // Initial application of filters after data load
    applyFilters();
}

function handleFilterChange(e) {
    const filterId = e.target.id;
    const value = e.target.value;
    if (filterId === 'regionFilter') currentFilters.region = value;
    else if (filterId === 'modelFilter') currentFilters.model = value;
    applyFilters();
}

function setLayer(value) {
    const metadata = getMetadata();
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

    const sceneLabels = metadata.sceneLabels || {};
    const subScenesConfig = metadata.subScenes || {};

    if (value === 'application') {
        subFiltersEl.innerHTML = Object.entries(sceneLabels).map(([key, label]) =>
            `<button type="button" class="chip sub-filter-chip" data-value="${key}" data-type="scene">${label}</button>`
        ).join('');
        subFiltersEl.classList.add('active');
        subFiltersEl.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => handleSubFilterClick(chip.dataset.value, 'scene'));
        });
    } else if (subScenesConfig[value]) {
        const subScenes = subScenesConfig[value];
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
    const metadata = getMetadata();
    const subScenesConfig = metadata.subScenes || {};

    // Helper to toggle active class
    const toggleActiveClass = (element, dataValue) => {
        element.querySelectorAll('.sub-filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-value') === dataValue);
        });
    };

    if (type === 'layerSub') {
        currentFilters.scene = '';
        currentFilters.subScene = currentFilters.subScene === value ? '' : value;
        sceneSubFiltersEl.classList.remove('active');
        sceneSubFiltersEl.innerHTML = '';
        toggleActiveClass(subFiltersEl, currentFilters.subScene);
    } else if (type === 'scene') {
        currentFilters.subScene = '';
        currentFilters.scene = currentFilters.scene === value ? '' : value;
        toggleActiveClass(subFiltersEl, currentFilters.scene);
        
        // Third level: only show when application layer and a scene with sub-scenes is selected
        if (currentFilters.scene && subScenesConfig[currentFilters.scene]) {
            const subScenes = subScenesConfig[currentFilters.scene];
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
        toggleActiveClass(sceneSubFiltersEl, currentFilters.subScene);
    } else if (type === 'model') {
        currentFilters.modelSub = currentFilters.modelSub === value ? '' : value;
        toggleActiveClass(document.getElementById('modelSubFilters'), currentFilters.modelSub);
    }

    applyFilters();
}

function handleModelChange(e) {
    const value = e.target.value;
    currentFilters.model = value;
    currentFilters.modelSub = '';

    const modelSubEl = document.getElementById('modelSubFilters');
    const metadata = getMetadata();
    const modelSubCategoriesConfig = metadata.modelSubCategories || {};
    const categories = modelSubCategoriesConfig[value]; // Directly use from metadata

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

// Apply all filter conditions
export function applyFilters() {
    const allCompanies = getAllCompanies();
    if (!allCompanies.length) {
        console.warn('⚠️ allCompanies not ready yet');
        return;
    }
    
    let filtered = allCompanies.filter(company => {
        // Layer filter
        if (currentFilters.layer && company.layer !== currentFilters.layer) {
            return false;
        }

        // Sub-scene filter (depends on layer)
        if (currentFilters.layer && currentFilters.subScene) {
            // For application layer, subScene is a specific sub-category within a scene
            // For other layers, subScene is a direct sub-category of the layer
            if (company.layer === 'application') {
                 // Check if the company's scene matches the current scene filter, 
                 // AND if its subScene matches the current subScene filter.
                 // This assumes metadata defines subScenes nested under primary scenes.
                 // The current implementation in setLayer and handleSubFilterClick implies
                 // that currentFilters.subScene is a sub-category directly.
                 // Need to re-evaluate metadata structure to ensure this logic is correct.
                 // For now, assuming company.subScene directly holds the selected sub-scene value.
                if (currentFilters.scene && company.scene !== currentFilters.scene) return false;
                if (company.subScene !== currentFilters.subScene) return false;

            } else {
                if (company.subScene !== currentFilters.subScene) return false;
            }
        } else if (currentFilters.layer === 'application' && currentFilters.scene && company.scene !== currentFilters.scene) {
            // If application layer and only scene is selected (no sub-scene)
            return false;
        }


        // Region filter
        if (currentFilters.region && company.region !== currentFilters.region) {
            return false;
        }

        // Model filter
        if (currentFilters.model && company.model !== currentFilters.model) {
            return false;
        }

        // Model sub-category filter
        if (currentFilters.modelSub && company.modelSub !== currentFilters.modelSub) {
            return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            const features = Array.isArray(company.features) ? company.features : [company.features];
            
            const matches = 
                (company.name && company.name.toLowerCase().includes(searchTerm)) ||
                (company.nameEn && company.nameEn.toLowerCase().includes(searchTerm)) ||
                (company.description && company.description.toLowerCase().includes(searchTerm)) ||
                features.some(f => String(f).toLowerCase().includes(searchTerm));
            
            if (!matches) return false;
        }
        return true;
    });

    const sortedFiltered = sortCompanies(filtered);
    setCompaniesData(sortedFiltered); // Update the filtered data in data-loader

    if (window.app && typeof window.app.renderCompanies === 'function') {
        window.app.renderCompanies(sortedFiltered);
    } else {
        console.error('❌ renderCompanies function not found on window.app');
    }
    
    // Update statistics via global function
    if (window.app && typeof window.app.updateStatistics === 'function') {
        window.app.updateStatistics();
    } else {
        console.error('❌ updateStatistics function not found on window.app');
    }
}

// No DOMContentLoaded listener here, as initialization is handled in index.html and called via initializeFilters
