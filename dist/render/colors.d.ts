export declare const RESET = "\u001B[0m";
export declare const dim: (t: string) => string;
export declare const red: (t: string) => string;
export declare const green: (t: string) => string;
export declare const yellow: (t: string) => string;
export declare const magenta: (t: string) => string;
export declare const cyan: (t: string) => string;
export declare function model(text: string, colors?: Record<string, string>): string;
export declare function project(text: string, colors?: Record<string, string>): string;
export declare function git(text: string, colors?: Record<string, string>): string;
export declare function gitBranch(text: string, colors?: Record<string, string>): string;
export declare function label(text: string, colors?: Record<string, string>): string;
export declare function warning(text: string, colors?: Record<string, string>): string;
export declare function critical(text: string, colors?: Record<string, string>): string;
export declare function getContextColor(percent: number, colors?: Record<string, string>): string;
export declare function getQuotaColor(percent: number, colors?: Record<string, string>): string;
/**
 * 渲染一个彩色进度条
 * @param percent 0-100
 * @param width 进度条宽度（字符数）
 * @param colors 颜色配置
 */
export declare function coloredBar(percent: number, width?: number, colors?: Record<string, string>): string;
/**
 * 渲染使用率进度条
 */
export declare function quotaBar(percent: number, width?: number, colors?: Record<string, string>): string;
//# sourceMappingURL=colors.d.ts.map