#!/usr/bin/env node
import { execSync } from 'child_process';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const config = {
  obscuraCmd: process.env.TINY_GOMCP_OBSCURA  || 'obscura',
  maxBuffer:  Number(process.env.TINY_GOMCP_MAX_BUFFER) || 50 * 1024 * 1024,
  searchUrl:  process.env.TINY_GOMCP_SEARCH   || 'https://html.duckduckgo.com/html/',
};

// 调用 obscura 的底层封装
function runObscura(url: string): string {
    try {
        // 使用 -q 静默输出，避免混入无关的日志信息
        const cmd = `${config.obscuraCmd} fetch -q "${url}"`;
        const html = execSync(cmd, {
            encoding: 'utf-8',
            env: process.env,
            maxBuffer: config.maxBuffer,
        });
        return html;
    } catch (error: any) {
        console.error("Error executing obscura:", error.message);
        if (error.stdout) console.error("Stdout:", error.stdout);
        if (error.stderr) console.error("Stderr:", error.stderr);
        process.exit(1);
    }
}

// Fetch 功能: HTML -> Markdown
function fetchUrl(url: string) {
    const html = runObscura(url);
    const turndownService = new TurndownService({ headingStyle: 'atx' });
    const markdown = turndownService.turndown(html);
    console.log(markdown);
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
            // 提取真实的链接
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
