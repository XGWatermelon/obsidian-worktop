# Obsidian 工作台插件 — 设计审查报告

> **版本**：v1.1
> **日期**：2026-05-29
> **审查范围**：设计理念、文件夹策略
> **审查目标**：明确插件与用户文档的边界

---

## 一、核心设计理念

### 1.1 原则：插件不篡改用户文档

**核心思想**：插件只在自己的「地盘」（工作台文件夹）里工作，不主动修改或创建用户原本的文件夹结构。

### 1.2 边界划分

| 操作 | 插件的职责 | 用户的职责 |
|------|-----------|-----------|
| **生成文件/文件夹** | 只在 `工作台/` 下生成 | 用户自己的文件夹由用户管理 |
| **读取文件** | 可以读取整个库 | — |
| **移动/重命名文件** | ❌ 不做 | 用户自己处理 |
| **创建外部文件夹** | ❌ 不做（除非用户明确要求） | 用户自己处理 |

### 1.3 为什么这样设计？

1. **尊重用户** — 用户的笔记库是用户自己的，插件不应该随意改动
2. **避免混乱** — 自动创建的文件夹可能和用户已有的结构冲突
3. **清晰边界** — 插件的东西在工作台里，用户的东西在外面
4. **灵活迁移** — 用户可以随时把内容移进/移出工作台

---

## 二、文件夹策略

### 2.1 推荐结构

```
用户的 Obsidian 仓库/
│
├── 工作台/                          ← 插件的地盘（自动生成）
│   ├── 日计划/                     ← 插件创建
│   ├── 周计划/                     ← 插件创建
│   ├── 事项/                       ← 插件创建
│   ├── 节点/                       ← 插件创建（知识图谱节点）
│   ├── 待整理/                     ← 插件创建（收件箱）
│   │   ├── 收藏摘录/
│   │   └── 待归类/
│   └── 常用入口.md                 ← 插件创建
│
├── （用户自己的其他文件夹）          ← 用户管理，插件不碰
│   ├── 日记/
│   ├── 项目/
│   └── ...
│
└── .obsidian/
```

### 2.2 设计要点

**插件自动生成的（在工作台下）**：
- `工作台/日计划/` — 日计划文件
- `工作台/周计划/` — 周计划文件
- `工作台/事项/` — 事项文件
- `工作台/节点/` — 知识图谱节点
- `工作台/待整理/` — 收件箱
- `工作台/常用入口.md` — 快捷入口

**用户自己管理的（插件不碰）**：
- 用户自己的 `日记/` 文件夹
- 用户自己的 `节点/` 文件夹（如果已存在）
- 用户自己的 `待整理/` 文件夹（如果已存在）
- 任何用户已有的文件夹

### 2.3 用户迁移指南

如果用户已有 `节点/` 或 `待整理/` 文件夹，想让插件管理：

**方案 A：移动内容到工作台下**
```
1. 把 用户/节点/ 下的内容移动到 工作台/节点/
2. 把 用户/待整理/ 下的内容移动到 工作台/待整理/
3. 删除空的原文件夹（可选）
```

**方案 B：修改配置指向用户文件夹**
```json
{
  "basic": {
    "folders": {
      "structure": {
        "nodes": { "name": "节点" },      // 改为绝对路径
        "inbox": { "name": "待整理" }      // 改为绝对路径
      }
    }
  }
}
```

**注意**：如果配置为绝对路径（如 `节点`），插件会读取用户原有的文件夹，但不会自动创建。

---

## 三、配置改造

### 3.1 默认配置变更

**之前**（部分文件夹在工作台外）：
```json
{
  "basic": {
    "folders": {
      "root": "工作台",
      "structure": {
        "dailyPlan": { "name": "日计划" },
        "weeklyPlan": { "name": "周计划" },
        "topic": { "name": "事项" },
        "nodes": { "name": "节点" },           // ← 工作台外
        "inbox": { "name": "待整理" },          // ← 工作台外
        "savedArticles": { "name": "待整理/收藏摘录" },  // ← 工作台外
        "toBeCategorized": { "name": "待整理/待归类" }   // ← 工作台外
      }
    }
  }
}
```

**之后**（所有文件夹在工作台下）：
```json
{
  "basic": {
    "folders": {
      "root": "工作台",
      "structure": {
        "dailyPlan": { "name": "日计划" },
        "weeklyPlan": { "name": "周计划" },
        "topic": { "name": "事项" },
        "nodes": { "name": "工作台/节点" },           // ← 工作台下
        "inbox": { "name": "工作台/待整理" },          // ← 工作台下
        "savedArticles": { "name": "工作台/待整理/收藏摘录" },  // ← 工作台下
        "toBeCategorized": { "name": "工作台/待整理/待归类" }   // ← 工作台下
      }
    }
  }
}
```

### 3.2 路径拼接逻辑

```typescript
// accessors.ts
export function getFolderPath(app: App, folderKey: string): string {
  const folder = config.basic.folders.structure[folderKey];
  
  // 如果 name 包含 "/"，视为绝对路径，不拼接 root
  if (folder.name.includes("/")) return folder.name;
  
  // 否则拼接 root
  return `${config.basic.folders.root}/${folder.name}`;
}
```

**示例**：
- `{ name: "日计划" }` → `工作台/日计划`
- `{ name: "工作台/节点" }` → `工作台/节点`（绝对路径）
- `{ name: "节点" }` → `工作台/节点`（拼接 root）

### 3.3 文件夹创建策略

**按需创建**：只在实际使用时创建文件夹

```typescript
// 不要在 onload 时创建所有文件夹
// 而是在创建文件前检查并创建

async function createDailyPlan(app: App) {
  const path = getDailyPlanPath(app);
  const folder = path.split("/").slice(0, -1).join("/");
  await ensureFolder(app, folder);  // 此时才创建
  await app.vault.create(path, content);
}
```

---

## 四、代码改造

### 4.1 移除启动时批量创建

**之前**：
```typescript
// main.ts
async onload() {
  await this.initFolders(); // 启动时创建所有文件夹
}
```

**之后**：
```typescript
// main.ts
async onload() {
  // 只加载配置，不创建文件夹
  this.config = await loadConfig(this);
  // ...
}
```

### 4.2 按需创建文件夹

```typescript
// services/PlanService.ts
export async function createDailyPlan(app: App): Promise<void> {
  const path = getDailyPlanPath(app);
  
  // 按需创建文件夹
  const folder = path.split("/").slice(0, -1).join("/");
  await ensureFolder(app, folder);
  
  // 创建文件
  const content = getDailyPlanTemplate(app);
  await app.vault.create(path, content);
}
```

### 4.3 ensureFolder 函数

```typescript
// utils/dataview.ts
export async function ensureFolder(app: App, folderPath: string): Promise<void> {
  const parts = folderPath.split("/");
  let current = "";
  
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!fileExists(app, current)) {
      await app.vault.createFolder(current);
    }
  }
}
```

---

## 五、配置模板更新

### 模板 1：默认配置（所有内容在工作台下）

```json
{
  "version": 1,
  "basic": {
    "app": {
      "name": "工作台",
      "icon": "layout-dashboard",
      "viewTitle": "智能工作台"
    },
    "folders": {
      "root": "工作台",
      "structure": {
        "dailyPlan": { "name": "日计划", "pattern": "{date}-日计划" },
        "weeklyPlan": { "name": "周计划", "pattern": "{year}-W{week}-本周计划" },
        "topic": { "name": "事项" },
        "nodes": { "name": "工作台/节点" },
        "inbox": { "name": "工作台/待整理" },
        "savedArticles": { "name": "工作台/待整理/收藏摘录" },
        "toBeCategorized": { "name": "工作台/待整理/待归类" }
      }
    }
  }
}
```

### 模板 2：用户已有节点文件夹（读取用户文件夹）

```json
{
  "version": 1,
  "basic": {
    "folders": {
      "root": "工作台",
      "structure": {
        "dailyPlan": { "name": "日计划", "pattern": "{date}-日计划" },
        "weeklyPlan": { "name": "周计划", "pattern": "{year}-W{week}-本周计划" },
        "topic": { "name": "事项" },
        "nodes": { "name": "节点" },           // ← 读取用户原有的节点文件夹
        "inbox": { "name": "待整理" }           // ← 读取用户原有的待整理文件夹
      }
    }
  }
}
```

**注意**：这种配置下，插件会读取用户原有的 `节点/` 和 `待整理/` 文件夹，但不会自动创建。

---

## 六、变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-05-29 | 初始版本，全面审查 |
| v1.0.3 | 2026-05-29 | 新增节点设计分析 |
| v1.1 | 2026-05-29 | 明确设计理念：插件只在工作台下生成，不篡改用户文档 |
