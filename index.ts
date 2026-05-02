#!/usr/bin/env node
import { spawnSync } from 'child_process';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const config = {
  obscuraCmd: process.env.TINY_GOMCP_OBSCURA  || 'obscura',
  maxBuffer:  Number(process.env.TINY_GOMCP_MAX_BUFFER) || 50 * 1024 * 1024,
  searchUrl:  process.env.TINY_GOMCP_SEARCH   || 'https://html.duckduckgo.com/html/',
};

const DOM_CLEANUP = `(function(){document.querySelectorAll("script,style,noscript").forEach(e=>e.remove());return document.body.innerHTML})()`;

// 调用 obscura 的底层封装
function runObscura(url: string, evalScript?: string): string {
    const args = ['fetch', '-q'];
    if (evalScript) args.push('-e', evalScript);
    args.push(url);

    const result = spawnSync(config.obscuraCmd, args, {
        encoding: 'utf-8',
        env: process.env,
        maxBuffer: config.maxBuffer,
        stdio: ['pipe', 'pipe', 'ignore'],
    });

    if (result.error) {
        console.error("Error executing obscura:", result.error.message);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error("obscura exited with code", result.status);
        process.exit(1);
    }
    return result.stdout;
}

// Fetch 功能: 获取渲染后的 body innerHTML -> turndown 转为 markdown
function fetchUrl(url: string) {
    const html = runObscura(url, DOM_CLEANUP);
    const turndownService = new TurndownService({ headingStyle: 'atx' });
    console.log(turndownService.turndown(html));
}

// DuckDuckGo 搜索功能: 解析 HTML 返回条目
function searchDuckDuckGo(query: string) {
    const searchUrl = `${config.searchUrl}?q=${encodeURIComponent(query)}`;
    const html = runObscura(searchUrl);

    const $ = cheerio.load(html);
    const results: string[] = [];

    $('.result').each((i, el) => {
        const title = $(el).find('.result__title').text().trim();
        const rawHref = $(el).find('.result__url').attr('href') || '';
        const snippet = $(el).find('.result__snippet').text().trim();

        if (title && snippet) {
            let actualUrl = rawHref;
            const urlMatch = rawHref.match(/uddg=([^&]+)/);
            if (urlMatch) {
                actualUrl = decodeURIComponent(urlMatch[1]);
            } else if (rawHref.startsWith('//')) {
                actualUrl = 'https:' + rawHref;
            }
            results.push(`${results.length + 1}. ${title}\n   Link: ${actualUrl}\n   Snippet: ${snippet}\n`);
        }
    });

    console.log(`Search results for: ${query}\n`);
    console.log(results.join('\n'));
}

// CLI 入口
const command = process.argv[2];
const arg = process.argv[3];

if (!command || !arg) {
    console.log("Usage: npx tsx index.ts [fetch|search] [url/query]");
    process.exit(1);
}

if (command === 'fetch') {
    fetchUrl(arg);
} else if (command === 'search') {
    searchDuckDuckGo(arg);
} else {
    console.log("Unknown command. Supported: fetch, search");
}
