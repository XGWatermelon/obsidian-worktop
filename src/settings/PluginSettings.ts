import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import WorkspacePlugin from "../../main";
import { getAllThemes } from "../themes";
import { AppConfig, DomainConfig } from "../config/types";

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

  private get config(): AppConfig {
    return this.plugin.config;
  }

  // ==================== 基础配置 ====================
  private renderBasicSettings(containerEl: HTMLElement): void {
    // 应用名称
    containerEl.createEl("h3", { text: "应用名称" });

    new Setting(containerEl)
      .setName("插件名称")
      .setDesc("显示在 Obsidian 插件列表中的名称")
      .addText((text) =>
        text
          .setPlaceholder("个人工作台")
          .setValue(this.config.basic.app.name)
          .onChange(async (value) => {
            this.config.basic.app.name = value || "个人工作台";
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("视图标题")
      .setDesc("工作台视图顶部显示的标题")
      .addText((text) =>
        text
          .setPlaceholder("个人工作台")
          .setValue(this.config.basic.app.viewTitle)
          .onChange(async (value) => {
            this.config.basic.app.viewTitle = value || "个人工作台";
            await this.plugin.saveConfig();
            this.plugin.refreshWorkspaceView();
          })
      );

    // 打开方式
    containerEl.createEl("h3", { text: "打开方式" });

    new Setting(containerEl)
      .setName("在主编辑区打开")
      .setDesc("开启后，工作台将在主编辑区以标签页形式打开；关闭则在侧边栏打开")
      .addToggle((toggle) =>
        toggle
          .setValue(this.config.basic.ui.openInMainEditor)
          .onChange(async (value) => {
            this.config.basic.ui.openInMainEditor = value;
            await this.plugin.saveConfig();
          })
      );

    // 主题
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
          .setValue(this.config.basic.ui.themeId)
          .onChange(async (value) => {
            this.config.basic.ui.themeId = value;
            await this.plugin.saveConfig();
            this.plugin.refreshWorkspaceView();
          })
      );

    // 文件夹配置
    containerEl.createEl("h3", { text: "文件夹配置" });

    new Setting(containerEl)
      .setName("根目录")
      .setDesc("工作台的根文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("工作台")
          .setValue(this.config.basic.folders.root)
          .onChange(async (value) => {
            this.config.basic.folders.root = value;
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("事项文件夹")
      .setDesc("事项存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("事项")
          .setValue(this.config.basic.folders.structure.topic?.name || "事项")
          .onChange(async (value) => {
            this.config.basic.folders.structure.topic = { name: value };
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("待整理文件夹")
      .setDesc("待整理文件存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("待整理")
          .setValue(this.config.basic.folders.structure.inbox?.name || "待整理")
          .onChange(async (value) => {
            this.config.basic.folders.structure.inbox = { name: value };
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("节点文件夹")
      .setDesc("知识图谱节点文件存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("节点")
          .setValue(this.config.basic.folders.structure.nodes?.name || "节点")
          .onChange(async (value) => {
            this.config.basic.folders.structure.nodes = { name: value };
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("日计划文件夹")
      .setDesc("日计划文件存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("日计划")
          .setValue(this.config.basic.folders.structure.dailyPlan?.name || "日计划")
          .onChange(async (value) => {
            this.config.basic.folders.structure.dailyPlan = { ...this.config.basic.folders.structure.dailyPlan, name: value };
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("周计划文件夹")
      .setDesc("周计划文件存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("周计划")
          .setValue(this.config.basic.folders.structure.weeklyPlan?.name || "周计划")
          .onChange(async (value) => {
            this.config.basic.folders.structure.weeklyPlan = { ...this.config.basic.folders.structure.weeklyPlan, name: value };
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("清单文件夹")
      .setDesc("工作流生成的清单文档存放的文件夹名称")
      .addText((text) =>
        text
          .setPlaceholder("清单")
          .setValue(this.config.basic.folders.structure.generatedDocs?.name || "清单")
          .onChange(async (value) => {
            this.config.basic.folders.structure.generatedDocs = { name: value };
            await this.plugin.saveConfig();
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
          .setValue(this.config.basic.statuses.topic.join(","))
          .onChange(async (value) => {
            this.config.basic.statuses.topic = value.split(",").map((s) => s.trim());
            await this.plugin.saveConfig();
          })
      );

    new Setting(containerEl)
      .setName("学习状态")
      .setDesc("学习状态列表，用逗号分隔")
      .addText((text) =>
        text
          .setPlaceholder("待阅读,已阅读,已理解,已掌握")
          .setValue(this.config.basic.statuses.learning.join(","))
          .onChange(async (value) => {
            this.config.basic.statuses.learning = value.split(",").map((s) => s.trim());
            await this.plugin.saveConfig();
          })
      );

    // 类型配置
    containerEl.createEl("h3", { text: "类型配置" });

    new Setting(containerEl)
      .setName("事项类型")
      .setDesc("事项的类型列表，格式：id:名称,id:名称")
      .addText((text) =>
        text
          .setPlaceholder("task:任务,idea:想法,project:项目")
          .setValue(this.config.basic.types.map((t) => `${t.id}:${t.name}`).join(","))
          .onChange(async (value) => {
            this.config.basic.types = value.split(",").map((s) => {
              const [id, name] = s.trim().split(":");
              return { id: id?.trim() || "", name: name?.trim() || id?.trim() || "" };
            }).filter((t) => t.id);
            await this.plugin.saveConfig();
          })
      );

    // 领域配置
    containerEl.createEl("h3", { text: "领域与模块" });

    this.renderDomainEditor(containerEl);

    // 切换到高级配置
    const switchBtn = containerEl.createDiv({ cls: "workspace-switch-btn" });
    switchBtn.createEl("button", { text: "切换到高级配置 →" }).addEventListener("click", () => {
      this.showAdvanced = true;
      this.display();
    });
  }

  // ==================== 领域编辑器 ====================
  private renderDomainEditor(containerEl: HTMLElement): void {
    const domains = this.config.basic.domains;

    if (domains.length === 0) {
      containerEl.createEl("p", { text: "暂未配置领域，点击下方按钮添加", cls: "workspace-empty-text" });
    }

    domains.forEach((domain, index) => {
      const card = containerEl.createDiv({ cls: "workspace-domain-edit-card" });

      const header = card.createDiv({ cls: "workspace-domain-edit-header" });
      header.createEl("span", { text: domain.name, cls: "workspace-domain-edit-name" });
      if (domain.color) {
        const colorDot = header.createSpan({ cls: "workspace-domain-color-dot" });
        colorDot.style.background = domain.color;
      }

      // 模块列表
      if (domain.modules.length > 0) {
        const modulesEl = card.createDiv({ cls: "workspace-domain-modules" });
        domain.modules.forEach((mod) => {
          modulesEl.createSpan({ cls: "workspace-module-tag", text: mod.name });
        });
      }

      // 操作按钮
      const actions = header.createDiv({ cls: "workspace-domain-edit-actions" });

      const editBtn = actions.createEl("button", { text: "编辑", cls: "workspace-btn-sm" });
      editBtn.addEventListener("click", () => {
        this.showDomainEditModal(domain, index);
      });

      const deleteBtn = actions.createEl("button", { text: "删除", cls: "workspace-btn-sm workspace-btn-danger" });
      deleteBtn.addEventListener("click", async () => {
        this.config.basic.domains.splice(index, 1);
        await this.plugin.saveConfig();
        this.display();
      });
    });

    // 添加领域按钮
    const addBtn = containerEl.createDiv({ cls: "workspace-card-action", text: "+ 添加领域" });
    addBtn.addEventListener("click", () => {
      this.showDomainEditModal(null, -1);
    });
  }

  // 领域编辑弹窗
  private showDomainEditModal(domain: DomainConfig | null, index: number): void {
    const isNew = domain === null;
    const editDomain: DomainConfig = domain
      ? { ...domain, modules: [...domain.modules] }
      : { id: "", name: "", color: "#7C3AED", modules: [] };

    const plugin = this.plugin;
    const config = this.config;
    const display = () => this.display();

    const modal = new DomainEditModal(this.app, editDomain, isNew, config.basic.domains, async (d: DomainConfig) => {
      if (isNew) {
        config.basic.domains.push(d);
      } else {
        config.basic.domains[index] = d;
      }
      await plugin.saveConfig();
      display();
    });
    modal.open();
  }

  // ==================== 高级配置 ====================
  private renderAdvancedSettings(containerEl: HTMLElement): void {
    // Frontmatter 字段名配置
    containerEl.createEl("h3", { text: "Frontmatter 字段名映射" });

    const fields = this.config.advanced.fields;
    const fieldLabels: Record<string, string> = {
      learningStatus: "学习状态字段名",
      type: "类型字段名",
      status: "状态字段名",
      deadline: "截止日期字段名",
    };

    Object.entries(fieldLabels).forEach(([key, label]) => {
      new Setting(containerEl)
        .setName(label)
        .setDesc(`frontmatter 中的字段名`)
        .addText((text) =>
          text
            .setValue(fields[key] || "")
            .onChange(async (value) => {
              this.config.advanced.fields[key] = value;
              await this.plugin.saveConfig();
            })
        );
    });

    // 工作流文档名配置
    containerEl.createEl("h3", { text: "工作流文档名称" });
    containerEl.createEl("p", {
      text: "点击工作流按钮时生成的文档名称。支持 {date} 占位符（替换为当天日期）。",
      cls: "workspace-config-hint",
    });

    this.config.basic.workflows.forEach((wf, index) => {
      new Setting(containerEl)
        .setName(wf.label)
        .setDesc(`文档名称模式，如 "{date}-${wf.label}"`)
        .addText((text) =>
          text
            .setPlaceholder(`{date}-${wf.label}`)
            .setValue(wf.docName || "")
            .onChange(async (value) => {
              this.config.basic.workflows[index].docName = value || undefined;
              await this.plugin.saveConfig();
            })
        );
    });

    // 数值限制
    containerEl.createEl("h3", { text: "数值限制" });

    const limits = this.config.advanced.limits;
    const limitLabels: Record<string, string> = {
      recentFiles: "最近文件数量",
      recentNotes: "最近笔记数量",
      activeTopics: "活跃任务数量",
      searchMinChars: "搜索最小字符数",
      searchResults: "搜索结果数量",
      debounceDelay: "防抖延迟(ms)",
    };

    Object.entries(limitLabels).forEach(([key, label]) => {
      new Setting(containerEl)
        .setName(label)
        .addText((text) =>
          text
            .setValue(String(limits[key] ?? ""))
            .onChange(async (value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num)) {
                this.config.advanced.limits[key] = num;
                await this.plugin.saveConfig();
              }
            })
        );
    });

    // 配置管理
    containerEl.createEl("h3", { text: "配置管理" });

    const configManagement = containerEl.createDiv({ cls: "workspace-config-management" });

    const exportBtn = configManagement.createEl("button", { text: "导出配置" });
    exportBtn.addEventListener("click", () => {
      const config = JSON.stringify(this.config, null, 2);
      navigator.clipboard.writeText(config);
    });

    const resetBtn = configManagement.createEl("button", { text: "重置为默认" });
    resetBtn.addEventListener("click", async () => {
      const { DEFAULT_CONFIG } = await import("../config/defaults");
      this.plugin.config = { ...DEFAULT_CONFIG };
      await this.plugin.saveConfig();
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

// ==================== 领域编辑弹窗（独立类） ====================

/** 生成随机 ID（类 GUID，8位短格式） */
function autoId(): string {
  return "id_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
}

class DomainEditModal extends Modal {
  private editDomain: DomainConfig;
  private isNew: boolean;
  private onSave: (d: DomainConfig) => void;
  private colorPreview: HTMLElement;
  private existingDomains: DomainConfig[];

  constructor(app: App, editDomain: DomainConfig, isNew: boolean, existingDomains: DomainConfig[], onSave: (d: DomainConfig) => void) {
    super(app);
    this.editDomain = editDomain;
    this.isNew = isNew;
    this.existingDomains = existingDomains;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("workspace-modal");
    contentEl.createEl("h2", { text: this.isNew ? "添加领域" : "编辑领域" });

    // 名称（唯一需要用户输入的字段，ID 自动生成）
    const nameSetting = new Setting(contentEl)
      .setName("领域名称")
      .setDesc("如：AI、SAP、前端开发")
      .addText((text) =>
        text
          .setPlaceholder("输入领域名称")
          .setValue(this.editDomain.name)
          .onChange((v) => {
            this.editDomain.name = v;
            if (this.isNew) {
              this.editDomain.id = autoId();
            }
          })
      );

    // 新建时显示自动生成的 ID 提示
    if (this.isNew) {
      const idHint = contentEl.createDiv({ cls: "workspace-id-hint" });
      idHint.createSpan({ text: "ID 将自动生成：", cls: "workspace-id-hint-label" });
      const idValue = idHint.createSpan({ text: "（输入名称后自动显示）", cls: "workspace-id-hint-value" });

      // 监听名称输入实时更新 ID 提示
      const nameInput = nameSetting.controlEl.querySelector("input") as HTMLInputElement;
      if (nameInput) {
        nameInput.addEventListener("input", () => {
          const generatedId = autoId();
          this.editDomain.id = generatedId;
          idValue.textContent = generatedId || "（输入名称后自动显示）";
        });
      }
    }

    // 颜色 — 带预览
    const colorSetting = new Setting(contentEl)
      .setName("颜色")
      .setDesc("点击色块选择颜色");

    this.colorPreview = colorSetting.controlEl.createDiv({ cls: "workspace-color-preview" });
    this.colorPreview.style.background = this.editDomain.color || "#7C3AED";
    this.colorPreview.style.width = "28px";
    this.colorPreview.style.height = "28px";
    this.colorPreview.style.borderRadius = "6px";
    this.colorPreview.style.cursor = "pointer";
    this.colorPreview.style.border = "2px solid var(--ws-border)";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = this.editDomain.color || "#7C3AED";
    colorInput.style.position = "absolute";
    colorInput.style.opacity = "0";
    colorInput.style.width = "0";
    colorInput.style.height = "0";
    colorInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.editDomain.color = val;
      this.colorPreview.style.background = val;
    });
    colorSetting.controlEl.appendChild(colorInput);
    this.colorPreview.addEventListener("click", () => colorInput.click());

    // 模块编辑
    contentEl.createEl("h3", { text: "模块列表" });
    const modulesContainer = contentEl.createDiv();

    const renderModules = () => {
      modulesContainer.empty();
      if (this.editDomain.modules.length === 0) {
        modulesContainer.createEl("p", {
          text: "暂无模块，下方添加",
          cls: "workspace-empty-text",
        });
      }
      this.editDomain.modules.forEach((mod, i) => {
        const row = modulesContainer.createDiv({ cls: "workspace-module-edit-row" });
        const nameSpan = row.createSpan({ text: mod.name });

        const editBtn = row.createEl("button", { text: "编辑", cls: "workspace-btn-sm" });
        editBtn.addEventListener("click", () => {
          // 切换到编辑模式：用输入框替换文字
          nameSpan.style.display = "none";
          editBtn.style.display = "none";
          const editInput = row.createEl("input", {
            cls: "workspace-module-edit-input",
            value: mod.name,
          });
          editInput.style.flex = "1";

          const saveBtn = row.createEl("button", { text: "保存", cls: "workspace-btn-sm workspace-btn-primary" });
          saveBtn.addEventListener("click", () => {
            const newName = editInput.value.trim();
            if (!newName) return;
            // 检查重复（排除自己）
            const dup = this.editDomain.modules.some((m, j) => j !== i && m.name === newName);
            if (dup) {
              new Notice(`模块「${newName}」已存在`);
              return;
            }
            this.editDomain.modules[i] = { id: autoId(), name: newName };
            renderModules();
          });

          const cancelBtn = row.createEl("button", { text: "取消", cls: "workspace-btn-sm" });
          cancelBtn.addEventListener("click", () => renderModules());

          editInput.focus();
          editInput.select();
        });

        const delBtn = row.createEl("button", { text: "删除", cls: "workspace-btn-sm workspace-btn-danger" });
        delBtn.addEventListener("click", () => {
          this.editDomain.modules.splice(i, 1);
          renderModules();
        });
      });
    };
    renderModules();

    // 添加模块 — 只需输入名称，ID 自动生成
    const addSection = contentEl.createDiv({ cls: "workspace-module-add-section" });
    const modNameSetting = new Setting(addSection)
      .setName("模块名称")
      .addText((text) => {
        text.setPlaceholder("如：大模型、FICO、前端");
        text.inputEl.addClass("workspace-module-name-input");
      });

    const addBtn = addSection.createEl("button", { text: "+ 添加模块", cls: "workspace-btn workspace-btn-primary" });
    addBtn.style.marginTop = "8px";
    addBtn.addEventListener("click", () => {
      const nameInput = addSection.querySelector(".workspace-module-name-input") as HTMLInputElement;
      const name = nameInput?.value?.trim();
      if (!name) return;

      // 检查重复
      const exists = this.editDomain.modules.some((m) => m.name === name);
      if (exists) {
        new Notice(`模块「${name}」已存在`);
        return;
      }

      this.editDomain.modules.push({ id: autoId(), name });
      nameInput.value = "";
      renderModules();
    });

    // 按钮行
    const btnRow = contentEl.createDiv({ cls: "workspace-modal-buttons" });
    const saveBtn = btnRow.createEl("button", { text: "保存", cls: "workspace-btn workspace-btn-primary" });
    saveBtn.addEventListener("click", () => {
      if (!this.editDomain.name) {
        new Notice("请填写领域名称");
        return;
      }
      // 检查领域名称重复
      const duplicate = this.existingDomains.some((d, i) =>
        d.name === this.editDomain.name && (this.isNew || i !== this.existingDomains.indexOf(this.editDomain))
      );
      if (duplicate) {
        new Notice(`领域「${this.editDomain.name}」已存在`);
        return;
      }
      this.onSave(this.editDomain);
      this.close();
    });
    const cancelBtn = btnRow.createEl("button", { text: "取消", cls: "workspace-btn" });
    cancelBtn.addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}
