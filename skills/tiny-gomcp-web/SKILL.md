---
name: tiny-gomcp-web
description: "Use tiny-gomcp for web search and URL fetch -> Markdown via obscura. Trigger on search/research/fetch requests, including Chinese keywords like 搜索/调查/查找/查询/资料/信息/调研."
allowed-tools: ["Bash"]
---

# tiny-gomcp-web Skill

Use the tiny-gomcp CLI to perform web search and fetch web pages to Markdown via obscura proxy.

## Trigger cues
- English: search, research, look up, find, investigate, browse, web search, web lookup.
- Chinese: 搜索, 查找, 查询, 调查, 调研, 资料, 信息, 了解, 看看, 甄别, 追踪, 盘点.
- Any request that mentions tiny-gomcp or asks to fetch a URL into Markdown.

## Before execution

| Source | Gather |
|--------|--------|
| **Environment** | Verify `tiny-gomcp` is on PATH, or use `npx tsx index.ts` from project dir |
| **Proxy** | Optional — set `HTTPS_PROXY` if proxy needed |
| **User request** | Identify: search query vs. direct URL fetch vs. multi-step research |

## Required clarifications
Ask only when genuinely ambiguous — do not over-ask.
1. **Query unclear**: If the user's search intent is ambiguous, ask for clarification before searching.
2. **Engine preference**: Default to DuckDuckGo search.

## Core commands
- `tiny-gomcp search <query>` — DuckDuckGo search, returns results with title, link, snippet
- `tiny-gomcp fetch <url>` — Fetch URL and convert to Markdown

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TINY_GOMCP_OBSCURA` | `obscura` | obscura executable path |
| `TINY_GOMCP_MAX_BUFFER` | `52428800` | execSync buffer size (bytes) |
| `TINY_GOMCP_SEARCH` | `https://html.duckduckgo.com/html/` | Search engine URL |
| `HTTPS_PROXY` / `HTTP_PROXY` | not set | Proxy (standard env vars) |

## References
- See `references/reference.md` for options, error handling, edge cases, and troubleshooting.

## Behavior
- Use tiny-gomcp for all search/fetch tasks when this skill is enabled.
- For multi-step tasks: search -> select relevant URLs -> fetch.
- If tiny-gomcp is not installed, suggest `npm install -g .` from the project directory, or use `npx tsx index.ts` as fallback.

## Error handling
- **tiny-gomcp not found**: Report and ask user to install (`npm install -g .`) or run from project dir with `npx tsx`.
- **obscura not found**: Report and ask user to install obscura or set `TINY_GOMCP_OBSCURA`.
- **Non-zero exit / timeout**: Show stderr; retry once. If fails again, report error.
- **Zero search results**: Inform user; suggest refining query.
- **Very large page**: Summarize key sections, offer full content on request.

## Output expectations
- Return the fetched Markdown and cite the source URL.
- Provide a short, task-focused summary after the Markdown when appropriate.

## Must avoid
- Do not submit credentials or interact with sensitive pages unless user explicitly requests.
- Do not perform destructive actions on web pages; this skill is for read-only search and fetch.

## Examples
```bash
# Search
tiny-gomcp search "golang tutorial"

# Fetch
tiny-gomcp fetch https://example.com

# With proxy
HTTPS_PROXY=http://127.0.0.1:1080 tiny-gomcp fetch https://example.com

# Local dev (from project dir)
npx tsx index.ts search "hello world"
```
