// ============================================================
// ClaudeHub - 待办进度行渲染
// ============================================================
import { yellow, dim } from '../colors.js';
/** 渲染待办进度行 */
export function renderTodosLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showTodos === false)
        return null;
    const { todos } = ctx.transcript;
    if (todos.length === 0)
        return null;
    const completed = todos.filter((t) => t.status === 'completed').length;
    const total = todos.length;
    const inProgress = todos.filter((t) => t.status === 'in_progress');
    const parts = [];
    // 进度计数
    parts.push(`${completed}/${total}`);
    // 进行中的任务
    for (const todo of inProgress) {
        parts.push(`${yellow('▸')} ${todo.content}`);
    }
    // 下一个待办
    const next = todos.find((t) => t.status === 'pending');
    if (next) {
        parts.push(`${dim('○')} ${next.content}`);
    }
    return parts.join(' | ');
}
//# sourceMappingURL=todos-line.js.map