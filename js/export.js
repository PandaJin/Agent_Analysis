// 导出功能模块
import { getCompaniesData, getMetadata } from './data-loader.js';
import { getLayerText, getSceneText, getRegionText, ensureInvestorsArray } from './utils.js';

// Excel导出
document.getElementById('exportExcel')?.addEventListener('click', exportToExcel);

export function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel导出库未加载，请检查网络连接');
        return;
    }

    const metadata = getMetadata();
    const companiesData = getCompaniesData();
    const data = companiesData.map(c => {
        // ensure investors is array format
        let investorsArray = c.investors;
        if (typeof c.investors === 'string') {
            // if it is a string, split it by comma
            investorsArray = [c.investors];
        } else if (!Array.isArray(c.investors)) {
            // if it is neither an array nor a string, set it to an empty array
            investorsArray = [];
        }

        return {
            'ID': c.id || '',
            '公司名称': c.name || '',
            '英文名称': c.nameEn || '',
            '技术栈层级': getLayerText(c.layer || '', metadata),
            '应用场景': c.scene ? getSceneText(c.scene, metadata) : '',
            '细分领域': c.subScene || '',
            '地域': getRegionText(c.region || '', metadata),
            '商业模式': (c.model || '').toUpperCase(),
            '简介': c.description || '',
            'ARR': c.arr || '',
            'MAU': c.mau || '',
            '用户类型': c.userType || '',
            '定价模式': c.pricingModel || '',
            '价格区间': c.pricingRange || '',
            '成立年份': c.founded || '',
            '总融资': c.funding || '',
            '投资方': ensureInvestorsArray(c.investors).join(', '),
            '官网': c.website || '',
            'GitHub': c.github || '',
            '核心亮点': c.highlight || ''
        };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // ID
        { wch: 15 }, // Company Name
        { wch: 20 }, // English Name
        { wch: 12 }, // Tech Stack
        { wch: 12 }, // Scene
        { wch: 12 }, // Sub-category
        { wch: 8 },  // Region
        { wch: 10 }, // Model
        { wch: 50 }, // Description
        { wch: 12 }, // ARR
        { wch: 12 }, // MAU
        { wch: 15 }, // User Type
        { wch: 15 }, // Pricing Model
        { wch: 20 }, // Price Range
        { wch: 10 }, // Founded Year
        { wch: 12 }, // Total Funding
        { wch: 30 }, // Investors
        { wch: 30 }, // Website
        { wch: 30 }, // GitHub
        { wch: 40 }  // Highlight
    ];

    XLSX.utils.book_append_sheet(wb, ws, "AI Agent Companies");

    // Export
    const filename = `AI_Agent_Companies_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// PDF导出
document.getElementById('exportPDF')?.addEventListener('click', exportToPDF);

export function exportToPDF() {
    if (typeof jspdf === 'undefined') {
        alert('PDF导出库未加载，请检查网络连接');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('AI Agent 生态玩家地图', 20, 20);

    const metadata = getMetadata();
    const companiesData = getCompaniesData();
    doc.setFontSize(12);
    doc.text(`总计 ${companiesData.length} 家公司`, 20, 30);
    doc.text(`导出时间: ${new Date().toLocaleString('zh-CN')}`, 20, 37);

    let y = 50;
    const pageHeight = doc.internal.pageSize.height;

    companiesData.forEach((company, index) => {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }

        // Safely get company information, avoid null errors
        const name = company.name || '';
        const nameEn = company.nameEn || '';
        const layer = company.layer || '';
        const region = company.region || '';
        const model = company.model || '';
        const arr = company.arr || '';
        const mau = company.mau || '';
        const description = company.description || '';

        doc.setFontSize(14);
        doc.text(`${index + 1}. ${name} (${nameEn})`, 20, y);
        y += 7;

        doc.setFontSize(10);
        doc.text(`Layer: ${getLayerText(layer, metadata)} | Region: ${getRegionText(region, metadata)} | Model: ${model.toUpperCase()}`, 20, y);
        y += 5;

        doc.text(`ARR: ${arr} | MAU: ${mau}`, 20, y);
        y += 5;

        // Description (truncated), ensure description exists
        const desc = description.substring(0, 80) + (description.length > 80 ? '...' : '');
        doc.text(desc, 20, y);
        y += 10;
    });

    doc.save(`AI_Agent_Companies_${new Date().toISOString().split('T')[0]}.pdf`);
}
