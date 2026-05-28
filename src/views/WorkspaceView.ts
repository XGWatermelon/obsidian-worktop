import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import { detectTheme, applyTheme } from "../utils/theme";
import { StatusBar } from "./StatusBar";
import { QuickActions } from "./QuickActions";
import { ActionTab } from "./tabs/ActionTab";
import { KnowledgeTab } from "./tabs/KnowledgeTab";
import { AnalysisTab } from "./tabs/AnalysisTab";
import { ReadingTab } from "./tabs/ReadingTab";

export const VIEW_TYPE_WORKSPACE = "workspace-view";

export class WorkspaceView extends ItemView {
  private activeTab: string = "action";
  private statusBar: StatusBar;
  private quickActions: QuickActions;
  private tabContent: HTMLElement;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private themeId: string = "green-dark";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  // 设置主题ID
  setThemeId(themeId: string): void {
    this.themeId = themeId;
  }

  getViewType(): string {
    return VIEW_TYPE_WORKSPACE;
  }

  getDisplayText(): string {
    return "智能工作台";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("workspace-container");

    const theme = detectTheme();
    applyTheme(container as HTMLElement, theme, this.themeId);

    const statusContainer = container.createDiv();
    this.statusBar = new StatusBar(this.app, statusContainer);
    this.statusBar.render();

    const actionsContainer = container.createDiv();
    this.quickActions = new QuickActions(this.app, actionsContainer, (tabId) => this.switchTab(tabId));
    this.quickActions.render();

    this.createTabNav(container as HTMLElement);

    this.tabContent = container.createDiv({ cls: "workspace-tab-content" });

    this.renderTab(this.activeTab);

    // 注册文件变更监听，实现自动刷新
    this.registerFileWatcher();
  }

  // 注册文件变更监听
  private registerFileWatcher(): void {
    // 监听文件修改
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.debounceRefresh();
        }
      })
    );

    // 监听文件创建
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.debounceRefresh();
        }
      })
    );

    // 监听文件删除
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.debounceRefresh();
        }
      })
    );

    // 监听文件重命名
    this.registerEvent(
      this.app.vault.on("rename", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.debounceRefresh();
        }
      })
    );
  }

  // 防抖刷新，避免频繁刷新
  private debounceRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(() => {
      this.refresh();
    }, 500); // 500ms 延迟
  }

  // 刷新工作台
  private refresh(): void {
    // 刷新状态栏
    if (this.statusBar) {
      this.statusBar.render();
    }

    // 刷新当前标签页
    this.renderTab(this.activeTab);
  }

  private createTabNav(container: HTMLElement): void {
    const nav = container.createDiv({ cls: "workspace-tab-nav" });

    const tabs = [
      { id: "action", label: "行动指北" },
      { id: "knowledge", label: "知识管理" },
      { id: "analysis", label: "学习分析" },
      { id: "reading", label: "稍后阅读" },
    ];

    tabs.forEach((tab) => {
      const tabEl = nav.createDiv({
        cls: `workspace-tab-item ${tab.id === this.activeTab ? "active" : ""}`,
        text: tab.label,
      });
      tabEl.dataset.tabId = tab.id;
      tabEl.addEventListener("click", () => this.switchTab(tab.id));
    });
  }

  private switchTab(tabId: string): void {
    this.activeTab = tabId;

    this.containerEl.querySelectorAll(".workspace-tab-item").forEach((el) => {
      el.classList.toggle("active", (el as HTMLElement).dataset.tabId === tabId);
    });

    this.renderTab(tabId);
  }

  private renderTab(tabId: string): void {
    this.tabContent.empty();

    switch (tabId) {
      case "action":
        new ActionTab(this.app, this.tabContent).render();
        break;
      case "knowledge":
        new KnowledgeTab(this.app, this.tabContent).render();
        break;
      case "analysis":
        new AnalysisTab(this.app, this.tabContent).render();
        break;
      case "reading":
        new ReadingTab(this.app, this.tabContent).render();
        break;
    }
  }

  async onClose(): Promise<void> {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }
}
