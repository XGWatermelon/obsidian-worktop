import { App, TFile, Notice } from "obsidian";
import {
  getLearningStats,
  getDomainStats,
  getDomainFiles,
  getActivityData,
  toLocalDateStr,
} from "../../utils/dataview";

export class AnalysisTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-analysis-tab");

    this.renderHeatmap();
    this.renderLearningStats();
    this.renderModuleCoverage();
    this.renderObjectStats();
  }

  private renderHeatmap(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "年度活跃度热力图" });

    const activityData = getActivityData(this.app, 365);

    // 今天
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 从今年5月1日开始
    const startYear = today.getMonth() >= 4 ? today.getFullYear() : today.getFullYear() - 1;

    // 创建主容器
    const graphContainer = section.createDiv({ cls: "gh-calendar" });

    // 渲染12个月（今年5月到明年4月）
    for (let i = 0; i < 12; i++) {
      const month = (4 + i) % 12; // 从5月开始（4是5月的索引）
      const year = startYear + Math.floor((4 + i) / 12);

      this.renderMonth(graphContainer, year, month, activityData, today);
    }

    // 图例
    const legend = section.createDiv({ cls: "gh-legend" });
    legend.createSpan({ text: "少" });
    for (let i = 0; i <= 4; i++) {
      legend.createSpan({ cls: `gh-legend-cell gh-level-${i}` });
    }
    legend.createSpan({ text: "多" });
  }

  private renderMonth(
    container: HTMLElement,
    year: number,
    month: number,
    activityData: Record<string, number>,
    today: Date
  ): void {
    const monthDiv = container.createDiv({ cls: "gh-month" });

    // 月份标签
    const label = monthDiv.createDiv({ cls: "gh-month-label" });
    label.textContent = `${year}年${this.getMonthName(month)}`;

    // 网格容器
    const grid = monthDiv.createDiv({ cls: "gh-month-grid" });

    // 行标签
    const dayLabels = grid.createDiv({ cls: "gh-day-labels" });
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    labels.forEach((l) => {
      dayLabels.createDiv({ cls: "gh-day-label", text: l });
    });

    // 格子区域
    const columns = grid.createDiv({ cls: "gh-columns" });

    // 获取本月第一天
    const firstDay = new Date(year, month, 1);
    // 获取本月最后一天
    const lastDay = new Date(year, month + 1, 0);

    // 对齐到周一（一周从周一开始）
    const startDayOfWeek = firstDay.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // 从本月第一周的周一开始
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - offset);

    // 按周渲染
    const currentDate = new Date(startDate);
    while (currentDate.getMonth() === month || currentDate < firstDay) {
      const column = columns.createDiv({ cls: "gh-column" });

      // 一周7天
      for (let d = 0; d < 7; d++) {
        const cell = column.createDiv({ cls: "gh-cell" });

        // 只渲染本月的日期
        if (currentDate.getMonth() === month) {
          const dateStr = toLocalDateStr(currentDate);
          const count = activityData[dateStr] || 0;
          const level = this.getActivityLevel(count);
          cell.addClass(`gh-level-${level}`);
          cell.title = `${dateStr}: ${count} 篇笔记`;
        } else {
          // 非本月日期显示为空
          cell.addClass("gh-empty");
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 如果已经过了本月，跳出循环
      if (currentDate > lastDay && currentDate.getDay() === 1) {
        break;
      }
    }
  }

  private getActivityLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  private getMonthName(month: number): string {
    const names = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    return names[month];
  }

  private renderLearningStats(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "学习状态分布" });

    const stats = getLearningStats(this.app);
    const statsEl = section.createDiv({
      cls: "workspace-learning-stats-horizontal",
    });

    const colors: Record<string, string> = {
      待阅读: "var(--ws-gray)",
      已阅读: "var(--ws-primary)",
      已理解: "#4FC1FF",
      已掌握: "var(--ws-secondary)",
    };

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    Object.entries(stats).forEach(([status, count]) => {
      const statCard = statsEl.createDiv({ cls: "workspace-stat-card-small" });
      const value = statCard.createDiv({
        cls: "workspace-stat-value-small",
        text: String(count),
      });
      value.style.color = colors[status];
      statCard.createDiv({ cls: "workspace-stat-label-small", text: status });
      if (total > 0) {
        const percent = Math.round((count / total) * 100);
        statCard.createDiv({
          cls: "workspace-stat-percent",
          text: `${percent}%`,
        });
      }
    });
  }

  private renderModuleCoverage(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "领域覆盖" });

    // 从配置中获取领域列表
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const domains = settings?.domains || ["AI", "SAP"];
    const learningStatusField = settings?.fieldNames?.learningStatus || "学习状态";

    if (domains.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂未配置领域，请在设置中添加",
      });
      return;
    }

    const grid = section.createDiv({ cls: "workspace-module-grid" });

    domains.forEach((domain: string) => {
      const stats = getDomainStats(this.app, domain, learningStatusField);
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      const mastered = stats["已掌握"] || 0;

      const card = grid.createDiv({ cls: "workspace-module-card" });
      card.createEl("h4", { text: domain });

      card.createDiv({
        cls: "workspace-module-progress",
        text: `${mastered}/${total}`,
      });

      const progressBar = card.createDiv({ cls: "workspace-progress-bar" });
      const progressFill = progressBar.createDiv({
        cls: "workspace-progress-fill",
      });
      if (total > 0) {
        progressFill.style.width = `${(mastered / total) * 100}%`;
      }

      // 点击生成领域统计文档
      card.addEventListener("click", () => {
        this.generateDomainDoc(domain, learningStatusField);
      });
    });
  }

  // 生成领域统计文档
  private async generateDomainDoc(domain: string, learningStatusField: string): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/领域统计-${domain}.md`;

    const stats = getDomainStats(this.app, domain, learningStatusField);
    const files = getDomainFiles(this.app, domain);
    const today = new Date();

    let content = `# ${domain} 领域统计\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    // 统计概览
    content += `## 统计概览\n\n`;
    content += `| 状态 | 数量 |\n`;
    content += `|------|------|\n`;

    const statusColors: Record<string, string> = {
      待阅读: "⬜",
      已阅读: "🟩",
      已理解: "🟦",
      已掌握: "🟪",
    };

    Object.entries(stats).forEach(([status, count]) => {
      content += `| ${statusColors[status] || ""} ${status} | ${count} |\n`;
    });

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    content += `| **总计** | **${total}** |\n\n`;

    // 按状态分组列出文件
    content += `---\n\n`;

    const statusGroups: Record<string, TFile[]> = {
      待阅读: [],
      已阅读: [],
      已理解: [],
      已掌握: [],
    };

    files.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const status = cache?.frontmatter?.[learningStatusField];
      if (status && status in statusGroups) {
        statusGroups[status].push(file);
      }
    });

    Object.entries(statusGroups).forEach(([status, statusFiles]) => {
      content += `## ${status}\n\n`;
      if (statusFiles.length === 0) {
        content += `暂无\n\n`;
      } else {
        statusFiles.forEach((file) => {
          content += `- [[${file.path}|${file.basename}]]\n`;
        });
        content += `\n`;
      }
    });

    // 创建或更新文档
    try {
      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
        // 确保文件夹存在
        const folder = docPath.split("/").slice(0, -1).join("/");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          await this.app.vault.createFolder(folder);
        }
        await this.app.vault.create(docPath, content);
      }
      this.app.workspace.openLinkText(docPath, "");
    } catch (error) {
      new Notice(`生成文档失败: ${error.message}`);
      console.error("生成文档失败:", error);
    }
  }

  private renderObjectStats(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "节点图谱" });

    const objectFiles = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith("节点/"));

    const statEl = section.createDiv({ cls: "workspace-object-stats" });
    statEl.createEl("p", {
      text: `共 ${objectFiles.length} 个知识图谱节点`,
    });

    const list = statEl.createEl("ul", { cls: "workspace-simple-list" });
    objectFiles.slice(0, 10).forEach((file) => {
      const item = list.createEl("li");
      const link = item.createEl("a", {
        text: file.basename,
        href: "#",
      });
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.app.workspace.openLinkText(file.path, "");
      });
    });
  }
}
