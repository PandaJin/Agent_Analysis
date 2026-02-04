# 数据格式说明

## JSON 结构

`data/companies.json` 的结构：

```json
{
  "version": "版本号",
  "lastUpdate": "最后更新日期 YYYY-MM-DD",
  "totalCompanies": 总公司数,
  "companies": [
    {公司对象}
  ],
  "metadata": {元数据}
}
```

## 公司对象字段

### 必填字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | number | 唯一标识符 | `1` |
| `name` | string | 中文名称 | `"腾讯云"` |
| `nameEn` | string | 英文名称 | `"Tencent Cloud"` |
| `layer` | string | 技术栈层级 | `"infrastructure"` |
| `region` | string | 地域 | `"china"` |
| `model` | string | 商业模式 | `"2b"` |
| `description` | string | 公司简介 (10-500字) | `"国内头部云服务商..."` |

### 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `scene` | string | 应用场景（application层必填） |
| `subScene` | string | 细分场景 |
| `features` | array | 核心功能列表 |
| `arr` | string | 年度经常性收入 |
| `mau` | string | 月活跃用户数 |
| `userType` | string | 用户类型 |
| `pricingModel` | string | 付费模式 |
| `pricingRange` | string | 定价区间 |
| `founded` | string | 成立年份 (YYYY) |
| `funding` | string | 总融资额 |
| `investors` | array | 投资方列表 |
| `fundingRounds` | array | 融资轮次详情 |
| `website` | string | 官方网站 URL |
| `github` | string | GitHub 地址 |
| `highlight` | string | 核心亮点 (最多200字) |
| `logo` | string | Logo (emoji或缩写) |

## 枚举值

### layer (技术栈层级)
- `infrastructure` - 基础设施层
- `llm` - 大模型层
- `platform` - 平台/框架层
- `application` - 应用层

### scene (应用场景)
- `general` - 通用场景
- `horizontal` - 水平场景
- `function` - 行业职能
- `vertical` - 行业垂直

### region (地域)
- `china` - 国内
- `overseas` - 出海
- `global` - 海外

### model (商业模式)
- `2b` - 企业服务
- `2c` - 消费者服务
- `2b2c` - 混合模式

## 融资轮次格式

```json
{
  "date": "YYYY-MM",
  "round": "轮次名称",
  "amount": "金额",
  "investors": ["投资方1", "投资方2"]
}
```

## 示例

```json
{
  "id": 1,
  "name": "OpenAI",
  "nameEn": "OpenAI",
  "layer": "llm",
  "scene": "",
  "subScene": "closed",
  "region": "global",
  "model": "2b2c",
  "description": "GPT系列领导者，定义AI Agent时代技术标准",
  "features": ["GPT-4", "AGENTS.md", "Function Calling"],
  "arr": "$3.4B+",
  "mau": "300M+",
  "userType": "开发者+企业+消费者",
  "pricingModel": "API+订阅",
  "pricingRange": "$20-200/月",
  "founded": "2015",
  "funding": "$13.5B",
  "investors": ["Microsoft", "Sequoia"],
  "fundingRounds": [
    {
      "date": "2023-01",
      "round": "投资",
      "amount": "$10B",
      "investors": ["Microsoft"]
    }
  ],
  "website": "https://openai.com",
  "github": "https://github.com/openai",
  "highlight": "技术与生态双引擎",
  "logo": "OAI"
}
```

## 数据校验

使用 JSON Schema 校验：

```bash
node scripts/validate-data.js
```

Schema 文件：`data/schema.json`
