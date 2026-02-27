#!/usr/bin/env node

/**
 * 数据校验脚本
 * 使用方法: node scripts/validate-data.js
 */

const fs = require('fs');
const path = require('path');

// 读取文件
const companiesPath = path.join(__dirname, '../data/companies.json');
const schemaPath = path.join(__dirname, '../data/schema.json');

console.log('🔍 开始数据校验...\n');

let hasErrors = false;

try {
    // 读取数据（schema 可选）
    const data = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    let schema = null;
    if (fs.existsSync(schemaPath)) {
        try { schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')); } catch (_) {}
    }
    
    console.log(`📊 总公司数: ${data.companies.length}`);
    console.log(`📅 最后更新: ${data.lastUpdate}\n`);
    
    // 基础校验
    const ids = new Set();
    const names = new Set();
    
    data.companies.forEach((company, index) => {
        const errors = [];
        const warnings = [];
        
        // 必填字段检查（v4.0：layer/region/model 可选，以 agentTag 等为主）
        const required = ['id', 'name', 'description'];
        required.forEach(field => {
            if (company[field] === undefined || company[field] === null) {
                errors.push(`缺少必填字段: ${field}`);
            }
        });
        if (!company.nameEn && !company.name) {
            errors.push('name 与 nameEn 至少填一项');
        }
        
        // ID唯一性
        if (ids.has(company.id)) {
            errors.push(`ID ${company.id} 重复`);
        }
        ids.add(company.id);
        
        // 名称可重复（同一公司多产品），仅记录用于统计
        if (company.name) names.add(company.name);
        
        // 枚举值检查（可选字段，有值时才校验）
        const validLayers = ['infrastructure', 'llm', 'platform', 'application'];
        if (company.layer && !validLayers.includes(company.layer)) {
            errors.push(`无效的 layer 值: ${company.layer}`);
        }
        const validRegions = ['china', 'overseas', 'global'];
        if (company.region && !validRegions.includes(company.region)) {
            warnings.push(`建议 region 为 china/overseas/global，当前: ${company.region}`);
        }
        const validModels = ['2b', '2c', '2b2c'];
        if (company.model && !validModels.includes(company.model)) {
            warnings.push(`建议 model 为 2b/2c/2b2c，当前: ${company.model}`);
        }
        
        // 描述长度检查（v4.0 合并 Excel 后放宽：仅超长报错）
        if (company.description && company.description.length > 500) {
            errors.push(`描述超过500字: 当前 ${company.description.length} 字`);
        }
        
        // URL格式检查
        if (company.website && !company.website.startsWith('http')) {
            errors.push(`网站URL格式错误: ${company.website}`);
        }
        
        // 仅错误阻断，警告只打印
        if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ 公司 #${index + 1} (${company.name}) 存在问题:`);
            errors.forEach(err => console.log(`   - ${err}`));
            warnings.forEach(w => console.log(`   ⚠ ${w}`));
            console.log('');
        } else if (warnings.length > 0 && index < 20) {
            console.log(`⚠ 公司 #${index + 1} (${company.name}): ${warnings.join('; ')}`);
        }
    });
    
    if (!hasErrors) {
        console.log('✅ 所有数据校验通过！');
    } else {
        console.log('⚠️  发现数据问题，请修正后重新提交。');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ 校验失败:', error.message);
    process.exit(1);
}
