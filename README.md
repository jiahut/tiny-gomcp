# tiny-gomcp

CLI tool for web fetching and DuckDuckGo search, powered by [obscura](https://github.com/h4ckf0r0day/obscura) proxy.

## Features

- **fetch** — Fetch any URL and convert to Markdown
- **search** — DuckDuckGo search with title, link, and snippet

## Prerequisites

- Node.js >= 18
- [obscura](https://github.com/h4ckf0r0day/obscura) on PATH

### Install obscura

Download from [GitHub Releases](https://github.com/h4ckf0r0day/obscura/releases):

```bash
# Linux (x86_64)
curl -L https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-linux.tar.gz | tar xz
sudo mv obscura /usr/local/bin/

# macOS (Apple Silicon)
curl -L https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-aarch64-macos.tar.gz | tar xz
sudo mv obscura /usr/local/bin/

# Windows (PowerShell)
Invoke-WebRequest -Uri https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-windows.zip -OutFile obscura.zip
Expand-Archive -Path obscura.zip -DestinationPath .
Move-Item obscura.exe C:\Windows\System32\
```

### Install tiny-gomcp

```bash
npm install -g .
```

## Usage

```bash
# Fetch a URL → Markdown
tiny-gomcp fetch https://example.com

# Search DuckDuckGo
tiny-gomcp search "golang tutorial"
```

## Configuration

All optional via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `TINY_GOMCP_OBSCURA` | `obscura` | obscura executable path |
| `TINY_GOMCP_MAX_BUFFER` | `52428800` (50MB) | Max output buffer size |
| `TINY_GOMCP_SEARCH` | `https://html.duckduckgo.com/html/` | Search engine endpoint |
| `HTTPS_PROXY` / `HTTP_PROXY` | not set | Proxy (standard env vars) |

```bash
# With proxy
HTTPS_PROXY=http://127.0.0.1:1080 tiny-gomcp fetch https://example.com

# Custom obscura path
TINY_GOMCP_OBSCURA=/usr/local/bin/obscura tiny-gomcp search "hello"
```

## Development

```bash
npm install
npm run build
npx tsx index.ts fetch https://example.com
```

## License

ISC
