// ============================================================
// ClaudeHub - stdin 读取和解析
// ============================================================

import type { StdinData, UsageData } from './types.js';
import { DEFAULT_CONTEXT_WINDOW, CONTEXT_WINDOW_SIZES } from './constants.js';

/** 从 stdin 读取 Claude Code 传入的 JSON 数据 */
export async function readStdin(): Promise<StdinData | null> {
  // 如果是 TTY（直接运行而非被 Claude Code 管道传入），返回 null
  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise<StdinData | null>((resolve) => {
    let raw = '';
    let settled = false;

    const finish = (value: StdinData | null) => {
      if (settled) return;
      settled = true;
      process.stdin.off('data', onData);
      process.stdin.off('end', onEnd);
      process.stdin.pause();
      resolve(value);
    };

    const tryParse = (): StdinData | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed) as StdinData;
      } catch {
        return null;
      }
    };

    const onData = (chunk: string | Buffer) => {
      raw += String(chunk);
      const parsed = tryParse();
      if (parsed !== null) {
        finish(parsed);
      }
    };

    const onEnd = () => {
      const parsed = tryParse();
      finish(parsed);
    };

    // 超时保护：如果没有数据传入
    const timer = setTimeout(() => {
      finish(tryParse());
    }, 500);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', onData);
    process.stdin.on('on', () => {
      clearTimeout(timer);
      finish(tryParse());
    });
  });
}

/** 计算当前上下文使用的 token 数 */
export function getTotalTokens(stdin: StdinData): number {
  const usage = stdin.context_window?.current_usage;
  return (
    (usage?.input_tokens ?? 0) +
    (usage?.cache_creation_input_tokens ?? 0) +
    (usage?.cache_read_input_tokens ?? 0)
  );
}

/** 获取上下文使用百分比（优先使用 Claude Code 原生值） */
export function getContextPercent(stdin: StdinData): number {
  // 1. 优先使用 Claude Code v2.1.6+ 提供的原生百分比
  const native = stdin.context_window?.used_percentage;
  if (typeof native === 'number' && !Number.isNaN(native) && native > 0) {
    return Math.min(100, Math.max(0, Math.round(native)));
  }

  // 2. 回退：手动计算
  const size = getContextWindowSize(stdin);
  const total = getTotalTokens(stdin);
  if (size <= 0) return 0;
  return Math.min(100, Math.round((total / size) * 100));
}

/** 获取上下文窗口大小 */
export function getContextWindowSize(stdin: StdinData): number {
  // 1. 优先使用 Claude Code 提供的值
  const reported = stdin.context_window?.context_window_size;
  if (reported && reported > 0) return reported;

  // 2. 根据模型 ID 推断
  const modelId = stdin.model?.id?.toLowerCase() ?? '';
  for (const [key, size] of Object.entries(CONTEXT_WINDOW_SIZES)) {
    if (modelId.includes(key)) return size;
  }

  return DEFAULT_CONTEXT_WINDOW;
}

/** 获取模型显示名称 */
export function getModelName(stdin: StdinData): string {
  const displayName = stdin.model?.display_name?.trim();
  if (displayName) return displayName;

  const modelId = stdin.model?.id?.trim();
  if (!modelId) return 'Unknown';

  // 尝试从模型 ID 中提取可读名称
  const lower = modelId.toLowerCase();

  // Bedrock 模型
  if (lower.includes('anthropic.claude-')) {
    return normalizeBedrockModel(modelId);
  }

  // Vertex AI 模型
  if (modelId.includes('@')) {
    const base = modelId.split('@')[0];
    return normalizeModelId(base);
  }

  return normalizeModelId(modelId);
}

/** 格式化 Bedrock 模型名称 */
function normalizeBedrockModel(modelId: string): string {
  const lower = modelId.toLowerCase();
  const prefix = 'anthropic.claude-';
  const idx = lower.indexOf(prefix);
  if (idx === -1) return modelId;

  let suffix = lower.slice(idx + prefix.length);
  suffix = suffix.replace(/-v\d+:\d+$/, '');
  suffix = suffix.replace(/-\d{8}$/, '');

  const tokens = suffix.split('-').filter(Boolean);
  const familyIdx = tokens.findIndex(
    (t) => t === 'haiku' || t === 'sonnet' || t === 'opus'
  );
  if (familyIdx === -1) return modelId;

  const family = tokens[familyIdx];
  const versionTokens: string[] = [];
  // 收集版本号（family 前后的数字）
  for (let i = familyIdx + 1; i < tokens.length && versionTokens.length < 2; i++) {
    if (/^\d+$/.test(tokens[i])) versionTokens.push(tokens[i]);
  }
  const version = versionTokens.length ? versionTokens.join('.') : null;
  const label = family[0].toUpperCase() + family.slice(1);
  return version ? `Claude ${label} ${version}` : `Claude ${label}`;
}

/** 格式化通用模型 ID */
function normalizeModelId(modelId: string): string {
  // 将常见的 kebab-case ID 转为可读格式
  return modelId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

/** 从 stdin 提取使用率数据 */
export function getUsageFromStdin(stdin: StdinData): UsageData | null {
  const rateLimits = stdin.rate_limits;
  if (!rateLimits) return null;

  const fiveHour = rateLimits.five_hour?.used_percentage ?? null;
  const sevenDay = rateLimits.seven_day?.used_percentage ?? null;

  if (fiveHour === null && sevenDay === null) return null;

  return {
    fiveHour: typeof fiveHour === 'number' ? Math.round(fiveHour) : null,
    sevenDay: typeof sevenDay === 'number' ? Math.round(sevenDay) : null,
    fiveHourResetAt: rateLimits.five_hour?.resets_at
      ? new Date(rateLimits.five_hour.resets_at * 1000)
      : null,
    sevenDayResetAt: rateLimits.seven_day?.resets_at
      ? new Date(rateLimits.seven_day.resets_at * 1000)
      : null,
  };
}
