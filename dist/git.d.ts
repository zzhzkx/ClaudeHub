export interface GitInfo {
    branch: string;
    dirty: boolean;
    ahead: number;
    behind: number;
}
/** 获取当前目录的 Git 状态 */
export declare function getGitStatus(cwd?: string): GitInfo;
//# sourceMappingURL=git.d.ts.map