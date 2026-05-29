import { Plugin, Notice } from "obsidian";
import { WorkspaceView, VIEW_TYPE_WORKSPACE } from "./src/views/WorkspaceView";
import { CreateNoteModal } from "./src/modals/CreateNoteModal";
import { createDailyPlan, createWeeklyPlan, createDiary } from "./src/services/PlanService";
import { initWorkspace } from "./src/services/InitService";
import { registerPropertyTypes, registerEditorSuggests } from "./src/services/PropertyService";
import { WorkspaceSettingTab } from "./src/settings/PluginSettings";
import { AppConfig } from "./src/config/types";
import { loadConfig, saveConfigFile } from "./src/config/loader";
import { getUIConfig } from "./src/config/accessors";

export default class WorkspacePlugin extends Plugin {
  config: AppConfig;
  private initialized = false;

  async onload() {
    console.log("Loading Workspace Plugin");

    this.config = await loadConfig(this);

    this.addSettingTab(new WorkspaceSettingTab(this.app, this));

    this.registerView(VIEW_TYPE_WORKSPACE, (leaf) => {
      const view = new WorkspaceView(leaf);
      view.setThemeId(this.config.basic.ui.themeId);
      return view;
    });

    this.addRibbonIcon("layout-grid", "打开工作台", async () => {
      await this.ensureInitialized();
      this.activateView();
    });

    this.addCommand({
      id: "open-workspace",
      name: "打开工作台",
      callback: async () => {
        await this.ensureInitialized();
        this.activateView();
      },
    });

    this.addCommand({
      id: "create-daily-plan",
      name: "创建今日日计划",
      callback: () => createDailyPlan(this.app),
    });

    this.addCommand({
      id: "create-weekly-plan",
      name: "创建本周计划",
      callback: () => createWeeklyPlan(this.app),
    });

    this.addCommand({
      id: "create-diary",
      name: "创建日记",
      callback: () => createDiary(this.app),
    });

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

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    await initWorkspace(this.app);
    await registerPropertyTypes(this.app, this.config);
    registerEditorSuggests(this, this.config);
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_WORKSPACE);

    if (leaves.length > 0) {
      workspace.revealLeaf(leaves[0]);
      return;
    }

    const ui = getUIConfig(this.app);
    const leaf = ui.openInMainEditor
      ? workspace.getLeaf("tab")
      : workspace.getRightLeaf(false);

    if (!leaf) return;

    await leaf.setViewState({ type: VIEW_TYPE_WORKSPACE, active: true });
    workspace.revealLeaf(leaf);
  }

  async saveConfig(): Promise<void> {
    await saveConfigFile(this, this.config);
  }

  refreshWorkspaceView(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORKSPACE);
    leaves.forEach((leaf) => {
      if (leaf.view instanceof WorkspaceView) {
        (leaf.view as WorkspaceView).setThemeId(this.config.basic.ui.themeId);
        leaf.setViewState({ type: VIEW_TYPE_WORKSPACE });
      }
    });
  }

  onunload() {
    console.log("Unloading Workspace Plugin");
  }
}
