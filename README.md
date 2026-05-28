# Obsidian 智能工作台插件

[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple)](https://obsidian.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

一个 Obsidian 插件，提供统一的工作台界面，帮助你管理日记、任务、学习计划和知识笔记。

---

## 功能特性

### 快速创建（7个按钮）
- **任务** / **想法** / **项目** / **灵感** / **写作** / **学习** — 一键创建对应类型的事项
- **日志** — 快速创建今日日记

### 工作流管理（7个按钮）
- **每日开始** — 创建或打开今日日记，开始新的一天
- **任务总览** — 查看所有进行中的任务
- **待整理清单** — 处理待整理文件夹中的文件
- **任务评估** — 评估待定的任务
- **写作管理** — 管理进行中的写作项目
- **学习统计** — 查看学习分析数据
- **最近动态** — 快速回到最近修改的文件

### 状态监控（4个卡片）
- **今日日记** — 显示今日日期，点击打开日记
- **今日待办** — 统计今日待办任务数量
- **本周待办** — 统计本周待办任务数量
- **逾期** — 统计逾期事项数量

### 标签页（4个）
- **行动指北** — 今日要事、活跃任务、本周计划、学习进度、最近修改
- **知识管理** — 事项清单、事项池、最近笔记
- **学习分析** — 热力图、学习状态分布、SAP 模块覆盖
- **稍后阅读** — 收藏摘录、待归类

### 配置选项
- 打开位置（主编辑区 / 侧边栏）
- 文件路径配置（日记、事项、周计划、待整理文件夹）

---

## 安装

### 方法一：手动安装

1. 下载最新版本的 `main.js`、`manifest.json`、`styles.css`
2. 复制到你的 Obsidian 仓库：
   ```
   <你的仓库>/.obsidian/plugins/worktop/
   ```
3. 在 Obsidian 中启用插件：
   - 打开设置 → 第三方插件
   - 找到 "Worktop" 并启用

### 方法二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/XGWatermelon/Obsidian-workhouse.git
cd Obsidian-workhouse

# 安装依赖
npm install

# 构建
npm run build

# 复制到插件目录
cp main.js manifest.json styles.css <你的仓库>/.obsidian/plugins/worktop/
```

---

## 使用方法

### 打开工作台

- **点击侧边栏图标**：点击左侧边栏的布局图标
- **命令面板**：`Ctrl/Cmd + P` → 输入"打开工作台"
- **快捷键**：在设置中绑定快捷键

### 快速创建事项

1. 点击工作台顶部的创建按钮（任务/想法/项目/灵感/写作/学习）
2. 在弹窗中输入标题
3. 文件自动创建到 `事项/` 文件夹并打开

### 使用工作流

- **每日开始**：每天早上点击，快速创建今日日记
- **任务总览**：查看当前正在进行的任务
- **待整理**：处理临时笔记和待归档文件
- **任务评估**：评估新创建的任务
- **写作管理**：跳转到正在进行的写作项目
- **学习统计**：查看学习进度和热力图
- **最近动态**：回到最近编辑的文件

### 配置插件

1. 打开设置 → 第三方插件 → Worktop
2. 点击齿轮图标打开配置页面
3. 修改配置项并保存

---

## 文件结构

```
<你的仓库>/
├── 日记/
│   ├── 2026-05-28.md              # 今日日记
│   ├── 2026-W22-本周计划.md        # 本周计划
│   └── ...
├── 事项/
│   ├── 2026-05-28-学习ABAP.md     # 事项文件
│   ├── 2026-05-28-写文章.md
│   └── ...
├── 待整理/
│   ├── 临时笔记.md
│   └── ...
└── .obsidian/
    └── plugins/
        └── worktop/
            ├── main.js
            ├── manifest.json
            └── styles.css
```

---

## 开发

### 环境要求

- Node.js >= 16
- npm >= 8

### 开发命令

```bash
# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 更新版本号
npm run version
```

### 项目结构

```
├── main.ts                          # 插件入口
├── manifest.json                    # 插件元数据
├── styles.css                       # 样式文件
├── esbuild.config.mjs               # 构建配置
├── tsconfig.json                    # TypeScript 配置
├── package.json                     # 项目配置
└── src/
    ├── settings/
    │   └── PluginSettings.ts        # 配置页面
    ├── modals/
    │   └── CreateNoteModal.ts       # 创建笔记弹窗
    ├── utils/
    │   ├── theme.ts                 # 主题工具
    │   ├── templates.ts             # 模板工具
    │   └── dataview.ts              # 数据查询工具
    └── views/
        ├── WorkspaceView.ts         # 主视图容器
        ├── StatusBar.ts             # 状态栏
        ├── QuickActions.ts          # 快捷操作栏
        └── tabs/
            ├── ActionTab.ts         # 行动指北标签页
            ├── KnowledgeTab.ts      # 知识管理标签页
            ├── AnalysisTab.ts       # 学习分析标签页
            └── ReadingTab.ts        # 稍后阅读标签页
```

---

## 技术栈

- **TypeScript** — 类型安全的 JavaScript
- **Obsidian API** — 插件开发框架
- **esbuild** — 快速构建工具
- **Moment.js** — 日期处理库

---

## 文档

- [工作台插件说明书](docs/工作台插件说明书.md) — 详细的使用说明和工作流
- [测试修改记录](docs/测试修改记录.md) — 测试问题和修复记录
- [项目架构文档](docs/项目架构文档.md) — 项目架构说明

---

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 致谢

- [Obsidian](https://obsidian.md/) — 优秀的知识管理工具
- [Obsidian API](https://github.com/obsidianmd/obsidian-api) — 插件开发文档

---

## 联系方式

- GitHub: [XGWatermelon](https://github.com/XGWatermelon)
- 项目链接: [https://github.com/XGWatermelon/Obsidian-workhouse](https://github.com/XGWatermelon/Obsidian-workhouse)

---

*最后更新：2026-05-28*
