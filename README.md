# AI Agent 生态玩家地图

> 追踪全球 120+ AI Agent 产业链核心玩家的交互式可视化平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Last Update](https://img.shields.io/badge/last%20update-2026--02--04-green.svg)](/)
[![Companies](https://img.shields.io/badge/companies-120%2B-orange.svg)](/)

🌐 **在线演示**: [https://pandajin.github.io/Agent_Analysis](https://pandajin.github.io/Agent_Analysis)

---

## ✨ 功能特性

### 🔍 多维度筛选
- **技术栈层级**：基础设施层 / 大模型层 / 平台框架层 / 应用层
- **应用场景**：通用场景 / 水平场景 / 行业职能 / 行业垂直
- **二级筛选**：AI Coding / 设计创作 / 智能客服 / 法律 / 医疗等
- **地域分布**：国内 / 出海 / 海外
- **商业模式**：2B / 2C / 2B2C

### 📊 详细信息
每个公司卡片包含：
- **商业数据**：ARR、MAU、用户类型
- **融资信息**：总融资额、投资方（a16z、YC等）、融资轮次
- **产品信息**：定价模式、定价区间、核心功能
- **链接**：官网、GitHub地址

### 💾 导出功能
- **Excel导出**：完整数据表格，支持进一步分析
- **PDF导出**：适合打印和报告使用

### 📈 统计面板
实时显示：
- 总公司数量
- 筛选结果数量
- 最高ARR公司
- 总融资额统计

---

## 🚀 快速开始

### 在线使用
直接访问：[https://pandajin.github.io/Agent_Analysis](https://pandajin.github.io/Agent_Analysis)

### 本地运行

#### 方法1：直接打开（推荐）
```bash
git clone https://github.com/PandaJin/Agent_Analysis.git
cd Agent_Analysis
# 双击 index.html 或者
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

#### 方法2：使用本地服务器
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server

# 然后访问 http://localhost:8000
```

---

## 📂 项目结构

```
Agent_Analysis/
├── index.html              # 主页面
├── README.md               # 项目文档（本文件）
├── data/
│   ├── companies.json     # 公司数据（120+家）
│   └── schema.json        # 数据格式规范
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── app.js             # 核心应用逻辑
│   ├── data-loader.js     # 数据加载
│   ├── filters.js         # 筛选功能
│   └── export.js          # Excel/PDF导出
├── scripts/
│   ├── validate-data.js   # 数据校验脚本
│   └── generate-full-data.py  # 完整数据生成
├── docs/
│   ├── CONTRIBUTING.md    # 贡献指南
│   └── DATA_FORMAT.md     # 数据格式说明
└── .github/
    └── workflows/
        └── validate.yml   # 自动数据校验
```

---

## 🤝 如何贡献

我们欢迎任何形式的贡献！

### 添加新公司

1. **Fork 本仓库**

2. **编辑数据文件** `data/companies.json`
   
   添加新公司条目（参考 [数据格式说明](docs/DATA_FORMAT.md)）：
   ```json
   {
     "id": 121,
     "name": "公司中文名",
     "nameEn": "Company English Name",
     "layer": "application",
     "scene": "horizontal",
     "subScene": "coding",
     "region": "global",
     "model": "2b",
     "description": "公司简介，至少10字，不超过500字",
     "features": ["特点1", "特点2", "特点3"],
     "arr": "$100M+",
     "mau": "10M+",
     "userType": "开发者",
     "pricingModel": "订阅制",
     "pricingRange": "$10-50/月",
     "founded": "2023",
     "funding": "$50M",
     "investors": ["a16z", "YC"],
     "fundingRounds": [
       {
         "date": "2024-06",
         "round": "A轮",
         "amount": "$50M",
         "investors": ["a16z"]
       }
     ],
     "website": "https://example.com",
     "github": "https://github.com/example",
     "highlight": "核心亮点",
     "logo": "🚀"
   }
   ```

3. **运行数据校验**（可选）
   ```bash
   node scripts/validate-data.js
   ```

4. **提交 Pull Request**
   - 标题格式：`feat: 添加 [公司名称]`
   - 描述：简要说明为何添加这家公司

### 修正数据

如果发现数据错误，欢迎提交 Issue 或 PR 修正。

### 其他贡献方式

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📖 改进文档
- 🌐 翻译（英文版）

详见 [贡献指南](docs/CONTRIBUTING.md)

---

## 📊 数据来源

本项目数据来自：
- 公开融资信息（Crunchbase、CB Insights）
- 公司官网
- 行业报告（Gartner、BCG、久谦咨询）
- 公开的产品分析

**免责声明**：所有数据仅供参考，可能存在滞后或不准确。如有错误，欢迎指正。

---

## 🔧 技术栈

- **纯前端**：HTML + CSS + JavaScript（无框架依赖）
- **数据格式**：JSON
- **图表库**：Chart.js（可选）
- **导出库**：
  - Excel：[SheetJS](https://sheetjs.com/)
  - PDF：[jsPDF](https://github.com/parallax/jsPDF)
- **数据校验**：JSON Schema

---

## 📜 开源协议

MIT License - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

感谢以下资源和工具：
- 腾讯云 AI Agent 分析团队
- Anthropic Claude（文档整理）
- GitHub Copilot（代码辅助）
- 所有贡献者

---

## 📮 联系方式

- **Issue**：[GitHub Issues](https://github.com/PandaJin/Agent_Analysis/issues)
- **讨论**：[GitHub Discussions](https://github.com/PandaJin/Agent_Analysis/discussions)
- **作者**：[@PandaJin](https://github.com/PandaJin)

---

## 🗺️ 路线图

- [x] V1.0：基础功能上线（筛选、展示、导出）
- [ ] V1.1：增加对比功能（多家公司对比）
- [ ] V1.2：融资时间轴可视化
- [ ] V1.3：API数据自动更新
- [ ] V2.0：AI推荐功能（基于用户偏好推荐公司）

---

## 📈 统计数据

| 维度 | 数量 |
|------|------|
| 总公司数 | 120+ |
| 基础设施层 | 15+ |
| 大模型层 | 20+ |
| 平台框架层 | 25+ |
| 应用层 | 60+ |
| 国内公司 | 40+ |
| 海外公司 | 60+ |
| 出海公司 | 20+ |

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！⭐**

Made with ❤️ by [PandaJin](https://github.com/PandaJin)

</div>
