import { App, Notice, TFile } from "obsidian";
import {
  getAllTopics,
  getTopicsByStatus,
  getTopicsByType,
  getRecentFiles,
  getOverdueTopics,
  getLearningStats,
  getDomainStats,
  getDomainFiles,
  ensureFolder,
} from "../utils/dataview";
import {
  getFolderPath,
  getStatuses,
  getDomains,
  getWorkflows,
  getLimit,
  getFieldName,
} from "../config/accessors";
import { moment } from "obsidian";

// ==================== 通用工具 ====================

function getDocPath(app: App, workflowId: string): string {
  const wf = getWorkflows(app).find((w) => w.id === workflowId);
  const docName = wf?.docName || `{date}-${wf?.label || workflowId}`;
  const resolved = docName.replace(/\{date\}/g, moment().format("YYYY-MM-DD"));
  const folderKey = wf?.folderKey || "generatedDocs";
  const folder = getFolderPath(app, folderKey);
  return `${folder}/工作流/${resolved}.md`;
}

async function saveAndOpen(app: App, path: string, content: string): Promise<void> {
  const folder = path.split("/").slice(0, -1).join("/");
  await ensureFolder(app, folder);

  const existing = app.vault.getAbstractFileByPath(path);
  if (existing && existing instanceof TFile) {
    await app.vault.modify(existing, content);
  } else {
    await app.vault.create(path, content);
  }
  app.workspace.openLinkText(path, "");
}

function topicTable(topics: { title: string; status: string; type: string; created: string; deadline: string; path: string }[]): string {
  if (topics.length === 0) return "";
  let md = "| 标题 | 状态 | 类型 | 创建日期 | 截止日期 |\n";
  md += "|------|------|------|----------|----------|\n";
  topics.forEach((t) => {
    md += `| [[${t.title}]] | ${t.status} | ${t.type} | ${t.created} | ${t.deadline || "-"} |\n`;
  });
  return md;
}

// ==================== 各工作流生成函数 ====================

// 任务总览：全部事项按状态分组
export async function generateTaskOverview(app: App): Promise<void> {
  const path = getDocPath(app, "task-overview");
  const today = moment().format("YYYY-MM-DD");
  const statuses = getStatuses(app, "topic");

  let content = `# 任务总览\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;

  let total = 0;
  statuses.forEach((status) => {
    const topics = getTopicsByStatus(app, status);
    total += topics.length;
    content += `## ${status}（${topics.length}）\n\n`;
    if (topics.length === 0) {
      content += `暂无\n\n`;
    } else {
      content += topicTable(topics) + "\n";
    }
  });

  // 逾期事项
  const overdue = getOverdueTopics(app);
  if (overdue.length > 0) {
    content += `## 逾期（${overdue.length}）\n\n`;
    content += topicTable(overdue) + "\n";
  }

  if (total === 0) {
    content += `---\n\n> 当前没有任何事项，点击上方「创建」按钮添加。\n`;
  }

  await saveAndOpen(app, path, content);
  new Notice("任务总览已生成");
}

// 待整理清单：列出 inbox 文件夹中的文件
export async function generateInboxList(app: App): Promise<void> {
  const path = getDocPath(app, "inbox-list");
  const inboxFolder = getFolderPath(app, "inbox");
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(inboxFolder + "/"));

  let content = `# 待整理清单\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;
  content += `共 ${files.length} 个待整理文件\n\n`;

  if (files.length === 0) {
    content += `---\n\n> 待整理文件夹为空。将文件移入「${inboxFolder}」文件夹即可在此处看到。\n`;
    content += `>\n> 示例：\n> - 收藏的文章\n> - 临时笔记\n> - 待归类的资料\n`;
  } else {
    content += `| 文件名 | 路径 | 最后修改 |\n`;
    content += "|--------|------|----------|\n";
    files.slice(0, 50).forEach((f) => {
      const date = moment(f.stat.mtime).format("YYYY-MM-DD HH:mm");
      content += `| [[${f.basename}]] | ${f.path} | ${date} |\n`;
    });
  }

  await saveAndOpen(app, path, content);
  new Notice("待整理清单已生成");
}

// 任务评估：待评估事项清单
export async function generateTaskEval(app: App): Promise<void> {
  const path = getDocPath(app, "task-eval");
  const defaultStatus = getStatuses(app, "topic")[0]; // "待评估"
  const topics = getTopicsByStatus(app, defaultStatus);

  let content = `# 任务评估\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;
  content += `共 ${topics.length} 个待评估事项\n\n`;

  if (topics.length === 0) {
    content += `---\n\n> 没有待评估的事项。点击「创建」按钮添加新事项。\n`;
  } else {
    content += `## 待评估事项\n\n`;
    topics.forEach((t, i) => {
      content += `### ${i + 1}. [[${t.title}]]\n`;
      content += `- 类型：${t.type}\n`;
      content += `- 创建日期：${t.created}\n`;
      if (t.deadline) content += `- 截止日期：${t.deadline}\n`;
      content += `\n`;
    });

    content += `---\n\n## 评估建议\n\n`;
    content += `- [ ] 逐项评估优先级\n`;
    content += `- [ ] 将高优先级事项状态改为「进行中」\n`;
    content += `- [ ] 将不再需要的事项标记为「已放弃」\n`;
  }

  await saveAndOpen(app, path, content);
  new Notice("任务评估已生成");
}

// 写作管理：写作类型事项
export async function generateWritingMgmt(app: App): Promise<void> {
  const path = getDocPath(app, "writing-mgmt");
  const activeStatus = getStatuses(app, "topic")[1]; // "进行中"
  const allWriting = getTopicsByType(app, "写作");
  const activeWriting = allWriting.filter((t) => t.status === activeStatus);

  let content = `# 写作管理\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;
  content += `进行中：${activeWriting.length} / 全部：${allWriting.length}\n\n`;

  if (allWriting.length === 0) {
    content += `---\n\n> 没有写作类事项。点击「创建 → 写作」添加。\n`;
  } else {
    const statuses = getStatuses(app, "topic");
    statuses.forEach((status) => {
      const items = allWriting.filter((t) => t.status === status);
      if (items.length > 0) {
        content += `## ${status}（${items.length}）\n\n`;
        content += topicTable(items) + "\n";
      }
    });
  }

  await saveAndOpen(app, path, content);
  new Notice("写作管理已生成");
}

// 学习统计：按领域汇总学习状态
export async function generateLearningStatsDoc(app: App): Promise<void> {
  const path = getDocPath(app, "learning-stats");
  const domains = getDomains(app);
  const learningStatuses = getStatuses(app, "learning");
  const globalStats = getLearningStats(app);
  const globalTotal = Object.values(globalStats).reduce((a, b) => a + b, 0);

  let content = `# 学习统计\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;

  // 全局概览
  content += `## 全局概览\n\n`;
  content += `| 学习状态 | 数量 | 占比 |\n`;
  content += `|----------|------|------|\n`;
  learningStatuses.forEach((s) => {
    const count = globalStats[s] || 0;
    const pct = globalTotal > 0 ? Math.round((count / globalTotal) * 100) : 0;
    content += `| ${s} | ${count} | ${pct}% |\n`;
  });
  content += `| **总计** | **${globalTotal}** | |\n\n`;

  // 按领域展开
  if (domains.length > 0) {
    content += `---\n\n## 领域详情\n\n`;
    domains.forEach((domain) => {
      const stats = getDomainStats(app, domain.name);
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      content += `### ${domain.name}（共 ${total} 篇）\n\n`;

      if (total === 0) {
        content += `暂无\n\n`;
      } else {
        learningStatuses.forEach((s) => {
          const count = stats[s] || 0;
          if (count > 0) content += `- ${s}：${count}\n`;
        });
        content += `\n`;
      }
    });
  }

  await saveAndOpen(app, path, content);
  new Notice("学习统计已生成");
}

// 最近动态：最近修改的文件
export async function generateRecentActivity(app: App): Promise<void> {
  const path = getDocPath(app, "recent-activity");
  const days = 7;
  const files = getRecentFiles(app, days);

  let content = `# 最近动态\n\n`;
  content += `> 更新时间：${new Date().toLocaleString()}\n\n`;
  content += `最近 ${days} 天内修改的文件，共 ${files.length} 个\n\n`;

  if (files.length === 0) {
    content += `---\n\n> 最近 ${days} 天内没有文件修改记录。\n`;
  } else {
    content += `| 文件名 | 路径 | 最后修改 |\n`;
    content += "|--------|------|----------|\n";
    files.forEach((f) => {
      const date = moment(f.stat.mtime).format("YYYY-MM-DD HH:mm");
      content += `| [[${f.basename}]] | ${f.path} | ${date} |\n`;
    });
  }

  await saveAndOpen(app, path, content);
  new Notice("最近动态已生成");
}
