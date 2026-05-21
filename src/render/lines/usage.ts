// ============================================================
// ClaudeHub - 使用率行渲染
// ============================================================

import type { RenderContext } from '../../types.js';
import { label, quotaBar, getQuotaColor, RESET } from '../colors.js';

/** 渲染使用率行 */
export function renderUsageLine(ctx: RenderContext): string | null {
  const display = ctx.config?.display;
  if (display?.showUsage === false) return null;
  if (!ctx.usageData) return null;

  const colors = ctx.config?.colors;
  const usageLabel = label('使用率', colors);
  const data = ctx.usageData;

  // 限制已满
  if (data.fiveHour === 100 || data.sevenDay === 100) {
    return `${usageLabel} ${label('⚠ 已达上限', colors)}`;
  }

  const barWidth = 10;
  const parts: string[] = [];

  if (data.fiveHour !== null) {
    const bar = display?.usageBarEnabled !== false
      ? quotaBar(data.fiveHour, barWidth, colors)
      : '';
    const pct = `${data.fiveHour}%`;
    parts.push(`5h: ${bar} ${pct}`);
  }

  if (data.sevenDay !== null) {
    const bar = display?.usageBarEnabled !== false
      ? quotaBar(data.sevenDay, barWidth, colors)
      : '';
    const pct = `${data.sevenDay}%`;
    parts.push(`7d: ${bar} ${pct}`);
  }

  if (parts.length === 0) return null;

  return `${usageLabel} ${parts.join(' | ')}`;
}
