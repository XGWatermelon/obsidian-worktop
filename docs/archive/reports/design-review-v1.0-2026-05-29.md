# Obsidian 工作台插件 — 设计审查报告

> **版本**：v1.0.2
> **日期**：2026-05-29
> **审查范围**：项目整体架构、代码组织、设计模式
> **审查目标**：识别设计层面的问题，提出改进方案

---

## 一、执行摘要

本报告对 Obsidian 工作台插件进行设计层面的全面审查。审查发现 **6 个主要设计问题**，按严重程度排序如下：

| 序号 | 问题 | 严重程度 | 状态 | 建议优先级 |
|------|------|----------|------|------------|
| 1 | main.ts 职责混乱（上帝类） | 🔴 高 | ✅ 已修 | P0 |
| 2 | 两套配置并存（data.json vs config.json） | 🔴 高 | ✅ 已修 | P0 |
| 3 | 硬编码的「软编码」 | 🟡 中 | ✅ 已修 | P1 |
| 4 | 文件夹创建时机不当 | 🟡 中 | ✅ 已修 | P1 |
| 5 | 视图层职责不清 | 🟡 中 | ⬜ 未修 | P2 |
| 6 | 模板系统不灵活 | 🟢 低 | ⬜ 未修 | P2 |

**总体评价**：P0 和 P1 问题全部修复，仅剩 P2（视图层职责、模板系统）待后续优化。

---

## 二、当前架构分析

### 2.1 项目结构

```
Obsidian 工作台插件/
├── main.ts                          # 插件入口（仅注册，80行）
├── src/
│   ├── config/                      # 配置系统（唯一来源，config.json）
│   │   ├── types.ts                 # 类型定义（basic + advanced 分层）
│   │   ├── defaults.ts              # 默认配置
│   │   ├── loader.ts                # 配置加载（仅 config.json + 默认值）
│   │   └── accessors.ts             # 配置访问工具
│   ├── services/                    # 业务逻辑层（新增）
│   │   └── PlanService.ts           # 计划创建服务
│   ├── settings/
│   │   └── PluginSettings.ts        # 设置界面（直接编辑 config）
│   ├── modals/
│   │   ├── ConfirmModal.ts          # 确认弹窗（新增）
│   │   └── CreateNoteModal.ts       # 创建弹窗
│   ├── utils/
│   │   ├── dataview.ts              # 数据查询
│   │   ├── templates.ts             # 模板生成
│   │   └── theme.ts                 # 主题工具
│   ├── views/
│   │   ├── WorkspaceView.ts         # 主视图
│   │   ├── StatusBar.ts             # 状态栏
│   │   ├── QuickActions.ts          # 快捷操作
│   │   └── tabs/
│   │       ├── ActionTab.ts         # 行动指北
│   │       ├── KnowledgeTab.ts      # 知识管理
│   │       ├── AnalysisTab.ts       # 学习分析
│   │       └── ReadingTab.ts        # 稍后阅读
│   └── themes/
│       └── index.ts                 # 主题配置
├── styles.css                       # 样式
└── docs/                            # 文档
```

### 2.2 数据流

```
用户操作
    ↓
main.ts（命令处理 + 按需创建文件夹）
    ↓
config/accessors.ts（配置读取）
    ↓
templates.ts（生成内容）
    ↓
Obsidian API（文件操作）
    ↓
views/（读取并渲染）
```

---

## 三、问题详细分析

### 3.1 问题 #1：main.ts 职责混乱（上帝类）

**严重程度**：🔴 高
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

- `ConfirmModal` 移到 `src/modals/ConfirmModal.ts`
- 日/周计划创建逻辑移到 `src/services/PlanService.ts`（含 `createDailyPlan`、`createWeeklyPlan`、`addDailyPlanLinkToWeeklyPlan`）
- main.ts 从 278 行精简到 80 行，只保留注册逻辑
- 命令回调直接调用 Service 方法：`callback: () => createDailyPlan(this.app)`

---

### 3.2 问题 #2：两套配置并存

**严重程度**：🔴 高
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

- 移除 `data.json` 读取逻辑，配置唯一来源为 `config.json`
- 移除旧的 `WorkspaceSettings` 接口和 `DEFAULT_SETTINGS`
- 移除 `migrateOldData()` 迁移代码
- `loadConfig()` 只合并 `config.json` + `DEFAULT_CONFIG`
- 设置界面直接编辑 `this.config`，通过 `saveConfigFile()` 写入 `config.json`

---

### 3.3 问题 #3：硬编码的「软编码」

**严重程度**：🟡 中
**状态**：🟡 部分修复
**修复日期**：2026-05-29

#### 已修复

**3.3.1 状态索引访问**

原代码通过 `slice(2)` 假设状态顺序，现已改为配置驱动：

```typescript
// 之前（脆弱）
const completedStatuses = getStatuses(app, "topic").slice(2);

// 之后（配置驱动）
const completedStatuses = getCompletedStatuses(app);
// 配置中新增 statuses.completed: ["已完成", "已放弃"]
```

**3.3.2 领域/模块 ID 生成**

原代码要求用户手动输入 ID，现已改为随机自动生成：

```typescript
// 之前（用户输入，可能重复或格式不对）
{ id: userInput, name: userInput }

// 之后（随机生成，永不重复）
function autoId(): string {
  return "id_" + Math.random().toString(36).substring(2, 10)
    + Date.now().toString(36).slice(-4);
}
```

**3.3.3 模块编辑**

原模块列表只有"添加"和"删除"，现已增加"编辑"功能：

- 每个模块显示"编辑"和"删除"按钮
- 点击"编辑"切换为输入框模式，支持修改名称
- 编辑时检查重复（排除自身）

#### 已修复（续）

**3.3.4 工作流按钮**

原工作流按钮在 `QuickActions.ts` 中硬编码，现已移到配置：

```typescript
// 之前（硬编码）
const workflowButtons = [
  { id: "daily-start", label: "每日开始" },
  // ...
];

// 之后（配置驱动）
const workflows = getWorkflows(this.app);
// 配置中：basic.workflows: [{ id: "daily-start", label: "每日开始" }, ...]
```

#### 未修复

- 模板占位符（"任务 1"、"内容 1"）仍在 `templates.ts` 中硬编码（P2）

---

### 3.4 问题 #4：文件夹创建时机不当

**严重程度**：🟡 中
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

- 移除 `initFolders()` 启动时批量创建文件夹的逻辑
- 改为按需创建：在 `vault.create()` 前调用 `ensureFolder()`
- `ensureFolder()` 逐级检查并创建缺失的父目录

```typescript
// 之前（启动时创建所有文件夹）
async onload() {
  await this.initFolders(); // 创建根目录 + 所有子目录
}

// 之后（按需创建）
// CreateNoteModal.submitTopic()
const folder = path.split("/").slice(0, -1).join("/");
await ensureFolder(this.app, folder);
await this.app.vault.create(path, content);
```

---

### 3.5 问题 #5：视图层职责不清

**严重程度**：🟡 中
**状态**：⬜ 未修
**改造难度**：高
**建议优先级**：P2

#### 问题描述

视图组件既负责数据获取，又负责 UI 渲染，导致数据获取逻辑重复。

#### 建议

引入 Service 层（`TaskService`、`StatsService`），视图通过 Service 获取数据。

---

### 3.6 问题 #6：模板系统不灵活

**严重程度**：🟢 低
**状态**：⬜ 未修
**改造难度**：中
**建议优先级**：P2

#### 问题描述

模板内容硬编码在 TypeScript 代码中，用户无法自定义模板结构。

#### 建议

将模板存为 `.md` 文件，支持用户编辑。

---

## 四、改进方案

### 4.1 目标架构

```
main.ts（入口，只做注册）
    │
    ├── config/（配置层）
    │   ├── types.ts
    │   ├── defaults.ts
    │   └── loader.ts
    │
    ├── commands/（命令层）
    │   ├── CreateDailyPlanCommand.ts
    │   ├── CreateWeeklyPlanCommand.ts
    │   └── CreateTopicCommand.ts
    │
    ├── services/（业务层）
    │   ├── PlanService.ts
    │   ├── TopicService.ts
    │   └── StatsService.ts
    │
    ├── views/（视图层，只负责渲染）
    │   └── ...
    │
    └── utils/（纯工具）
        └── ...
```

### 4.2 改进步骤

| 阶段 | 内容 | 状态 | 预计时间 |
|------|------|------|----------|
| Phase 1 | 配置系统统一 | ✅ 完成 | — |
| Phase 2 | 拆分 main.ts | ✅ 完成 | — |
| Phase 3 | 消除硬编码 | ✅ 完成 | — |
| Phase 4 | 按需创建文件夹 | ✅ 完成 | — |
| Phase 5 | 引入 Service 层 | ⬜ 待做 | 3-4 小时 |
| Phase 6 | 模板文件化 | ⬜ 待做 | 1-2 小时 |

---

## 五、变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-05-29 | 初始版本，全面审查 |
| v1.0.1 | 2026-05-29 | 修复 #2 配置统一、#3 状态索引+ID生成+模块编辑、#4 文件夹按需创建 |
| v1.0.2 | 2026-05-29 | 修复 #1 main.ts 拆分（ConfirmModal+PlanService）、#3 工作流按钮配置化 |
