#!/usr/bin/env node
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const config = {
  obscuraCmd: process.env.TINY_GOMCP_OBSCURA  || 'obscura',
  maxBuffer:  Number(process.env.TINY_GOMCP_MAX_BUFFER) || 50 * 1024 * 1024,
  searchUrl:  process.env.TINY_GOMCP_SEARCH   || 'https://html.duckduckgo.com/html/',
};

const DOM_CLEANUP = `(function(){document.querySelectorAll("script,style,noscript").forEach(e=>e.remove());return document.body.innerHTML})()`;

// 异步调用 obscura 的底层封装
function runObscuraAsync(url: string, evalScript?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const args = ['fetch', '-q'];
        if (evalScript) args.push('-e', evalScript);
        args.push(url);

        const child = spawn(config.obscuraCmd, args, {
            env: process.env,
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            // 手动实现 maxBuffer 限制
            if (stdout.length > config.maxBuffer) {
                child.kill();
                reject(new Error(`Max buffer size (${config.maxBuffer} bytes) exceeded`));
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`obscura exited with code ${code}\nStderr: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });

        child.on('error', (err) => {
            reject(new Error(`Failed to start obscura: ${err.message}`));
        });
    });
}

// Fetch 功能: 获取渲染后的 body innerHTML -> turndown 转为 markdown
async function fetchUrl(url: string) {
    try {
        const html = await runObscuraAsync(url, DOM_CLEANUP);
        const turndownService = new TurndownService({ headingStyle: 'atx' });
        console.log(turndownService.turndown(html));
    } catch (error: any) {
        console.error("Fetch Error:", error.message);
        process.exit(1);
    }
}

// DuckDuckGo 搜索功能: 解析 HTML 返回条目
async function searchDuckDuckGo(query: string) {
    try {
        const searchUrl = `${config.searchUrl}?q=${encodeURIComponent(query)}`;
        const html = await runObscuraAsync(searchUrl);

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
    } catch (error: any) {
        console.error("Search Error:", error.message);
        process.exit(1);
    }
}

// CLI 异步入口
async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    if (!command || !arg) {
        console.log("Usage: npx tsx index.ts [fetch|search] [url/query]");
        process.exit(1);
    }

    if (command === 'fetch') {
        await fetchUrl(arg);
    } else if (command === 'search') {
        await searchDuckDuckGo(arg);
    } else {
        console.log("Unknown command. Supported: fetch, search");
        process.exit(1);
    }
}

main();
