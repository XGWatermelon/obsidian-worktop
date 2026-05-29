import { App, TFile, Notice } from "obsidian";
import {
  fileExists,
  getTopicsByStatus,
  getLearningStats,
  getRecentFiles,
} from "../../utils/dataview";
import { getDailyPlanPath } from "../../utils/templates";

export class ActionTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-action-tab");

    const left = this.container.createDiv({ cls: "workspace-action-left" });
    this.renderTodayTasks(left);
    this.renderActiveTopics(left);
    this.renderQuickLinks(left);

    const right = this.container.createDiv({ cls: "workspace-action-right" });
    this.renderWeeklyPlan(right);
    this.renderLearningProgress(right);
    this.renderRecentModified(right);
  }

  // 常用入口模块
  private renderQuickLinks(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    const header = card.createDiv({ cls: "workspace-card-header" });
    header.createEl("h3", { text: "常用入口" });

    // 添加按钮
    const addBtn = header.createDiv({ cls: "workspace-add-btn", text: "+" });
    addBtn.addEventListener("click", () => this.addQuickLink());

    // 异步获取保存的链接
    this.getQuickLinks().then(links => {
      if (links.length === 0) {
        card.createEl("p", {
          cls: "workspace-empty-text",
          text: "点击 + 添加常用文档链接",
        });
      } else {
        const list = card.createEl("ul", { cls: "workspace-quick-links" });
        links.forEach((link, index) => {
          const item = list.createEl("li", { cls: "workspace-quick-link-item" });
          const linkEl = item.createEl("a", {
            text: link.label,
            href: "#",
          });
          linkEl.addEventListener("click", (e) => {
            e.preventDefault();
            if (fileExists(this.app, link.path)) {
              this.app.workspace.openLinkText(link.path, "");
            } else {
              new Notice(`文件不存在: ${link.path}`);
            }
          });

          // 删除按钮
          const deleteBtn = item.createDiv({ cls: "workspace-delete-btn", text: "×" });
          deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.deleteQuickLink(index);
          });
        });
      }
    });
  }

  // 获取常用入口文档路径
  private getQuickLinksDocPath(): string {
    const settings = (this.app as any).plugins?.getPlugin?.("worktop")?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    return `${workspaceRoot}/常用入口.md`;
  }

  // 获取保存的链接
  private async getQuickLinks(): Promise<{ label: string; path: string }[]> {
    const docPath = this.getQuickLinksDocPath();

    if (!fileExists(this.app, docPath)) {
      return [];
    }

    try {
      const file = this.app.vault.getAbstractFileByPath(docPath) as TFile;
      const content = await this.app.vault.read(file);
      const links: { label: string; path: string }[] = [];

      // 解析文档内容
      const lines = content.split("\n");
      for (const line of lines) {
        // 格式：- [[路径|显示名称]]
        const match = line.match(/^- \[\[([^|]+)\|(.+)\]\]$/);
        if (match) {
          links.push({ path: match[1], label: match[2] });
        }
      }

      return links;
    } catch (e) {
      console.error("读取常用入口文档失败:", e);
      return [];
    }
  }

  // 保存链接
  private async saveQuickLinks(links: { label: string; path: string }[]): Promise<void> {
    const docPath = this.getQuickLinksDocPath();
    const settings = (this.app as any).plugins?.getPlugin?.("worktop")?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";

    // 确保工作台文件夹存在
    if (!fileExists(this.app, workspaceRoot)) {
      await this.app.vault.createFolder(workspaceRoot);
    }

    // 生成文档内容
    let content = `# 常用入口\n\n`;
    content += `> 快速访问常用文档\n\n`;

    links.forEach(link => {
      content += `- [[${link.path}|${link.label}]]\n`;
    });

    // 创建或更新文档
    try {
      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
        await this.app.vault.create(docPath, content);
      }
    } catch (e) {
      console.error("保存常用入口文档失败:", e);
    }
  }

  // 添加链接
  private addQuickLink(): void {
    const modal = new FileSearchModal(this.app, async (path: string) => {
      const links = await this.getQuickLinks();
      const label = path.split("/").pop()?.replace(".md", "") || path;
      links.push({ label, path });
      await this.saveQuickLinks(links);
      this.render(); // 刷新
    });
    modal.open();
  }

  // 删除链接
  private async deleteQuickLink(index: number): Promise<void> {
    const links = await this.getQuickLinks();
    links.splice(index, 1);
    await this.saveQuickLinks(links);
    this.render(); // 刷新
  }

  private renderTodayTasks(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "今日要事" });

    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const todayPath = getDailyPlanPath(workspaceRoot);
    if (fileExists(this.app, todayPath)) {
      const file = this.app.vault.getAbstractFileByPath(todayPath) as TFile;
      this.app.vault.cachedRead(file).then((content) => {
        const tasks = this.extractTasks(content);
        const contentEl = card.createDiv({ cls: "workspace-card-content" });
        if (tasks.length === 0) {
          contentEl.createEl("p", { text: "今日暂无任务", cls: "workspace-card-empty-text" });
        } else {
          const list = contentEl.createEl("ul", { cls: "workspace-task-list" });
          tasks.forEach((task) => {
            const item = list.createEl("li", { cls: task.done ? "task-done" : "" });
            item.createSpan({ text: task.done ? "☑" : "☐", cls: "task-check" });
            item.createSpan({ text: task.text });
          });
        }
        const editBtn = card.createDiv({ cls: "workspace-card-action", text: "编辑" });
        editBtn.addEventListener("click", () => {
          this.app.workspace.openLinkText(todayPath, "");
        });
      });
    } else {
      const empty = card.createDiv({ cls: "workspace-card-empty" });
      empty.createEl("p", { text: "今日日计划未创建" });
      const createBtn = empty.createDiv({ cls: "workspace-card-action", text: "创建日计划" });
      createBtn.addEventListener("click", () => {
        (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-daily-plan");
      });
    }
  }

  private renderActiveTopics(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "活跃任务" });

    const topics = getTopicsByStatus(this.app, "进行中");
    if (topics.length === 0) {
      card.createEl("p", { cls: "workspace-card-empty-text", text: "暂无进行中的任务" });
    } else {
      const list = card.createEl("ul", { cls: "workspace-topic-list" });
      topics.slice(0, 10).forEach((topic) => {
        const item = list.createEl("li");
        item.createSpan({ cls: `workspace-type-tag ${topic.type}`, text: topic.type });
        const titleLink = item.createEl("a", { text: topic.title, href: "#" });
        titleLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
      });
    }
  }

  private renderWeeklyPlan(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "本周计划" });

    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";

    const now = new Date();
    const weekNum = this.getWeekNumber(now);
    const year = now.getFullYear();
    const planPath = `${workspaceRoot}/周计划/${year}-W${weekNum.toString().padStart(2, "0")}-本周计划.md`;

    if (fileExists(this.app, planPath)) {
      const file = this.app.vault.getAbstractFileByPath(planPath) as TFile;
      this.app.vault.cachedRead(file).then((content) => {
        const goals = this.extractGoals(content);
        const contentEl = card.createDiv({ cls: "workspace-card-content" });
        if (goals.length === 0) {
          contentEl.createEl("p", { text: "暂无本周目标", cls: "workspace-card-empty-text" });
        } else {
          const list = contentEl.createEl("ul", { cls: "workspace-task-list" });
          goals.forEach((goal) => {
            const item = list.createEl("li", { cls: goal.done ? "task-done" : "" });
            item.createSpan({ text: goal.done ? "☑" : "☐", cls: "task-check" });
            item.createSpan({ text: goal.text });
          });
        }
        const editBtn = card.createDiv({ cls: "workspace-card-action", text: "编辑" });
        editBtn.addEventListener("click", () => {
          this.app.workspace.openLinkText(planPath, "");
        });
      });
    } else {
      const empty = card.createDiv({ cls: "workspace-card-empty" });
      empty.createEl("p", { text: "本周计划未创建" });
      const createBtn = empty.createDiv({ cls: "workspace-card-action", text: "创建计划" });
      createBtn.addEventListener("click", () => {
        (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-weekly-plan");
      });
    }
  }

  private renderLearningProgress(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "学习进度" });

    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const learningStatusField = settings?.fieldNames?.learningStatus || "学习状态";

    const stats = getLearningStats(this.app, learningStatusField);
    const statsEl = card.createDiv({ cls: "workspace-learning-stats" });

    const colors: Record<string, string> = {
      待阅读: "var(--ws-gray)",
      已阅读: "var(--ws-primary)",
      已理解: "#4FC1FF",
      已掌握: "var(--ws-secondary)",
    };

    Object.entries(stats).forEach(([status, count]) => {
      const statItem = statsEl.createDiv({ cls: "workspace-stat-item" });
      statItem.style.cursor = "pointer";
      const dot = statItem.createSpan({ cls: "workspace-stat-dot" });
      dot.style.background = colors[status];
      statItem.createSpan({ text: `${status}: ${count}` });

      // 点击生成学习状态文档
      statItem.addEventListener("click", async () => {
        await this.generateLearningStatusDoc(status, learningStatusField, workspaceRoot);
      });
    });
  }

  // 生成学习状态文档
  private async generateLearningStatusDoc(status: string, learningStatusField: string, workspaceRoot: string): Promise<void> {
    const docPath = `${workspaceRoot}/学习状态-${status}.md`;

    const files = this.app.vault.getMarkdownFiles().filter(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      return cache?.frontmatter?.[learningStatusField] === status;
    });

    const today = new Date();
    let content = `# 学习状态：${status}\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;
    content += `共 ${files.length} 个文档\n\n`;

    files.forEach(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      content += `- [[${file.path}]]`;
      if (fm?.type) content += ` (${fm.type})`;
      content += `\n`;
    });

    try {
      // 确保文件夹存在
      if (!fileExists(this.app, workspaceRoot)) {
        await this.app.vault.createFolder(workspaceRoot);
      }

      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
        await this.app.vault.create(docPath, content);
      }
      this.app.workspace.openLinkText(docPath, "");
    } catch (error) {
      new Notice(`生成文档失败: ${error.message}`);
      console.error("生成学习状态文档失败:", error);
    }
  }

  private renderRecentModified(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "最近修改" });

    const files = getRecentFiles(this.app, 7);
    if (files.length === 0) {
      card.createEl("p", { cls: "workspace-card-empty-text", text: "暂无最近修改" });
    } else {
      const list = card.createEl("ul", { cls: "workspace-file-list" });
      files.slice(0, 10).forEach((file) => {
        const item = list.createEl("li");
        const link = item.createEl("a", { text: file.basename, href: "#" });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(file.path, "");
        });
        item.createSpan({ cls: "workspace-file-date", text: new Date(file.stat.mtime).toLocaleDateString() });
      });
    }
  }

  private extractTasks(content: string): { text: string; done: boolean }[] {
    const tasks: { text: string; done: boolean }[] = [];
    const lines = content.split("\n");
    let inTodaySection = false;

    for (const line of lines) {
      if (line.includes("今日要事")) { inTodaySection = true; continue; }
      if (inTodaySection && line.startsWith("## ")) { break; }
      if (inTodaySection) {
        const match = line.match(/^- \[([ xX])\] (.+)/);
        if (match) {
          tasks.push({ text: match[2], done: match[1] !== " " });
        }
      }
    }
    return tasks;
  }

  private extractGoals(content: string): { text: string; done: boolean }[] {
    const goals: { text: string; done: boolean }[] = [];
    const lines = content.split("\n");
    let inGoalsSection = false;

    for (const line of lines) {
      if (line.includes("本周目标")) { inGoalsSection = true; continue; }
      if (inGoalsSection && line.startsWith("## ")) { break; }
      if (inGoalsSection) {
        const match = line.match(/^- \[([ xX])\] (.+)/);
        if (match) {
          goals.push({ text: match[2], done: match[1] !== " " });
        }
      }
    }
    return goals;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}

// 文件搜索弹窗（模糊匹配）
class FileSearchModal {
  private app: App;
  private onSubmit: (path: string) => void;

  constructor(app: App, onSubmit: (path: string) => void) {
    this.app = app;
    this.onSubmit = onSubmit;
  }

  open(): void {
    const { Modal } = require("obsidian");

    class SearchModal extends Modal {
      private onSubmit: (path: string) => void;
      private searchInput: HTMLInputElement | null = null;
      private resultsContainer: HTMLElement | null = null;

      constructor(app: any, onSubmit: (path: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
      }

      onOpen(): void {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "添加常用入口" });

        // 搜索输入框
        const searchContainer = contentEl.createDiv({ cls: "workspace-search-container" });
        this.searchInput = searchContainer.createEl("input", {
          cls: "workspace-search-input",
          attr: { placeholder: "输入文件名进行搜索...", type: "text" },
        });

        // 结果容器
        this.resultsContainer = contentEl.createDiv({ cls: "workspace-search-results" });

        // 监听输入事件
        if (this.searchInput) {
          this.searchInput.addEventListener("input", () => {
            this.updateResults();
          });

          // 聚焦输入框
          this.searchInput.focus();
        }
      }

      private updateResults(): void {
        if (!this.searchInput || !this.resultsContainer) return;

        const query = this.searchInput.value.toLowerCase().trim();
        this.resultsContainer.empty();

        if (query.length < 2) {
          this.resultsContainer.createEl("p", {
            cls: "workspace-search-hint",
            text: "请输入至少2个字符进行搜索",
          });
          return;
        }

        // 搜索文件
        const files = this.app.vault.getMarkdownFiles()
          .filter((file: any) => {
            const fileName = file.basename.toLowerCase();
            const filePath = file.path.toLowerCase();
            return fileName.includes(query) || filePath.includes(query);
          })
          .slice(0, 20); // 限制结果数量

        if (files.length === 0) {
          this.resultsContainer.createEl("p", {
            cls: "workspace-search-hint",
            text: "未找到匹配的文件",
          });
          return;
        }

        // 显示结果
        const list = this.resultsContainer.createEl("ul", { cls: "workspace-search-list" });
        files.forEach((file: any) => {
          const item = list.createEl("li", { cls: "workspace-search-item" });
          const nameEl = item.createDiv({ cls: "workspace-search-name", text: file.basename });
          const pathEl = item.createDiv({ cls: "workspace-search-path", text: file.path });

          item.addEventListener("click", () => {
            this.onSubmit(file.path);
            this.close();
          });
        });
      }

      onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
      }
    }

    const modal = new SearchModal(this.app, this.onSubmit);
    modal.open();
  }
}
