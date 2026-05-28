import { App, PluginSettingTab, Setting } from "obsidian";
import WorkspacePlugin from "../../main";
import { getAllThemes } from "../themes";

export interface QuickLink {
  label: string;
  path: string;
}

export interface WorkspaceSettings {
  openInMainEditor: boolean;
  themeId: string;
  workspaceRoot: string;
  topicFolder: string;
  inboxFolder: string;
  topicStatus: string[];
  topicTypes: string[];
  learningStatus: string[];
  domains: string[];
  quickLinks: QuickLink[];
  fieldNames: {
    learningStatus: string;
    type: string;
    status: string;
    deadline: string;
  };
}

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  openInMainEditor: true,
  themeId: "green-dark",
  workspaceRoot: "工作台",
  topicFolder: "事项",
  inboxFolder: "待整理",
  topicStatus: ["待评估", "进行中", "已完成", "已放弃"],
  topicTypes: ["任务", "想法", "项目", "灵感", "写作", "学习"],
  learningStatus: ["待阅读", "已阅读", "已理解", "已掌握"],
  domains: ["AI", "SAP"],
  quickLinks: [],
  fieldNames: {
    learningStatus: "学习状态",
    type: "type",
    status: "status",
    deadline: "deadline",
  },
};

export class WorkspaceSettingTab extends PluginSettingTab {
  plugin: WorkspacePlugin;
  private showAdvanced: boolean = false;

  constructor(app: App, plugin: WorkspacePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "工作台插件设置" });

    if (this.showAdvanced) {
      this.renderAdvancedSettings(containerEl);
    } else {
      this.renderBasicSettings(containerEl);
    }
  }

  // 基本配置
  private renderBasicSettings(containerEl: HTMLElement): void {
    // 打开位置配置
    containerEl.createEl("h3", { text: "打开方式" });

    new Setting(containerEl)
      .setName("在主编辑区打开")
      .setDesc("开启后，工作台将在主编辑区以标签页形式打开；关闭则在侧边栏打开")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.openInMainEditor)
          .onChange(async (value) => {
            this.plugin.settings.openInMainEditor = value;
            await this.plugin.saveSettings();
          })
      );

    // 主题配置
    containerEl.createEl("h3", { text: "主题设置" });

    const themes = getAllThemes();
    const themeOptions: Record<string, string> = {};
    themes.forEach((theme) => {
      themeOptions[theme.id] = theme.name;
    });

    new Setting(containerEl)
      .setName("主题颜色")
      .setDesc("选择工作台的主题颜色")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(themeOptions)
          .setValue(this.plugin.settings.themeId)
          .onChange(async (value) => {
            this.plugin.settings.themeId = value;
            await this.plugin.saveSettings();
            this.plugin.refreshWorkspaceView();
          })
      );

    // 文件夹配置
    containerEl.createEl("h3", { text: "文件夹配置" });

    new Setting(containerEl)
      .setName("事项文件夹")
      .setDesc("任务、想法、项目、灵感、写作、学习等事项存放的文件夹路径")
      .addText((text) =>
        text
          .setPlaceholder("事项")
          .setValue(this.plugin.settings.topicFolder)
          .onChange(async (value) => {
            this.plugin.settings.topicFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("待整理文件夹")
      .setDesc("待整理文件存放的文件夹路径")
      .addText((text) =>
        text
          .setPlaceholder("待整理")
          .setValue(this.plugin.settings.inboxFolder)
          .onChange(async (value) => {
            this.plugin.settings.inboxFolder = value;
            await this.plugin.saveSettings();
          })
      );

    // 状态配置
    containerEl.createEl("h3", { text: "状态配置" });

    new Setting(containerEl)
      .setName("事项状态")
      .setDesc("事项的状态列表，用逗号分隔")
      .addText((text) =>
        text
          .setPlaceholder("待评估,进行中,已完成,已放弃")
          .setValue(this.plugin.settings.topicStatus.join(","))
          .onChange(async (value) => {
            this.plugin.settings.topicStatus = value.split(",").map((s) => s.trim());
            await this.plugin.saveSettings();
          })
      );

    // 标签配置
    containerEl.createEl("h3", { text: "标签配置" });

    new Setting(containerEl)
      .setName("事项类型")
      .setDesc("事项的类型列表，用逗号分隔")
      .addText((text) =>
        text
          .setPlaceholder("任务,想法,项目,灵感,写作,学习")
          .setValue(this.plugin.settings.topicTypes.join(","))
          .onChange(async (value) => {
            this.plugin.settings.topicTypes = value.split(",").map((s) => s.trim());
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("学习状态")
      .setDesc("学习状态列表，用逗号分隔")
      .addText((text) =>
        text
          .setPlaceholder("待阅读,已阅读,已理解,已掌握")
          .setValue(this.plugin.settings.learningStatus.join(","))
          .onChange(async (value) => {
            this.plugin.settings.learningStatus = value.split(",").map((s) => s.trim());
            await this.plugin.saveSettings();
          })
      );

    // 领域配置
    containerEl.createEl("h3", { text: "领域配置" });

    new Setting(containerEl)
      .setName("领域列表")
      .setDesc("用于知识分类统计的领域列表，用分号分隔。例如：AI;SAP;FICO")
      .addText((text) =>
        text
          .setPlaceholder("AI;SAP;FICO")
          .setValue(this.plugin.settings.domains.join(";"))
          .onChange(async (value) => {
            this.plugin.settings.domains = value.split(";").map((s) => s.trim()).filter((s) => s);
            await this.plugin.saveSettings();
          })
      );

    // 切换到高级配置
    const switchBtn = containerEl.createDiv({ cls: "workspace-switch-btn" });
    switchBtn.createEl("button", { text: "切换到高级配置 →" }).addEventListener("click", () => {
      this.showAdvanced = true;
      this.display();
    });
  }

  // 高级配置
  private renderAdvancedSettings(containerEl: HTMLElement): void {
    // Frontmatter 字段名配置
    containerEl.createEl("h3", { text: "Frontmatter 字段名映射" });

    new Setting(containerEl)
      .setName("学习状态字段名")
      .setDesc("frontmatter 中学习状态的字段名")
      .addText((text) =>
        text
          .setPlaceholder("学习状态")
          .setValue(this.plugin.settings.fieldNames.learningStatus)
          .onChange(async (value) => {
            this.plugin.settings.fieldNames.learningStatus = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("类型字段名")
      .setDesc("frontmatter 中类型的字段名")
      .addText((text) =>
        text
          .setPlaceholder("type")
          .setValue(this.plugin.settings.fieldNames.type)
          .onChange(async (value) => {
            this.plugin.settings.fieldNames.type = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("状态字段名")
      .setDesc("frontmatter 中状态的字段名")
      .addText((text) =>
        text
          .setPlaceholder("status")
          .setValue(this.plugin.settings.fieldNames.status)
          .onChange(async (value) => {
            this.plugin.settings.fieldNames.status = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("截止日期字段名")
      .setDesc("frontmatter 中截止日期的字段名")
      .addText((text) =>
        text
          .setPlaceholder("deadline")
          .setValue(this.plugin.settings.fieldNames.deadline)
          .onChange(async (value) => {
            this.plugin.settings.fieldNames.deadline = value;
            await this.plugin.saveSettings();
          })
      );

    // 配置管理
    containerEl.createEl("h3", { text: "配置管理" });

    const configManagement = containerEl.createDiv({ cls: "workspace-config-management" });

    const exportBtn = configManagement.createEl("button", { text: "导出配置" });
    exportBtn.addEventListener("click", () => {
      const config = JSON.stringify(this.plugin.settings, null, 2);
      navigator.clipboard.writeText(config);
      // 这里可以添加提示
    });

    const importBtn = configManagement.createEl("button", { text: "导入配置" });
    importBtn.addEventListener("click", () => {
      // 这里可以添加导入逻辑
    });

    const resetBtn = configManagement.createEl("button", { text: "重置为默认" });
    resetBtn.addEventListener("click", async () => {
      this.plugin.settings = { ...DEFAULT_SETTINGS };
      await this.plugin.saveSettings();
      this.display();
    });

    configManagement.createEl("p", {
      text: "提示：导出的配置文件可以分享给其他人使用",
      cls: "workspace-config-hint",
    });

    // 切换到基本配置
    const switchBtn = containerEl.createDiv({ cls: "workspace-switch-btn" });
    switchBtn.createEl("button", { text: "← 切换到基本配置" }).addEventListener("click", () => {
      this.showAdvanced = false;
      this.display();
    });
  }
}
