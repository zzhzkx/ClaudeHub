// ============================================================
// ClaudeHub - 会话信息行渲染（模型 + 项目 + Git）
// ============================================================
import { model, project, gitBranch, dim } from '../colors.js';
import { getModelName } from '../../stdin.js';
/** 路径过长时折叠中间部分：a/b/c/d/e → a/b/.../d/e */
function truncatePath(path, maxLen) {
    if (path.length <= maxLen)
        return path;
    const segments = path.split('/');
    if (segments.length <= 3)
        return path; // 太短不需要折叠
    // 保留前 2 段和后 2 段，中间用 ... 代替
    const head = segments.slice(0, 2).join('/');
    const tail = segments.slice(-2).join('/');
    return `${head}/.../${tail}`;
}
/** 根据 pathLevels 配置截取路径末尾 N 段 */
function pathByLevels(path, levels) {
    if (levels <= 0)
        return path;
    const segments = path.replace(/\\/g, '/').split('/').filter(Boolean);
    if (segments.length <= levels)
        return path;
    return segments.slice(-levels).join('/');
}
/** 渲染会话信息行：模型 | 项目路径 | git 分支 */
export function renderSessionLine(ctx) {
    const parts = [];
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
        // 优先使用 pathLevels 配置，否则智能截断
        const levels = ctx.config?.pathLevels ?? 0;
        const displayPath = levels > 0 ? pathByLevels(fullPath, levels) : truncatePath(fullPath, 30);
        parts.push(project(`📁 ${displayPath}`, colors));
    }
    // Git 分支 🌿
    if (ctx.config?.gitStatus?.enabled && ctx.gitBranch) {
        const dirty = ctx.gitDirty && ctx.config.gitStatus.showDirty ? ' ●' : '';
        const branchStr = `🌿 ${gitBranch(ctx.gitBranch, colors)}${dirty}`;
        parts.push(branchStr);
    }
    // 会话时长 ⏱
    if (display?.showDuration && ctx.sessionDuration) {
        parts.push(dim(`⏱ ${ctx.sessionDuration}`));
    }
    return parts.join(' │ ');
}
//# sourceMappingURL=session-line.js.map