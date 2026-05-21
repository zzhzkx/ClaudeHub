// ============================================================
// ClaudeHub - 会话信息行渲染（模型 + 项目 + Git）
// ============================================================

import type { RenderContext } from '../../types.js';
import { model, project, git, gitBranch, label, dim } from '../colors.js';
import { getModelName } from '../../stdin.js';

/** 路径过长时折叠中间部分：a/b/c/d/e → a/b/.../d/e */
function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) return path;
  const segments = path.split('/');
  if (segments.length <= 3) return path; // 太短不需要折叠
  // 保留前 2 段和后 2 段，中间用 ... 代替
  const head = segments.slice(0, 2).join('/');
  const tail = segments.slice(-2).join('/');
  return `${head}/.../${tail}`;
}

/** 渲染会话信息行：模型 | 项目路径 | git 分支 */
export function renderSessionLine(ctx: RenderContext): string {
  const parts: string[] = [];
  const colors = ctx.config?.colors;
  const display = ctx.config?.display;

  // 模型名称 🤖
  if (display?.showModel !== false) {
    const modelName = getModelName(ctx.stdin);
    parts.push(model(`🤖 [${modelName}]`, colors));
  }

  // 项目路径 📁
  const projectDir = ctx.stdin.cwd || ctx.stdin.workspace?.current_dir || '';
  if (projectDir) {
    const fullPath = projectDir.replace(/\\/g, '/');
    const displayPath = truncatePath(fullPath, 30);
    parts.push(project(`📁 ${displayPath}`, colors));
  }

  // Git 分支 🌿
  if (ctx.config?.gitStatus?.enabled && ctx.gitBranch) {
    const dirty = ctx.gitDirty && ctx.config.gitStatus.showDirty ? ' ●' : '';
    const branchStr = `🌿 ${gitBranch(ctx.gitBranch, colors)}${dirty}`;
    parts.push(branchStr);
  }

  return parts.join(' │ ');
}
