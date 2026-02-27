#!/usr/bin/env node
/**
 * 将 AI Company.xlsx 导入并合并到 Agent_Analysis data/companies.json
 * - 产品级去重匹配（产品名称 / 公司 <-> name / nameEn）
 * - 用 Excel 的 Agent标签 1/2/3 替代 layer 结构
 * - 增加腾讯云赛道 1~6、国家、是否华人产品、Web/APP ARR、分类
 * - ARR 以 Excel 产品收入ARR（百万美金）为准
 *
 * 用法: node scripts/import-ai-company-xlsx.js [--dry-run]
 * 可选: 在 Agent_Analysis 目录下执行，或指定环境变量 DATA_DIR / XLSX_PATH
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || ROOT;
const XLSX_PATH = process.env.XLSX_PATH || path.join(ROOT, '..', 'AI Company.xlsx');

const COMPANIES_JSON = path.join(DATA_DIR, 'data', 'companies.json');

// Excel 列名（与 AI Company.xlsx 表头一致，表头可能缺右括号）
const EXCEL_COLS = {
  排序: 'sortOrder',
  产品名称: 'productName',
  公司: 'company',
  分类: 'category',
  '产品收入ARR（百万美金）': 'arrProductMillion',
  '产品收入ARR（百万美金': 'arrProductMillion',
  'Web收入ARR（百万美金）': 'arrWebMillion',
  'APP收入ARR（百万美金）': 'arrAppMillion',
  'APP收入ARR（百万美金': 'arrAppMillion',
  MAU_latest: 'mauLatest',
  'Time - MAU_latest': 'mauTime',
  ARR_latest: 'arrLatest',
  'Time - ARR_latest': 'arrTime',
  来源: 'source',
  '云规模（百万美金）': 'cloudScaleMillion',
  市场: 'market',
  是否华人产品: 'isChineseProduct',
  Agent标签: 'agentTag',
  Agent标签二级: 'agentTagLevel2',
  Agent标签三级: 'agentTagLevel3',
  腾讯云一级标签: 'tencentTrack1',
  腾讯云二级标签: 'tencentTrack2',
  腾讯云三级标签: 'tencentTrack3',
  腾讯云四级标签: 'tencentTrack4',
  腾讯云五级行业标签: 'tencentTrack5',
  腾讯云六级行业标签: 'tencentTrack6',
  雇员数: 'employeeCount',
  人效: 'efficiency',
  ROF: 'rof',
  国家: 'country',
};

function normalizeForMatch(str) {
  if (str == null || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[,，、]/g, '');
}

function safeNum(v) {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function safeStr(v) {
  if (v == null) return '';
  const s = String(v).trim();
  return s === '' || s.toLowerCase() === 'n/a' ? '' : s;
}

function formatArrFromMillion(million) {
  if (million == null || !Number.isFinite(million)) return '';
  if (million >= 1000) return `$${(million / 1000).toFixed(1)}B+`;
  if (million >= 1) return `$${million.toFixed(0)}M+`;
  return `$${million}`;
}

/** 从 Excel 一行生成用于匹配的键（产品名、公司名） */
function excelMatchKeys(row) {
  const product = normalizeForMatch(row.productName || row.产品名称);
  const company = normalizeForMatch(row.company || row.公司);
  return { product, company };
}

/** 现有公司匹配键 */
function existingMatchKeys(c) {
  const name = normalizeForMatch(c.name);
  const nameEn = normalizeForMatch(c.nameEn);
  return { name, nameEn };
}

/** 是否视为同一产品/公司 */
function isSameEntry(excelKeys, existingKeys) {
  if (excelKeys.product && (excelKeys.product === existingKeys.name || excelKeys.product === existingKeys.nameEn))
    return true;
  if (excelKeys.company && (excelKeys.company === existingKeys.name || excelKeys.company === existingKeys.nameEn))
    return true;
  return false;
}

/** 把 Excel 行转为统一字段名对象（保留原表头键与英文键） */
function normalizeExcelRow(raw, headers) {
  const row = {};
  headers.forEach((h, i) => {
    const val = raw[i];
    if (h) row[h] = val;
    const key = EXCEL_COLS[h];
    if (key) row[key] = val;
  });
  return row;
}

function pick(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

/** 从 Excel 行填充到公司对象（合并用） */
function applyExcelToCompany(row, existing = null) {
  const productName = safeStr(pick(row, 'productName', '产品名称'));
  const company = safeStr(pick(row, 'company', '公司'));
  const arrProduct = safeNum(pick(row, 'arrProductMillion', '产品收入ARR（百万美金）', '产品收入ARR（百万美金'));
  const arrWeb = safeNum(pick(row, 'arrWebMillion', 'Web收入ARR（百万美金）'));
  const appArr = safeNum(pick(row, 'arrAppMillion', 'APP收入ARR（百万美金）', 'APP收入ARR（百万美金'));

  const base = existing ? { ...existing } : {};
  return {
    ...base,
    name: productName || base.name || company || '',
    nameEn: base.nameEn || company || productName || '',
    company: company || base.company || '', // 母公司/公司名
    description: base.description || '',
    agentTag: safeStr(pick(row, 'agentTag', 'Agent标签')) || base.agentTag || '',
    agentTagLevel2: safeStr(pick(row, 'agentTagLevel2', 'Agent标签二级')) || base.agentTagLevel2 || '',
    agentTagLevel3: safeStr(pick(row, 'agentTagLevel3', 'Agent标签三级')) || base.agentTagLevel3 || '',
    tencentTrack1: safeStr(pick(row, 'tencentTrack1', '腾讯云一级标签')) || base.tencentTrack1 || '',
    tencentTrack2: safeStr(pick(row, 'tencentTrack2', '腾讯云二级标签')) || base.tencentTrack2 || '',
    tencentTrack3: safeStr(pick(row, 'tencentTrack3', '腾讯云三级标签')) || base.tencentTrack3 || '',
    tencentTrack4: safeStr(pick(row, 'tencentTrack4', '腾讯云四级标签')) || base.tencentTrack4 || '',
    tencentTrack5: safeStr(pick(row, 'tencentTrack5', '腾讯云五级行业标签')) || base.tencentTrack5 || '',
    tencentTrack6: safeStr(pick(row, 'tencentTrack6', '腾讯云六级行业标签')) || base.tencentTrack6 || '',
    arr: arrProduct != null ? formatArrFromMillion(arrProduct) : (base.arr || ''),
    arrProductMillion: arrProduct ?? base.arrProductMillion,
    arrWebMillion: arrWeb ?? base.arrWebMillion,
    arrAppMillion: appArr ?? base.arrAppMillion,
    mau: safeStr(pick(row, 'mauLatest', 'MAU_latest')) || base.mau || '',
    country: safeStr(pick(row, 'country', '国家')) || base.country || '',
    isChineseProduct: safeStr(pick(row, 'isChineseProduct', '是否华人产品')) || base.isChineseProduct || '',
    category: safeStr(pick(row, 'category', '分类')) || base.category || '',
    market: safeStr(pick(row, 'market', '市场')) || base.market || '',
    layer: base.layer || '', // 保留兼容，后续可由 agentTag 推导
    region: base.region || '',
    model: base.model || '',
    modelSub: base.modelSub || '',
    scene: base.scene || '',
    subScene: base.subScene || '',
    features: base.features || [],
    userType: base.userType || '',
    pricingModel: base.pricingModel || '',
    pricingRange: base.pricingRange || '',
    founded: base.founded || '',
    funding: base.funding || '',
    investors: base.investors || [],
    fundingRounds: base.fundingRounds || [],
    website: base.website || '',
    github: base.github || '',
    highlight: base.highlight || '',
    logo: base.logo || '',
    logoUrl: base.logoUrl || '',
  };
}

/** 从 Excel 行创建全新公司条目 */
function newCompanyFromExcel(row, nextId) {
  const c = applyExcelToCompany(row, null);
  return {
    id: nextId,
    name: c.name || '未命名产品',
    nameEn: c.nameEn || '',
    company: c.company || '',
    description: c.description || '（待补充）',
    agentTag: c.agentTag,
    agentTagLevel2: c.agentTagLevel2,
    agentTagLevel3: c.agentTagLevel3,
    tencentTrack1: c.tencentTrack1,
    tencentTrack2: c.tencentTrack2,
    tencentTrack3: c.tencentTrack3,
    tencentTrack4: c.tencentTrack4,
    tencentTrack5: c.tencentTrack5,
    tencentTrack6: c.tencentTrack6,
    arr: c.arr,
    arrProductMillion: c.arrProductMillion,
    arrWebMillion: c.arrWebMillion,
    arrAppMillion: c.arrAppMillion,
    mau: c.mau,
    country: c.country,
    isChineseProduct: c.isChineseProduct,
    category: c.category,
    market: c.market,
    layer: '',
    region: c.market === '国内' ? 'china' : c.market === '出海' ? 'overseas' : c.market === '海外' ? 'global' : '',
    model: '',
    scene: '',
    subScene: '',
    features: [],
    userType: '',
    pricingModel: '',
    pricingRange: '',
    founded: '',
    funding: '',
    investors: [],
    fundingRounds: [],
    website: '',
    github: '',
    highlight: '',
    logo: '',
    logoUrl: '',
  };
}

function main() {
  console.log('📂 XLSX:', XLSX_PATH);
  console.log('📂 JSON:', COMPANIES_JSON);
  if (DRY_RUN) console.log('🔸 仅预览，不写文件\n');

  if (!fs.existsSync(XLSX_PATH)) {
    console.error('❌ 未找到 AI Company.xlsx，路径:', XLSX_PATH);
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH, { type: 'file', cellDates: false, raw: false });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!data.length) {
    console.error('❌ Excel 无数据');
    process.exit(1);
  }

  const headers = data[0].map((h) => (h != null ? String(h).trim() : ''));
  const rows = data.slice(1).filter((r) => r.some((c) => c != null && String(c).trim() !== ''));

  const excelRows = rows.map((r) => {
    const raw = headers.map((_, i) => r[i]);
    return normalizeExcelRow(raw, headers);
  });

  console.log('📊 Excel 行数（含表头）:', data.length, '有效数据行:', excelRows.length);
  console.log('📋 表头:', headers.slice(0, 15).join(' | '), '...\n');

  let dataJson;
  try {
    dataJson = JSON.parse(fs.readFileSync(COMPANIES_JSON, 'utf8'));
  } catch (e) {
    console.error('❌ 读取 companies.json 失败:', e.message);
    process.exit(1);
  }

  const existingList = Array.isArray(dataJson.companies) ? dataJson.companies : [];
  const existingByKey = new Map();
  existingList.forEach((c) => {
    const k = existingMatchKeys(c);
    const key = `${k.name}|${k.nameEn}`;
    if (!existingByKey.has(key)) existingByKey.set(key, c);
  });

  const mergedByExistingId = new Map();
  const newEntries = [];
  let nextId = existingList.length ? Math.max(...existingList.map((c) => c.id || 0), 0) + 1 : 1;

  for (const row of excelRows) {
    const excelKeys = excelMatchKeys(row);
    let found = null;
    for (const [, c] of existingByKey.entries()) {
      const existingKeys = existingMatchKeys(c);
      if (isSameEntry(excelKeys, existingKeys)) {
        found = c;
        break;
      }
    }
    if (found) {
      const mergedOne = applyExcelToCompany(row, mergedByExistingId.get(found.id) || found);
      mergedByExistingId.set(found.id, mergedOne);
    } else {
      newEntries.push(newCompanyFromExcel(row, nextId++));
    }
  }

  const merged = [...mergedByExistingId.values(), ...newEntries];
  const unmatchedExisting = existingList.filter((c) => !mergedByExistingId.has(c.id));
  for (const c of unmatchedExisting) {
    const legacy = { ...c };
    if (!legacy.agentTag && legacy.layer) {
      const layerToTag = {
        infrastructure: '基础设施层',
        llm: '大模型层',
        platform: '平台/框架层',
        application: '应用层',
      };
      legacy.agentTag = layerToTag[legacy.layer] || legacy.layer;
    }
    merged.push(legacy);
  }

  const sorted = merged.sort((a, b) => {
    const tagA = (a.agentTag || a.name || '').toLowerCase();
    const tagB = (b.agentTag || b.name || '').toLowerCase();
    if (tagA !== tagB) return tagA.localeCompare(tagB, 'zh');
    const arrA = a.arrProductMillion ?? -1;
    const arrB = b.arrProductMillion ?? -1;
    if (arrA !== arrB) return arrB - arrA;
    return (a.name || '').localeCompare(b.name || '', 'zh');
  });

  const out = {
    version: '4.0.0',
    lastUpdate: new Date().toISOString().slice(0, 10),
    totalCompanies: sorted.length,
    note: 'v4.0 合并 AI Company.xlsx：Agent标签三级、腾讯云赛道、ARR/国家/分类等',
    companies: sorted.map((c, i) => ({ ...c, id: i + 1 })),
  };

  if (!DRY_RUN) {
    fs.writeFileSync(COMPANIES_JSON, JSON.stringify(out, null, 2), 'utf8');
    console.log('✅ 已写入', COMPANIES_JSON);
  } else {
    console.log('🔸 [dry-run] 将写入', sorted.length, '条记录');
    console.log('🔸 示例（首条）:', JSON.stringify(out.companies[0], null, 2).slice(0, 600) + '...');
  }

  console.log('\n📊 合并结果: Excel 行', excelRows.length, '| 原有未匹配保留', unmatchedExisting.length, '| 合计', out.companies.length);
}

main();
