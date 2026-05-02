# tiny-gomcp 项目架构

## 概述

TypeScript/Node.js CLI 工具，提供网页抓取和搜索引擎功能，底层通过 `obscura` 代理访问网络。

## 目录结构

```
tiny-gomcp/
  index.ts            # 源文件，CLI 入口 + 全部逻辑
  tsconfig.json       # TypeScript 编译配置
  package.json        # npm 包配置（含 bin 字段）
  package-lock.json   # 依赖锁定
  dist/               # 编译输出（tsc 生成）
  node_modules/       # 第三方依赖
```

## 技术栈

- **语言**: TypeScript (tsx 运行)
- **运行时**: Node.js
- **包管理**: npm

## 依赖

| 包 | 用途 |
|---|---|
| `cheerio` | HTML 解析（搜索结果提取） |
| `turndown` | HTML → Markdown 转换 |
| `tsx` (dev) | TypeScript 直接运行 |
| `typescript` (dev) | 类型支持 |
| `@types/node` (dev) | Node.js 类型定义 |
| `@types/turndown` (dev) | Turndown 类型定义 |

## 核心架构

### 外部依赖

- **obscura.exe**: 本地代理抓取工具，负责实际的 HTTP 请求，通过 `child_process.execSync` 调用
- **代理**: `http://127.0.0.1:1080`（硬编码）

### 模块划分（均在 index.ts 中）

```
runObscura(url)          # 底层封装：调用 obscura.exe 获取 HTML
  ├─ fetchUrl(url)       # fetch 命令：HTML → Markdown 输出
  └─ searchDuckDuckGo(q) # duckduckgo 命令：搜索并解析结果
```

### CLI 接口

```bash
# 全局安装
npm install -g .
tiny-gomcp fetch <url>           # 抓取网页，输出 Markdown
tiny-gomcp search <query>        # DuckDuckGo 搜索，输出结果列表

# 本地开发
npm run build
npx tsx index.ts fetch <url>
npx tsx index.ts search <query>
```

### 搜索结果解析逻辑

DuckDuckGo 使用 HTML 版接口 (`html.duckduckgo.com/html/`)，cheerio 解析 `.result` 元素：
- 提取标题 (`.result__title`)
- 提取链接 (`.result__url` 的 href，需解码 `uddg=` 参数获取真实 URL)
- 提取摘要 (`.result__snippet`)

## 配置（环境变量）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `TINY_GOMCP_OBSCURA` | `obscura` | 可执行文件路径 |
| `TINY_GOMCP_MAX_BUFFER` | `52428800` (50MB) | execSync buffer 大小 |
| `TINY_GOMCP_SEARCH` | `https://html.duckduckgo.com/html/` | 搜索引擎 URL |
| `HTTPS_PROXY` / `HTTP_PROXY` | 不设置 | 代理（标准环境变量，按需设置） |

## 注意事项

- 无 `.git` 仓库
- 无测试、无 CI/CD
- 无 tsconfig.json（依赖 tsx 默认配置）
