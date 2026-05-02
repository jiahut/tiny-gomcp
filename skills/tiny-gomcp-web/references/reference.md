# tiny-gomcp Reference

## Overview
tiny-gomcp is a TypeScript CLI tool for web search and fetch. It uses obscura as a proxy to access the web and converts HTML to Markdown via turndown.

## Commands

| Command | Description | Output |
|---------|-------------|--------|
| `search <query>` | DuckDuckGo search | Results: title, link, snippet |
| `fetch <url>` | Fetch URL → Markdown | Page content as Markdown |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TINY_GOMCP_OBSCURA` | `obscura` | obscura executable path |
| `TINY_GOMCP_MAX_BUFFER` | `52428800` (50MB) | execSync buffer size in bytes |
| `TINY_GOMCP_SEARCH` | `https://html.duckduckgo.com/html/` | Search engine HTML endpoint |
| `HTTPS_PROXY` | not set | HTTPS proxy URL |
| `HTTP_PROXY` | not set | HTTP proxy URL |

## Installation

```bash
# Global install
cd /path/to/tiny-gomcp
npm install -g .

# Or run locally
npx tsx index.ts <command> <arg>
```

## Error Scenarios & Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `tiny-gomcp: command not found` | Not installed globally | Run `npm install -g .` from project dir |
| `obscura: command not found` | obscura not on PATH | Install obscura or set `TINY_GOMCP_OBSCURA` |
| Connection timeout | Network issue or proxy misconfigured | Check network; set/unset `HTTPS_PROXY` |
| Empty search results | Query too narrow | Refine query |
| Garbled/truncated Markdown | Large page exceeding buffer | Increase `TINY_GOMCP_MAX_BUFFER` |
| `ENOTFOUND` / DNS error | No network or proxy unreachable | Check connectivity and proxy settings |

## Edge Cases

- **Redirects**: obscura follows redirects automatically. Final URL may differ from input.
- **JavaScript-heavy pages**: Only static HTML is fetched (no JS rendering). Content requiring JS execution will be missing.
- **Large pages**: Output can be very long. Increase buffer if truncated.
- **Rate limiting**: DuckDuckGo may rate-limit repeated searches. Space out requests.
- **Non-HTML content**: PDFs or binary files will produce minimal or no Markdown output.

## Architecture

```
CLI (index.ts)
  → runObscura(url)          # calls obscura.exe via execSync
    → fetchUrl(url)          # HTML → Markdown (turndown)
    → searchDuckDuckGo(q)    # HTML → parsed results (cheerio)
```

## Examples

```bash
# Basic search
tiny-gomcp search "rust async programming"

# Fetch a page
tiny-gomcp fetch https://example.com

# With proxy
HTTPS_PROXY=socks5://127.0.0.1:1080 tiny-gomcp fetch https://example.com

# Custom obscura path
TINY_GOMCP_OBSCURA=/usr/local/bin/obscura tiny-gomcp fetch https://example.com

# Large page buffer
TINY_GOMCP_MAX_BUFFER=104857600 tiny-gomcp fetch https://example.com
```
