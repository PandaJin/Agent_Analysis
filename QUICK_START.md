# 快速开始指南

## 第一步：上传到GitHub

### 方式1：命令行上传（推荐）
```bash
cd Agent_Analysis

# 初始化git
git init
git add .
git commit -m "Initial commit: AI Agent Ecosystem Map"

# 关联远程仓库
git remote add origin https://github.com/PandaJin/Agent_Analysis.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 方式2：GitHub Desktop
1. 打开 GitHub Desktop
2. File -> Add Local Repository
3. 选择 Agent_Analysis 文件夹
4. Publish repository

### 方式3：网页上传
1. 访问 https://github.com/PandaJin/Agent_Analysis
2. 点击 "uploading an existing file"
3. 拖拽所有文件上传

## 第二步：启用GitHub Pages

1. 进入仓库Settings
2. 左侧菜单选择 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main" + "/ (root)"
5. 点击 Save

等待几分钟，访问：
https://pandajin.github.io/Agent_Analysis

## 第三步：完善数据

当前包含50家示例公司，扩展到120+：

```bash
# 编辑 data/companies.json
# 添加更多公司数据

# 或者运行数据生成脚本
python3 scripts/generate_full_data.py
```

## 第四步：数据校验

```bash
node scripts/validate-data.js
```

## 常见问题

**Q: 双击 index.html 无法加载数据？**  
A: 使用本地服务器：`python3 -m http.server 8000`

**Q: 如何添加新公司？**  
A: 参考 docs/DATA_FORMAT.md，编辑 companies.json

**Q: GitHub Pages 404？**  
A: 检查Settings->Pages是否正确配置，等待5分钟部署

