# Obsidian 工作台插件 - 硬编码升级指导手册

> 版本：v1.0 | 日期：2026-05-29
> 目标：将所有硬编码改造为可配置项，提升插件的通用性和可维护性

---

## 一、改造总览

### 1.1 硬编码统计

| 类别 | 数量 | 优先级 | 影响范围 |
|------|------|--------|----------|
| 文件夹路径 | 12处 | P0 | 核心功能 |
| 状态/类型字符串 | 15处 | P0 | 核心功能 |
| 学习状态 | 5处(重复) | P0 | 数据统计 |
| SAP 模块 | 1处 | P1 | 领域分析 |
| 颜色值 | 8处 | P1 | UI 展示 |
| 类型映射 | 4处 | P1 | 创建功能 |
| 数值常量 | 8处 | P2 | 性能/体验 |
| 模板内容 | 5处 | P2 | 内容生成 |
| 其他 | 3处 | P2 | 边角功能 |

### 1.2 改造原则

1. **向下兼容**：新配置项必须有默认值，旧数据无需迁移
2. **渐进式**：按优先级分批改造，每批独立可用
3. **集中管理**：所有配置统一在 `PluginSettings.ts` 中定义
4. **单一来源**：消除重复定义，同一配置只在一个地方声明

---

## 二、配置结构设计

### 2.1 完整配置接口

```typescript
// src/settings/PluginSettings.ts

export interface WorkspaceSettings {
  // ===== 基础配置（已有）=====
  openInMainEditor: boolean;
  themeId: string;
  workspaceRoot: string;
  topicFolder: string;
  inboxFolder: string;
  topicStatus: string[];
  topicTypes: string[];
  learningStatus: string[];
  domains: string[];
  quickLinks: QuickLink[];
  fieldNames: {
    learningStatus: string;
    type: string;
    status: string;
    deadline: string;
  };

  // ===== P0 新增：文件夹路径配置 =====
  folders: {
    dailyPlan: string;      // 日计划文件夹名（相对于 workspaceRoot）
    weeklyPlan: string;     // 周计划文件夹名
    diary: string;          // 日记文件夹名（相对于 workspaceRoot）
    sapModule: string;      // SAP 模块文件夹路径
    nodes: string;          // 节点图谱文件夹路径
    savedArticles: string;  // 收藏摘录路径
    toBeCategorized: string;// 待归类路径
  };

  // ===== P0 新增：文件命名模式 =====
  filePatterns: {
    dailyPlan: string;   // 日计划文件名模式，如 "{date}-日计划"
    weeklyPlan: string;  // 周计划文件名模式，如 "{year}-W{week}-本周计划"
    diary: string;       // 日记文件名模式，如 "{date}"
  };

  // ===== P1 新增：SAP 模块列表 =====
  sapModules: string[];

  // ===== P1 新增：状态颜色 =====
  statusColors: {
    overdue: string;     // 逾期颜色
    completed: string;   // 已完成颜色
    active: string;      // 进行中颜色
    understanding: string; // 已理解颜色
  };

  // ===== P1 新增：类型标签映射 =====
  typeLabels: Record<string, string>;

  // ===== P2 新增：数值常量 =====
  limits: {
    debounceDelay: number;     // 防抖延迟(ms)
    recentFilesMax: number;    // 最近文件最大数量
    recentNotesMax: number;    // 最近笔记最大数量
    activeTopicsMax: number;   // 活跃任务最大数量
    searchMinChars: number;    // 搜索最小字符数
    searchResultsMax: number;  // 搜索结果最大数量
    nodeGraphMax: number;      // 节点图谱最大数量
  };

  // ===== P2 新增：模板配置 =====
  templates: {
    dailyPlan: string;   // 日计划模板内容
    weeklyPlan: string;  // 周计划模板内容
    topic: string;       // 事项模板内容
    diary: string;       // 日记模板内容
    weeklyCategories: string[]; // 周计划分类
  };
}
```

### 2.2 默认值定义

```typescript
export const DEFAULT_SETTINGS: WorkspaceSettings = {
  // 基础配置（保持不变）
  openInMainEditor: true,
  themeId: "green-dark",
  workspaceRoot: "工作台",
  topicFolder: "事项",
  inboxFolder: "待整理",
  topicStatus: ["待评估", "进行中", "已完成", "已放弃"],
  topicTypes: ["任务", "想法", "项目", "灵感", "写作", "学习"],
  learningStatus: ["待阅读", "已阅读", "已理解", "已掌握"],
  domains: ["AI", "SAP"],
  quickLinks: [],
  fieldNames: {
    learningStatus: "学习状态",
    type: "type",
    status: "status",
    deadline: "deadline",
  },

  // P0：文件夹路径
  folders: {
    dailyPlan: "日计划",
    weeklyPlan: "周计划",
    diary: "日记",
    sapModule: "SAP/模块",
    nodes: "节点",
    savedArticles: "待整理/收藏摘录",
    toBeCategorized: "待整理/待归类",
  },

  // P0：文件命名模式
  filePatterns: {
    dailyPlan: "{date}-日计划",
    weeklyPlan: "{year}-W{week}-本周计划",
    diary: "{date}",
  },

  // P1：SAP 模块
  sapModules: ["FICO", "HR", "MM", "SD"],

  // P1：状态颜色
  statusColors: {
    overdue: "#FF6B6B",
    completed: "#77DD77",
    active: "#FFD93D",
    understanding: "#4FC1FF",
  },

  // P1：类型标签
  typeLabels: {
    task: "任务",
    idea: "想法",
    project: "项目",
    inspiration: "灵感",
    writing: "写作",
    learning: "学习",
    diary: "日记",
  },

  // P2：数值常量
  limits: {
    debounceDelay: 500,
    recentFilesMax: 20,
    recentNotesMax: 15,
    activeTopicsMax: 10,
    searchMinChars: 2,
    searchResultsMax: 20,
    nodeGraphMax: 10,
  },

  // P2：模板（留空表示使用内置默认模板）
  templates: {
    dailyPlan: "",
    weeklyPlan: "",
    topic: "",
    diary: "",
    weeklyCategories: ["SAP 学习", "项目任务", "写作/事项"],
  },
};
```

---

## 三、分批改造计划

### 3.1 第一批：P0 - 核心路径和状态（预计 2-3 小时）

#### 3.1.1 统一配置访问方式

**问题**：当前有 3 种不同的配置访问方式，容易出错。

**改造**：创建统一的配置访问工具函数。

```typescript
// src/utils/settings.ts（新建文件）

import { App } from "obsidian";
import { WorkspaceSettings, DEFAULT_SETTINGS } from "../settings/PluginSettings";

/**
 * 获取插件配置（统一访问方式）
 */
export function getSettings(app: App): WorkspaceSettings {
  const plugin = (app as any).plugins?.plugins?.["worktop"];
  return plugin?.settings || DEFAULT_SETTINGS;
}

/**
 * 获取文件夹路径（自动拼接 workspaceRoot）
 */
export function getFolderPath(app: App, folderKey: keyof WorkspaceSettings["folders"]): string {
  const settings = getSettings(app);
  const folder = settings.folders[folderKey];
  
  // 如果是绝对路径（包含 /），直接返回
  if (folder.includes("/")) {
    return folder;
  }
  
  // 否则拼接 workspaceRoot
  return `${settings.workspaceRoot}/${folder}`;
}

/**
 * 生成文件路径（使用命名模式）
 */
export function generateFilePath(
  app: App,
  patternKey: keyof WorkspaceSettings["filePatterns"],
  vars: Record<string, string>
): string {
  const settings = getSettings(app);
  let pattern = settings.filePatterns[patternKey];
  
  // 替换变量
  Object.entries(vars).forEach(([key, value]) => {
    pattern = pattern.replace(`{${key}}`, value);
  });
  
  return pattern;
}
```

#### 3.1.2 改造 templates.ts

**Before:**
```typescript
export function getDailyPlanPath(workspaceRoot: string = "工作台"): string {
  const today = moment().format("YYYY-MM-DD");
  return `${workspaceRoot}/日计划/${today}-日计划.md`;
}
```

**After:**
```typescript
export function getDailyPlanPath(app: App): string {
  const settings = getSettings(app);
  const today = moment().format("YYYY-MM-DD");
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  
  const folder = getFolderPath(app, "dailyPlan");
  const fileName = generateFilePath(app, "filePatterns.dailyPlan", {
    date: today,
    year,
    week: weekNum,
  });
  
  return `${folder}/${fileName}.md`;
}
```

**改造清单：**

| 函数 | 改造内容 |
|------|---------|
| `getDailyPlanPath()` | 使用 `folders.dailyPlan` 和 `filePatterns.dailyPlan` |
| `getWeeklyPlanPath()` | 使用 `folders.weeklyPlan` 和 `filePatterns.weeklyPlan` |
| `getTopicPath()` | 使用已配置的 `topicFolder` |
| `getDiaryTemplate()` | 使用 `folders.diary` 和 `filePatterns.diary` |

#### 3.1.3 改造状态引用

**Before:**
```typescript
// 多处重复
if (fm.status === "已完成") { ... }
if (fm.status === "进行中") { ... }
```

**After:**
```typescript
import { getSettings } from "../utils/settings";

// 使用配置中的状态列表
const settings = getSettings(this.app);
const completedStatus = settings.topicStatus[2]; // "已完成"
const activeStatus = settings.topicStatus[1];     // "进行中"
```

**改造清单：**

| 文件 | 行号 | 改造内容 |
|------|------|---------|
| `StatusBar.ts` | 240,259 | 使用 `settings.topicStatus` |
| `QuickActions.ts` | 105,123 | 使用 `settings.topicStatus` |
| `ActionTab.ts` | 209 | 使用 `settings.topicStatus` |
| `KnowledgeTab.ts` | 27,65 | 使用 `settings.topicStatus` |
| `dataview.ts` | 89-90 | 使用 `settings.topicStatus` |

#### 3.1.4 统一学习状态

**Before:**
```typescript
// dataview.ts 中重复定义 4 次
const stats: Record<string, number> = {
  待阅读: 0,
  已阅读: 0,
  已理解: 0,
  已掌握: 0,
};
```

**After:**
```typescript
import { getSettings } from "./settings";

export function getLearningStats(app: App): Record<string, number> {
  const settings = getSettings(app);
  const stats: Record<string, number> = {};
  
  // 从配置初始化统计对象
  settings.learningStatus.forEach(status => {
    stats[status] = 0;
  });
  
  // ... 其余逻辑不变
}
```

**改造清单：**

| 文件 | 函数 | 改造内容 |
|------|------|---------|
| `dataview.ts` | `getLearningStats()` | 从 `settings.learningStatus` 初始化 |
| `dataview.ts` | `getSapModuleStats()` | 同上 |
| `dataview.ts` | `getDomainStats()` | 同上 |
| `AnalysisTab.ts` | `renderLearningStats()` | 颜色映射使用配置 |
| `AnalysisTab.ts` | `renderModuleCoverage()` | 状态分组使用配置 |

---

### 3.2 第二批：P1 - 扩展配置（预计 1-2 小时）

#### 3.2.1 SAP 模块配置化

**Before:**
```typescript
// dataview.ts:156
const modules = ["FICO", "HR", "MM", "SD"];
```

**After:**
```typescript
export function getSapModuleStats(app: App): Record<string, Record<string, number>> {
  const settings = getSettings(app);
  const modules = settings.sapModules;
  
  // ... 其余逻辑不变
}
```

#### 3.2.2 颜色值配置化

**Before:**
```typescript
// StatusBar.ts
color: "#FF6B6B"  // 逾期
color: "#77DD77"  // 已完成
color: "#FFD93D"  // 进行中
```

**After:**
```typescript
import { getSettings } from "../utils/settings";

const settings = getSettings(this.app);

this.createStatCard({
  label: "逾期",
  value: String(overdueTopics.length),
  color: overdueTopics.length > 0 
    ? settings.statusColors.overdue 
    : "var(--ws-gray)",
  // ...
});
```

**改造清单：**

| 文件 | 改造内容 |
|------|---------|
| `StatusBar.ts` | 所有 `createStatCard` 调用使用 `settings.statusColors` |
| `AnalysisTab.ts` | `renderLearningStats()` 颜色映射 |
| `ActionTab.ts` | `renderLearningProgress()` 颜色映射 |

#### 3.2.3 类型映射配置化

**Before:**
```typescript
// CreateNoteModal.ts
private getTypeLabel(): string {
  const labels: Record<string, string> = {
    task: "任务",
    idea: "想法",
    // ...
  };
  return labels[this.noteType] || "笔记";
}
```

**After:**
```typescript
private getTypeLabel(): string {
  const settings = getSettings(this.app);
  return settings.typeLabels[this.noteType] || "笔记";
}
```

**改造清单：**

| 文件 | 改造内容 |
|------|---------|
| `CreateNoteModal.ts` | `getTypeLabel()` 和 `getTypeValue()` 使用配置 |
| `QuickActions.ts` | `createButtons` 从 `settings.typeLabels` 生成 |

---

### 3.3 第三批：P2 - 灵活配置（预计 1 小时）

#### 3.3.1 数值常量配置化

**Before:**
```typescript
// WorkspaceView.ts
this.refreshTimeout = setTimeout(() => {
  this.refresh();
}, 500); // 硬编码 500ms
```

**After:**
```typescript
const settings = getSettings(this.app);
this.refreshTimeout = setTimeout(() => {
  this.refresh();
}, settings.limits.debounceDelay);
```

**改造清单：**

| 文件 | 常量 | 配置项 |
|------|------|--------|
| `WorkspaceView.ts` | `500` | `limits.debounceDelay` |
| `dataview.ts` | `20` | `limits.recentFilesMax` |
| `KnowledgeTab.ts` | `15` | `limits.recentNotesMax` |
| `ActionTab.ts` | `10` | `limits.activeTopicsMax` |
| `ActionTab.ts` | `2` | `limits.searchMinChars` |
| `ActionTab.ts` | `20` | `limits.searchResultsMax` |
| `AnalysisTab.ts` | `10` | `limits.nodeGraphMax` |

#### 3.3.2 模板配置化

**方案**：支持用户自定义模板，留空则使用内置默认模板。

```typescript
export function getDailyPlanTemplate(app: App, weeklyPlanPath?: string): string {
  const settings = getSettings(app);
  
  // 如果用户配置了自定义模板
  if (settings.templates.dailyPlan) {
    return interpolateTemplate(settings.templates.dailyPlan, {
      date: moment().format("YYYY-MM-DD"),
      weeklyPlan: weeklyPlanPath || "",
      // ... 其他变量
    });
  }
  
  // 否则使用内置默认模板
  return getDefaultDailyPlanTemplate(weeklyPlanPath);
}
```

**改造清单：**

| 函数 | 改造内容 |
|------|---------|
| `getDiaryTemplate()` | 支持 `settings.templates.diary` |
| `getDailyPlanTemplate()` | 支持 `settings.templates.dailyPlan` |
| `getWeeklyPlanTemplate()` | 支持 `settings.templates.weeklyPlan` |
| `getTopicTemplate()` | 支持 `settings.templates.topic` |

---

## 四、配置界面改造

### 4.1 设置页面分组

```typescript
// src/settings/PluginSettings.ts

private renderBasicSettings(containerEl: HTMLElement): void {
  // 1. 打开方式
  // 2. 主题设置
  // 3. 文件夹配置（扩展）
  this.renderFolderSettings(containerEl);
  // 4. 状态配置（保持）
  // 5. 标签配置（保持）
  // 6. 领域配置（保持）
}

private renderAdvancedSettings(containerEl: HTMLElement): void {
  // 1. Frontmatter 字段名映射
  // 2. 文件命名模式
  this.renderFilePatternSettings(containerEl);
  // 3. SAP 模块配置
  this.renderSapModuleSettings(containerEl);
  // 4. 颜色配置
  this.renderColorSettings(containerEl);
  // 5. 数值配置
  this.renderLimitSettings(containerEl);
  // 6. 模板配置
  this.renderTemplateSettings(containerEl);
  // 7. 配置管理（导入/导出/重置）
}
```

### 4.2 文件夹配置 UI

```typescript
private renderFolderSettings(containerEl: HTMLElement): void {
  containerEl.createEl("h3", { text: "文件夹配置" });

  const folderLabels: Record<string, string> = {
    dailyPlan: "日计划文件夹",
    weeklyPlan: "周计划文件夹",
    diary: "日记文件夹",
    sapModule: "SAP 模块文件夹",
    nodes: "节点图谱文件夹",
    savedArticles: "收藏摘录路径",
    toBeCategorized: "待归类路径",
  };

  Object.entries(folderLabels).forEach(([key, label]) => {
    new Setting(containerEl)
      .setName(label)
      .setDesc(`相对于工作台根目录的路径`)
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.folders[key])
          .setValue(this.plugin.settings.folders[key])
          .onChange(async (value) => {
            this.plugin.settings.folders[key] = value || DEFAULT_SETTINGS.folders[key];
            await this.plugin.saveSettings();
          })
      );
  });
}
```

### 4.3 文件命名模式 UI

```typescript
private renderFilePatternSettings(containerEl: HTMLElement): void {
  containerEl.createEl("h3", { text: "文件命名模式" });

  const patternHelp = `
    可用变量：
    - {date} - 日期，如 2026-05-29
    - {year} - 年份，如 2026
    - {week} - 周数，如 22
    - {month} - 月份，如 05
    - {day} - 日期，如 29
  `;

  new Setting(containerEl)
    .setName("日计划文件名")
    .setDesc(patternHelp)
    .addText((text) =>
      text
        .setPlaceholder("{date}-日计划")
        .setValue(this.plugin.settings.filePatterns.dailyPlan)
        .onChange(async (value) => {
          this.plugin.settings.filePatterns.dailyPlan = value || "{date}-日计划";
          await this.plugin.saveSettings();
        })
    );

  // 类似地配置 weeklyPlan 和 diary
}
```

---

## 五、配置导入/导出增强

### 5.1 导出完整配置

```typescript
private exportSettings(): void {
  const config = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    settings: this.plugin.settings,
  };
  
  const json = JSON.stringify(config, null, 2);
  navigator.clipboard.writeText(json);
  new Notice("配置已复制到剪贴板");
}
```

### 5.2 导入配置（带验证）

```typescript
private async importSettings(json: string): Promise<void> {
  try {
    const config = JSON.parse(json);
    
    // 验证版本
    if (!config.version || !config.settings) {
      throw new Error("无效的配置文件");
    }
    
    // 合并配置（保留默认值）
    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, config.settings);
    await this.plugin.saveSettings();
    
    new Notice("配置导入成功");
    this.display(); // 刷新设置页面
  } catch (error) {
    new Notice(`导入失败: ${error.message}`);
  }
}
```

---

## 六、数据迁移策略

### 6.1 向下兼容

所有新增配置项都有默认值，旧版本升级后无需手动迁移：

```typescript
async loadSettings() {
  const saved = await this.loadData();
  this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  
  // 确保新增的嵌套对象也被正确合并
  if (saved) {
    this.settings.folders = Object.assign({}, DEFAULT_SETTINGS.folders, saved.folders);
    this.settings.filePatterns = Object.assign({}, DEFAULT_SETTINGS.filePatterns, saved.filePatterns);
    this.settings.statusColors = Object.assign({}, DEFAULT_SETTINGS.statusColors, saved.statusColors);
    this.settings.limits = Object.assign({}, DEFAULT_SETTINGS.limits, saved.limits);
    this.settings.templates = Object.assign({}, DEFAULT_SETTINGS.templates, saved.templates);
  }
}
```

### 6.2 版本检测

```typescript
// 在配置中添加版本号
export interface WorkspaceSettings {
  configVersion?: number; // 配置版本，用于未来迁移
  // ... 其他字段
}

async loadSettings() {
  const saved = await this.loadData();
  this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  
  // 版本迁移
  if (!saved?.configVersion) {
    // v0 -> v1 迁移逻辑
    this.migrateV0ToV1(saved);
  }
}

private migrateV0ToV1(oldSettings: any): void {
  // 将旧的平铺配置迁移到新的嵌套结构
  if (oldSettings && !oldSettings.folders) {
    this.settings.folders = {
      dailyPlan: "日计划",
      weeklyPlan: "周计划",
      diary: "日记",
      sapModule: "SAP/模块",
      nodes: "节点",
      savedArticles: "待整理/收藏摘录",
      toBeCategorized: "待整理/待归类",
    };
  }
  this.settings.configVersion = 1;
}
```

---

## 七、测试检查清单

### 7.1 功能测试

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

### 7.2 配置测试

- [ ] 修改文件夹路径后功能正常
- [ ] 修改文件命名模式后功能正常
- [ ] 修改状态列表后功能正常
- [ ] 修改学习状态后功能正常
- [ ] 修改颜色后显示正常
- [ ] 导出配置功能正常
- [ ] 导入配置功能正常
- [ ] 重置配置功能正常

### 7.3 兼容性测试

- [ ] 全新安装正常工作
- [ ] 旧版本升级后正常工作
- [ ] 自定义配置后重启 Obsidian 保持配置

---

## 八、改造时间表

| 阶段 | 内容 | 预计时间 | 产出 |
|------|------|----------|------|
| Phase 1 | P0 核心改造 | 2-3 小时 | 基础可配置版本 |
| Phase 2 | P1 扩展配置 | 1-2 小时 | 完整配置版本 |
| Phase 3 | P2 灵活配置 | 1 小时 | 高级配置版本 |
| Phase 4 | 配置界面 | 1-2 小时 | 用户友好版本 |
| Phase 5 | 测试修复 | 1-2 小时 | 稳定版本 |
| **总计** | | **6-10 小时** | |

---

## 九、注意事项

1. **命名规范**：配置项使用 camelCase，与 TypeScript 惯例一致
2. **类型安全**：所有配置项必须有明确的类型定义
3. **默认值**：每个配置项都必须有合理的默认值
4. **文档注释**：配置接口的每个字段都要有 JSDoc 注释
5. **向后兼容**：新版本必须能读取旧版本的配置文件
6. **性能考虑**：配置读取应该缓存，避免频繁访问文件系统

---

## 附录：文件改动清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/settings/PluginSettings.ts` | 重构 | 扩展配置接口和默认值 |
| `src/utils/settings.ts` | 新建 | 统一配置访问工具函数 |
| `src/utils/templates.ts` | 重构 | 使用配置替代硬编码 |
| `src/utils/dataview.ts` | 重构 | 使用配置替代硬编码 |
| `src/views/StatusBar.ts` | 重构 | 使用配置替代硬编码 |
| `src/views/QuickActions.ts` | 重构 | 使用配置替代硬编码 |
| `src/views/WorkspaceView.ts` | 小改 | 使用配置的数值常量 |
| `src/views/tabs/ActionTab.ts` | 重构 | 使用配置替代硬编码 |
| `src/views/tabs/AnalysisTab.ts` | 重构 | 使用配置替代硬编码 |
| `src/views/tabs/KnowledgeTab.ts` | 小改 | 使用配置替代硬编码 |
| `src/views/tabs/ReadingTab.ts` | 小改 | 使用配置的文件夹路径 |
| `src/modals/CreateNoteModal.ts` | 重构 | 使用配置的类型映射 |
| `src/themes/index.ts` | 不变 | 保持现有主题系统 |
| `main.ts` | 小改 | 使用配置的文件夹路径 |
