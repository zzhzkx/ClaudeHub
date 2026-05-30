import type { TranscriptData } from './types.js';
/**
 * 从文件末尾增量读取新增行
 * 利用文件 size 变化判断是否有新内容，只解析新增部分
 */
export declare function parseTranscriptIncremental(transcriptPath: string, lastSize: number): {
    data: TranscriptData;
    newSize: number;
};
/** 兼容旧接口：全量解析 */
export declare function parseTranscript(transcriptPath: string): TranscriptData;
//# sourceMappingURL=transcript.d.ts.map