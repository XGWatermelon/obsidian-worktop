import { moment } from "obsidian";

// 日记模板 - 记录今天做了什么
export function getDiaryTemplate(): string {
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
export function getDailyPlanTemplate(weeklyPlanPath?: string): string {
  const today = moment().format("YYYY-MM-DD");
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  const planPath = weeklyPlanPath || `周计划/${year}-W${weekNum}-本周计划.md`;

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
export function getWeeklyPlanTemplate(): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  const startOfWeek = moment().startOf("isoWeek").format("MM.DD");
  const endOfWeek = moment().endOf("isoWeek").format("MM.DD");
  const weekId = `${year}-W${weekNum}`;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = moment().startOf("isoWeek").add(i, "days");
    days.push(`### ${day.format("dddd")} - ${day.format("MM.DD")}`);
  }

  return `---
tags:
  - 计划
  - 周计划
type: 周计划
week: "${weekId}"
start_date: ${moment().startOf("isoWeek").format("YYYY-MM-DD")}
end_date: ${moment().endOf("isoWeek").format("YYYY-MM-DD")}
status: 进行中
---

# ${year} 年第 ${weekNum} 周计划

> ${startOfWeek} — ${endOfWeek}

## 本周目标

### SAP 学习

- [ ] 学习内容 1
- [ ] 学习内容 2

### 项目任务

- [ ] 任务 1
- [ ] 任务 2

### 写作/事项

- [ ] 事项 1
- [ ] 事项 2

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
  type: string,
  title: string,
  status: string = "待评估",
  learningStatus: string = "待阅读",
  deadline: string = ""
): string {
  const today = moment().format("YYYY-MM-DD");
  return `---
tags:
  - 事项
type: ${type}
status: ${status}
created: ${today}
updated: ${today}
deadline: "${deadline}"
学习状态: ${learningStatus}
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

// 路径生成函数（需要传入 workspaceRoot）
export function getDailyPlanPath(workspaceRoot: string = "工作台"): string {
  const today = moment().format("YYYY-MM-DD");
  return `${workspaceRoot}/日计划/${today}-日计划.md`;
}

export function getWeeklyPlanPath(workspaceRoot: string = "工作台"): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  return `${workspaceRoot}/周计划/${year}-W${weekNum}-本周计划.md`;
}

export function getTopicPath(title: string, topicFolder: string = "事项"): string {
  const today = moment().format("YYYY-MM-DD");
  const safeTitle = title.replace(/[\/\\:*?"<>|]/g, "-");
  return `${topicFolder}/${today}-${safeTitle}.md`;
}
