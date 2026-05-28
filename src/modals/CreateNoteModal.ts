import { App, Modal, Setting, Notice } from "obsidian";
import { getTopicTemplate, getTopicPath } from "../utils/templates";

export class CreateNoteModal extends Modal {
  private noteType: string;
  private title: string = "";
  private status: string = "待评估";
  private learningStatus: string = "待阅读";
  private deadline: string = "";
  private onSubmit: (path: string, content: string) => void;

  constructor(
    app: App,
    noteType: string,
    onSubmit: (path: string, content: string) => void
  ) {
    super(app);
    this.noteType = noteType;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("workspace-modal");

    contentEl.createEl("h2", { text: `创建${this.getTypeLabel()}` });

    // 标题输入
    new Setting(contentEl).setName("标题").addText((text) =>
      text.setPlaceholder("输入标题...").onChange((value) => {
        this.title = value;
      })
    );

    // 状态下拉框
    new Setting(contentEl).setName("状态").addDropdown((dropdown) =>
      dropdown
        .addOption("待评估", "待评估")
        .addOption("进行中", "进行中")
        .addOption("已完成", "已完成")
        .addOption("已放弃", "已放弃")
        .setValue(this.status)
        .onChange((value) => {
          this.status = value;
        })
    );

    // 学习状态下拉框
    new Setting(contentEl).setName("学习状态").addDropdown((dropdown) =>
      dropdown
        .addOption("待阅读", "待阅读")
        .addOption("已阅读", "已阅读")
        .addOption("已理解", "已理解")
        .addOption("已掌握", "已掌握")
        .setValue(this.learningStatus)
        .onChange((value) => {
          this.learningStatus = value;
        })
    );

    // 截止日期选择器
    const dateSetting = new Setting(contentEl).setName("截止日期");
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = this.deadline;
    dateInput.addEventListener("change", (e) => {
      this.deadline = (e.target as HTMLInputElement).value;
    });
    dateSetting.settingEl.appendChild(dateInput);

    // 按钮
    const buttonEl = contentEl.createDiv({ cls: "workspace-modal-buttons" });

    const submitBtn = buttonEl.createEl("button", {
      text: "创建",
      cls: "workspace-btn workspace-btn-primary",
    });
    submitBtn.addEventListener("click", () => this.submitTopic());

    const cancelBtn = buttonEl.createEl("button", {
      text: "取消",
      cls: "workspace-btn",
    });
    cancelBtn.addEventListener("click", () => this.close());
  }

  private getTypeLabel(): string {
    const labels: Record<string, string> = {
      task: "任务",
      idea: "想法",
      project: "项目",
      inspiration: "灵感",
      writing: "写作",
      learning: "学习",
      diary: "日记",
    };
    return labels[this.noteType] || "笔记";
  }

  private getTypeValue(): string {
    const typeMap: Record<string, string> = {
      task: "任务",
      idea: "想法",
      project: "项目",
      inspiration: "灵感",
      writing: "写作",
      learning: "学习",
    };
    return typeMap[this.noteType] || "任务";
  }

  private async submitTopic(): Promise<void> {
    if (!this.title.trim()) {
      return;
    }
    try {
      const path = getTopicPath(this.title);
      const content = getTopicTemplate(
        this.getTypeValue(),
        this.title,
        this.status,
        this.learningStatus,
        this.deadline
      );
      this.onSubmit(path, content);
      this.close();
    } catch (error) {
      new Notice(`创建失败: ${error.message}`);
      console.error("创建事项失败:", error);
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
