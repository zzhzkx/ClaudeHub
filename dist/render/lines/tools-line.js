// ============================================================
// ClaudeHub - 工具活动行渲染
// ============================================================
import { yellow, green, cyan, label } from '../colors.js';
function truncatePath(path, maxLen = 20) {
    const normalized = path.replace(/\\/g, '/');
    if (normalized.length <= maxLen)
        return normalized;
    const parts = normalized.split('/');
    const filename = parts.pop() || normalized;
    if (filename.length >= maxLen)
        return filename.slice(0, maxLen - 3) + '...';
    return '.../' + filename;
}
/** 渲染工具活动行 */
export function renderToolsLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showTools === false)
        return null;
    const { tools } = ctx.transcript;
    if (tools.length === 0)
        return null;
    const colors = ctx.config?.colors;
    const parts = [];
    // 正在运行的工具
    const running = tools.filter((t) => t.status === 'running');
    for (const tool of running.slice(-2)) {
        const target = tool.target ? truncatePath(tool.target) : '';
        parts.push(`${yellow('◐')} ${cyan(tool.name)}${target ? label(`: ${target}`, colors) : ''}`);
    }
    // 已完成的工具（统计数量）
    const completed = tools.filter((t) => t.status === 'completed' || t.status === 'error');
    const counts = new Map();
    for (const tool of completed) {
        counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
    }
    const sorted = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
    for (const [name, count] of sorted) {
        parts.push(`${green('✓')} ${name} ${label(`×${count}`, colors)}`);
    }
    if (parts.length === 0)
        return null;
    return parts.join(' | ');
}
//# sourceMappingURL=tools-line.js.map