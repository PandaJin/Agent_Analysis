# 数据格式说明

## JSON 结构

`data/companies.json` 的结构：

```json
{
  "version": "版本号",
  "lastUpdate": "最后更新日期 YYYY-MM-DD",
  "totalCompanies": 总公司数,
  "companies": [
    { 公司/产品对象 }
  ],
  "metadata": { 元数据 }
}
```

## 公司/产品对象字段（v4.0 与 AI Company.xlsx 对齐）

### 必填字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | number | 唯一标识符 | `1` |
| `name` | string | 产品/公司中文名称 | `"ChatGPT"` |
| `nameEn` | string | 英文名称 | `"OpenAI"` |
| `description` | string | 简介 (10-500字) | `"GPT系列领导者..."` |

### 分类与赛道（替代原 layer/scene 结构）

| 字段 | 类型 | 说明 |
|------|------|------|
| `agentTag` | string | Agent 标签一级（原 layer 语义） |
| `agentTagLevel2` | string | Agent 标签二级 |
| `agentTagLevel3` | string | Agent 标签三级 |
| `tencentTrack1` | string | 腾讯云一级标签 |
| `tencentTrack2` | string | 腾讯云二级标签 |
| `tencentTrack3` | string | 腾讯云三级标签 |
| `tencentTrack4` | string | 腾讯云四级标签 |
| `tencentTrack5` | string | 腾讯云五级行业标签 |
| `tencentTrack6` | string | 腾讯云六级行业标签 |

### 地域与市场

| 字段 | 类型 | 说明 |
|------|------|------|
| `region` | string | 地域：`china` / `overseas` / `global` |
| `market` | string | 市场（如 国内/出海/海外） |
| `country` | string | 国家（来自 Excel） |
| `isChineseProduct` | string | 是否华人产品（是/否 等） |

### 收入与商业（ARR 以 Excel 产品收入为准）

| 字段 | 类型 | 说明 |
|------|------|------|
| `arr` | string | 展示用 ARR（如 `$25.5B+`） |
| `arrProductMillion` | number | 产品收入 ARR（百万美金） |
| `arrWebMillion` | number | Web 收入 ARR（百万美金） |
| `arrAppMillion` | number | APP 收入 ARR（百万美金） |
| `mau` | string | 月活等 |
| `category` | string | 分类（来自 Excel） |

### 兼容保留字段（可选）

| 字段 | 类型 | 说明 |
|------|------|------|
| `layer` | string | 技术栈层级（兼容旧筛选） |
| `scene` | string | 应用场景 |
| `subScene` | string | 细分场景 |
| `model` | string | 商业模式 2b/2c/2b2c |
| `modelSub` | string | 商业模式细分 |
| `company` | string | 母公司/公司名（产品时用） |
| `features` | array | 核心功能列表 |
| `userType` | string | 用户类型 |
| `pricingModel` | string | 付费模式 |
| `pricingRange` | string | 定价区间 |
| `founded` | string | 成立年份 |
| `funding` | string | 总融资额 |
| `investors` | array | 投资方列表 |
| `fundingRounds` | array | 融资轮次详情 |
| `website` | string | 官网 URL |
| `github` | string | GitHub 地址 |
| `highlight` | string | 核心亮点 |
| `logo` | string | Logo 文字缩写 |
| `logoUrl` | string | Logo 图片 URL |

## 数据校验

```bash
npm run validate
# 或
node scripts/validate-data.js
```

## 从 AI Company.xlsx 重新导入/合并

```bash
npm run import-xlsx
# 或
node scripts/import-ai-company-xlsx.js
```

可选 `--dry-run` 仅预览不写文件。
