import { App, TFile, moment } from "obsidian";
import { getFolderPath, getConfig, getDomains } from "../config/accessors";
import { ensureFolder, fileExists } from "../utils/dataview";
import {
  getDailyPlanTemplate,
  getWeeklyPlanTemplate,
  getTopicTemplate,
  getDiaryTemplate,
  getNodeTemplate,
} from "../utils/templates";

const folderDemos: Record<string, (app: App) => { name: string; content: string }> = {
  dailyPlan: (app) => ({
    name: `${moment().format("YYYY-MM-DD")}-日计划.md`,
    content: getDailyPlanTemplate(app),
  }),
  weeklyPlan: (app) => ({
    name: `${moment().format("YYYY")}-W${moment().format("WW")}-本周计划.md`,
    content: getWeeklyPlanTemplate(app),
  }),
  diary: (app) => ({
    name: `${moment().format("YYYY-MM-DD")}.md`,
    content: getDiaryTemplate(app),
  }),
  topic: (app) => ({
    name: `${moment().format("YYYY-MM-DD")}-示例任务.md`,
    content: getTopicTemplate(app, "任务", "示例任务"),
  }),
  inbox: () => ({
    name: "README.md",
    content: `# 待整理

将收藏的文章、临时笔记、待归类的资料放入此文件夹。

工作流按钮「待整理清单」会自动列出此文件夹中的内容。
`,
  }),
  nodes: () => ({
    name: "demo-节点-模板.md",
    content: getNodeTemplate("示例节点", "这是一个节点模板，用于记录独立的知识点概念。"),
  }),
  generatedDocs: () => ({
    name: "README.md",
    content: `# 清单

工作流按钮生成的汇总文档存放在此文件夹。

点击工作台上的工作流按钮（任务总览、待整理清单等）会在此处自动生成实时文档。
`,
  }),
};

const DEMO_ROOT = "work-top-demo";

function getDomainDemo(domainName: string, domainColor: string, modules: { name: string; path: string }[]): string {
  const today = moment().format("YYYY-MM-DD");
  const tags = `\n  - ${domainName.toLowerCase()}`;
  const moduleList = modules.length > 0
    ? modules.map((m) => `- [[${m.path}|${m.name}]]`).join("\n")
    : "- 模块 1\n- 模块 2";

  return `---
tags:${tags}
domain: ${domainName}
type: 学习
status: 已完成
created: ${today}
updated: ${today}
学习状态: 已理解
---

# ${domainName} 领域概览

> 颜色：${domainColor}

## 包含模块

${moduleList}

## 学习笔记

这是 ${domainName} 领域的示例文件。可以在这里记录学习内容。

## 参考资料

- [参考链接](https://example.com)
`;
}

function getModuleDemo(domainName: string, moduleName: string): string {
  const today = moment().format("YYYY-MM-DD");
  const tags = `\n  - ${domainName.toLowerCase()}\n  - ${moduleName.toLowerCase()}`;

  return `---
tags:${tags}
domain: ${domainName}
module: ${moduleName}
type: 学习
status: 进行中
created: ${today}
updated: ${today}
学习状态: 待阅读
---

# ${moduleName} 学习笔记

> 领域：${domainName} / 模块：${moduleName}

## 基础知识

这里是 ${moduleName} 的学习笔记，可以记录核心概念和要点。

## 实践记录

### ${today}
- 初始学习

## 参考资料

`;
}

function getNodeDoc(domainName: string, domainFile: string, modules: { name: string; file: string }[]): string {
  const today = moment().format("YYYY-MM-DD");
  const moduleLinks = modules.length > 0
    ? modules.map((m) => `- [[${m.file}|${m.name}]]`).join("\n")
    : "- 无模块";

  return `---
tags:
  - 节点
created: ${today}
学习状态: 待阅读
---

# ${domainName}

> 类型：领域节点

## 关联文档

- [[${domainFile}|${domainName} 概览]]

## 子节点

${moduleLinks}
`;
}

function getModuleNodeDoc(domainName: string, moduleName: string, moduleFile: string): string {
  const today = moment().format("YYYY-MM-DD");

  return `---
tags:
  - 节点
created: ${today}
学习状态: 待阅读
---

# ${moduleName}

> 类型：模块节点 | 领域：${domainName}

## 关联文档

- [[${moduleFile}|${moduleName} 学习笔记]]
`;
}

export async function initWorkspace(app: App): Promise<void> {
  const config = getConfig(app);
  const structure = config.basic.folders.structure;

  // 1. 创建所有文件夹 + demo 文件
  for (const key of Object.keys(structure)) {
    const folderPath = getFolderPath(app, key);
    await ensureFolder(app, folderPath);

    const demoFn = folderDemos[key];
    if (!demoFn) continue;

    const demo = demoFn(app);
    const filePath = `${folderPath}/${demo.name}`;
    if (!fileExists(app, filePath)) {
      await app.vault.create(filePath, demo.content);
    }
  }

  // 2. 创建事项子文件夹（按类型）
  const topicFolder = getFolderPath(app, "topic");
  const types = config.basic.types;
  for (const type of types) {
    const typeFolder = `${topicFolder}/${type.name}`;
    await ensureFolder(app, typeFolder);

    // 缺失 demo 时生成
    const demoFile = `${typeFolder}/${moment().format("YYYY-MM-DD")}-示例${type.name}.md`;
    if (!fileExists(app, demoFile)) {
      await app.vault.create(demoFile, getTopicTemplate(app, type.name, `示例${type.name}`));
    }
  }

  // 3. 创建领域/模块 demo + 节点文档
  const domains = getDomains(app);
  const nodesFolder = getFolderPath(app, "nodes");

  for (const domain of domains) {
    // demo 文件夹: work-top-demo/AI/
    const domainDemoFolder = `${DEMO_ROOT}/${domain.name}`;
    await ensureFolder(app, domainDemoFolder);

    // 先收集模块路径（用于领域概览的链接）
    const moduleInfos: { name: string; path: string; file: string }[] = [];
    for (const mod of domain.modules) {
      const modFolder = `${domainDemoFolder}/${mod.name}`;
      await ensureFolder(app, modFolder);
      const modFile = `${modFolder}/${mod.name}学习笔记.md`;
      moduleInfos.push({ name: mod.name, path: modFile, file: modFile });
      if (!fileExists(app, modFile)) {
        await app.vault.create(modFile, getModuleDemo(domain.name, mod.name));
      }
    }

    // 领域概览 demo 文件
    const domainDemoFile = `${domainDemoFolder}/${domain.name}概览.md`;
    if (!fileExists(app, domainDemoFile)) {
      await app.vault.create(domainDemoFile, getDomainDemo(domain.name, domain.color || "#7C3AED", moduleInfos));
    }

    // 节点文档: 节点/AI.md — 关联到 demo
    const nodeFile = `${nodesFolder}/${domain.name}.md`;
    if (!fileExists(app, nodeFile)) {
      const nodeModules = moduleInfos.map((m) => ({ name: m.name, file: m.file }));
      await app.vault.create(nodeFile, getNodeDoc(domain.name, domainDemoFile, nodeModules));
    }

    // 模块节点文档: 节点/AGENTS.md — 关联到 demo
    for (const mod of domain.modules) {
      const modNodeFile = `${nodesFolder}/${mod.name}.md`;
      if (!fileExists(app, modNodeFile)) {
        const modDemoFile = `${domainDemoFolder}/${mod.name}/${mod.name}学习笔记.md`;
        await app.vault.create(modNodeFile, getModuleNodeDoc(domain.name, mod.name, modDemoFile));
      }
    }
  }
}
