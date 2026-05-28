import { App, TFile, Notice } from "obsidian";
import {
  fileExists,
  getOverdueTopics,
} from "../utils/dataview";
import { getDailyPlanPath } from "../utils/templates";

export class StatusBar {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-status-bar");

    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";

    const todayPath = getDailyPlanPath(workspaceRoot);
    const todayExists = fileExists(this.app, todayPath);
    const overdueTopics = getOverdueTopics(this.app, settings?.topicFolder || "事项");

    // 今日日计划
    this.createStatCard({
      label: "今日日计划",
      value: todayExists ? "已创建" : "未创建",
      color: todayExists ? "var(--ws-primary)" : "var(--ws-gray)",
      onClick: () => {
        if (todayExists) {
          this.app.workspace.openLinkText(todayPath, "");
        } else {
          (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-daily-plan");
        }
      },
    });

    // 今日待办 - 异步加载
    const todayCard = this.createStatCard({
      label: "今日待办",
      value: "-",
      color: "var(--ws-primary)",
      onClick: () => {
        if (todayExists) this.app.workspace.openLinkText(todayPath, "");
      },
    });
    if (todayExists) {
      const file = this.app.vault.getAbstractFileByPath(todayPath) as TFile;
      this.app.vault.cachedRead(file).then((content) => {
        const { done, total } = this.countTasks(content);
        const valueEl = todayCard.querySelector(".workspace-stat-value") as HTMLElement;
        if (valueEl) valueEl.textContent = `${done}/${total}`;
      });
    }

    // 本周待办 - 异步加载
    const weekCard = this.createStatCard({
      label: "本周待办",
      value: "-",
      color: "var(--ws-secondary)",
      onClick: () => {
        const now = new Date();
        const weekNum = this.getWeekNumber(now);
        const year = now.getFullYear();
        const planPath = `${workspaceRoot}/周计划/${year}-W${weekNum.toString().padStart(2, "0")}-本周计划.md`;
        if (fileExists(this.app, planPath)) {
          this.app.workspace.openLinkText(planPath, "");
        } else {
          (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-weekly-plan");
        }
      },
    });
    this.countWeekTasks().then(({ done, total }) => {
      const valueEl = weekCard.querySelector(".workspace-stat-value") as HTMLElement;
      if (valueEl) valueEl.textContent = `${done}/${total}`;
    });

    // 逾期 - 生成详细列表文档
    const overdueCard = this.createStatCard({
      label: "逾期",
      value: String(overdueTopics.length),
      color: overdueTopics.length > 0 ? "#FF6B6B" : "var(--ws-gray)",
      onClick: () => {
        this.generateAndOpenOverdueList(overdueTopics);
      },
    });
    if (overdueTopics.length > 0) {
      const valueEl = overdueCard.querySelector(".workspace-stat-value") as HTMLElement;
      if (valueEl) valueEl.style.color = "#FF6B6B";
    }

    // 已完成事项统计 - 生成详细列表文档
    const completedTopics = this.getCompletedTopics();
    const completedCard = this.createStatCard({
      label: "已完成",
      value: String(completedTopics.length),
      color: "#77DD77",
      onClick: () => {
        this.generateAndOpenCompletedList(completedTopics);
      },
    });
    // 已完成数字显示为绿色
    const completedValueEl = completedCard.querySelector(".workspace-stat-value") as HTMLElement;
    if (completedValueEl) completedValueEl.style.color = "#77DD77";

    // 进行中事项统计 - 生成详细列表文档
    const activeTopics = this.getActiveTopics();
    const activeCard = this.createStatCard({
      label: "进行中",
      value: String(activeTopics.length),
      color: "#FFD93D",
      onClick: () => {
        this.generateAndOpenActiveList(activeTopics);
      },
    });
    // 进行中数字显示为黄色
    const activeValueEl = activeCard.querySelector(".workspace-stat-value") as HTMLElement;
    if (activeValueEl) activeValueEl.style.color = "#FFD93D";
  }

  // 生成并打开逾期事项列表
  private async generateAndOpenOverdueList(topics: any[]): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/逾期事项.md`;
    const today = new Date();

    let content = `# 逾期事项列表\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    topics.forEach(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      if (fm) {
        const deadline = new Date(fm.deadline);
        const daysOverdue = Math.floor((today.getTime() - deadline.getTime()) / 86400000);
        content += `### [[${file.path}]]\n`;
        content += `- **类型**：${fm.type || '-'}\n`;
        content += `- **状态**：${fm.status}\n`;
        content += `- **截止日期**：${fm.deadline}\n`;
        content += `- **逾期天数**：${daysOverdue}天\n`;
        content += `- **创建时间**：${fm.created || '-'}\n\n`;
      }
    });

    await this.createOrUpdateDoc(docPath, content);
  }

  // 生成并打开已完成事项列表
  private async generateAndOpenCompletedList(topics: any[]): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/已完成事项.md`;
    const today = new Date();

    let content = `# 已完成事项列表\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    topics.forEach(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      if (fm) {
        content += `### [[${file.path}]]\n`;
        content += `- **类型**：${fm.type || '-'}\n`;
        content += `- **状态**：${fm.status}\n`;
        content += `- **创建时间**：${fm.created || '-'}\n`;
        content += `- **完成时间**：${fm.updated || '-'}\n`;
        if (fm.deadline) content += `- **截止日期**：${fm.deadline}\n`;
        content += `\n`;
      }
    });

    await this.createOrUpdateDoc(docPath, content);
  }

  // 生成并打开进行中事项列表
  private async generateAndOpenActiveList(topics: any[]): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/进行中事项.md`;
    const today = new Date();

    let content = `# 进行中事项列表\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    topics.forEach(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      if (fm) {
        content += `### [[${file.path}]]\n`;
        content += `- **类型**：${fm.type || '-'}\n`;
        content += `- **状态**：${fm.status}\n`;
        content += `- **创建时间**：${fm.created || '-'}\n`;
        content += `- **更新时间**：${fm.updated || '-'}\n`;
        if (fm.deadline) content += `- **截止日期**：${fm.deadline}\n`;
        content += `\n`;
      }
    });

    await this.createOrUpdateDoc(docPath, content);
  }

  // 创建或更新文档
  private async createOrUpdateDoc(docPath: string, content: string): Promise<void> {
    try {
      // 确保文件夹存在
      const folder = docPath.split("/").slice(0, -1).join("/");
      if (!fileExists(this.app, folder)) {
        await this.app.vault.createFolder(folder);
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
      console.error("生成文档失败:", error);
    }
  }

  // 获取已完成的事项
  private getCompletedTopics(): any[] {
    const files = this.app.vault.getMarkdownFiles()
      .filter((f) => f.path.startsWith("事项/"));
    const completed: any[] = [];

    files.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.status === "已完成") {
        completed.push(file);
      }
    });

    return completed;
  }

  // 获取进行中的事项
  private getActiveTopics(): any[] {
    const files = this.app.vault.getMarkdownFiles()
      .filter((f) => f.path.startsWith("事项/"));
    const active: any[] = [];

    files.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.status === "进行中") {
        active.push(file);
      }
    });

    return active;
  }

  private createStatCard(options: {
    label: string;
    value: string;
    color: string;
    onClick: () => void;
  }): HTMLElement {
    const card = this.container.createDiv({ cls: "workspace-stat-card" });
    card.createDiv({ cls: "workspace-stat-value", text: options.value });
    card.createDiv({ cls: "workspace-stat-label", text: options.label });
    card.style.borderLeft = `4px solid ${options.color}`;
    card.addEventListener("click", options.onClick);
    return card;
  }

  private countTasks(content: string): { done: number; total: number } {
    let done = 0;
    let total = 0;
    const lines = content.split("\n");
    let inTodaySection = false;

    for (const line of lines) {
      if (line.includes("今日要事")) { inTodaySection = true; continue; }
      if (inTodaySection && line.startsWith("## ")) { break; }
      if (inTodaySection) {
        const match = line.match(/^- \[([ xX])\] (.+)/);
        if (match) {
          total++;
          if (match[1] !== " ") done++;
        }
      }
    }
    return { done, total };
  }

  private async countWeekTasks(): Promise<{ done: number; total: number }> {
    let done = 0;
    let total = 0;
    const now = new Date();

    // 1. 统计周计划文件中的任务
    const weekNum = this.getWeekNumber(now);
    const year = now.getFullYear();
    const planPath = `周计划/${year}-W${weekNum.toString().padStart(2, "0")}-本周计划.md`;
    if (fileExists(this.app, planPath)) {
      const file = this.app.vault.getAbstractFileByPath(planPath) as TFile;
      const content = await this.app.vault.cachedRead(file);
      const tasks = this.countWeeklyPlanTasks(content);
      done += tasks.done;
      total += tasks.total;
    }

    // 2. 统计本周7天日记中的任务
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const path = `日记/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.md`;
      if (fileExists(this.app, path)) {
        const file = this.app.vault.getAbstractFileByPath(path) as TFile;
        const content = await this.app.vault.cachedRead(file);
        const tasks = this.countTasks(content);
        done += tasks.done;
        total += tasks.total;
      }
    }
    return { done, total };
  }

  private countWeeklyPlanTasks(content: string): { done: number; total: number } {
    let done = 0;
    let total = 0;
    const lines = content.split("\n");
    let inGoalsSection = false;

    for (const line of lines) {
      if (line.includes("本周目标")) { inGoalsSection = true; continue; }
      if (inGoalsSection && line.startsWith("## ")) { break; }
      if (inGoalsSection) {
        const match = line.match(/^- \[([ xX])\] (.+)/);
        if (match) {
          total++;
          if (match[1] !== " ") done++;
        }
      }
    }
    return { done, total };
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
