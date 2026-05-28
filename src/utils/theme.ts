import { getThemeById, Theme, ThemeColors } from "../themes";

export type ThemeMode = "dark" | "light";

// 检测当前主题模式
export function detectTheme(): ThemeMode {
  const isDark = document.body.classList.contains("theme-dark");
  return isDark ? "dark" : "light";
}

// 应用主题
export function applyTheme(container: HTMLElement, mode: ThemeMode, themeId?: string): void {
  container.setAttribute("data-theme", mode);

  // 获取主题配置
  const theme = themeId ? getThemeById(themeId) : getThemeById("green-dark");
  if (!theme) return;

  // 获取对应模式的颜色
  const colors: ThemeColors = mode === "dark" ? theme.dark : theme.light;

  // 应用 CSS 变量
  container.style.setProperty("--ws-bg", colors.bg);
  container.style.setProperty("--ws-card-bg", colors.cardBg);
  container.style.setProperty("--ws-primary", colors.primary);
  container.style.setProperty("--ws-secondary", colors.secondary);
  container.style.setProperty("--ws-gray", colors.gray);
  container.style.setProperty("--ws-text", colors.text);
  container.style.setProperty("--ws-border", colors.border);
  container.style.setProperty("--ws-hover", colors.hover);
}

// 获取主题颜色
export function getThemeColors(mode: ThemeMode, themeId?: string): ThemeColors {
  const theme = themeId ? getThemeById(themeId) : getThemeById("green-dark");
  if (!theme) {
    // 返回默认主题
    return mode === "dark" ? getThemeById("green-dark")!.dark : getThemeById("green-dark")!.light;
  }
  return mode === "dark" ? theme.dark : theme.light;
}
