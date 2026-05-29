import { App, Notice } from "obsidian";
import { CreateNoteModal } from "../modals/CreateNoteModal";
import { ensureFolder } from "../utils/dataview";
import { getTypes, getFolderPath, getWorkflows } from "../config/accessors";
import {
  generateTaskOverview,
  generateInboxList,
  generateTaskEval,
  generateWritingMgmt,
  generateLearningStatsDoc,
  generateRecentActivity,
} from "../services/WorkflowService";
import { createDiary } from "../services/PlanService";

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

    // 快速创建按钮 - 从配置读取类型
    const createGroup = this.container.createDiv({ cls: "workspace-action-group" });
    createGroup.createSpan({ cls: "workspace-action-label", text: "创建：" });

    const types = getTypes(this.app);
    types.forEach((type) => {
      const button = createGroup.createDiv({ cls: "workspace-action-btn create", text: type.name });
      button.addEventListener("click", () => this.openCreateModal(type.id));
    });

    this.container.createDiv({ cls: "workspace-action-separator" });

    // 工作流按钮 - 从配置读取
    const workflowGroup = this.container.createDiv({ cls: "workspace-action-group" });
    workflowGroup.createSpan({ cls: "workspace-action-label", text: "工作流：" });

    const workflows = getWorkflows(this.app);
    workflows.forEach((wf) => {
      const button = workflowGroup.createDiv({ cls: "workspace-action-btn workflow", text: wf.label });
      button.addEventListener("click", () => this.handleWorkflowAction(wf.id));
    });
  }

  private openCreateModal(type: string): void {
    new CreateNoteModal(this.app, type, async (path, content) => {
      try {
        const folder = path.split("/").slice(0, -1).join("/");
        await ensureFolder(this.app, folder);
        const file = await this.app.vault.create(path, content);
        this.app.workspace.openLinkText(file.path, "");
      } catch (error) {
        new Notice(`创建失败: ${error.message}`);
        console.error("创建文件失败:", error);
      }
    }).open();
  }

  private async handleWorkflowAction(actionId: string): Promise<void> {
    switch (actionId) {
      case "daily-start":
        (this.app as any).commands.executeCommandById("obsidian-workspace-plugin:create-daily-plan");
        break;
      case "task-overview":
        await generateTaskOverview(this.app);
        break;
      case "inbox-list":
        await generateInboxList(this.app);
        break;
      case "task-eval":
        await generateTaskEval(this.app);
        break;
      case "writing-mgmt":
        await generateWritingMgmt(this.app);
        break;
      case "learning-stats":
        if (this.onSwitchTab) this.onSwitchTab("analysis");
        await generateLearningStatsDoc(this.app);
        break;
      case "recent-activity":
        await generateRecentActivity(this.app);
        break;
      case "diary":
        await createDiary(this.app);
        break;
    }
  }
}
