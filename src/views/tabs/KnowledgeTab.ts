import { App, TFile, Notice } from "obsidian";
import { getTopicsByStatus, getRecentFiles, getFolderStats } from "../../utils/dataview";

export class KnowledgeTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-knowledge-tab");

    this.renderTopicList();
    this.renderTopicPool();
    this.renderRecentNotes();
    this.renderDocOverview();
  }

  private renderTopicList(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "事项清单" });

    const topics = getTopicsByStatus(this.app, "进行中");
    if (topics.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无进行中的事项",
      });
    } else {
      const grid = section.createDiv({ cls: "workspace-topic-grid" });
      topics.forEach((topic) => {
        const card = grid.createDiv({ cls: "workspace-topic-card" });
        const header = card.createDiv({ cls: "workspace-topic-header" });
        const typeTag = header.createSpan({
          cls: `workspace-type-tag ${topic.type}`,
          text: topic.type,
        });
        const title = card.createEl("a", {
          cls: "workspace-topic-title",
          text: topic.title,
          href: "#",
        });
        title.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
        if (topic.deadline) {
          card.createDiv({
            cls: "workspace-topic-deadline",
            text: `截止: ${topic.deadline}`,
          });
        }
      });
    }
  }

  private renderTopicPool(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "事项池" });

    const topics = getTopicsByStatus(this.app, "待评估");
    if (topics.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无待评估的事项",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-simple-list" });
      topics.forEach((topic) => {
        const item = list.createEl("li");
        const link = item.createEl("a", {
          text: topic.title,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
        item.createSpan({
          cls: "workspace-list-date",
          text: topic.created,
        });
      });
    }
  }

  private renderRecentNotes(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "最近笔记" });

    const files = getRecentFiles(this.app, 7);
    if (files.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无最近修改的笔记",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-simple-list" });
      files.slice(0, 15).forEach((file) => {
        const item = list.createEl("li");
        const link = item.createEl("a", {
          text: file.basename,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(file.path, "");
        });
        item.createSpan({
          cls: "workspace-list-date",
          text: new Date(file.stat.mtime).toLocaleDateString(),
        });
      });
    }
  }

  private renderDocOverview(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "文档概览" });

    const folderStats = getFolderStats(this.app);
    const folders = Object.entries(folderStats).sort((a, b) => b[1] - a[1]);

    if (folders.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无文档",
      });
    } else {
      // 显示统计卡片
      const grid = section.createDiv({ cls: "workspace-folder-grid" });
      folders.forEach(([folder, count]) => {
        const card = grid.createDiv({ cls: "workspace-folder-card" });
        card.createDiv({ cls: "workspace-folder-name", text: folder });
        card.createDiv({ cls: "workspace-folder-count", text: String(count) });
        card.addEventListener("click", () => {
          this.generateAndOpenFolderDoc(folder);
        });
      });

      // 生成文档按钮
      const generateBtn = section.createDiv({ cls: "workspace-card-action", text: "生成完整文档概览" });
      generateBtn.addEventListener("click", () => {
        this.generateFullDocOverview();
      });
    }
  }

  // 生成单个文件夹的文档
  private async generateAndOpenFolderDoc(folder: string): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/${folder}文档清单.md`;
    const today = new Date();

    const files = this.app.vault.getMarkdownFiles()
      .filter((f) => f.path.startsWith(folder + "/"))
      .sort((a, b) => b.stat.mtime - a.stat.mtime);

    let content = `# ${folder} 文档清单\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;
    content += `共 ${files.length} 个文档\n\n`;

    files.forEach((file) => {
      const date = new Date(file.stat.mtime).toLocaleDateString();
      content += `- [[${file.path}]] (${date})\n`;
    });

    await this.createOrUpdateDoc(docPath, content);
  }

  // 生成完整的文档概览
  private async generateFullDocOverview(): Promise<void> {
    const settings = (this.app as any).plugins?.plugins?.["worktop"]?.settings;
    const workspaceRoot = settings?.workspaceRoot || "工作台";
    const docPath = `${workspaceRoot}/文档概览.md`;
    const today = new Date();

    const folderStats = getFolderStats(this.app);
    const folders = Object.entries(folderStats).sort((a, b) => b[1] - a[1]);

    let content = `# 文档概览\n\n`;
    content += `> 生成时间：${today.toLocaleString()}\n\n`;

    // 统计汇总
    const totalCount = folders.reduce((sum, [, count]) => sum + count, 0);
    content += `共 ${folders.length} 个文件夹，${totalCount} 个文档\n\n`;

    // 文件夹列表
    content += `## 文件夹概览\n\n`;
    folders.forEach(([folder, count]) => {
      content += `- [[${workspaceRoot}/${folder}文档清单.md|${folder}]] (${count} 个文档)\n`;
    });

    content += `\n---\n\n`;

    // 每个文件夹的详细列表
    folders.forEach(([folder]) => {
      content += `## ${folder}\n\n`;
      const files = this.app.vault.getMarkdownFiles()
        .filter((f) => f.path.startsWith(folder + "/"))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

      files.forEach((file) => {
        content += `- [[${file.path}]]\n`;
      });
      content += `\n`;
    });

    await this.createOrUpdateDoc(docPath, content);
  }

  // 创建或更新文档
  private async createOrUpdateDoc(docPath: string, content: string): Promise<void> {
    try {
      // 确保文件夹存在
      const folder = docPath.split("/").slice(0, -1).join("/");
      if (!this.app.vault.getAbstractFileByPath(folder)) {
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
}
