// 主题配置文件
// 可以单独维护，插件主程序读取此文件

export interface ThemeColors {
  bg: string;
  cardBg: string;
  primary: string;
  secondary: string;
  gray: string;
  text: string;
  border: string;
  hover: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  dark: ThemeColors;
  light: ThemeColors;
}

// 主题列表
export const themes: Theme[] = [
  {
    id: "green-dark",
    name: "暗夜绿",
    description: "经典深色主题，绿色主调",
    dark: {
      bg: "#1E1E1E",
      cardBg: "#2D2D2D",
      primary: "#77DD77",
      secondary: "#CBC3E3",
      gray: "#333333",
      text: "#E0E0E0",
      border: "#404040",
      hover: "#3D3D3D",
    },
    light: {
      bg: "#FFFFFF",
      cardBg: "#F5F5F5",
      primary: "#4CAF50",
      secondary: "#9C27B0",
      gray: "#E0E0E0",
      text: "#333333",
      border: "#D0D0D0",
      hover: "#E8E8E8",
    },
  },
  {
    id: "ocean-blue",
    name: "海洋蓝",
    description: "清新蓝色主题",
    dark: {
      bg: "#0D1B2A",
      cardBg: "#1B2838",
      primary: "#4FC1FF",
      secondary: "#64B5F6",
      gray: "#2A3A4A",
      text: "#E0E0E0",
      border: "#3A4A5A",
      hover: "#2A3A4A",
    },
    light: {
      bg: "#F5F9FC",
      cardBg: "#FFFFFF",
      primary: "#2196F3",
      secondary: "#1976D2",
      gray: "#E3F2FD",
      text: "#333333",
      border: "#BBDEFB",
      hover: "#E3F2FD",
    },
  },
  {
    id: "sunset-orange",
    name: "日落橙",
    description: "温暖橙色主题",
    dark: {
      bg: "#1A1210",
      cardBg: "#2A1F1A",
      primary: "#FF9F43",
      secondary: "#FFD93D",
      gray: "#3A2A1A",
      text: "#E0D0C0",
      border: "#4A3A2A",
      hover: "#3A2A1A",
    },
    light: {
      bg: "#FFF8F0",
      cardBg: "#FFFFFF",
      primary: "#FF9800",
      secondary: "#FFC107",
      gray: "#FFF3E0",
      text: "#333333",
      border: "#FFE0B2",
      hover: "#FFF3E0",
    },
  },
  {
    id: "forest-green",
    name: "森林绿",
    description: "自然绿色主题",
    dark: {
      bg: "#0A1A0A",
      cardBg: "#1A2A1A",
      primary: "#4CAF50",
      secondary: "#81C784",
      gray: "#2A3A2A",
      text: "#E0E0E0",
      border: "#3A4A3A",
      hover: "#2A3A2A",
    },
    light: {
      bg: "#F1F8E9",
      cardBg: "#FFFFFF",
      primary: "#4CAF50",
      secondary: "#8BC34A",
      gray: "#E8F5E9",
      text: "#333333",
      border: "#C8E6C9",
      hover: "#E8F5E9",
    },
  },
  {
    id: "purple-dream",
    name: "梦幻紫",
    description: "神秘紫色主题",
    dark: {
      bg: "#1A0A2A",
      cardBg: "#2A1A3A",
      primary: "#BB86FC",
      secondary: "#CF6679",
      gray: "#3A2A4A",
      text: "#E0D0F0",
      border: "#4A3A5A",
      hover: "#3A2A4A",
    },
    light: {
      bg: "#F3E5F5",
      cardBg: "#FFFFFF",
      primary: "#9C27B0",
      secondary: "#E91E63",
      gray: "#F3E5F5",
      text: "#333333",
      border: "#CE93D8",
      hover: "#F3E5F5",
    },
  },
  {
    id: "cherry-red",
    name: "樱桃红",
    description: "热情红色主题",
    dark: {
      bg: "#1A0A0A",
      cardBg: "#2A1A1A",
      primary: "#FF6B6B",
      secondary: "#FFD93D",
      gray: "#3A2A2A",
      text: "#E0D0D0",
      border: "#4A3A3A",
      hover: "#3A2A2A",
    },
    light: {
      bg: "#FFF0F0",
      cardBg: "#FFFFFF",
      primary: "#F44336",
      secondary: "#FF9800",
      gray: "#FFEBEE",
      text: "#333333",
      border: "#EF9A9A",
      hover: "#FFEBEE",
    },
  },
  {
    id: "teal-cyan",
    name: "青色",
    description: "清爽青色主题",
    dark: {
      bg: "#0A1A1A",
      cardBg: "#1A2A2A",
      primary: "#00BCD4",
      secondary: "#4DD0E1",
      gray: "#2A3A3A",
      text: "#E0E0E0",
      border: "#3A4A4A",
      hover: "#2A3A3A",
    },
    light: {
      bg: "#E0F7FA",
      cardBg: "#FFFFFF",
      primary: "#00BCD4",
      secondary: "#0097A7",
      gray: "#E0F7FA",
      text: "#333333",
      border: "#80DEEA",
      hover: "#E0F7FA",
    },
  },
  {
    id: "golden-sand",
    name: "金沙",
    description: "奢华金色主题",
    dark: {
      bg: "#1A1A0A",
      cardBg: "#2A2A1A",
      primary: "#FFD700",
      secondary: "#FFA000",
      gray: "#3A3A2A",
      text: "#E0E0D0",
      border: "#4A4A3A",
      hover: "#3A3A2A",
    },
    light: {
      bg: "#FFFDE7",
      cardBg: "#FFFFFF",
      primary: "#FFC107",
      secondary: "#FF9800",
      gray: "#FFF9C4",
      text: "#333333",
      border: "#FFE082",
      hover: "#FFF9C4",
    },
  },
  {
    id: "rose-pink",
    name: "玫瑰粉",
    description: "温柔粉色主题",
    dark: {
      bg: "#1A0A1A",
      cardBg: "#2A1A2A",
      primary: "#FF69B4",
      secondary: "#FFB6C1",
      gray: "#3A2A3A",
      text: "#E0D0E0",
      border: "#4A3A4A",
      hover: "#3A2A3A",
    },
    light: {
      bg: "#FCE4EC",
      cardBg: "#FFFFFF",
      primary: "#E91E63",
      secondary: "#F06292",
      gray: "#FCE4EC",
      text: "#333333",
      border: "#F48FB1",
      hover: "#FCE4EC",
    },
  },
  {
    id: "slate-gray",
    name: "石板灰",
    description: "简约灰色主题",
    dark: {
      bg: "#1A1A1A",
      cardBg: "#2A2A2A",
      primary: "#90A4AE",
      secondary: "#B0BEC5",
      gray: "#3A3A3A",
      text: "#E0E0E0",
      border: "#4A4A4A",
      hover: "#3A3A3A",
    },
    light: {
      bg: "#ECEFF1",
      cardBg: "#FFFFFF",
      primary: "#607D8B",
      secondary: "#78909C",
      gray: "#CFD8DC",
      text: "#333333",
      border: "#B0BEC5",
      hover: "#CFD8DC",
    },
  },
];

// 获取主题
export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

// 获取所有主题
export function getAllThemes(): Theme[] {
  return themes;
}
