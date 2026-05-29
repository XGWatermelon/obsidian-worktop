import { AppConfig } from "./types";

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,

  // ==================== 基础配置 ====================
  basic: {
    app: {
      name: "工作台",
      icon: "layout-dashboard",
      viewTitle: "个人工作台",
    },

    ui: {
      openInMainEditor: true,
      themeId: "green-dark",
    },

    folders: {
      root: "工作台",
      structure: {
        dailyPlan: { name: "日计划", pattern: "{date}-日计划" },
        weeklyPlan: { name: "周计划", pattern: "{year}-W{week}-本周计划" },
        diary: { name: "日记", pattern: "{date}" },
        inbox: { name: "工作台/待整理" },
        savedArticles: { name: "工作台/待整理/收藏" },
        nodes: { name: "工作台/节点" },
        topic: { name: "事项" },
        generatedDocs: { name: "清单" },
      },
    },

    domains: [
      {
        id: "ai",
        name: "AI",
        color: "#7C3AED",
        modules: [
          { id: "agents", name: "AGENTS" },
          { id: "llm", name: "大模型" },
          { id: "mcp", name: "MCP" },
          { id: "skills", name: "Skills" },
        ],
      },
      {
        id: "sap",
        name: "SAP",
        color: "#0EA5E9",
        modules: [
          { id: "fico", name: "FICO" },
          { id: "hr", name: "HR" },
          { id: "mm", name: "MM" },
          { id: "sd", name: "SD" },
        ],
      },
    ],

    statuses: {
      topic: ["待评估", "进行中", "已完成", "已放弃"],
      learning: ["待阅读", "已阅读", "已理解", "已掌握"],
      default: "待评估",
      completed: ["已完成", "已放弃"],
    },

    types: [
      { id: "task", name: "任务", icon: "checkbox" },
      { id: "idea", name: "想法", icon: "lightbulb" },
      { id: "project", name: "项目", icon: "folder" },
      { id: "writing", name: "写作", icon: "pencil" },
      { id: "learning", name: "学习", icon: "book" },
    ],

    workflows: [
      { id: "daily-start", label: "每日开始", folderKey: "dailyPlan", docName: "{date}-日计划" },
      { id: "task-overview", label: "任务总览", folderKey: "generatedDocs", docName: "{date}-任务总览" },
      { id: "inbox-list", label: "待整理清单", folderKey: "generatedDocs", docName: "{date}-待整理清单" },
      { id: "task-eval", label: "任务评估", folderKey: "generatedDocs", docName: "{date}-任务评估" },
      { id: "writing-mgmt", label: "写作管理", folderKey: "generatedDocs", docName: "{date}-写作管理" },
      { id: "learning-stats", label: "学习统计", folderKey: "generatedDocs", docName: "{date}-学习统计" },
      { id: "recent-activity", label: "最近动态", folderKey: "generatedDocs", docName: "{date}-最近动态" },
    ],
  },

  // ==================== 高级配置 ====================
  advanced: {
    tabs: [
      { id: "action", name: "行动指北", icon: "compass" },
      { id: "knowledge", name: "知识管理", icon: "brain" },
      { id: "analysis", name: "学习分析", icon: "chart" },
      { id: "reading", name: "稍后阅读", icon: "bookmark" },
    ],

    fields: {
      status: "status",
      type: "type",
      deadline: "deadline",
      created: "created",
      updated: "updated",
      learningStatus: "学习状态",
      domain: "domain",
      module: "module",
    },

    limits: {
      recentFiles: 20,
      recentNotes: 15,
      activeTopics: 10,
      searchMinChars: 2,
      searchResults: 20,
      debounceDelay: 500,
    },

    theme: {
      defaultId: "green-dark",
      statusColors: {
        overdue: "#FF6B6B",
        completed: "#77DD77",
        active: "#FFD93D",
        understanding: "#4FC1FF",
      },
    },

    templates: {
      weeklyCategories: ["SAP 学习", "项目任务", "写作/事项"],
    },
  },
};
