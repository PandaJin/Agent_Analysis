// 数据加载模块
import { parseARRValue, sortCompanies } from './utils.js';

let _allCompanies = []; // Stores all loaded companies
let _companiesData = []; // Stores currently filtered companies
let _metadata = {}; // Stores metadata like subScenes

export function getAllCompanies() {
    return _allCompanies;
}

export function getCompaniesData() {
    return _companiesData;
}

export function setCompaniesData(data) {
    _companiesData = data;
}

export function getMetadata() {
    return _metadata;
}

export async function loadData() {
    try {
        document.getElementById('loadingSpinner').classList.add('active');
        
        const response = await fetch('data/companies.json');
        const data = await response.json();
        
        _allCompanies = sortCompanies(data.companies);
        _companiesData = [..._allCompanies]; // Initialize filtered data with all companies
        _metadata = data.metadata;
        
        console.log('✅ Data loaded:', {
            totalCompanies: _allCompanies.length,
            hasMetadata: !!_metadata.subScenes
        });
        
        // 更新UI
        const lastEl = document.getElementById('lastUpdate');
        if (lastEl) lastEl.textContent = data.lastUpdate;
        
        // Use globally exposed functions from app.js
        if (window.app && typeof window.app.updateStatistics === 'function') {
            window.app.updateStatistics();
        }
        if (window.app && typeof window.app.renderCompanies === 'function') {
            window.app.renderCompanies(_companiesData);
        }

        document.getElementById('loadingSpinner').classList.remove('active');
        
        return data;
    } catch (error) {
        console.error('数据加载失败:', error);
        document.getElementById('loadingSpinner').classList.remove('active');
        document.getElementById('playersContainer').innerHTML = `
            <div class="empty-state">
                <h3>数据加载失败</h3>
                <p>请检查 data/companies.json 文件是否存在</p>
                <p style="color: #e74c3c; margin-top: 10px;">错误: ${error.message}</p>
            </div>
        `;
    }
}

// updateStatistics function should ideally be in a separate UI module or main orchestrator.
// For now, keep it here but ensure it uses the module's _companiesData
// This function will be called by window.app.updateStatistics
export function updateStatistics() {
    const countEl = document.getElementById('filteredCount');
    if (countEl) countEl.textContent = _companiesData.length;
}

// No DOMContentLoaded listener here, as initialization is handled in index.html