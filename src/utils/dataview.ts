import { App, TFile } from "obsidian";

export interface TaskItem {
  text: string;
  file: string;
  line: number;
  completed: boolean;
}

export interface TopicItem {
  title: string;
  type: string;
  status: string;
  created: string;
  deadline: string;
  path: string;
}

export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayDiaryPath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `日记/${year}-${month}-${day}.md`;
}

export function fileExists(app: App, path: string): boolean {
  return app.vault.getAbstractFileByPath(path) !== null;
}

export function getRecentFiles(app: App, days: number = 7): TFile[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return app.vault
    .getMarkdownFiles()
    .filter((f) => f.stat.mtime > cutoff)
    .sort((a, b) => b.stat.mtime - a.stat.mtime)
    .slice(0, 20);
}

export function getTopicsByStatus(app: App, status: string, topicFolder: string = "事项"): TopicItem[] {
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const topics: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      if (fm.status === status) {
        topics.push({
          title: file.basename,
          type: fm.type || "",
          status: fm.status || "",
          created: fm.created || "",
          deadline: fm.deadline || "",
          path: file.path,
        });
      }
    }
  });

  return topics;
}

export function getOverdueTopics(app: App, topicFolder: string = "事项"): TopicItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const overdue: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      if (
        fm.deadline &&
        fm.status !== "已完成" &&
        fm.status !== "已放弃"
      ) {
        const deadlineDate = new Date(fm.deadline);
        if (!isNaN(deadlineDate.getTime()) && deadlineDate < today) {
          overdue.push({
            title: file.basename,
            type: fm.type || "",
            status: fm.status || "",
            created: fm.created || "",
            deadline: fm.deadline,
            path: file.path,
          });
        }
      }
    }
  });

  return overdue;
}

export function getLearningStats(app: App, learningStatusField: string = "学习状态"): Record<string, number> {
  const stats: Record<string, number> = {
    待阅读: 0,
    已阅读: 0,
    已理解: 0,
    已掌握: 0,
  };

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.[learningStatusField]) {
      const status = cache.frontmatter[learningStatusField];
      if (status in stats) {
        stats[status]++;
      }
    }
  });

  return stats;
}

export function getActivityData(
  app: App,
  days: number = 365
): Record<string, number> {
  const data: Record<string, number> = {};
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  app.vault.getMarkdownFiles().forEach((file) => {
    if (file.stat.ctime > cutoff) {
      const date = toLocalDateStr(new Date(file.stat.ctime));
      data[date] = (data[date] || 0) + 1;
    }
    if (file.stat.mtime > cutoff && file.stat.mtime !== file.stat.ctime) {
      const date = toLocalDateStr(new Date(file.stat.mtime));
      data[date] = (data[date] || 0) + 1;
    }
  });

  return data;
}

export function getSapModuleStats(
  app: App
): Record<string, Record<string, number>> {
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

  app.vault.getMarkdownFiles().forEach((file) => {
    if (file.path.startsWith("SAP/模块/")) {
      const cache = app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.学习状态) {
        const mod = file.path.split("/")[2];
        if (mod && mod in stats) {
          const status = cache.frontmatter.学习状态;
          if (status in stats[mod]) {
            stats[mod][status]++;
          }
        }
      }
    }
  });

  return stats;
}

// 获取文件夹统计
export function getFolderStats(app: App): Record<string, number> {
  const stats: Record<string, number> = {};
  app.vault.getMarkdownFiles().forEach((file) => {
    const topLevel = file.path.split("/")[0];
    if (topLevel !== file.path) {
      stats[topLevel] = (stats[topLevel] || 0) + 1;
    }
  });
  return stats;
}

// 获取领域统计
export function getDomainStats(app: App, domain: string, learningStatusField: string = "学习状态"): Record<string, number> {
  const stats: Record<string, number> = {
    待阅读: 0,
    已阅读: 0,
    已理解: 0,
    已掌握: 0,
  };

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.tags?.includes(domain)) {
      const status = cache.frontmatter[learningStatusField];
      if (status && status in stats) {
        stats[status]++;
      }
    }
  });

  return stats;
}

// 获取领域的文件列表
export function getDomainFiles(app: App, domain: string): TFile[] {
  const files: TFile[] = [];

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.tags?.includes(domain)) {
      files.push(file);
    }
  });

  return files.sort((a, b) => b.stat.mtime - a.stat.mtime);
}
