import { App, TFile, Notice } from "obsidian";
import {
  getLearningStats,
  getDomainStats,
  getDomainModuleStats,
  getDomainFiles,
  getActivityData,
  toLocalDateStr,
} from "../../utils/dataview";
import {
  getDomains,
  getStatuses,
  getStatusColor,
  getFolderPath,
} from "../../config/accessors";

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startYear = today.getMonth() >= 4 ? today.getFullYear() : today.getFullYear() - 1;

    const graphContainer = section.createDiv({ cls: "gh-calendar" });

    for (let i = 0; i < 12; i++) {
      const month = (4 + i) % 12;
      const year = startYear + Math.floor((4 + i) / 12);
      this.renderMonth(graphContainer, year, month, activityData, today);
    }

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

    const label = monthDiv.createDiv({ cls: "gh-month-label" });
    label.textContent = `${year}年${this.getMonthName(month)}`;

    const grid = monthDiv.createDiv({ cls: "gh-month-grid" });

    const dayLabels = grid.createDiv({ cls: "gh-day-labels" });
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    labels.forEach((l) => {
      dayLabels.createDiv({ cls: "gh-day-label", text: l });
    });

    const columns = grid.createDiv({ cls: "gh-columns" });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - offset);

    const currentDate = new Date(startDate);
    while (currentDate.getMonth() === month || currentDate < firstDay) {
      const column = columns.createDiv({ cls: "gh-column" });

      for (let d = 0; d < 7; d++) {
        const cell = column.createDiv({ cls: "gh-cell" });

        if (currentDate.getMonth() === month) {
          const dateStr = toLocalDateStr(currentDate);
          const count = activityData[dateStr] || 0;
          const level = this.getActivityLevel(count);
          cell.addClass(`gh-level-${level}`);
          cell.title = `${dateStr}: ${count} 篇笔记`;
        } else {
          cell.addClass("gh-empty");
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

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

    const learningStatuses = getStatuses(this.app, "learning");
    const stats = getLearningStats(this.app);
    const statsEl = section.createDiv({
      cls: "workspace-learning-stats-horizontal",
    });

    // 从配置读取颜色
    const colorMap: Record<string, string> = {
      [learningStatuses[0]]: "var(--ws-gray)",      // 待阅读
      [learningStatuses[1]]: "var(--ws-primary)",    // 已阅读
      [learningStatuses[2]]: getStatusColor(this.app, "understanding"), // 已理解
      [learningStatuses[3]]: "var(--ws-secondary)",  // 已掌握
    };

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    Object.entries(stats).forEach(([status, count]) => {
      const statCard = statsEl.createDiv({ cls: "workspace-stat-card-small workspace-clickable" });
      const value = statCard.createDiv({
        cls: "workspace-stat-value-small",
        text: String(count),
      });
      value.style.color = colorMap[status] || "var(--ws-gray)";
      statCard.createDiv({ cls: "workspace-stat-label-small", text: status });
      if (total > 0) {
        const percent = Math.round((count / total) * 100);
        statCard.createDiv({
          cls: "workspace-stat-percent",
          text: `${percent}%`,
        });
      }
      statCard.addEventListener("click", () => this.generateLearningStatusDoc(status));
    });
  }

  private renderModuleCoverage(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "领域覆盖" });

    const domains = getDomains(this.app);
    const learningStatuses = getStatuses(this.app, "learning");
    const masteredStatus = learningStatuses[learningStatuses.length - 1]; // "已掌握"

    if (domains.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂未配置领域，请在设置中添加",
      });
      return;
    }

    domains.forEach((domain) => {
      const domainSection = section.createDiv({ cls: "workspace-domain-section" });

      // 领域头部：颜色点 + 名称 + 总数
      const domainHeader = domainSection.createDiv({ cls: "workspace-domain-header" });
      if (domain.color) {
        const colorDot = domainHeader.createSpan({ cls: "workspace-domain-color-dot" });
        colorDot.style.background = domain.color;
      }
      domainHeader.createEl("span", { text: domain.name, cls: "workspace-domain-title" });

      const domainStats = getDomainStats(this.app, domain.name);
      const domainTotal = Object.values(domainStats).reduce((a, b) => a + b, 0);
      domainHeader.createSpan({ cls: "workspace-domain-total", text: `${domainTotal} 篇` });

      // 领域学习状态小卡片行（和学习状态分布同风格，但更小）
      const statsRow = domainSection.createDiv({ cls: "workspace-domain-stats-row" });
      learningStatuses.forEach((status) => {
        const count = domainStats[status] || 0;
        const item = statsRow.createDiv({ cls: "workspace-domain-stat-item" });
        item.createSpan({ cls: "workspace-domain-stat-num", text: String(count) });
        item.createSpan({ cls: "workspace-domain-stat-label", text: status });
      });

      // 模块卡片网格
      if (domain.modules.length > 0) {
        const { moduleStats } = getDomainModuleStats(this.app, domain.id);
        const grid = domainSection.createDiv({ cls: "workspace-module-grid" });

        const allKeys = [...domain.modules.map((m) => m.name)];
        if (moduleStats["未分类"]) allKeys.push("未分类");

        allKeys.forEach((modName) => {
          const stats = moduleStats[modName] || {};
          const total = Object.values(stats).reduce((a, b) => a + b, 0);
          const mastered = stats[masteredStatus] || 0;
          const isUncategorized = modName === "未分类";

          const card = grid.createDiv({
            cls: `workspace-module-card ${isUncategorized ? "workspace-module-uncategorized" : ""}`,
          });
          card.style.cursor = "pointer";

          const top = card.createDiv({ cls: "workspace-module-top" });
          top.createSpan({ cls: "workspace-module-name", text: isUncategorized ? "未分类" : modName });
          top.createSpan({ cls: "workspace-module-progress", text: `${mastered}/${total}` });

          const progressBar = card.createDiv({ cls: "workspace-progress-bar" });
          const progressFill = progressBar.createDiv({ cls: "workspace-progress-fill" });
          if (total > 0) {
            progressFill.style.width = `${(mastered / total) * 100}%`;
          }

          card.addEventListener("click", () => {
            this.generateModuleDoc(domain.name, modName);
          });
        });
      }

      domainHeader.addEventListener("click", () => {
        this.generateDomainDoc(domain.name);
      });
    });
  }

  // 生成领域统计文档
  private async generateDomainDoc(domain: string): Promise<void> {
    const docPath = `${getFolderPath(this.app, "generatedDocs")}/领域/领域统计-${domain}.md`;
    const learningStatuses = getStatuses(this.app, "learning");

    const stats = getDomainStats(this.app, domain);
    const files = getDomainFiles(this.app, domain);
    const today = new Date();

    let content = `# ${domain} 领域统计\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    content += `## 统计概览\n\n`;
    content += `| 状态 | 数量 |\n`;
    content += `|------|------|\n`;

    const statusIcons: Record<string, string> = {};
    const icons = ["⬜", "🟩", "🟦", "🟪"];
    learningStatuses.forEach((s, i) => {
      statusIcons[s] = icons[i] || "";
    });

    Object.entries(stats).forEach(([status, count]) => {
      content += `| ${statusIcons[status] || ""} ${status} | ${count} |\n`;
    });

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    content += `| **总计** | **${total}** |\n\n`;

    content += `---\n\n`;

    const statusGroups: Record<string, TFile[]> = {};
    learningStatuses.forEach((s) => (statusGroups[s] = []));

    files.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const learningStatusField = "学习状态";
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

    try {
      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
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

  // 生成模块清单文档
  private async generateModuleDoc(domainName: string, moduleName: string): Promise<void> {
    const docPath = `${getFolderPath(this.app, "generatedDocs")}/模块/模块清单-${moduleName}.md`;
    const learningStatuses = getStatuses(this.app, "learning");

    // 和 getDomainModuleStats 保持一致的 tag 匹配逻辑
    const domains = getDomains(this.app);
    const domain = domains.find((d) => d.name === domainName);
    const domainLower = domainName.toLowerCase();

    const allFiles = this.app.vault.getMarkdownFiles();
    const moduleFiles: TFile[] = [];

    allFiles.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const tags: string[] = cache?.frontmatter?.tags || [];
      const tagsLower = tags.map((t) => String(t).toLowerCase());

      if (!tagsLower.includes(domainLower)) return;

      if (moduleName === "未分类") {
        // 未分类：有领域 tag 但没有匹配任何模块 tag
        const hasModuleTag = domain
          ? domain.modules.some((m) => tagsLower.includes(m.name.toLowerCase()) || tagsLower.includes(m.id.toLowerCase()))
          : false;
        if (!hasModuleTag) moduleFiles.push(file);
      } else {
        // 普通模块：tag 中包含模块名或模块 id
        if (tagsLower.includes(moduleName.toLowerCase())) {
          moduleFiles.push(file);
        } else if (domain) {
          const mod = domain.modules.find((m) => m.name === moduleName);
          if (mod && tagsLower.includes(mod.id.toLowerCase())) {
            moduleFiles.push(file);
          }
        }
      }
    });

    let content = `# ${moduleName} 模块清单\n\n`;
    content += `> 领域：${domainName} | 更新时间：${new Date().toLocaleString()}\n\n`;
    content += `共 ${moduleFiles.length} 篇\n\n`;

    if (moduleFiles.length === 0) {
      content += `暂无文件\n`;
    } else {
      // 按学习状态分组
      const groups: Record<string, TFile[]> = {};
      learningStatuses.forEach((s) => (groups[s] = []));
      groups["未标记"] = [];

      moduleFiles.forEach((file) => {
        const cache = this.app.metadataCache.getFileCache(file);
        const status = cache?.frontmatter?.["学习状态"];
        if (status && status in groups) {
          groups[status].push(file);
        } else {
          groups["未标记"].push(file);
        }
      });

      Object.entries(groups).forEach(([status, files]) => {
        if (files.length === 0) return;
        content += `## ${status}（${files.length}）\n\n`;
        files.forEach((f) => {
          content += `- [[${f.basename}]]\n`;
        });
        content += `\n`;
      });
    }

    try {
      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
        const folder = docPath.split("/").slice(0, -1).join("/");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          await this.app.vault.createFolder(folder);
        }
        await this.app.vault.create(docPath, content);
      }
      this.app.workspace.openLinkText(docPath, "");
    } catch (error) {
      new Notice(`生成文档失败: ${error.message}`);
      console.error("生成模块清单失败:", error);
    }
  }

  // 生成学习状态文档
  private async generateLearningStatusDoc(status: string): Promise<void> {
    const docPath = `${getFolderPath(this.app, "generatedDocs")}/学习状态/学习状态-${status}.md`;
    const learningStatusField = "学习状态";

    const allFiles = this.app.vault.getMarkdownFiles();
    const matchedFiles: TFile[] = [];

    allFiles.forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const fmStatus = cache?.frontmatter?.[learningStatusField];
      if (fmStatus === status) {
        matchedFiles.push(file);
      }
    });

    const today = new Date();
    let content = `# 学习状态：${status}\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;
    content += `共 ${matchedFiles.length} 篇\n\n`;
    content += `---\n\n`;

    if (matchedFiles.length === 0) {
      content += `暂无\n`;
    } else {
      matchedFiles.forEach((file) => {
        const cache = this.app.metadataCache.getFileCache(file);
        const type = cache?.frontmatter?.type || "";
        const domain = cache?.frontmatter?.domain || "";
        const meta = [type, domain].filter(Boolean).join(" / ");
        content += `- [[${file.path}|${file.basename}]]${meta ? ` (${meta})` : ""}\n`;
      });
    }

    try {
      const existing = this.app.vault.getAbstractFileByPath(docPath);
      if (existing) {
        await this.app.vault.modify(existing as TFile, content);
      } else {
        const folder = docPath.split("/").slice(0, -1).join("/");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          await this.app.vault.createFolder(folder);
        }
        await this.app.vault.create(docPath, content);
      }
      this.app.workspace.openLinkText(docPath, "");
    } catch (error) {
      new Notice(`生成文档失败: ${error.message}`);
      console.error("生成学习状态文档失败:", error);
    }
  }

  private renderObjectStats(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "节点图谱" });

    const nodesFolder = getFolderPath(this.app, "nodes");
    const objectFiles = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(nodesFolder + "/"));

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
