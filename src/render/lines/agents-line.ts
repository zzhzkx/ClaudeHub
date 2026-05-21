// ============================================================
// ClaudeHub - Agent 活动行渲染
// ============================================================

import type { RenderContext } from '../../types.js';
import { yellow, green, cyan, label } from '../colors.js';

/** 渲染 Agent 活动行 */
export function renderAgentsLine(ctx: RenderContext): string | null {
  const display = ctx.config?.display;
  if (display?.showAgents === false) return null;

  const { agents } = ctx.transcript;
  if (agents.length === 0) return null;

  const colors = ctx.config?.colors;
  const parts: string[] = [];

  for (const agent of agents) {
    const statusIcon = agent.status === 'running' ? yellow('◐') : green('✓');
    const modelLabel = agent.model ? cyan(`[${agent.model}]`) : '';
    const desc = agent.description ?? '';
    parts.push(`${statusIcon} ${agent.type} ${modelLabel} ${label(desc, colors)}`.trim());
  }

  if (parts.length === 0) return null;
  return parts.join(' | ');
}
