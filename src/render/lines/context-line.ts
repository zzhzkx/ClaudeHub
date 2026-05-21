// ============================================================
// ClaudeHub - 上下文使用行渲染
// ============================================================

import type { RenderContext } from '../../types.js';
import { label, coloredBar, getContextColor, RESET } from '../colors.js';
import { getContextPercent, getContextWindowSize, getTotalTokens } from '../../stdin.js';

/** 格式化 token 数量 */
function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

/** 格式化时间间隔为人类可读字符串 */
function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

/** 渲染上下文使用行 */
export function renderContextLine(ctx: RenderContext): string | null {
  const display = ctx.config?.display;
  if (display?.showContextBar === false) return null;

  const colors = ctx.config?.colors;
  const percent = getContextPercent(ctx.stdin);
  const ctxLabel = label('上下文', colors);

  // 进度条
  const bar = coloredBar(percent, 10, colors);

  // 数值显示
  const mode = display?.contextValue ?? 'both';
  const size = getContextWindowSize(ctx.stdin);
  const used = getTotalTokens(ctx.stdin);

  let valueStr: string;
  switch (mode) {
    case 'tokens':
      valueStr = `${formatTokens(used)}/${formatTokens(size)}`;
      break;
    case 'remaining':
      valueStr = `${100 - percent}%`;
      break;
    case 'both':
      valueStr = `${percent}% (${formatTokens(used)}/${formatTokens(size)})`;
      break;
    case 'percent':
    default:
      valueStr = `${percent}%`;
      break;
  }

  // 距上次回复时长
  const parts = [`${ctxLabel} ${bar} ${valueStr}`];
  if (ctx.transcript.lastAssistantResponseAt) {
    const elapsed = Date.now() - ctx.transcript.lastAssistantResponseAt.getTime();
    const elapsedStr = formatElapsed(elapsed);
    parts.push(label(`⏱ ${elapsedStr}`, colors));
  }

  return parts.join(' │ ');
}
