#!/usr/bin/env node

// ============================================================
// ClaudeHub - Claude Code HUD 状态栏
//
// 一个为 Claude Code CLI 提供实时状态栏的 Node.js 工具
// 显示：模型名称、上下文使用进度条、工具活动、Git 状态等
//
// 灵感来自 jarrodwatts/claude-hud (MIT License)
// ============================================================

import { readStdin, getContextPercent, getModelName, getUsageFromStdin } from './stdin.js';
import { parseTranscript } from './transcript.js';
import { loadConfig } from './config.js';
import { getGitStatus } from './git.js';
import { render } from './render/index.js';
import type { RenderContext } from './types.js';

async function main(): Promise<void> {
  try {
    // 1. 从 stdin 读取 Claude Code 传入的数据
    const stdin = await readStdin();

    if (!stdin) {
      // 直接运行（非管道模式），显示提示
      console.log('ClaudeHub - Claude Code HUD 状态栏');
      console.log('此工具应由 Claude Code 的 statusLine 配置调用');
      console.log('');
      console.log('配置方法：在 ~/.claude/settings.json 中添加：');
      console.log('  "statusLine": "node /path/to/claudehub/dist/index.js"');
      return;
    }

    // 2. 加载用户配置
    const config = loadConfig();

    // 3. 解析 transcript（工具/Agent/待办活动）
    const transcript = await parseTranscript(stdin.transcript_path ?? '');

    // 4. 获取 Git 状态
    const gitInfo = config.gitStatus?.enabled
      ? getGitStatus(stdin.cwd)
      : { branch: '', dirty: false, ahead: 0, behind: 0 };

    // 5. 获取使用率数据
    const usageData = config.display?.showUsage !== false
      ? getUsageFromStdin(stdin)
      : null;

    // 6. 构建渲染上下文
    const ctx: RenderContext = {
      stdin,
      transcript,
      sessionDuration: '',
      usageData,
      memoryUsage: null,
      config,
      gitBranch: gitInfo.branch,
      gitDirty: gitInfo.dirty,
    };

    // 7. 渲染并输出
    render(ctx);
  } catch (error) {
    // 静默失败——不要让状态栏错误干扰 Claude Code
    console.error('[claudehub]', error instanceof Error ? error.message : 'Unknown error');
  }
}

void main();
