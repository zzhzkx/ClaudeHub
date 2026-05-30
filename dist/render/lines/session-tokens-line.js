// ============================================================
// ClaudeHub - Session Token 用量行渲染
// ============================================================
import { label, cyan, green, yellow, dim } from '../colors.js';
import { getSessionTokens } from '../../stdin.js';
/** 格式化 token 数量 */
function formatTokens(n) {
    if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(0)}k`;
    return n.toString();
}
/** 渲染 Session Token 用量行 */
export function renderSessionTokensLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showSessionTokens !== true)
        return null;
    const tokens = getSessionTokens(ctx.stdin);
    if (!tokens)
        return null;
    const colors = ctx.config?.colors;
    const parts = [];
    if (tokens.inputTokens > 0) {
        parts.push(`📥 ${label('输入', colors)} ${cyan(formatTokens(tokens.inputTokens))}`);
    }
    if (tokens.outputTokens > 0) {
        parts.push(`📤 ${label('输出', colors)} ${green(formatTokens(tokens.outputTokens))}`);
    }
    if (tokens.cacheCreationTokens > 0) {
        parts.push(`✏️ ${label('缓存写', colors)} ${yellow(formatTokens(tokens.cacheCreationTokens))}`);
    }
    if (tokens.cacheReadTokens > 0) {
        parts.push(`📖 ${label('缓存读', colors)} ${dim(formatTokens(tokens.cacheReadTokens))}`);
    }
    if (parts.length === 0)
        return null;
    return parts.join(' │ ');
}
//# sourceMappingURL=session-tokens-line.js.map