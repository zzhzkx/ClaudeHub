// ============================================================
// ClaudeHub - Git 状态获取
// ============================================================

import { execSync } from 'node:child_process';

export interface GitInfo {
  branch: string;
  dirty: boolean;
  ahead: number;
  behind: number;
}

/** 获取当前目录的 Git 状态 */
export function getGitStatus(cwd?: string): GitInfo {
  const baseOpts = cwd ? { cwd } : {};

  let branch = '';
  let dirty = false;
  let ahead = 0;
  let behind = 0;

  try {
    // 获取当前分支
    branch = execSync('git branch --show-current', {
      ...baseOpts,
      encoding: 'utf-8',
      timeout: 3000,
    }).trim();
  } catch {
    // 不在 git 仓库中或 git 不可用
    return { branch: '', dirty: false, ahead: 0, behind: 0 };
  }

  try {
    // 检查是否有未提交的更改
    const status = execSync('git status --porcelain', {
      ...baseOpts,
      encoding: 'utf-8',
      timeout: 3000,
    });
    dirty = status.trim().length > 0;
  } catch {
    // ignore
  }

  try {
    // 检查领先/落后远程的提交数
    const revList = execSync('git rev-list --left-right --count HEAD...@{upstream}', {
      ...baseOpts,
      encoding: 'utf-8',
      timeout: 3000,
    }).trim();
    const parts = revList.split('\t');
    if (parts.length === 2) {
      ahead = parseInt(parts[0], 10) || 0;
      behind = parseInt(parts[1], 10) || 0;
    }
  } catch {
    // 没有上游分支
  }

  return { branch, dirty, ahead, behind };
}
