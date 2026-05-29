import { moment, App } from "obsidian";
import {
  getFolderPath,
  generateFilePath,
  getDefaultStatus,
  getStatuses,
  getWeeklyCategories,
} from "../config/accessors";

// 日记模板 - 记录今天做了什么
export function getDiaryTemplate(app: App): string {
  const today = moment().format("YYYY-MM-DD");
  return `---
tags:
  - 日记
type: 日记
date: ${today}
---

# ${today} 日记

## 今日记录

### 上午


### 下午


### 晚上


## 今日收获


## 明日计划

`;
}

// 日计划模板 - 今天要做什么
export function getDailyPlanTemplate(app: App, weeklyPlanPath?: string): string {
  const today = moment().format("YYYY-MM-DD");
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  const planPath = weeklyPlanPath || `${getFolderPath(app, "weeklyPlan")}/${year}-W${weekNum}-本周计划.md`;

  return `---
tags:
  - 计划
  - 日计划
type: 日计划
date: ${today}
weekly_plan: "[[${planPath}]]"
---

# ${today} 日计划

> 本周计划：[[${planPath}]]

## 今日要事

- [ ] 任务 1
- [ ] 任务 2
- [ ] 任务 3

## 执行记录

### 上午

-

### 下午

-

### 晚上

-

## 完成情况

- 完成：
- 未完成：
- 原因：

`;
}

// 周计划模板 - 本周要做什么
export function getWeeklyPlanTemplate(app: App): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  const startOfWeek = moment().startOf("isoWeek").format("MM.DD");
  const endOfWeek = moment().endOf("isoWeek").format("MM.DD");
  const weekId = `${year}-W${weekNum}`;
  const defaultStatus = getDefaultStatus(app);
  const categories = getWeeklyCategories(app);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = moment().startOf("isoWeek").add(i, "days");
    days.push(`### ${day.format("dddd")} - ${day.format("MM.DD")}`);
  }

  const categorySections = categories
    .map((cat) => `### ${cat}\n\n- [ ] 内容 1\n- [ ] 内容 2`)
    .join("\n\n");

  return `---
tags:
  - 计划
  - 周计划
type: 周计划
week: "${weekId}"
start_date: ${moment().startOf("isoWeek").format("YYYY-MM-DD")}
end_date: ${moment().endOf("isoWeek").format("YYYY-MM-DD")}
status: ${defaultStatus}
---

# ${year} 年第 ${weekNum} 周计划

> ${startOfWeek} — ${endOfWeek}

## 本周目标

${categorySections}

## 每日进展

${days.map((d) => `${d}\n- `).join("\n")}

## 本周回顾

### 完成了什么


### 未完成/延期


### 下周准备

`;
}

// 事项模板
export function getTopicTemplate(
  app: App,
  type: string,
  title: string,
  status?: string,
  learningStatus?: string,
  deadline: string = ""
): string {
  const today = moment().format("YYYY-MM-DD");
  const defaultStatus = status || getDefaultStatus(app);
  const defaultLearningStatus = learningStatus || getStatuses(app, "learning")[0];

  return `---
tags:
  - 事项
type: ${type}
status: ${defaultStatus}
created: ${today}
updated: ${today}
deadline: "${deadline}"
学习状态: ${defaultLearningStatus}
---

# ${title}

## 背景


## 目标


## 进展记录

### ${today}
- 创建事项

## 参考资料

`;
}

// 路径生成函数
export function getDailyPlanPath(app: App): string {
  const today = moment().format("YYYY-MM-DD");
  return generateFilePath(app, "dailyPlan", { date: today });
}

export function getWeeklyPlanPath(app: App): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  return generateFilePath(app, "weeklyPlan", { year, week: weekNum });
}

export function getTopicPath(app: App, title: string, type?: string): string {
  const today = moment().format("YYYY-MM-DD");
  const safeTitle = title.replace(/[\/\\:*?"<>|]/g, "-");
  const topicFolder = getFolderPath(app, "topic");
  const subFolder = type ? `${topicFolder}/${type}` : topicFolder;
  return `${subFolder}/${today}-${safeTitle}.md`;
}

// 节点模板
export function getNodeTemplate(title: string, description?: string): string {
  const today = moment().format("YYYY-MM-DD");

  return `---
tags:
  - 节点
created: ${today}
updated: ${today}
学习状态: 待阅读
---

# ${title}

${description ? `> ${description}\n` : ""}
## 概念说明



## 关联笔记



## 参考资料

`;
}
