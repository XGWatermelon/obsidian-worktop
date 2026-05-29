# 笔记库结构整改方案

> 目标路径：`F:\personal_files\个人知识库整理\Obsidian-warehouse\obsidian-note-warehouse`

---

## 一、目标结构

```
obsidian-note-warehouse/
├── SAP/                  # 合并：SAP技术 + SAP模块 + SAP项目
│   ├── 技术/             # ← SAP 技术知识/ 内容原样搬入
│   ├── 模块/             # ← SAP 模块知识/ 内容原样搬入
│   └── 项目/             # ← SAP项目/ 内容原样搬入
│
├── AI/                   # 合并：AI学习 + AI赋能 + 各项积累 + 学习Obsidian记录
│   ├── 学习/             # ← AI学习/ 内容原样搬入
│   ├── 工具/             # ← AI赋能/AI-工具/ + 各项积累/小工具.md + 学习Obsidian记录/
│   ├── SAP结合/          # ← AI赋能/AI-SAP/
│   └── 知识库/           # ← AI赋能/AI-知识库/
│
├── 对象/                 # 保持不动
│
├── 日记/                 # ← diary/ 改名
│
├── 选题/                 # 新建（空文件夹）
│
├── 待整理/               # 合并：未整理 + Clippings + ZZZ未完成项目
│   ├── 临时笔记/         # ← 未整理/临时笔记/
│   ├── 收藏摘录/         # ← 未整理/收藏摘录/
│   ├── 待归类/           # ← 未整理/待归类/
│   ├── 已md化处理/       # ← 未整理/已md化处理/
│   └── 半成品/           # ← ZZZ未完成项目/半成品/
│
├── 仓库config/           # 保持不动
│
└── 主页.md               # 保持不动
```

---

## 二、操作清单

### 步骤 1：创建新文件夹

```bash
mkdir -p "SAP/技术" "SAP/模块" "SAP/项目"
mkdir -p "AI/学习" "AI/工具" "AI/SAP结合" "AI/知识库"
mkdir -p "选题"
mkdir -p "待整理"
```

### 步骤 2：移动 SAP 相关

```bash
# SAP 技术知识 → SAP/技术/
mv "SAP 技术知识/ABAP" "SAP/技术/"
mv "SAP 技术知识/CPI" "SAP/技术/"
mv "SAP 技术知识/Fiori" "SAP/技术/"
mv "SAP 技术知识/KUE" "SAP/技术/"
mv "SAP 技术知识/Odata 基础知识与教程" "SAP/技术/"
mv "SAP 技术知识/SAP 知识" "SAP/技术/"

# SAP 模块知识 → SAP/模块/
mv "SAP 模块知识/FICO" "SAP/模块/"
mv "SAP 模块知识/HR" "SAP/模块/"
mv "SAP 模块知识/MM" "SAP/模块/"
mv "SAP 模块知识/SD" "SAP/模块/"

# SAP项目 → SAP/项目/
mv "SAP项目/Mizkan" "SAP/项目/"
mv "SAP项目/海康威视GTS" "SAP/项目/"
mv "SAP项目/项目主页.md" "SAP/项目/"
```

### 步骤 3：移动 AI 相关

```bash
# AI学习 → AI/学习/
mv "AI学习/AI实践" "AI/学习/"
mv "AI学习/Claude Code国内API配置.md" "AI/学习/"
mv "AI学习/Claude Code踩坑.md" "AI/学习/"
mv "AI学习/Skills功能清单.md" "AI/学习/"

# AI赋能/AI-工具/ → AI/工具/
mv "AI赋能/AI-工具/文档转换工具" "AI/工具/"

# 各项积累/小工具.md → AI/工具/
mv "各项积累/小工具.md" "AI/工具/"

# 学习Obsidian记录/ → AI/工具/Obsidian学习/
mkdir -p "AI/工具/Obsidian学习"
mv "学习Obsidian记录/GIT插件设置.md" "AI/工具/Obsidian学习/"
mv "学习Obsidian记录/学习链接.md" "AI/工具/Obsidian学习/"

# AI赋能/AI-SAP/ → AI/SAP结合/
mv "AI赋能/AI-SAP/BAPI代码自动获取" "AI/SAP结合/"
mv "AI赋能/AI-SAP/SAP-Skills-插件清单.md" "AI/SAP结合/"

# AI赋能/AI-知识库/ → AI/知识库/
mv "AI赋能/AI-知识库/工作流" "AI/知识库/"
mv "AI赋能/AI-知识库/理论" "AI/知识库/"
```

### 步骤 4：改名 diary → 日记

```bash
mv "diary" "日记"
```

### 步骤 5：合并待整理

```bash
# 未整理内容 → 待整理/
mv "未整理/临时笔记" "待整理/"
mv "未整理/收藏摘录" "待整理/"
mv "未整理/待归类" "待整理/"
mv "未整理/已md化处理" "待整理/"
mv "未整理/主页.md" "待整理/"

# ZZZ未完成项目/半成品/ → 待整理/半成品/
mv "ZZZ未完成项目/半成品" "待整理/"

# Clippings 内容（如果有的话）→ 待整理/收藏摘录/
# 目前 Clippings 为空，可直接删除
```

### 步骤 6：删除空文件夹

```bash
rmdir "SAP 技术知识"
rmdir "SAP 模块知识"
rmdir "SAP项目"
rmdir "AI学习"
rmdir "AI赋能/AI-工具"
rmdir "AI赋能/AI-SAP"
rmdir "AI赋能/AI-知识库"
rmdir "AI赋能"
rmdir "各项积累"
rmdir "学习Obsidian记录"
rmdir "未整理/临时笔记"
rmdir "未整理/收藏摘录"
rmdir "未整理/待归类"
rmdir "未整理/已md化处理"
rmdir "未整理"
rmdir "ZZZ未完成项目/半成品"
rmdir "ZZZ未完成项目"
rmdir "Clippings"
```

---

## 三、需要更新的内部链接

移动文件后，Obsidian 的 wiki 链接 `[[...]]` 会自动更新（Obsidian 内置功能）。但以下文件中的**相对路径引用**可能需要手动检查：

| 文件 | 需要检查的链接 |
|------|---------------|
| `主页.md` | 所有 `[[...]]` 链接 |
| `文档索引.md` | 所有 `[[...]]` 链接和文件夹路径 |
| `SAP/模块/FICO/FICO 学习主页.md` | 内部链接 |
| `SAP/项目/项目主页.md` | 内部链接 |
| `仓库config/仪表盘/dashboard.md` | Dataview 查询路径 |

**建议：** 移动完成后，在 Obsidian 中打开这些文件，检查链接是否正常。Obsidian 会自动提示断链。

---

## 四、Dataview 查询路径更新

如果主页或其他文件中有 Dataview 查询引用了旧路径，需要更新：

| 旧路径 | 新路径 |
|--------|--------|
| `FROM "SAP 技术知识"` | `FROM "SAP/技术"` |
| `FROM "SAP 模块知识"` | `FROM "SAP/模块"` |
| `FROM "SAP项目"` | `FROM "SAP/项目"` |
| `FROM "AI学习"` | `FROM "AI/学习"` |
| `FROM "AI赋能"` | `FROM "AI"` |
| `FROM "未整理"` | `FROM "待整理"` |
| `FROM "diary"` | `FROM "日记"` |

---

## 五、整改后统计

| 项目 | 整改前 | 整改后 |
|------|--------|--------|
| 顶层文件夹数 | 12 | 7 |
| 总文件数 | 126 | 126（不变） |
| 新增文件夹 | — | `选题/` |
| 合并文件夹 | — | SAP×3→1, AI×4→1, 待整理×3→1 |

---

*生成时间：2026-05-27*
