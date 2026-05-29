# Obsidian 个人工作台插件

[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple)](https://obsidian.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

一个 Obsidian 插件，提供统一的工作台界面，帮助你管理计划、事项、学习和知识。

**欢迎下载使用！** 如果你有任何建议或发现了 bug，欢迎在 [Issues](https://github.com/XGWatermelon/Obsidian-workhouse/issues) 中反馈。你也可以 clone 源码，让 AI 帮你定制化修改，打造专属自己的工作台。当前版本已经过通用性调整，但可能仍有不足之处，敬请见谅。

---

## 功能特性

- **计划管理** — 日计划、周计划，自动关联
- **事项跟踪** — 任务/想法/项目/写作/学习，状态流转
- **状态监控** — 待办统计、逾期提醒、完成率追踪
- **学习分析** — 年度活跃度热力图、领域覆盖、学习状态分布
- **知识管理** — 事项清单、事项池、文档概览
- **稍后阅读** — 收藏摘录、待归类笔记管理
- **配置驱动** — 文件夹、状态、类型、领域全部可配置
- **10 套主题** — 暗夜绿、海洋蓝、日落橙、森林绿、梦幻紫、樱桃红、青色、金沙、玫瑰粉、石板灰

---

## 安装

### 从 Release 安装（推荐）

1. 前往 [Releases 页面](https://github.com/XGWatermelon/Obsidian-workhouse/releases)，下载最新版本的 `main.js`、`manifest.json`、`styles.css`
2. 在你的 Obsidian 仓库中创建文件夹 `.obsidian/plugins/worktop/`
3. 将下载的三个文件放入该文件夹
4. 打开 Obsidian → 设置 → 第三方插件 → 找到「个人工作台」→ 启用

> **注意**：请从 Release 页面下载，不要下载仓库源码压缩包（源码需要构建才能使用）。

### 从源码构建

```bash
git clone https://github.com/XGWatermelon/Obsidian-workhouse.git
cd Obsidian-workhouse
npm install
npm run build
# 构建产物：main.js（项目根目录）
```

---

## 快速开始

1. **打开工作台** — 点击左侧边栏图标，或按 `Ctrl+P` 输入「打开工作台」
2. **创建今日日计划** — 按 `Ctrl+P` 输入「创建今日日计划」
3. **创建事项** — 按 `Ctrl+P` 输入「创建事项」
4. **使用工作台** — 在 4 个标签页中查看和管理你的工作

详细使用说明请参见 [插件说明书](docs/插件说明书.md)。

---

## 文档

| 文档 | 说明 | 适用对象 |
|------|------|---------|
| [插件说明书](docs/插件说明书.md) | 安装、配置、功能、工作流、FAQ | 所有用户 |
| [架构文档](docs/架构文档.md) | 技术栈、项目结构、模块详解、数据流 | 开发者 |
| [设计书](docs/设计书.md) | 设计原则、目录结构、界面设计、数据模型 | 开发者、设计评审 |
| [开发指南](docs/开发指南.md) | 开发环境、编码准则、Git 工作流、测试 | 开发者 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更日志 | 所有人 |

---

## 项目结构

```
├── main.ts                    # 插件入口
├── manifest.json              # 插件元数据
├── styles.css                 # 样式文件
├── esbuild.config.mjs         # 构建配置
└── src/
    ├── config/                # 配置层（types, defaults, loader, accessors）
    ├── modals/                # 弹窗层（CreateNoteModal, ConfirmModal）
    ├── services/              # 服务层（Plan, Workflow, Init, Property）
    ├── settings/              # 设置层（PluginSettings）
    ├── themes/                # 主题层（10 套预设主题）
    ├── utils/                 # 工具层（dataview, templates, theme）
    └── views/                 # 视图层（WorkspaceView, StatusBar, QuickActions, 4 个标签页）
```

---

## 技术栈

- **TypeScript 5.3** — 类型安全的开发语言
- **Obsidian API** — 插件框架
- **esbuild** — 快速构建工具
- **Moment.js** — 日期处理（Obsidian 内置）
- **cal-heatmap** — 热力图组件

---

## 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build
```

更多开发信息请参见 [开发指南](docs/开发指南.md)。

---

## 目录结构

插件推荐的 Obsidian 仓库目录结构：

```
用户的 Obsidian 仓库/
├── 工作台/                    ← 插件自动生成
│   ├── 日计划/
│   ├── 周计划/
│   ├── 事项/
│   │   ├── 任务/
│   │   ├── 想法/
│   │   ├── 项目/
│   │   ├── 写作/
│   │   └── 学习/
│   ├── 节点/
│   ├── 待整理/
│   │   └── 收藏/
│   ├── 清单/
│   └── 常用入口.md
├── work-top-demo/             ← 领域/模块示例文件
├── （用户自己的其他文件夹）    ← 用户管理，插件不碰
└── .obsidian/
```

**设计原则**：插件只在工作台文件夹下生成内容，不篡改用户的其他文件夹。

---

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'feat: Add some AmazingFeature'`)
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

*最后更新：2026-05-30*
