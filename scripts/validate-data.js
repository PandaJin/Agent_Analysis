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
    // 读取数据
    const data = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    console.log(`📊 总公司数: ${data.companies.length}`);
    console.log(`📅 最后更新: ${data.lastUpdate}\n`);
    
    // 基础校验
    const ids = new Set();
    const names = new Set();
    
    data.companies.forEach((company, index) => {
        const errors = [];
        
        // 必填字段检查
        const required = ['id', 'name', 'nameEn', 'layer', 'region', 'model', 'description'];
        required.forEach(field => {
            if (!company[field]) {
                errors.push(`缺少必填字段: ${field}`);
            }
        });
        
        // ID唯一性
        if (ids.has(company.id)) {
            errors.push(`ID ${company.id} 重复`);
        }
        ids.add(company.id);
        
        // 名称唯一性
        if (names.has(company.name)) {
            errors.push(`公司名称 "${company.name}" 重复`);
        }
        names.add(company.name);
        
        // 枚举值检查
        const validLayers = ['infrastructure', 'llm', 'platform', 'application'];
        if (company.layer && !validLayers.includes(company.layer)) {
            errors.push(`无效的 layer 值: ${company.layer}`);
        }
        
        const validRegions = ['china', 'overseas', 'global'];
        if (company.region && !validRegions.includes(company.region)) {
            errors.push(`无效的 region 值: ${company.region}`);
        }
        
        const validModels = ['2b', '2c', '2b2c'];
        if (company.model && !validModels.includes(company.model)) {
            errors.push(`无效的 model 值: ${company.model}`);
        }
        
        // 描述长度检查
        if (company.description && (company.description.length < 10 || company.description.length > 500)) {
            errors.push(`描述长度不符合要求 (10-500字): 当前 ${company.description.length} 字`);
        }
        
        // URL格式检查
        if (company.website && !company.website.startsWith('http')) {
            errors.push(`网站URL格式错误: ${company.website}`);
        }
        
        // 输出错误
        if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ 公司 #${index + 1} (${company.name}) 存在问题:`);
            errors.forEach(err => console.log(`   - ${err}`));
            console.log('');
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
