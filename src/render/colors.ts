// ============================================================
// ClaudeHub - ANSI 颜色和进度条
// ============================================================

import {
  CONTEXT_WARNING_THRESHOLD,
  CONTEXT_CRITICAL_THRESHOLD,
  USAGE_WARNING_THRESHOLD,
  USAGE_CRITICAL_THRESHOLD,
} from '../constants.js';

export const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const BRIGHT_BLUE = '\x1b[94m';
const BRIGHT_MAGENTA = '\x1b[95m';

const ANSI_BY_NAME: Record<string, string> = {
  dim: DIM,
  red: RED,
  green: GREEN,
  yellow: YELLOW,
  magenta: MAGENTA,
  cyan: CYAN,
  brightBlue: BRIGHT_BLUE,
  brightMagenta: BRIGHT_MAGENTA,
};

function resolveAnsi(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (ANSI_BY_NAME[value]) return ANSI_BY_NAME[value];
  // 支持 256 色数字
  const num = Number(value);
  if (!Number.isNaN(num) && num >= 0 && num <= 255) {
    return `\x1b[38;5;${num}m`;
  }
  // 支持十六进制
  if (value.startsWith('#') && value.length === 7) {
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  }
  return fallback;
}

function colorize(text: string, color: string): string {
  return `${color}${text}${RESET}`;
}

// ---- 基础颜色函数 ----

export const dim = (t: string) => colorize(t, DIM);
export const red = (t: string) => colorize(t, RED);
export const green = (t: string) => colorize(t, GREEN);
export const yellow = (t: string) => colorize(t, YELLOW);
export const magenta = (t: string) => colorize(t, MAGENTA);
export const cyan = (t: string) => colorize(t, CYAN);

// ---- 可配置颜色 ----

export function model(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.model, CYAN));
}

export function project(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.project, YELLOW));
}

export function git(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.git, MAGENTA));
}

export function gitBranch(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.gitBranch, CYAN));
}

export function label(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.label, DIM));
}

export function warning(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.warning, YELLOW));
}

export function critical(text: string, colors?: Record<string, string>): string {
  return colorize(text, resolveAnsi(colors?.critical, RED));
}

// ---- 上下文进度条颜色 ----

export function getContextColor(percent: number, colors?: Record<string, string>): string {
  if (percent >= CONTEXT_CRITICAL_THRESHOLD) return resolveAnsi(colors?.critical, RED);
  if (percent >= CONTEXT_WARNING_THRESHOLD) return resolveAnsi(colors?.warning, YELLOW);
  return resolveAnsi(colors?.context, GREEN);
}

// ---- 使用率进度条颜色 ----

export function getQuotaColor(percent: number, colors?: Record<string, string>): string {
  if (percent >= USAGE_CRITICAL_THRESHOLD) return resolveAnsi(colors?.critical, RED);
  if (percent >= USAGE_WARNING_THRESHOLD) return resolveAnsi(colors?.usage, BRIGHT_MAGENTA);
  return resolveAnsi(colors?.usage, BRIGHT_BLUE);
}

// ---- 进度条渲染 ----

/**
 * 渲染一个彩色进度条
 * @param percent 0-100
 * @param width 进度条宽度（字符数）
 * @param colors 颜色配置
 */
export function coloredBar(
  percent: number,
  width: number = 10,
  colors?: Record<string, string>
): string {
  const safeWidth = Math.max(0, Math.round(width));
  const safePercent = Math.min(100, Math.max(0, percent));
  const filled = Math.round((safePercent / 100) * safeWidth);
  const empty = safeWidth - filled;
  const color = getContextColor(safePercent, colors);
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}

/**
 * 渲染使用率进度条
 */
export function quotaBar(
  percent: number,
  width: number = 10,
  colors?: Record<string, string>
): string {
  const safeWidth = Math.max(0, Math.round(width));
  const safePercent = Math.min(100, Math.max(0, percent));
  const filled = Math.round((safePercent / 100) * safeWidth);
  const empty = safeWidth - filled;
  const color = getQuotaColor(safePercent, colors);
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
