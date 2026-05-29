import { Plugin, Notice, Modal } from "obsidian";
import { WorkspaceView, VIEW_TYPE_WORKSPACE } from "./src/views/WorkspaceView";
import { CreateNoteModal } from "./src/modals/CreateNoteModal";
import {
  getDailyPlanTemplate,
  getDailyPlanPath,
  getWeeklyPlanTemplate,
  getWeeklyPlanPath,
} from "./src/utils/templates";
import {
  WorkspaceSettingTab,
  WorkspaceSettings,
  DEFAULT_SETTINGS,
} from "./src/settings/PluginSettings";
import { fileExists } from "./src/utils/dataview";

// 确认弹窗
class ConfirmModal extends Modal {
  private title: string;
  private message: string;
  private onConfirm: () => void;

  constructor(app: any, title: string, message: string, onConfirm: () => void) {
    super(app);
    this.title = title;
    this.message = message;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });

    const buttonDiv = contentEl.createDiv({ cls: "workspace-modal-buttons" });

    const confirmBtn = buttonDiv.createEl("button", {
      text: "确认",
      cls: "workspace-btn workspace-btn-primary",
    });
    confirmBtn.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });

    const cancelBtn = buttonDiv.createEl("button", {
      text: "取消",
      cls: "workspace-btn",
    });
    cancelBtn.addEventListener("click", () => {
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export default class WorkspacePlugin extends Plugin {
  settings: WorkspaceSettings;

  async onload() {
    console.log("Loading Workspace Plugin");

    // 加载配置
    await this.loadSettings();

    // 注册配置页面
    this.addSettingTab(new WorkspaceSettingTab(this.app, this));

    // 注册视图
    this.registerView(VIEW_TYPE_WORKSPACE, (leaf) => {
      const view = new WorkspaceView(leaf);
      view.setThemeId(this.settings.themeId);
      return view;
    });

    // 侧边栏图标
    this.addRibbonIcon("layout-dashboard", "打开工作台", () => {
      this.activateView();
    });

    // 打开工作台命令
    this.addCommand({
      id: "open-workspace",
      name: "打开工作台",
      callback: () => {
        this.activateView();
      },
    });

    // 创建今日日计划命令
    this.addCommand({
      id: "create-daily-plan",
      name: "创建今日日计划",
      callback: async () => {
        const workspaceRoot = this.settings.workspaceRoot;
        const path = getDailyPlanPath(workspaceRoot);

        // 确保日计划文件夹存在
        const dailyPlanFolder = `${workspaceRoot}/日计划`;
        if (!fileExists(this.app, dailyPlanFolder)) {
          await this.app.vault.createFolder(dailyPlanFolder);
        }

        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing) {
          this.app.workspace.openLinkText(path, "");
        } else {
          // 检查周计划是否存在
          const weeklyPlanPath = getWeeklyPlanPath(workspaceRoot);
          if (!fileExists(this.app, weeklyPlanPath)) {
            // 弹窗提示创建周计划
            const modal = new ConfirmModal(
              this.app,
              "本周计划未创建",
              "是否先创建本周计划？",
              async () => {
                // 确保周计划文件夹存在
                const weeklyPlanFolder = `${workspaceRoot}/周计划`;
                if (!fileExists(this.app, weeklyPlanFolder)) {
                  await this.app.vault.createFolder(weeklyPlanFolder);
                }

                // 创建周计划
                const planContent = getWeeklyPlanTemplate();
                await this.app.vault.create(weeklyPlanPath, planContent);
                new Notice("本周计划已创建");

                // 创建日计划
                const content = getDailyPlanTemplate(weeklyPlanPath);
                const file = await this.app.vault.create(path, content);
                // 在周计划中添加日计划链接
                await this.addDailyPlanLinkToWeeklyPlan(weeklyPlanPath, path);
                this.app.workspace.openLinkText(file.path, "");
              }
            );
            modal.open();
          } else {
            const content = getDailyPlanTemplate(weeklyPlanPath);
            const file = await this.app.vault.create(path, content);
            // 在周计划中添加日计划链接
            await this.addDailyPlanLinkToWeeklyPlan(weeklyPlanPath, path);
            this.app.workspace.openLinkText(file.path, "");
          }
        }
      },
    });

    // 创建本周计划命令
    this.addCommand({
      id: "create-weekly-plan",
      name: "创建本周计划",
      callback: async () => {
        const workspaceRoot = this.settings.workspaceRoot;
        const path = getWeeklyPlanPath(workspaceRoot);

        // 确保周计划文件夹存在
        const weeklyPlanFolder = `${workspaceRoot}/周计划`;
        if (!fileExists(this.app, weeklyPlanFolder)) {
          await this.app.vault.createFolder(weeklyPlanFolder);
        }

        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing) {
          this.app.workspace.openLinkText(path, "");
        } else {
          const content = getWeeklyPlanTemplate();
          const file = await this.app.vault.create(path, content);
          this.app.workspace.openLinkText(file.path, "");
        }
      },
    });

    // 创建事项命令
    this.addCommand({
      id: "create-topic",
      name: "创建事项",
      callback: () => {
        new CreateNoteModal(this.app, "task", async (path, content) => {
          const file = await this.app.vault.create(path, content);
          this.app.workspace.openLinkText(file.path, "");
        }).open();
      },
    });
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_WORKSPACE);

    if (leaves.length > 0) {
      workspace.revealLeaf(leaves[0]);
      return;
    }

    // 根据配置选择打开位置
    const leaf = this.settings.openInMainEditor
      ? workspace.getLeaf("tab")
      : workspace.getRightLeaf(false);

    if (!leaf) return;

    await leaf.setViewState({ type: VIEW_TYPE_WORKSPACE, active: true });
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 刷新工作台视图
  refreshWorkspaceView(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORKSPACE);
    leaves.forEach((leaf) => {
      if (leaf.view instanceof WorkspaceView) {
        // 更新主题
        (leaf.view as WorkspaceView).setThemeId(this.settings.themeId);
        // 重新打开视图
        leaf.setViewState({ type: VIEW_TYPE_WORKSPACE });
      }
    });
  }

  // 在周计划中添加日计划链接
  async addDailyPlanLinkToWeeklyPlan(weeklyPlanPath: string, dailyPlanPath: string): Promise<void> {
    try {
      const file = this.app.vault.getAbstractFileByPath(weeklyPlanPath) as any;
      if (!file) return;

      const content = await this.app.vault.read(file);
      const today = new Date();
      const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      const dayName = dayNames[today.getDay()];
      const dateStr = `${today.getMonth() + 1}.${today.getDate()}`;

      // 查找"每日进展"部分
      const lines = content.split("\n");
      let targetIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        // 查找今天的日期行，格式如：### 星期四 - 05.28
        if (lines[i].includes(dayName) && lines[i].includes(dateStr)) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === -1) {
        // 如果没找到，在文件末尾添加
        targetIndex = lines.length;
        lines.push("");
        lines.push(`### ${dayName} - ${dateStr}`);
        lines.push(`- [[${dailyPlanPath}]]`);
      } else {
        // 在日期行后面添加链接，替换空的 "- "
        let insertIndex = targetIndex + 1;

        // 检查下一行是否是空的 "- "
        if (insertIndex < lines.length && lines[insertIndex].trim() === "-") {
          // 替换空行
          lines[insertIndex] = `- [[${dailyPlanPath}]]`;
        } else {
          // 在日期行后插入
          lines.splice(insertIndex, 0, `- [[${dailyPlanPath}]]`);
        }
      }

      await this.app.vault.modify(file, lines.join("\n"));
      new Notice("已关联到周计划");
    } catch (error) {
      console.error("添加日计划链接到周计划失败:", error);
    }
  }

  onunload() {
    console.log("Unloading Workspace Plugin");
  }
}
