import { App, Notice, TFile } from "obsidian";
import { CreateNoteModal } from "../modals/CreateNoteModal";
import { getTopicsByStatus, getRecentFiles, fileExists } from "../utils/dataview";

export class QuickActions {
  private container: HTMLElement;
  private app: App;
  private onSwitchTab?: (tabId: string) => void;

  constructor(app: App, container: HTMLElement, onSwitchTab?: (tabId: string) => void) {
    this.app = app;
    this.container = container;
    this.onSwitchTab = onSwitchTab;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-quick-actions");

    // 快速创建按钮
    const createGroup = this.container.createDiv({ cls: "workspace-action-group" });
    createGroup.createSpan({ cls: "workspace-action-label", text: "创建：" });

    const createButtons = [
      { type: "task", label: "任务" },
      { type: "idea", label: "想法" },
      { type: "project", label: "项目" },
      { type: "inspiration", label: "灵感" },
      { type: "writing", label: "写作" },
      { type: "learning", label: "学习" },
      { type: "diary", label: "日志" },
    ];

    createButtons.forEach((btn) => {
      const button = createGroup.createDiv({ cls: "workspace-action-btn create", text: btn.label });
      button.addEventListener("click", () => this.openCreateModal(btn.type));
    });

    this.container.createDiv({ cls: "workspace-action-separator" });

    // 工作流按钮
    const workflowGroup = this.container.createDiv({ cls: "workspace-action-group" });
    workflowGroup.createSpan({ cls: "workspace-action-label", text: "工作流：" });

    const workflowButtons = [
      { id: "daily-start", label: "每日开始" },
      { id: "task-overview", label: "任务总览" },
      { id: "inbox-list", label: "待整理清单" },
      { id: "task-eval", label: "任务评估" },
      { id: "writing-mgmt", label: "写作管理" },
      { id: "learning-stats", label: "学习统计" },
      { id: "recent-activity", label: "最近动态" },
    ];

    workflowButtons.forEach((btn) => {
      const button = workflowGroup.createDiv({ cls: "workspace-action-btn workflow", text: btn.label });
      button.addEventListener("click", () => this.handleWorkflowAction(btn.id));
    });
  }

  private openCreateModal(type: string): void {
    new CreateNoteModal(this.app, type, async (path, content) => {
      try {
        const file = await this.app.vault.create(path, content);
        this.app.workspace.openLinkText(file.path, "");
      } catch (error) {
        new Notice(`创建失败: ${error.message}`);
        console.error("创建文件失败:", error);
      }
    }).open();
  }

  private handleWorkflowAction(actionId: string): void {
    switch (actionId) {
      case "daily-start":
        this.dailyStart();
        break;
      case "task-overview":
        this.showTaskOverview();
        break;
      case "inbox-list":
        this.showInboxList();
        break;
      case "task-eval":
        this.showTaskEval();
        break;
      case "writing-mgmt":
        this.showWritingMgmt();
        break;
      case "learning-stats":
        if (this.onSwitchTab) this.onSwitchTab("analysis");
        break;
      case "recent-activity":
        this.showRecentActivity();
        break;
    }
  }

  private async dailyStart(): Promise<void> {
    // 调用命令来创建日计划（包含周计划关联逻辑）
    (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-daily-plan");
  }

  private showTaskOverview(): void {
    const topics = getTopicsByStatus(this.app, "进行中");
    if (topics.length === 0) {
      new Notice("暂无进行中的任务");
      return;
    }
    this.app.workspace.openLinkText(topics[0].path, "");
  }

  private showInboxList(): void {
    const files = this.app.vault.getMarkdownFiles().filter(f => f.path.startsWith("待整理/"));
    if (files.length === 0) {
      new Notice("待整理文件夹为空");
      return;
    }
    this.app.workspace.openLinkText(files[0].path, "");
  }

  private showTaskEval(): void {
    const topics = getTopicsByStatus(this.app, "待评估");
    if (topics.length === 0) {
      new Notice("暂无待评估的任务");
      return;
    }
    this.app.workspace.openLinkText(topics[0].path, "");
  }

  private showWritingMgmt(): void {
    const topics = getTopicsByStatus(this.app, "进行中").filter(t => t.type === "写作");
    if (topics.length === 0) {
      new Notice("暂无进行中的写作");
      return;
    }
    this.app.workspace.openLinkText(topics[0].path, "");
  }

  private showRecentActivity(): void {
    const files = getRecentFiles(this.app, 7);
    if (files.length === 0) {
      new Notice("暂无最近活动");
      return;
    }
    this.app.workspace.openLinkText(files[0].path, "");
  }
}
