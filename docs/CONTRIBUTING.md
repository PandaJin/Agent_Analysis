# 贡献指南

感谢你对 AI Agent 生态玩家地图项目的关注！

## 如何贡献

### 添加新公司

1. **Fork 本仓库**

2. **编辑 `data/companies.json`**
   - 在 `companies` 数组末尾添加新条目
   - 确保 `id` 是唯一的递增数字
   - 所有必填字段都要填写

3. **运行数据校验**（可选）
   ```bash
   node scripts/validate-data.js
   ```

4. **提交 Pull Request**
   - 标题：`feat: 添加 [公司名称]`
   - 描述：简要说明添加理由

### 修正数据

如果发现数据错误：
1. 在 Issue 中报告，或
2. 直接提交 PR 修正

### 数据质量要求

✅ **必须包含**：
- 准确的公司名称（中英文）
- 正确的分类（layer, scene, region, model）
- 真实的融资信息
- 有效的官网链接

❌ **避免**：
- 虚假或夸大的数据
- 过时的信息
- 未验证的融资额

## 数据格式

详见 [DATA_FORMAT.md](DATA_FORMAT.md)

## 行为准则

- 尊重事实
- 保持客观
- 礼貌沟通

## 问题反馈

通过 [GitHub Issues](https://github.com/PandaJin/Agent_Analysis/issues) 报告问题。
