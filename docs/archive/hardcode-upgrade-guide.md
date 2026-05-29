# Obsidian 工作台插件 - 硬编码升级指导手册

> 版本：v2.0 | 日期：2026-05-29
> 目标：将所有硬编码改造为通用可配置系统，用户可通过 JSON 或设置界面自定义一切

---

## 一、改造总览

### 1.1 硬编码统计

| 类别 | 数量 | 优先级 | 影响范围 |
|------|------|--------|----------|
| 文件夹路径 | 12处 | P0 | 核心功能 |
| 状态/类型字符串 | 15处 | P0 | 核心功能 |
| 学习状态 | 5处(重复) | P0 | 数据统计 |
| 领域/模块 | 1处 | P1 | 领域分析 |
| 颜色值 | 8处 | P1 | UI 展示 |
| 类型映射 | 4处 | P1 | 创建功能 |
| 数值常量 | 8处 | P2 | 性能/体验 |
| 模板内容 | 5处 | P2 | 内容生成 |
| 应用名称/标签 | 3处 | P2 | UI 展示 |

### 1.2 改造原则

1. **一切皆可配置** — 应用名称、文件夹、状态、领域等全部通过配置定义
2. **向下兼容** — 新配置项必须有默认值，旧数据无需迁移
3. **双轨配置** — 支持设置界面可视化编辑 + JSON 文件直接编辑
4. **单一来源** — 消除重复定义，同一配置只在一个地方声明

---

## 二、配置文件设计

### 2.1 文件位置

```
.obsidian/
└── plugins/
    └── worktop/
        ├── main.js           # 插件代码
        ├── manifest.json     # 插件清单
        ├── styles.css        # 样式
        ├── data.json         # 插件设置（Obsidian 自动管理，存储基础配置）
        └── config.json       # 用户自定义配置（新增，存储完整配置）
```

### 2.2 配置优先级

```
config.json（用户自定义，最高优先级）
    ↓ 覆盖
data.json（插件设置界面保存的基础配置）
    ↓ 覆盖
DEFAULT_CONFIG（代码内置默认值）
```

### 2.3 完整配置结构 (config.json)

```json
{
  "$schema": "./config.schema.json",
  "version": 1,

  "app": {
    "name": "工作台",
    "icon": "layout-dashboard",
    "viewTitle": "智能工作台"
  },

  "folders": {
    "root": "工作台",
    "structure": {
      "dailyPlan": {
        "name": "日计划",
        "pattern": "{date}-日计划"
      },
      "weeklyPlan": {
        "name": "周计划",
        "pattern": "{year}-W{week}-本周计划"
      },
      "diary": {
        "name": "日记",
        "pattern": "{date}"
      },
      "inbox": {
        "name": "待整理"
      },
      "nodes": {
        "name": "节点"
      },
      "savedArticles": {
        "name": "待整理/收藏摘录"
      },
      "toBeCategorized": {
        "name": "待整理/待归类"
      }
    }
  },

  "domains": [
    {
      "id": "ai",
      "name": "AI",
      "color": "#7C3AED",
      "modules": [
        { "id": "agents", "name": "AGENTS" },
        { "id": "llm", "name": "大模型" },
        { "id": "mcp", "name": "MCP" },
        { "id": "skills", "name": "Skills" }
      ]
    },
    {
      "id": "sap",
      "name": "SAP",
      "color": "#0EA5E9",
      "modules": [
        { "id": "fico", "name": "FICO" },
        { "id": "hr", "name": "HR" },
        { "id": "mm", "name": "MM" },
        { "id": "sd", "name": "SD" }
      ]
    }
  ],

  "statuses": {
    "topic": ["待评估", "进行中", "已完成", "已放弃"],
    "learning": ["待阅读", "已阅读", "已理解", "已掌握"],
    "default": "待评估"
  },

  "types": [
    { "id": "task", "name": "任务", "icon": "checkbox" },
    { "id": "idea", "name": "想法", "icon": "lightbulb" },
    { "id": "project", "name": "项目", "icon": "folder" },
    { "id": "writing", "name": "写作", "icon": "pencil" },
    { "id": "learning", "name": "学习", "icon": "book" }
  ],

  "tabs": [
    { "id": "action", "name": "行动指北", "icon": "compass" },
    { "id": "knowledge", "name": "知识管理", "icon": "brain" },
    { "id": "analysis", "name": "学习分析", "icon": "chart" },
    { "id": "reading", "name": "稍后阅读", "icon": "bookmark" }
  ],

  "fields": {
    "status": "status",
    "type": "type",
    "deadline": "deadline",
    "created": "created",
    "updated": "updated",
    "learningStatus": "学习状态",
    "domain": "domain",
    "module": "module"
  },

  "limits": {
    "recentFiles": 20,
    "recentNotes": 15,
    "activeTopics": 10,
    "searchMinChars": 2,
    "searchResults": 20,
    "debounceDelay": 500
  },

  "theme": {
    "defaultId": "green-dark",
    "statusColors": {
      "overdue": "#FF6B6B",
      "completed": "#77DD77",
      "active": "#FFD93D",
      "understanding": "#4FC1FF"
    }
  },

  "templates": {
    "weeklyCategories": ["SAP 学习", "项目任务", "写作/事项"]
  }
}
```

---

## 三、配置样例

### 样例 1：AI 技术学习工作台

```json
{
  "app": {
    "name": "AI 学习中心",
    "icon": "brain",
    "viewTitle": "AI 学习工作台"
  },
  "folders": {
    "root": "AI-Learning",
    "structure": {
      "dailyPlan": { "name": "每日", "pattern": "{date}-学习计划" },
      "weeklyPlan": { "name": "每周", "pattern": "{year}-W{week}" },
      "diary": { "name": "学习记录" },
      "inbox": { "name": "Inbox" }
    }
  },
  "domains": [
    {
      "id": "llm",
      "name": "大模型",
      "color": "#8B5CF6",
      "modules": [
        { "id": "transformer", "name": "Transformer" },
        { "id": "fine-tune", "name": "微调" },
        { "id": "inference", "name": "推理优化" },
        { "id": "rag", "name": "RAG" }
      ]
    },
    {
      "id": "agents",
      "name": "AI Agent",
      "color": "#EC4899",
      "modules": [
        { "id": "langchain", "name": "LangChain" },
        { "id": "autogen", "name": "AutoGen" },
        { "id": "crewai", "name": "CrewAI" },
        { "id": "mcp", "name": "MCP" }
      ]
    },
    {
      "id": "tools",
      "name": "开发工具",
      "color": "#F59E0B",
      "modules": [
        { "id": "cursor", "name": "Cursor" },
        { "id": "claude-code", "name": "Claude Code" },
        { "id": "copilot", "name": "Copilot" }
      ]
    }
  ],
  "statuses": {
    "topic": ["想学", "学习中", "已掌握", "暂时搁置"],
    "learning": ["待阅读", "在读", "读完", "精通"]
  },
  "types": [
    { "id": "course", "name": "课程" },
    { "id": "paper", "name": "论文" },
    { "id": "project", "name": "实战项目" },
    { "id": "note", "name": "笔记" }
  ]
}
```

### 样例 2：团队项目管理

```json
{
  "app": {
    "name": "项目中心",
    "icon": "rocket",
    "viewTitle": "项目管理看板"
  },
  "folders": {
    "root": "Projects",
    "structure": {
      "dailyPlan": { "name": "日报", "pattern": "{date}-日报" },
      "weeklyPlan": { "name": "周报", "pattern": "W{week}" },
      "inbox": { "name": "待处理" }
    }
  },
  "domains": [
    {
      "id": "project-a",
      "name": "电商平台",
      "color": "#EF4444",
      "modules": [
        { "id": "frontend", "name": "前端" },
        { "id": "backend", "name": "后端" },
        { "id": "test", "name": "测试" },
        { "id": "devops", "name": "运维" }
      ]
    },
    {
      "id": "project-b",
      "name": "数据中台",
      "color": "#3B82F6",
      "modules": [
        { "id": "ingestion", "name": "数据采集" },
        { "id": "processing", "name": "数据处理" },
        { "id": "analysis", "name": "数据分析" },
        { "id": "viz", "name": "可视化" }
      ]
    }
  ],
  "statuses": {
    "topic": ["未开始", "开发中", "测试中", "已上线", "已关闭"]
  },
  "types": [
    { "id": "feature", "name": "需求" },
    { "id": "bug", "name": "Bug" },
    { "id": "improve", "name": "优化" },
    { "id": "doc", "name": "文档" }
  ],
  "tabs": [
    { "id": "action", "name": "待办看板", "icon": "kanban" },
    { "id": "knowledge", "name": "文档中心", "icon": "file-text" },
    { "id": "analysis", "name": "进度统计", "icon": "bar-chart" },
    { "id": "reading", "name": "参考资料", "icon": "bookmark" }
  ]
}
```

### 样例 3：个人知识库

```json
{
  "app": {
    "name": "知识库",
    "icon": "book-open",
    "viewTitle": "我的知识库"
  },
  "folders": {
    "root": "Knowledge",
    "structure": {
      "dailyPlan": { "name": "每日", "pattern": "{date}" },
      "weeklyPlan": { "name": "每周", "pattern": "{year}-W{week}" },
      "diary": { "name": "日记" },
      "inbox": { "name": "Inbox" },
      "nodes": { "name": "概念" }
    }
  },
  "domains": [
    {
      "id": "tech",
      "name": "技术",
      "color": "#10B981",
      "modules": [
        { "id": "frontend", "name": "前端" },
        { "id": "backend", "name": "后端" },
        { "id": "mobile", "name": "移动端" },
        { "id": "cloud", "name": "云服务" }
      ]
    },
    {
      "id": "business",
      "name": "业务",
      "color": "#F59E0B",
      "modules": [
        { "id": "product", "name": "产品" },
        { "id": "operation", "name": "运营" },
        { "id": "marketing", "name": "营销" }
      ]
    },
    {
      "id": "personal",
      "name": "个人成长",
      "color": "#8B5CF6",
      "modules": [
        { "id": "reading", "name": "阅读" },
        { "id": "thinking", "name": "思考" },
        { "id": "habits", "name": "习惯" }
      ]
    }
  ],
  "statuses": {
    "topic": ["待办", "进行中", "完成", "归档"],
    "learning": ["想读", "在读", "读完", "内化"]
  }
}
```

---

## 四、配置加载系统

### 4.1 类型定义

```typescript
// src/config/types.ts

export interface AppConfig {
  version: number;
  app: {
    name: string;
    icon: string;
    viewTitle: string;
  };
  folders: {
    root: string;
    structure: Record<string, FolderConfig>;
  };
  domains: DomainConfig[];
  statuses: {
    topic: string[];
    learning: string[];
    default: string;
  };
  types: TypeConfig[];
  tabs: TabConfig[];
  fields: Record<string, string>;
  limits: Record<string, number>;
  theme: {
    defaultId: string;
    statusColors: Record<string, string>;
  };
  templates: {
    weeklyCategories: string[];
  };
}

export interface FolderConfig {
  name: string;
  pattern?: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  color?: string;
  modules: ModuleConfig[];
}

export interface ModuleConfig {
  id: string;
  name: string;
}

export interface TypeConfig {
  id: string;
  name: string;
  icon?: string;
}

export interface TabConfig {
  id: string;
  name: string;
  icon?: string;
}
```

### 4.2 默认配置

```typescript
// src/config/defaults.ts

import { AppConfig } from "./types";

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,

  app: {
    name: "工作台",
    icon: "layout-dashboard",
    viewTitle: "智能工作台",
  },

  folders: {
    root: "工作台",
    structure: {
      dailyPlan: { name: "日计划", pattern: "{date}-日计划" },
      weeklyPlan: { name: "周计划", pattern: "{year}-W{week}-本周计划" },
      diary: { name: "日记", pattern: "{date}" },
      inbox: { name: "待整理" },
      nodes: { name: "节点" },
      savedArticles: { name: "待整理/收藏摘录" },
      toBeCategorized: { name: "待整理/待归类" },
    },
  },

  domains: [
    {
      id: "ai",
      name: "AI",
      color: "#7C3AED",
      modules: [
        { id: "agents", name: "AGENTS" },
        { id: "llm", name: "大模型" },
        { id: "mcp", name: "MCP" },
        { id: "skills", name: "Skills" },
      ],
    },
    {
      id: "sap",
      name: "SAP",
      color: "#0EA5E9",
      modules: [
        { id: "fico", name: "FICO" },
        { id: "hr", name: "HR" },
        { id: "mm", name: "MM" },
        { id: "sd", name: "SD" },
      ],
    },
  ],

  statuses: {
    topic: ["待评估", "进行中", "已完成", "已放弃"],
    learning: ["待阅读", "已阅读", "已理解", "已掌握"],
    default: "待评估",
  },

  types: [
    { id: "task", name: "任务", icon: "checkbox" },
    { id: "idea", name: "想法", icon: "lightbulb" },
    { id: "project", name: "项目", icon: "folder" },
    { id: "writing", name: "写作", icon: "pencil" },
    { id: "learning", name: "学习", icon: "book" },
  ],

  tabs: [
    { id: "action", name: "行动指北", icon: "compass" },
    { id: "knowledge", name: "知识管理", icon: "brain" },
    { id: "analysis", name: "学习分析", icon: "chart" },
    { id: "reading", name: "稍后阅读", icon: "bookmark" },
  ],

  fields: {
    status: "status",
    type: "type",
    deadline: "deadline",
    created: "created",
    updated: "updated",
    learningStatus: "学习状态",
    domain: "domain",
    module: "module",
  },

  limits: {
    recentFiles: 20,
    recentNotes: 15,
    activeTopics: 10,
    searchMinChars: 2,
    searchResults: 20,
    debounceDelay: 500,
  },

  theme: {
    defaultId: "green-dark",
    statusColors: {
      overdue: "#FF6B6B",
      completed: "#77DD77",
      active: "#FFD93D",
      understanding: "#4FC1FF",
    },
  },

  templates: {
    weeklyCategories: ["SAP 学习", "项目任务", "写作/事项"],
  },
};
```

### 4.3 配置加载器

```typescript
// src/config/loader.ts

import { App, Plugin, TFile } from "obsidian";
import { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./defaults";

const CONFIG_FILE = "config.json";

/**
 * 加载配置（合并 config.json + data.json + 默认值）
 */
export async function loadConfig(plugin: Plugin): Promise<AppConfig> {
  // 1. 从 data.json 加载基础配置
  const pluginData = (await plugin.loadData()) || {};

  // 2. 从 config.json 加载完整配置
  const customConfig = await loadConfigFile(plugin);

  // 3. 合并配置
  const config = deepMerge(DEFAULT_CONFIG, pluginData, customConfig);

  // 4. 确保 version 字段
  config.version = config.version || 1;

  return config;
}

/**
 * 加载插件目录下的 config.json
 */
async function loadConfigFile(plugin: Plugin): Promise<Partial<AppConfig> | null> {
  const pluginDir = (plugin as any).manifest?.dir || "";
  const configPath = pluginDir ? `${pluginDir}/${CONFIG_FILE}` : CONFIG_FILE;

  try {
    const file = plugin.app.vault.getAbstractFileByPath(configPath);
    if (file && file instanceof TFile) {
      const content = await plugin.app.vault.read(file);
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("加载 config.json 失败，使用默认配置:", e);
  }

  return null;
}

/**
 * 保存配置到 config.json
 */
export async function saveConfigFile(plugin: Plugin, config: Partial<AppConfig>): Promise<void> {
  const pluginDir = (plugin as any).manifest?.dir || "";
  const configPath = pluginDir ? `${pluginDir}/${CONFIG_FILE}` : CONFIG_FILE;
  const content = JSON.stringify(config, null, 2);

  try {
    const file = plugin.app.vault.getAbstractFileByPath(configPath);
    if (file && file instanceof TFile) {
      await plugin.app.vault.modify(file, content);
    } else {
      await plugin.app.vault.create(configPath, content);
    }
  } catch (e) {
    console.error("保存 config.json 失败:", e);
  }
}

/**
 * 验证配置
 */
export function validateConfig(config: Partial<AppConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.app && !config.app.name) {
    errors.push("app.name 不能为空");
  }

  if (config.domains && !Array.isArray(config.domains)) {
    errors.push("domains 必须是数组");
  }

  if (config.domains) {
    config.domains.forEach((domain, i) => {
      if (!domain.id) errors.push(`domains[${i}].id 不能为空`);
      if (!domain.name) errors.push(`domains[${i}].name 不能为空`);
      if (!Array.isArray(domain.modules)) {
        errors.push(`domains[${i}].modules 必须是数组`);
      }
    });
  }

  if (config.statuses) {
    if (!Array.isArray(config.statuses.topic)) {
      errors.push("statuses.topic 必须是数组");
    }
    if (!Array.isArray(config.statuses.learning)) {
      errors.push("statuses.learning 必须是数组");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 深度合并对象
 */
function deepMerge(...objects: any[]): any {
  return objects.reduce((merged, obj) => {
    if (!obj) return merged;

    Object.keys(obj).forEach((key) => {
      if (
        obj[key] &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key]) &&
        merged[key] &&
        typeof merged[key] === "object"
      ) {
        merged[key] = deepMerge(merged[key], obj[key]);
      } else {
        merged[key] = obj[key];
      }
    });

    return merged;
  }, {});
}
```

### 4.4 配置访问工具

```typescript
// src/config/accessors.ts

import { App } from "obsidian";
import { AppConfig, DomainConfig, ModuleConfig } from "./types";
import { DEFAULT_CONFIG } from "./defaults";

/**
 * 获取插件配置
 */
export function getConfig(app: App): AppConfig {
  const plugin = (app as any).plugins?.plugins?.["worktop"];
  return plugin?.config || DEFAULT_CONFIG;
}

/**
 * 获取应用名称
 */
export function getAppName(app: App): string {
  return getConfig(app).app.name;
}

/**
 * 获取根目录
 */
export function getRootFolder(app: App): string {
  return getConfig(app).folders.root;
}

/**
 * 获取文件夹路径
 */
export function getFolderPath(app: App, folderKey: string): string {
  const config = getConfig(app);
  const folder = config.folders.structure[folderKey];

  if (!folder) return `${config.folders.root}/${folderKey}`;

  // 如果是绝对路径（包含 /），直接返回
  if (folder.name.includes("/")) {
    return folder.name;
  }

  return `${config.folders.root}/${folder.name}`;
}

/**
 * 生成文件路径（使用命名模式）
 */
export function generateFilePath(app: App, folderKey: string, vars: Record<string, string>): string {
  const config = getConfig(app);
  const folder = config.folders.structure[folderKey];

  if (!folder?.pattern) {
    return `${getFolderPath(app, folderKey)}/${vars.date || "untitled"}`;
  }

  let pattern = folder.pattern;
  Object.entries(vars).forEach(([key, value]) => {
    pattern = pattern.replace(`{${key}}`, value);
  });

  return `${getFolderPath(app, folderKey)}/${pattern}`;
}

/**
 * 获取所有领域
 */
export function getDomains(app: App): DomainConfig[] {
  return getConfig(app).domains;
}

/**
 * 获取指定领域
 */
export function getDomain(app: App, domainId: string): DomainConfig | undefined {
  return getConfig(app).domains.find((d) => d.id === domainId);
}

/**
 * 获取领域的模块
 */
export function getModules(app: App, domainId: string): ModuleConfig[] {
  const domain = getDomain(app, domainId);
  return domain?.modules || [];
}

/**
 * 获取状态列表
 */
export function getStatuses(app: App, type: "topic" | "learning" = "topic"): string[] {
  return getConfig(app).statuses[type];
}

/**
 * 获取类型列表
 */
export function getTypes(app: App) {
  return getConfig(app).types;
}

/**
 * 获取类型名称
 */
export function getTypeName(app: App, typeId: string): string {
  const type = getConfig(app).types.find((t) => t.id === typeId);
  return type?.name || typeId;
}

/**
 * 获取标签页配置
 */
export function getTabs(app: App) {
  return getConfig(app).tabs;
}

/**
 * 获取字段名
 */
export function getFieldName(app: App, field: string): string {
  return getConfig(app).fields[field] || field;
}

/**
 * 获取数值限制
 */
export function getLimit(app: App, key: string): number {
  return getConfig(app).limits[key] ?? DEFAULT_CONFIG.limits[key] ?? 10;
}

/**
 * 获取状态颜色
 */
export function getStatusColor(app: App, status: string): string {
  return getConfig(app).theme.statusColors[status] || "var(--ws-gray)";
}
```

---

## 五、代码改造指南

### 5.1 改造示例：StatusBar.ts

**Before（硬编码）：**
```typescript
export class StatusBar {
  render(): void {
    const workspaceRoot = "工作台";
    const todayPath = `${workspaceRoot}/日计划/${today}-日计划.md`;
    
    this.createStatCard({
      label: "逾期",
      color: "#FF6B6B",
      // ...
    });
    
    if (fm.status === "已完成") { ... }
  }
}
```

**After（使用配置）：**
```typescript
import { getConfig, getFolderPath, getStatusColor, getStatuses } from "../config/accessors";

export class StatusBar {
  render(): void {
    const config = getConfig(this.app);
    const todayPath = generateFilePath(this.app, "dailyPlan", { date: today });
    
    this.createStatCard({
      label: "逾期",
      color: getStatusColor(this.app, "overdue"),
      // ...
    });
    
    const completedStatus = getStatuses(this.app, "topic")[2]; // "已完成"
    if (fm.status === completedStatus) { ... }
  }
}
```

### 5.2 改造示例：WorkspaceView.ts

**Before（硬编码）：**
```typescript
export class WorkspaceView extends ItemView {
  getDisplayText(): string {
    return "智能工作台";
  }

  private createTabNav(container: HTMLElement): void {
    const tabs = [
      { id: "action", label: "行动指北" },
      { id: "knowledge", label: "知识管理" },
      { id: "analysis", label: "学习分析" },
      { id: "reading", label: "稍后阅读" },
    ];
    // ...
  }
}
```

**After（使用配置）：**
```typescript
import { getConfig, getTabs } from "../config/accessors";

export class WorkspaceView extends ItemView {
  getDisplayText(): string {
    return getConfig(this.app).app.viewTitle;
  }

  private createTabNav(container: HTMLElement): void {
    const tabs = getTabs(this.app);
    // ...
  }
}
```

### 5.3 改造示例：dataview.ts

**Before（硬编码）：**
```typescript
export function getSapModuleStats(app: App): Record<string, Record<string, number>> {
  const modules = ["FICO", "HR", "MM", "SD"];
  const stats: Record<string, Record<string, number>> = {};

  modules.forEach((mod) => {
    stats[mod] = {
      待阅读: 0,
      已阅读: 0,
      已理解: 0,
      已掌握: 0,
    };
  });

  // ...
}
```

**After（使用配置）：**
```typescript
import { getConfig, getStatuses } from "../config/accessors";

export function getDomainModuleStats(
  app: App,
  domainId: string
): Record<string, Record<string, number>> {
  const config = getConfig(this.app);
  const domain = config.domains.find(d => d.id === domainId);
  if (!domain) return {};

  const learningStatuses = getStatuses(app, "learning");
  const stats: Record<string, Record<string, number>> = {};

  domain.modules.forEach((mod) => {
    stats[mod.name] = {};
    learningStatuses.forEach((status) => {
      stats[mod.name][status] = 0;
    });
  });

  // 统计逻辑...
  return stats;
}
```

### 5.4 改造示例：QuickActions.ts

**Before（硬编码）：**
```typescript
private render(): void {
  const createButtons = [
    { type: "task", label: "任务" },
    { type: "idea", label: "想法" },
    { type: "project", label: "项目" },
    // ...
  ];
}

private showTaskOverview(): void {
  const topics = getTopicsByStatus(this.app, "进行中");
  // ...
}
```

**After（使用配置）：**
```typescript
import { getConfig, getTypes, getStatuses } from "../config/accessors";

private render(): void {
  const types = getTypes(this.app);
  const createButtons = types.map(t => ({ type: t.id, label: t.name }));
}

private showTaskOverview(): void {
  const activeStatus = getStatuses(this.app, "topic")[1]; // "进行中"
  const topics = getTopicsByStatus(this.app, activeStatus);
  // ...
}
```

---

## 六、设置界面设计

### 6.1 界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  工作台插件设置                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ 基础设置 ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  应用名称:     [工作台                     ]           │ │
│  │  视图标题:     [智能工作台                 ]           │ │
│  │  根目录:       [工作台                     ]           │ │
│  │  默认主题:     [暗夜绿                  ▼]             │ │
│  │  打开方式:     [主编辑区 / 侧边栏    ○/●]             │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ 领域与模块 ───────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ AI                                    [编辑][删除]│ │ │
│  │  │   AGENTS │ 大模型 │ MCP │ Skills                 │ │ │
│  │  ├──────────────────────────────────────────────────┤ │ │
│  │  │ SAP                                   [编辑][删除]│ │ │
│  │  │   FICO │ HR │ MM │ SD                            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  [+ 添加领域]                                          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ 状态配置 ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  事项状态:  [待评估, 进行中, 已完成, 已放弃            ] │ │
│  │  学习状态:  [待阅读, 已阅读, 已理解, 已掌握            ] │ │
│  │  默认状态:  [待评估                                ▼]  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ 类型配置 ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ 任务 (task)                              [删除]  │ │ │
│  │  │ 想法 (idea)                              [删除]  │ │ │
│  │  │ 项目 (project)                           [删除]  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  [+ 添加类型]                                          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ 高级配置 ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  配置文件: .obsidian/plugins/worktop/config.json        │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │                                                  │ │ │
│  │  │  [JSON 编辑器区域]                               │ │ │
│  │  │                                                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  [验证配置]  [导出]  [导入]  [重置默认]  [打开文件]    │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 领域编辑弹窗

```
┌─────────────────────────────────────────┐
│  编辑领域                                │
├─────────────────────────────────────────┤
│                                         │
│  ID:     [ai                        ]   │
│  名称:   [AI                        ]   │
│  颜色:   [#7C3AED    ] [🎨]            │
│                                         │
│  模块:                                   │
│  ┌─────────────────────────────────┐    │
│  │ agents    AGENTS         [删除] │    │
│  │ llm       大模型         [删除] │    │
│  │ mcp       MCP           [删除] │    │
│  │ skills    Skills        [删除] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  新模块:                                 │
│  ID: [          ] 名称: [          ]    │
│                              [添加]     │
│                                         │
│         [取消]           [保存]         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 七、数据迁移策略

### 7.1 向下兼容

```typescript
// src/config/migration.ts

import { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./defaults";

interface OldSettings {
  workspaceRoot?: string;
  topicFolder?: string;
  inboxFolder?: string;
  topicStatus?: string[];
  topicTypes?: string[];
  learningStatus?: string[];
  domains?: string[];
  fieldNames?: Record<string, string>;
  // ... 其他旧字段
}

/**
 * 迁移旧配置到新格式
 */
export function migrateOldSettings(old: OldSettings): Partial<AppConfig> {
  if (!old) return {};

  return {
    version: 1,
    folders: {
      root: old.workspaceRoot || DEFAULT_CONFIG.folders.root,
      structure: {
        ...DEFAULT_CONFIG.folders.structure,
        inbox: { name: old.inboxFolder || "待整理" },
      },
    },
    statuses: {
      topic: old.topicStatus || DEFAULT_CONFIG.statuses.topic,
      learning: old.learningStatus || DEFAULT_CONFIG.statuses.learning,
      default: old.topicStatus?.[0] || DEFAULT_CONFIG.statuses.default,
    },
    types: (old.topicTypes || []).map((name) => ({
      id: name.toLowerCase(),
      name,
    })),
    domains: (old.domains || []).map((name) => ({
      id: name.toLowerCase(),
      name,
      modules: [],
    })),
    fields: old.fieldNames
      ? {
          learningStatus: old.fieldNames.learningStatus,
          type: old.fieldNames.type,
          status: old.fieldNames.status,
          deadline: old.fieldNames.deadline,
        }
      : DEFAULT_CONFIG.fields,
  };
}
```

### 7.2 加载时自动迁移

```typescript
// main.ts

async onload() {
  // 加载旧配置
  const oldData = await this.loadData();

  // 如果有旧配置且没有 version 字段，进行迁移
  if (oldData && !oldData.version) {
    const migrated = migrateOldSettings(oldData);
    this.config = deepMerge(DEFAULT_CONFIG, migrated);
    // 保存迁移后的配置
    await saveConfigFile(this, this.config);
  } else {
    // 正常加载
    this.config = await loadConfig(this);
  }
}
```

---

## 八、测试检查清单

### 8.1 功能测试

- [ ] 日计划创建功能正常
- [ ] 周计划创建功能正常
- [ ] 日计划关联周计划功能正常
- [ ] 事项创建功能正常
- [ ] 状态栏统计正确
- [ ] 学习统计正确
- [ ] 领域覆盖统计正确
- [ ] 热力图显示正常
- [ ] 常用入口功能正常
- [ ] 稍后阅读功能正常

### 8.2 配置测试

- [ ] 修改应用名称后显示正常
- [ ] 修改根目录后功能正常
- [ ] 添加/删除领域后功能正常
- [ ] 添加/删除模块后功能正常
- [ ] 修改状态列表后功能正常
- [ ] 修改类型列表后功能正常
- [ ] 修改标签页后显示正常
- [ ] 导出配置功能正常
- [ ] 导入配置功能正常
- [ ] 重置配置功能正常
- [ ] 验证配置功能正常

### 8.3 兼容性测试

- [ ] 全新安装正常工作
- [ ] 旧版本升级后正常工作（自动迁移）
- [ ] config.json 不存在时使用默认配置
- [ ] config.json 格式错误时有错误提示
- [ ] 自定义配置后重启 Obsidian 保持配置

---

## 九、改造时间表

| 阶段 | 内容 | 预计时间 | 产出 |
|------|------|----------|------|
| Phase 1 | 配置系统搭建 | 2 小时 | types.ts, defaults.ts, loader.ts, accessors.ts |
| Phase 2 | 代码改造 | 3-4 小时 | 所有文件使用配置替代硬编码 |
| Phase 3 | 设置界面 | 2-3 小时 | 可视化配置界面 |
| Phase 4 | 数据迁移 | 1 小时 | 旧配置自动迁移 |
| Phase 5 | 测试修复 | 1-2 小时 | 稳定版本 |
| **总计** | | **9-12 小时** | |

---

## 十、附录：文件清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/config/types.ts` | 配置类型定义 |
| `src/config/defaults.ts` | 默认配置 |
| `src/config/loader.ts` | 配置加载/保存/验证 |
| `src/config/accessors.ts` | 配置访问工具函数 |
| `src/config/migration.ts` | 数据迁移 |
| `config.schema.json` | JSON Schema（可选，用于编辑器提示） |

### 修改文件

| 文件 | 改动说明 |
|------|----------|
| `main.ts` | 加载新配置系统，迁移旧配置 |
| `src/settings/PluginSettings.ts` | 重写设置界面 |
| `src/views/WorkspaceView.ts` | 使用配置的 app.name, tabs |
| `src/views/StatusBar.ts` | 使用配置的 folders, statusColors, statuses |
| `src/views/QuickActions.ts` | 使用配置的 types, statuses |
| `src/views/tabs/ActionTab.ts` | 使用配置的 folders, statuses |
| `src/views/tabs/AnalysisTab.ts` | 使用配置的 domains, statuses |
| `src/views/tabs/KnowledgeTab.ts` | 使用配置的 statuses |
| `src/views/tabs/ReadingTab.ts` | 使用配置的 folders |
| `src/utils/templates.ts` | 使用配置的 folders, templates |
| `src/utils/dataview.ts` | 使用配置的 domains, statuses, fields |
| `src/modals/CreateNoteModal.ts` | 使用配置的 types, statuses |
