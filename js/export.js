// 导出功能模块

// Excel导出
document.getElementById('exportExcel')?.addEventListener('click', exportToExcel);

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel导出库未加载，请检查网络连接');
        return;
    }

    // 准备数据，增加错误处理
    const data = companiesData.map(c => {
        // 确保investors是数组格式
        let investorsArray = c.investors;
        if (typeof c.investors === 'string') {
            // 如果是字符串，按逗号分割
            investorsArray = [c.investors];
        } else if (!Array.isArray(c.investors)) {
            // 如果既不是数组也不是字符串，设为空数组
            investorsArray = [];
        }

        return {
            'ID': c.id || '',
            '公司名称': c.name || '',
            '英文名称': c.nameEn || '',
            '技术栈层级': getLayerText(c.layer || ''),
            '应用场景': c.scene ? getSceneText(c.scene) : '',
            '细分领域': c.subScene || '',
            '地域': getRegionText(c.region || ''),
            '商业模式': (c.model || '').toUpperCase(),
            '简介': c.description || '',
            'ARR': c.arr || '',
            'MAU': c.mau || '',
            '用户类型': c.userType || '',
            '定价模式': c.pricingModel || '',
            '价格区间': c.pricingRange || '',
            '成立年份': c.founded || '',
            '总融资': c.funding || '',
            '投资方': investorsArray.join(', '),
            '官网': c.website || '',
            'GitHub': c.github || '',
            '核心亮点': c.highlight || ''
        };
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // 设置列宽
    ws['!cols'] = [
        { wch: 5 },  // ID
        { wch: 15 }, // 公司名称
        { wch: 20 }, // 英文名称
        { wch: 12 }, // 技术栈
        { wch: 12 }, // 场景
        { wch: 12 }, // 细分
        { wch: 8 },  // 地域
        { wch: 10 }, // 模式
        { wch: 50 }, // 简介
        { wch: 12 }, // ARR
        { wch: 12 }, // MAU
        { wch: 15 }, // 用户类型
        { wch: 15 }, // 定价模式
        { wch: 20 }, // 价格区间
        { wch: 10 }, // 成立年份
        { wch: 12 }, // 融资
        { wch: 30 }, // 投资方
        { wch: 30 }, // 官网
        { wch: 30 }, // GitHub
        { wch: 40 }  // 亮点
    ];

    XLSX.utils.book_append_sheet(wb, ws, "AI Agent Companies");

    // 导出
    const filename = `AI_Agent_Companies_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// PDF导出
document.getElementById('exportPDF')?.addEventListener('click', exportToPDF);

function exportToPDF() {
    if (typeof jspdf === 'undefined') {
        alert('PDF导出库未加载，请检查网络连接');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // 标题
    doc.setFontSize(20);
    doc.text('AI Agent 生态玩家地图', 20, 20);

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

        // 安全获取公司信息，避免空值错误
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
        doc.text(`Layer: ${getLayerText(layer)} | Region: ${getRegionText(region)} | Model: ${model.toUpperCase()}`, 20, y);
        y += 5;

        doc.text(`ARR: ${arr} | MAU: ${mau}`, 20, y);
        y += 5;

        // 描述（截断），确保描述存在
        const desc = description.substring(0, 80) + (description.length > 80 ? '...' : '');
        doc.text(desc, 20, y);
        y += 10;
    });

    doc.save(`AI_Agent_Companies_${new Date().toISOString().split('T')[0]}.pdf`);
}
