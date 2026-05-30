#!/usr/bin/env node
// ============================================================
// ClaudeHub - Claude Code HUD 状态栏
// ============================================================
import { readStdin, getUsageFromStdin, formatDuration } from './stdin.js';
import { parseTranscriptIncremental, parseTranscript } from './transcript.js';
import { loadConfig } from './config.js';
import { getGitStatus } from './git.js';
import { render } from './render/index.js';
import { statSync } from 'node:fs';
// ---- 缓存 ----
let cachedConfig = null;
let cachedGit = null;
let cachedTranscript = null;
let transcriptLastSize = 0;
const GIT_CACHE_MS = 10000; // Git 状态缓存 10 秒
const TRANSCRIPT_FULL_INTERVAL = 30000; // 每 30 秒强制全量解析一次（兜底）
let lastFullParse = 0;
function getConfig() {
    if (!cachedConfig)
        cachedConfig = loadConfig();
    return cachedConfig;
}
function getGitCached(cwd) {
    const now = Date.now();
    if (cachedGit && now - cachedGit.ts < GIT_CACHE_MS)
        return cachedGit;
    const info = getGitStatus(cwd);
    cachedGit = { branch: info.branch, dirty: info.dirty, ts: now };
    return cachedGit;
}
function logError(msg, err) {
    // 输出到 stderr，不影响 stdout 的 HUD 渲染
    const detail = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[claudehub] ${msg}: ${detail}\n`);
}
async function main() {
    try {
        const stdin = await readStdin();
        if (!stdin)
            return;
        const config = getConfig();
        const now = Date.now();
        // 增量解析 transcript：只读新增内容，大幅减少 I/O
        const forceFull = now - lastFullParse > TRANSCRIPT_FULL_INTERVAL;
        const transcriptPath = stdin.transcript_path ?? '';
        if (forceFull) {
            // 强制全量（兜底，防止增量累积误差）
            cachedTranscript = parseTranscript(transcriptPath);
            try {
                transcriptLastSize = statSync(transcriptPath).size;
            }
            catch {
                transcriptLastSize = 0;
            }
            lastFullParse = now;
        }
        else {
            // 增量解析
            const result = parseTranscriptIncremental(transcriptPath, transcriptLastSize);
            transcriptLastSize = result.newSize;
            // 合并增量结果到缓存
            if (result.data.tools.length > 0 || result.data.agents.length > 0 || result.data.todos.length > 0) {
                cachedTranscript = { ...(cachedTranscript ?? { tools: [], agents: [], todos: [] }), ...result.data };
            }
            if (!cachedTranscript) {
                cachedTranscript = { tools: [], agents: [], todos: [] };
            }
        }
        const gitInfo = config.gitStatus?.enabled
            ? getGitCached(stdin.cwd)
            : { branch: '', dirty: false };
        const usageData = config.display?.showUsage !== false
            ? getUsageFromStdin(stdin)
            : null;
        // 计算会话时长
        const sessionStart = cachedTranscript?.sessionStart;
        const sessionDuration = sessionStart
            ? formatDuration(Date.now() - sessionStart.getTime())
            : '';
        const ctx = {
            stdin,
            transcript: cachedTranscript,
            sessionDuration,
            usageData,
            memoryUsage: null,
            config,
            gitBranch: gitInfo.branch,
            gitDirty: gitInfo.dirty,
        };
        render(ctx);
    }
    catch (err) {
        logError('render failed', err);
    }
}
void main();
//# sourceMappingURL=index.js.map