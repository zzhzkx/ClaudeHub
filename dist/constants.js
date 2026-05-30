// ============================================================
// ClaudeHub - 常量定义
// ============================================================
/** 自动压缩缓冲区比例（Claude Code 内部预留） */
export const AUTOCOMPACT_BUFFER_PERCENT = 0.15;
/** 上下文警告阈值 */
export const CONTEXT_WARNING_THRESHOLD = 70;
export const CONTEXT_CRITICAL_THRESHOLD = 85;
/** 使用率警告阈值 */
export const USAGE_WARNING_THRESHOLD = 75;
export const USAGE_CRITICAL_THRESHOLD = 90;
/** 默认进度条宽度 */
export const DEFAULT_BAR_WIDTH = 10;
/** stdin 读取超时 (ms) */
export const STDIN_FIRST_BYTE_TIMEOUT = 250;
export const STDIN_IDLE_TIMEOUT = 30;
export const STDIN_MAX_BYTES = 256 * 1024; // 256KB
/** Claude Code 模型上下文窗口大小映射 */
export const CONTEXT_WINDOW_SIZES = {
    // Claude 4.x 系列
    'claude-opus-4-7': 200_000,
    'claude-sonnet-4-6': 200_000,
    'claude-haiku-4-5': 200_000,
    // Claude 3.x 系列
    'claude-3-7-sonnet': 200_000,
    'claude-3-5-sonnet': 200_000,
    'claude-3-5-haiku': 200_000,
    'claude-3-opus': 200_000,
    // 1M 上下文版本
    'claude-opus-4-7-1m': 1_000_000,
    'claude-sonnet-4-6-1m': 1_000_000,
};
/** 默认上下文窗口大小 */
export const DEFAULT_CONTEXT_WINDOW = 200_000;
//# sourceMappingURL=constants.js.map