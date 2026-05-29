# Obsidian 工作台插件 — 设计审查报告

> **版本**：v1.0.3
> **日期**：2026-05-29
> **审查范围**：项目整体架构、代码组织、设计模式、节点设计
> **审查目标**：识别设计层面的问题，提出改进方案

---

## 一、执行摘要

本报告对 Obsidian 工作台插件进行设计层面的全面审查。审查发现 **7 个主要设计问题**，按严重程度排序如下：

| 序号 | 问题 | 严重程度 | 状态 | 建议优先级 |
|------|------|----------|------|------------|
| 1 | main.ts 职责混乱（上帝类） | 🔴 高 | ✅ 已修 | P0 |
| 2 | 两套配置并存（data.json vs config.json） | 🔴 高 | ✅ 已修 | P0 |
| 3 | 硬编码的「软编码」 | 🟡 中 | ✅ 已修 | P1 |
| 4 | 文件夹创建时机不当 | 🟡 中 | ✅ 已修 | P1 |
| 5 | 视图层职责不清 | 🟡 中 | ⬜ 未修 | P2 |
| 6 | 模板系统不灵活 | 🟢 低 | ⬜ 未修 | P2 |
| 7 | 节点文件夹位置设计 | 🟡 中 | ⬜ 待定 | P1 |

**总体评价**：P0 问题全部修复，P1 问题大部分修复，仅剩节点位置和 P2 问题待定。

---

## 二、当前架构分析

### 2.1 项目结构（最新）

```
Obsidian 工作台插件/
├── main.ts                          # 插件入口（仅注册，98行）✅ 已精简
├── src/
│   ├── config/                      # 配置系统（唯一来源，config.json）
│   │   ├── types.ts                 # 类型定义（basic + advanced 分层）
│   │   ├── defaults.ts              # 默认配置
│   │   ├── loader.ts                # 配置加载（仅 config.json + 默认值）
│   │   └── accessors.ts             # 配置访问工具
│   ├── services/                    # 业务逻辑层（新增）✅
│   │   └── PlanService.ts           # 计划创建服务（新增）
│   ├── settings/
│   │   └── PluginSettings.ts        # 设置界面
│   ├── modals/
│   │   ├── ConfirmModal.ts          # 确认弹窗（新增）✅
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

### 2.2 数据流（最新）

```
用户操作
    ↓
main.ts（命令注册，调用 Service）
    ↓
services/PlanService.ts（业务逻辑）
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

#### 修复前

main.ts 278 行，包含：
- 配置加载
- 文件夹初始化
- 命令注册
- 日计划创建逻辑（90+ 行）
- 周计划创建逻辑
- 日计划关联周计划逻辑
- 视图刷新逻辑

#### 修复后

main.ts 98 行，只保留：
- 配置加载
- 视图注册
- 命令注册（调用 Service）

业务逻辑移到 `services/PlanService.ts`（115 行）：
- `createDailyPlan()` — 日计划创建
- `createWeeklyPlan()` — 周计划创建
- `addDailyPlanLinkToWeeklyPlan()` — 日周计划关联

弹窗组件移到 `modals/ConfirmModal.ts`（43 行）。

---

### 3.2 问题 #2：两套配置并存

**严重程度**：🔴 高
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

- 移除 `data.json` 读取逻辑
- 配置唯一来源为 `config.json`
- 移除旧的 `WorkspaceSettings` 接口和 `DEFAULT_SETTINGS`
- 移除 `migrateOldData()` 迁移代码
- `loadConfig()` 只合并 `config.json` + `DEFAULT_CONFIG`

---

### 3.3 问题 #3：硬编码的「软编码」

**严重程度**：🟡 中
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

**3.3.1 状态索引访问**

```typescript
// 之前（脆弱）
const completedStatuses = getStatuses(app, "topic").slice(2);

// 之后（配置驱动）
const completedStatuses = getCompletedStatuses(app);
// 配置中新增 statuses.completed: ["已完成", "已放弃"]
```

**3.3.2 领域/模块 ID 生成**

```typescript
// 之前（用户输入，可能重复）
{ id: userInput, name: userInput }

// 之后（随机生成）
function autoId(): string {
  return "id_" + Math.random().toString(36).substring(2, 10)
    + Date.now().toString(36).slice(-4);
}
```

**3.3.3 工作流按钮配置化**

```typescript
// 之前（硬编码）
const workflowButtons = [
  { id: "daily-start", label: "每日开始" },
  // ...
];

// 之后（配置驱动）
const workflows = getWorkflows(this.app);
// 配置中新增 basic.workflows
```

---

### 3.4 问题 #4：文件夹创建时机不当

**严重程度**：🟡 中
**状态**：✅ 已修复
**修复日期**：2026-05-29

#### 修复内容

- 移除 `initFolders()` 启动时批量创建文件夹的逻辑
- 改为按需创建：在 `vault.create()` 前调用 `ensureFolder()`

```typescript
// 之前（启动时创建所有文件夹）
async onload() {
  await this.initFolders();
}

// 之后（按需创建）
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

### 3.7 问题 #7：节点文件夹位置设计

**严重程度**：🟡 中
**状态**：⬜ 待定
**建议优先级**：P1

#### 问题描述

当前节点文件夹配置为 `{ name: "节点" }`，会拼接 root 变成 `工作台/节点/`。

但从语义和使用场景来看，节点应该与工作台平级。

#### 当前配置

```typescript
// defaults.ts
folders: {
  root: "工作台",
  structure: {
    dailyPlan: { name: "日计划" },
    weeklyPlan: { name: "周计划" },
    topic: { name: "事项" },
    nodes: { name: "节点" },  // ← 当前：工作台/节点/
    // ...
  },
}
```

#### 节点的本质

节点是**知识图谱的基础单元**，用于：

1. **Obsidian 图谱视图** — 节点是图谱中的节点
2. **Wiki 链接** — 节点是 `[[链接]]` 的目标
3. **AI 上下文** — 节点帮助 AI 理解知识结构
4. **知识积累** — 节点是永久性的知识，不是临时任务

#### 节点与其他文件夹的区别

| 文件夹 | 性质 | 生命周期 | 时间属性 |
|--------|------|----------|----------|
| 日计划 | 任务管理 | 短期（当天） | 强 |
| 周计划 | 任务管理 | 短期（当周） | 强 |
| 事项 | 任务管理 | 中期（有截止日期） | 中 |
| **节点** | **知识积累** | **永久** | **无** |
| 待整理 | 临时存储 | 短期 | 弱 |

#### 建议方案

**推荐：节点与工作台平级**

```
仓库根目录/
├── 工作台/              ← 任务管理（时间驱动）
│   ├── 日计划/
│   ├── 周计划/
│   ├── 事项/
│   └── 常用入口.md
│
├── 节点/                ← 知识图谱（知识驱动）
│   ├── AI/
│   │   ├── MCP协议.md
│   │   └── LangChain框架.md
│   └── SAP/
│       └── ...
│
└── 待整理/              ← 收件箱
```

#### 理由

1. **语义清晰** — 节点是知识积累，不是工作台的附属
2. **引用简洁** — `[[节点/MCP协议]]` 比 `[[工作台/节点/MCP协议]]` 简洁
3. **扩展性好** — 未来可以按领域细分：`节点/AI/`、`节点/SAP/`
4. **图谱友好** — Obsidian 图谱视图中节点更易发现
5. **多工作台支持** — 如果未来支持多工作台，节点可以共享

#### 配置改造方案

```typescript
// defaults.ts
folders: {
  root: "工作台",
  structure: {
    dailyPlan: { name: "日计划", pattern: "{date}-日计划" },
    weeklyPlan: { name: "周计划", pattern: "{year}-W{week}-本周计划" },
    topic: { name: "事项" },
    // nodes 改为绝对路径（包含 /）
    nodes: { name: "节点" },  // ← 不再拼接 root，直接返回 "节点"
    inbox: { name: "待整理" },
    savedArticles: { name: "待整理/收藏摘录" },
    toBeCategorized: { name: "待整理/待归类" },
  },
}
```

**路径拼接逻辑**（已有）：
```typescript
// accessors.ts
export function getFolderPath(app: App, folderKey: string): string {
  const folder = config.basic.folders.structure[folderKey];
  // 如果 name 包含 "/"，视为绝对路径，不拼接 root
  if (folder.name.includes("/")) return folder.name;
  return `${config.basic.folders.root}/${folder.name}`;
}
```

只需把 `nodes` 的 `name` 改为包含 `/` 的路径，或者从配置中移除，改为独立配置项。

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
    ├── services/（业务层）
    │   ├── PlanService.ts ✅ 已有
    │   ├── TopicService.ts（待做）
    │   └── StatsService.ts（待做）
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
| Phase 5 | 节点位置改造 | ⬜ 待做 | 0.5 小时 |
| Phase 6 | 引入 Service 层 | ⬜ 待做 | 3-4 小时 |
| Phase 7 | 模板文件化 | ⬜ 待做 | 1-2 小时 |

---

## 五、变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-05-29 | 初始版本，全面审查 |
| v1.0.1 | 2026-05-29 | 修复 #2 配置统一、#3 状态索引+ID生成+模块编辑、#4 文件夹按需创建 |
| v1.0.2 | 2026-05-29 | 修复 #1 main.ts 拆分（ConfirmModal+PlanService）、#3 工作流按钮配置化 |
| v1.0.3 | 2026-05-29 | 新增 #7 节点文件夹位置设计分析，建议节点与工作台平级 |
