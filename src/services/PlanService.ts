import { App, Notice, TFile } from "obsidian";
import { ConfirmModal } from "../modals/ConfirmModal";
import {
  getDailyPlanTemplate,
  getDailyPlanPath,
  getWeeklyPlanTemplate,
  getWeeklyPlanPath,
  getDiaryTemplate,
} from "../utils/templates";
import { moment } from "obsidian";
import { fileExists, ensureFolder } from "../utils/dataview";
import { getFolderPath } from "../config/accessors";

/**
 * 创建日计划（含周计划关联逻辑）
 */
export async function createDailyPlan(app: App): Promise<void> {
  const path = getDailyPlanPath(app);
  await ensureFolder(app, getFolderPath(app, "dailyPlan"));

  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) {
    app.workspace.openLinkText(path, "");
    return;
  }

  const weeklyPlanPath = getWeeklyPlanPath(app);
  if (!fileExists(app, weeklyPlanPath)) {
    new ConfirmModal(
      app,
      "本周计划未创建",
      "是否先创建本周计划？",
      async () => {
        await ensureFolder(app, getFolderPath(app, "weeklyPlan"));
        const planContent = getWeeklyPlanTemplate(app);
        await app.vault.create(weeklyPlanPath, planContent);
        new Notice("本周计划已创建");

        const content = getDailyPlanTemplate(app, weeklyPlanPath);
        const file = await app.vault.create(path, content);
        await addDailyPlanLinkToWeeklyPlan(app, weeklyPlanPath, path);
        app.workspace.openLinkText(file.path, "");
      }
    ).open();
  } else {
    const content = getDailyPlanTemplate(app, weeklyPlanPath);
    const file = await app.vault.create(path, content);
    await addDailyPlanLinkToWeeklyPlan(app, weeklyPlanPath, path);
    app.workspace.openLinkText(file.path, "");
  }
}

/**
 * 创建周计划
 */
export async function createWeeklyPlan(app: App): Promise<void> {
  const path = getWeeklyPlanPath(app);
  await ensureFolder(app, getFolderPath(app, "weeklyPlan"));

  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) {
    app.workspace.openLinkText(path, "");
    return;
  }

  const content = getWeeklyPlanTemplate(app);
  const file = await app.vault.create(path, content);
  app.workspace.openLinkText(file.path, "");
}

/**
 * 在周计划中添加日计划链接
 */
export async function addDailyPlanLinkToWeeklyPlan(
  app: App,
  weeklyPlanPath: string,
  dailyPlanPath: string
): Promise<void> {
  try {
    const file = app.vault.getAbstractFileByPath(weeklyPlanPath) as TFile;
    if (!file) return;

    const content = await app.vault.read(file);
    const today = new Date();
    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dayName = dayNames[today.getDay()];
    const dateStr = `${today.getMonth() + 1}.${today.getDate()}`;

    const lines = content.split("\n");
    let targetIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(dayName) && lines[i].includes(dateStr)) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      lines.push("");
      lines.push(`### ${dayName} - ${dateStr}`);
      lines.push(`- [[${dailyPlanPath}]]`);
    } else {
      let insertIndex = targetIndex + 1;
      if (insertIndex < lines.length && lines[insertIndex].trim() === "-") {
        lines[insertIndex] = `- [[${dailyPlanPath}]]`;
      } else {
        lines.splice(insertIndex, 0, `- [[${dailyPlanPath}]]`);
      }
    }

    await app.vault.modify(file, lines.join("\n"));
    new Notice("已关联到周计划");
  } catch (error) {
    console.error("添加日计划链接到周计划失败:", error);
  }
}

/**
 * 创建日记
 */
export async function createDiary(app: App): Promise<void> {
  const diaryFolder = getFolderPath(app, "diary");
  const today = moment().format("YYYY-MM-DD");
  const path = `${diaryFolder}/${today}.md`;

  await ensureFolder(app, diaryFolder);

  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) {
    app.workspace.openLinkText(path, "");
    return;
  }

  const content = getDiaryTemplate(app);
  const file = await app.vault.create(path, content);
  app.workspace.openLinkText(file.path, "");
  new Notice("日记已创建");
}
