// ============================================================
// ClaudeHub - 配置加载
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { HudConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

/** 配置文件搜索路径（按优先级） */
const CONFIG_PATHS = [
  // 项目级配置
  join(process.cwd(), '.claudehub.json'),
  join(process.cwd(), '.claude', 'claudehub.json'),
  // 用户级配置
  join(homedir(), '.claudehub.json'),
  join(homedir(), '.claude', 'claudehub.json'),
];

/** 加载配置（合并默认值） */
export function loadConfig(): HudConfig {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        const raw = readFileSync(path, 'utf-8');
        const userConfig = JSON.parse(raw) as Partial<HudConfig>;
        return deepMerge(DEFAULT_CONFIG, userConfig);
      } catch {
        // 配置文件解析失败，使用默认值
      }
    }
  }
  return { ...DEFAULT_CONFIG };
}

/** 简单的深度合并 */
function deepMerge<T extends Record<string, any>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && base[key] && typeof base[key] === 'object') {
      (result as any)[key] = deepMerge(base[key], val);
    } else if (val !== undefined) {
      (result as any)[key] = val;
    }
  }
  return result;
}
