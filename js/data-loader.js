// 数据加载模块 — v4.0
import { sortCompanies } from './utils.js';

let _allCompanies = [];
let _companiesData = [];
let _metadata = {};

export function getAllCompanies() { return _allCompanies; }
export function getCompaniesData() { return _companiesData; }
export function setCompaniesData(data) { _companiesData = data; }
export function getMetadata() { return _metadata; }

function normalizeCompanies(companies) {
    return companies.map(c => {
        const copy = { ...c };
        // 合并 "应用层" → "Agent应用层"
        if (copy.agentTag === '应用层') copy.agentTag = 'Agent应用层';
        // 无 agentTag 但有 layer 时，用 layer 推导
        if (!copy.agentTag && copy.layer) {
            const map = {
                infrastructure: '基础设施层', llm: '大模型层',
                platform: '平台/框架层', application: 'Agent应用层'
            };
            copy.agentTag = map[copy.layer] || copy.layer;
        }
        // "/" 视为空
        if (copy.agentTagLevel3 === '/') copy.agentTagLevel3 = '';
        if (copy.agentTagLevel2 === '/') copy.agentTagLevel2 = '';
        return copy;
    });
}

function buildMetadata(companies) {
    const agentTagTree = {};
    const agentTagCounts = {};
    const markets = new Set();
    const countries = new Set();
    const categories = new Set();
    const chineseProducts = new Set();

    companies.forEach(c => {
        const t1 = c.agentTag || '';
        const t2 = c.agentTagLevel2 || '';
        const t3 = c.agentTagLevel3 || '';

        if (t1) {
            agentTagCounts[t1] = (agentTagCounts[t1] || 0) + 1;
            if (!agentTagTree[t1]) agentTagTree[t1] = {};
            if (t2) {
                if (!agentTagTree[t1][t2]) agentTagTree[t1][t2] = {};
                if (t3) {
                    agentTagTree[t1][t2][t3] = (agentTagTree[t1][t2][t3] || 0) + 1;
                }
            }
        }
        if (c.market) markets.add(c.market);
        if (c.country) countries.add(c.country);
        if (c.category) categories.add(c.category);
        if (c.isChineseProduct) chineseProducts.add(c.isChineseProduct);
    });

    return {
        agentTagTree,
        agentTagCounts,
        markets: [...markets].sort(),
        countries: [...countries].sort((a, b) => a.localeCompare(b, 'zh')),
        categories: [...categories].sort((a, b) => a.localeCompare(b, 'zh')),
        chineseProducts: [...chineseProducts].sort()
    };
}

export async function loadData() {
    try {
        document.getElementById('loadingSpinner').classList.add('active');

        const response = await fetch('data/companies.json');
        const data = await response.json();

        const normalized = normalizeCompanies(data.companies || []);
        _allCompanies = sortCompanies(normalized);
        _companiesData = [..._allCompanies];
        _metadata = buildMetadata(_allCompanies);

        console.log('✅ Data loaded:', _allCompanies.length, 'companies');

        const lastEl = document.getElementById('lastUpdate');
        if (lastEl) lastEl.textContent = data.lastUpdate || '';

        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = _allCompanies.length;

        if (window.app?.updateStatistics) window.app.updateStatistics();
        if (window.app?.renderCompanies) window.app.renderCompanies(_companiesData);

        document.getElementById('loadingSpinner').classList.remove('active');
        return data;
    } catch (error) {
        console.error('数据加载失败:', error);
        document.getElementById('loadingSpinner').classList.remove('active');
        document.getElementById('playersContainer').innerHTML = `
            <div class="empty-state">
                <h3>数据加载失败</h3>
                <p>请检查 data/companies.json 是否存在</p>
                <p style="color: #C25B56; margin-top: 8px;">${error.message}</p>
            </div>`;
    }
}
